import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order, { IOrder } from '@/models/Order'
import Product from '@/models/Product'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ANV-${timestamp}-${random}`
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
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = body

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
      const product = await Product.findById(item.productId)
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${item.productId}` },
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

    // If COD, mark as confirmed
    if (paymentMethod === 'cod') {
      order.status = 'confirmed'
      order.timeline.push({
        status: 'confirmed',
        message: 'Order confirmed (Cash on Delivery)',
        timestamp: new Date(),
      })
      await order.save()
    }

    // For online payment (Razorpay), order stays pending until payment is verified
    // Razorpay order will be created separately via /api/payment/create-order

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
