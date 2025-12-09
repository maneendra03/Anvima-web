import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'

// Public tracking endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const phone = searchParams.get('phone')

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, message: 'Order number is required' },
        { status: 400 }
      )
    }

    // Find order by order number and optionally verify with phone
    const query: any = { orderNumber: orderNumber.toUpperCase() }
    
    const order = await Order.findOne(query)
      .select('orderNumber status paymentStatus tracking timeline shippingAddress.name shippingAddress.city createdAt')
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // If phone provided, verify it matches (last 4 digits)
    if (phone) {
      const orderPhone = (order as any).shippingAddress?.phone || ''
      const phoneLast4 = phone.replace(/\D/g, '').slice(-4)
      const orderPhoneLast4 = orderPhone.replace(/\D/g, '').slice(-4)
      
      if (phoneLast4 !== orderPhoneLast4) {
        return NextResponse.json(
          { success: false, message: 'Phone number does not match' },
          { status: 400 }
        )
      }
    }

    // Return tracking info
    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerName: (order as any).shippingAddress?.name?.split(' ')[0] || 'Customer',
      city: (order as any).shippingAddress?.city,
      orderDate: order.createdAt,
      tracking: order.tracking || null,
      timeline: order.timeline.map((t: any) => ({
        status: t.status,
        message: t.message,
        timestamp: t.timestamp,
      })),
      estimatedDelivery: getEstimatedDelivery(order.status, order.createdAt),
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
    })
  } catch (error) {
    console.error('Tracking Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tracking info' },
      { status: 500 }
    )
  }
}

function getEstimatedDelivery(status: string, orderDate: Date): string | null {
  if (status === 'delivered' || status === 'cancelled' || status === 'refunded') {
    return null
  }
  
  // Estimate 5-7 business days from order date
  const estimatedDate = new Date(orderDate)
  estimatedDate.setDate(estimatedDate.getDate() + 7)
  
  return estimatedDate.toISOString()
}
