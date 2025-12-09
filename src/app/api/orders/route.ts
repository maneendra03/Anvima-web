import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Order, { IOrder } from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { sendOrderNotification } from '@/lib/whatsapp'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ANV-${timestamp}-${random}`
}

// Helper to check if string is valid MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id
}

// GET - Get user's orders
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const orders = await Order.find({ user: authResult.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name slug images')
      .lean()

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Get Orders Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const body = await request.json()
    
    // Debug: Log the entire request body
    console.log('Order API received body:', JSON.stringify(body, null, 2))
    
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = body

    // Debug: Log items specifically
    console.log('Items received:', items)

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items in order' },
        { status: 400 }
      )
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
      return NextResponse.json(
        { success: false, message: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Fetch product details and calculate totals
    const orderItems = []
    let subtotal = 0

    for (const item of items) {
      // Debug logging
      console.log('Processing item:', { productId: item.productId, slug: item.slug })
      
      // Try to find product by ObjectId first, then by slug
      let product = null
      
      if (item.productId && isValidObjectId(item.productId)) {
        product = await Product.findById(item.productId)
        console.log('Found by ObjectId:', !!product)
      }
      
      // If not found by ID, try by slug (for mock data compatibility)
      if (!product && item.slug) {
        console.log('Searching for product by slug:', item.slug)
        product = await Product.findOne({ slug: item.slug })
        console.log('Found by item.slug:', !!product, 'slug:', item.slug)
        
        // If still not found, try without any filters
        if (!product) {
          const allProducts = await Product.find({}).select('slug name')
          console.log('All products in DB:', allProducts.map(p => p.slug))
        }
      }
      
      // Also try productId as slug
      if (!product && item.productId) {
        product = await Product.findOne({ slug: item.productId })
        console.log('Found by productId as slug:', !!product)
      }
      
      if (!product) {
        console.log('Product NOT FOUND for:', { productId: item.productId, slug: item.slug })
        // Return detailed error message for debugging
        return NextResponse.json(
          { 
            success: false, 
            message: `Product not found: ${item.slug || item.productId}`,
            debug: {
              receivedProductId: item.productId,
              receivedSlug: item.slug,
              fullItem: item
            }
          },
          { status: 400 }
        )
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const itemPrice = item.price || product.price
      const itemTotal = itemPrice * item.quantity

      // Get the first image URL
      const imageUrl = product.images && product.images.length > 0 
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url || '')
        : ''

      orderItems.push({
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: imageUrl,
        price: itemPrice,
        quantity: item.quantity,
        variant: item.variant,
        customization: item.customization,
      })

      subtotal += itemTotal

      // Reduce stock
      product.stock -= item.quantity
      await product.save()
    }

    // Calculate shipping (free over ₹999)
    const shippingCost = subtotal >= 999 ? 0 : 99

    // Calculate discount (if coupon applied)
    let discount = 0
    // TODO: Implement coupon validation

    // Calculate tax (18% GST)
    const tax = Math.round((subtotal - discount) * 0.18)

    // Calculate total
    const total = subtotal + shippingCost - discount + tax

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order
    const order = await Order.create({
      orderNumber,
      user: authResult.userId,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      discount,
      couponCode: couponCode || undefined,
      tax,
      total,
      status: 'pending',
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'pending',
      notes,
      timeline: [
        {
          status: 'pending',
          message: 'Order placed',
          timestamp: new Date(),
        },
      ],
    }) as IOrder

    // If COD or Pay Later, mark as confirmed
    if (paymentMethod === 'cod' || paymentMethod === 'pay_later') {
      order.status = 'confirmed'
      order.timeline.push({
        status: 'confirmed',
        message: paymentMethod === 'cod' 
          ? 'Order confirmed (Cash on Delivery)' 
          : 'Order confirmed (Pay Later)',
        timestamp: new Date(),
      })
      await order.save()
    }

    // For online payment (Razorpay), order stays pending until payment is verified
    // Razorpay order will be created separately via /api/payment/create-order

    // Send order confirmation email
    try {
      const user = await User.findById(authResult.userId).select('email name')
      if (user && user.email) {
        const addressString = `${shippingAddress.name}\n${shippingAddress.address}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}\n${shippingAddress.phone}`
        
        await sendOrderConfirmationEmail(
          user.email,
          user.name,
          order.orderNumber,
          {
            items: orderItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price * item.quantity,
            })),
            subtotal,
            shipping: shippingCost,
            total: order.total,
            address: addressString,
          }
        )
        console.log('✅ Order confirmation email sent to:', user.email)

        // Send WhatsApp notification to admin
        try {
          await sendOrderNotification({
            orderNumber: order.orderNumber,
            customerName: shippingAddress.name || user.name,
            customerPhone: shippingAddress.phone,
            total: order.total,
            itemsCount: orderItems.length,
            shippingAddress: addressString,
          })
          console.log('✅ WhatsApp notification logged for order:', order.orderNumber)
        } catch (whatsappError) {
          console.error('Failed to send WhatsApp notification:', whatsappError)
        }
      }
    } catch (emailError) {
      // Don't fail the order if email fails
      console.error('Failed to send order confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
      },
    })
  } catch (error) {
    console.error('Create Order Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    )
  }
}
