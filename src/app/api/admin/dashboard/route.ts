import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import Order from '@/models/Order'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/dashboard - Get dashboard stats
export async function GET() {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()

    // Get various statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      monthlySales
    ] = await Promise.all([
      // Total users (excluding admins)
      User.countDocuments({ role: 'user' }),
      
      // Total active products
      Product.countDocuments({ isActive: true }),
      
      // Total orders
      Order.countDocuments(),
      
      // Pending orders
      Order.countDocuments({ status: 'pending' }),
      
      // Total revenue (delivered orders)
      Order.aggregate([
        { $match: { status: 'delivered', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent orders
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      
      // Top selling products
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { 
          _id: '$items.product', 
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }},
        { $unwind: '$product' },
        { $project: {
          name: '$product.name',
          slug: '$product.slug',
          image: { $arrayElemAt: ['$product.images', 0] },
          totalSold: 1,
          revenue: 1
        }}
      ]),
      
      // Monthly sales (last 6 months)
      Order.aggregate([
        { $match: { 
          status: 'delivered',
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
        }},
        { $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ])

    return successResponse({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      topProducts,
      monthlySales
    }, 'Dashboard data fetched successfully')
  } catch (error) {
    console.error('Dashboard error:', error)
    return errorResponse('Failed to fetch dashboard data')
  }
}
