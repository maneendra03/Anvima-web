import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'
import { 
  sendOrderShippedEmail, 
  sendOrderDeliveredEmail, 
  sendOrderStatusUpdateEmail,
  sendOrderCancelledEmail 
} from '@/lib/email'

// GET /api/admin/orders/[id] - Get single order
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()
    const { id } = await params

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name slug images')
      .lean()

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    return successResponse(order, 'Order fetched successfully')
  } catch (error) {
    console.error('Get order error:', error)
    return errorResponse('Failed to fetch order')
  }
}

// PUT /api/admin/orders/[id] - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const { status, paymentStatus, trackingNumber, trackingUrl, carrier, estimatedDelivery, notes, sendEmail } = await request.json()
    const { id } = await params

    await dbConnect()

    const order = await Order.findById(id).populate('user', 'name email')

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    const previousStatus = order.status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = order.user as any

    // Update fields
    if (status) {
      order.status = status
      order.timeline.push({
        status,
        message: notes || `Order status updated to ${status}`,
        timestamp: new Date()
      })
    }

    if (paymentStatus) order.paymentStatus = paymentStatus
    
    // Update tracking info
    if (trackingNumber || trackingUrl || carrier || estimatedDelivery) {
      if (!order.tracking) {
        order.tracking = {}
      }
      if (trackingNumber) order.tracking.trackingNumber = trackingNumber
      if (trackingUrl) order.tracking.trackingUrl = trackingUrl
      if (carrier) order.tracking.carrier = carrier
      if (estimatedDelivery) order.tracking.estimatedDelivery = new Date(estimatedDelivery)
    }

    await order.save()

    // Send email notifications if enabled (default: true)
    if (sendEmail !== false && status && status !== previousStatus && user?.email) {
      try {
        switch (status) {
          case 'shipped':
            await sendOrderShippedEmail(
              user.email,
              user.name,
              order.orderNumber,
              {
                carrier: order.tracking?.carrier,
                trackingNumber: order.tracking?.trackingNumber,
                trackingUrl: order.tracking?.trackingUrl,
                estimatedDelivery: order.tracking?.estimatedDelivery?.toISOString(),
              }
            )
            break
          case 'delivered':
            await sendOrderDeliveredEmail(user.email, user.name, order.orderNumber)
            break
          case 'cancelled':
            await sendOrderCancelledEmail(user.email, user.name, order.orderNumber, notes)
            break
          default:
            // Send generic status update for other statuses
            await sendOrderStatusUpdateEmail(
              user.email,
              user.name,
              order.orderNumber,
              status,
              notes || `Your order has been ${status}`
            )
        }
        console.log(`📧 Order status email sent for ${order.orderNumber} - Status: ${status}`)
      } catch (emailError) {
        console.error('Failed to send order status email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return successResponse(order, 'Order updated successfully')
  } catch (error) {
    console.error('Update order error:', error)
    return errorResponse('Failed to update order')
  }
}
