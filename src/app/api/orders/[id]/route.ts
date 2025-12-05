import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'

// GET - Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    const { id } = await params

    await dbConnect()

    const order = await Order.findOne({
      _id: id,
      user: authResult.userId,
    })
      .populate('items.product', 'name slug images')
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Get Order Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT - Cancel order (user can cancel if pending)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    await dbConnect()

    const order = await Order.findOne({
      _id: id,
      user: authResult.userId,
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    if (action === 'cancel') {
      // Only allow cancellation if order is pending or confirmed
      if (!['pending', 'confirmed'].includes(order.status)) {
        return NextResponse.json(
          { success: false, message: 'Order cannot be cancelled at this stage' },
          { status: 400 }
        )
      }

      order.status = 'cancelled'
      order.timeline.push({
        status: 'cancelled',
        message: 'Order cancelled by customer',
        timestamp: new Date(),
      })

      await order.save()

      return NextResponse.json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Update Order Error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    )
  }
}
