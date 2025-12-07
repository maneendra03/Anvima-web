import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')
    const search = searchParams.get('search')
    const sortParam = searchParams.get('sort')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {}

    if (status) query.status = status
    if (paymentStatus) query.paymentStatus = paymentStatus
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ]
    }

    // Handle sort parameter (e.g., -createdAt for descending)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sortOptions: any = { createdAt: -1 }
    if (sortParam) {
      const sortField = sortParam.startsWith('-') ? sortParam.substring(1) : sortParam
      const sortOrder = sortParam.startsWith('-') ? -1 : 1
      sortOptions = { [sortField]: sortOrder }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ])

    return successResponse({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Orders fetched successfully')
  } catch (error) {
    console.error('Admin get orders error:', error)
    return errorResponse('Failed to fetch orders')
  }
}
