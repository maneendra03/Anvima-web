import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import dbConnect from '@/lib/mongodb'
import ReturnRequest from '@/models/ReturnRequest'
import Order from '@/models/Order'

// Generate unique return number
function generateReturnNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `RET-${timestamp}-${random}`
}

// GET - Get user's return requests
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const returns = await ReturnRequest.find({ user: authResult.userId })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber total')
      .lean()

    return NextResponse.json({
      success: true,
      data: returns,
    })
  } catch (error) {
    console.error('Get Returns Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch return requests' },
      { status: 500 }
    )
  }
}

// POST - Create new return request
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const body = await request.json()
    const { orderId, items, images } = body

    // Validate order belongs to user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: authResult.userId,
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { success: false, message: 'Return can only be requested for delivered orders' },
        { status: 400 }
      )
    }

    // Check if return window is still open (7 days)
    const deliveredAt = order.timeline.find((t: any) => t.status === 'delivered')?.timestamp
    if (deliveredAt) {
      const daysSinceDelivery = Math.floor(
        (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceDelivery > 7) {
        return NextResponse.json(
          { success: false, message: 'Return window has expired (7 days from delivery)' },
          { status: 400 }
        )
      }
    }

    // Check for existing return request
    const existingReturn = await ReturnRequest.findOne({
      order: orderId,
      status: { $nin: ['rejected', 'refunded'] },
    })

    if (existingReturn) {
      return NextResponse.json(
        { success: false, message: 'A return request already exists for this order' },
        { status: 400 }
      )
    }

    // Calculate refund amount
    let refundAmount = 0
    for (const item of items) {
      const orderItem = order.items.find((i: any) => i._id.toString() === item.orderItemId)
      if (orderItem) {
        refundAmount += orderItem.price * item.quantity
      }
    }

    // Create return request
    const returnRequest = await ReturnRequest.create({
      returnNumber: generateReturnNumber(),
      order: orderId,
      user: authResult.userId,
      items: items.map((item: any) => ({
        orderItem: item.orderItemId,
        quantity: item.quantity,
        reason: item.reason,
        description: item.description,
      })),
      images: images || [],
      status: 'pending',
      refundAmount,
      timeline: [
        {
          status: 'pending',
          message: 'Return request submitted',
          timestamp: new Date(),
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Return request submitted successfully',
      data: {
        returnNumber: returnRequest.returnNumber,
        status: returnRequest.status,
      },
    })
  } catch (error) {
    console.error('Create Return Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create return request' },
      { status: 500 }
    )
  }
}
