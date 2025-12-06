import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'
import { sendOrderCancelledEmail } from '@/lib/email'

// GET /api/user/orders/[id] - Get single order details
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

    // Try to find by ID or order number
    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderNumber: id.toUpperCase() }
      ],
      user: authResult.userId
    })
      .populate('items.product', 'slug')
      .lean()

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    return successResponse(order, 'Order fetched successfully')
  } catch (error) {
    console.error('Error fetching order:', error)
    return errorResponse('Failed to fetch order')
  }
}

// PUT /api/user/orders/[id] - Cancel order (user can only cancel their own orders)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    const { action, reason } = await request.json()
    const { id } = await params

    if (action !== 'cancel') {
      return errorResponse('Invalid action. Only "cancel" is allowed.', 400)
    }

    await dbConnect()

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderNumber: id.toUpperCase() }
      ],
      user: authResult.userId
    }).populate('user', 'name email')

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed']
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse(
        `Cannot cancel order. Order is already ${order.status}. Only pending or confirmed orders can be cancelled.`,
        400
      )
    }

    // Update order status to cancelled
    const previousStatus = order.status
    order.status = 'cancelled'
    order.timeline.push({
      status: 'cancelled',
      message: reason || 'Order cancelled by customer',
      timestamp: new Date()
    })

    // If payment was made, mark for refund
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded'
      order.timeline.push({
        status: 'refund_initiated',
        message: 'Refund initiated for cancelled order',
        timestamp: new Date()
      })
    }

    await order.save()

    // Send cancellation email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = order.user as any
    if (user?.email) {
      try {
        await sendOrderCancelledEmail(
          user.email,
          user.name,
          order.orderNumber,
          reason || 'Cancelled by customer'
        )
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return successResponse(
      { 
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        previousStatus,
        paymentStatus: order.paymentStatus
      }, 
      'Order cancelled successfully'
    )
  } catch (error) {
    console.error('Error cancelling order:', error)
    return errorResponse('Failed to cancel order')
  }
}
