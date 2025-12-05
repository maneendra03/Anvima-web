import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const orders = await Order.find({ user: authResult.userId })
      .sort({ createdAt: -1 })
      .lean()

    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      date: order.createdAt,
      status: order.status,
      total: order.total,
      items: order.items.map((item) => ({
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),
    }))

    return successResponse({
      orders: formattedOrders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
