import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

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

    const { status, paymentStatus, trackingNumber, trackingUrl, carrier, notes } = await request.json()
    const { id } = await params

    await dbConnect()

    const order = await Order.findById(id)

    if (!order) {
      return errorResponse('Order not found', 404)
    }

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
    if (trackingNumber || trackingUrl || carrier) {
      if (!order.tracking) {
        order.tracking = {}
      }
      if (trackingNumber) order.tracking.trackingNumber = trackingNumber
      if (trackingUrl) order.tracking.trackingUrl = trackingUrl
      if (carrier) order.tracking.carrier = carrier
    }

    await order.save()

    return successResponse(order, 'Order updated successfully')
  } catch (error) {
    console.error('Update order error:', error)
    return errorResponse('Failed to update order')
  }
}
