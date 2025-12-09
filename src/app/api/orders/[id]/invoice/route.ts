import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'

// Generate Invoice PDF data for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    const { id } = await params

    const order = await Order.findOne({
      _id: id,
      user: authResult.userId,
    }).populate('items.product', 'name')

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      invoiceDate: order.createdAt,
      
      // Company details
      company: {
        name: 'Anvima Creations',
        address: 'Hyderabad, Telangana, India',
        phone: '+91 6304742807',
        email: 'anvima.creations@gmail.com',
        gstin: '', // Add your GSTIN if registered
      },
      
      // Customer details
      customer: {
        name: order.shippingAddress.name,
        phone: order.shippingAddress.phone,
        address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      },
      
      // Order details
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      
      // Items
      items: order.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        variant: item.variant,
      })),
      
      // Totals
      subtotal: order.subtotal,
      shipping: order.shippingCost,
      discount: order.discount,
      tax: order.tax || 0,
      total: order.total,
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
