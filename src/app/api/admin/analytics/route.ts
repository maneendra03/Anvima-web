import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    startDate.setHours(0, 0, 0, 0)

    // Previous period for comparison
    const prevStartDate = new Date()
    prevStartDate.setDate(prevStartDate.getDate() - (periodDays * 2))
    prevStartDate.setHours(0, 0, 0, 0)

    // Current period stats
    const currentOrders = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ])

    // Previous period stats (for comparison)
    const prevOrders = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: prevStartDate, $lt: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      }
    ])

    // Revenue by day for chart
    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Top selling products
    const topProducts = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.name',
          slug: '$product.slug',
          image: { $arrayElemAt: ['$product.images.url', 0] },
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ])

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Revenue by category
    const revenueByCategory = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startDate },
          status: { $nin: ['cancelled', 'refunded'] }
        } 
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData'
        }
      },
      { $unwind: '$productData' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productData.category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryData.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } }
    ])

    // New customers
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startDate },
      role: 'user'
    })

    const prevNewCustomers = await User.countDocuments({
      createdAt: { $gte: prevStartDate, $lt: startDate },
      role: 'user'
    })

    // Total counts
    const totalProducts = await Product.countDocuments({ isActive: true })
    const totalCustomers = await User.countDocuments({ role: 'user' })

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .lean()

    // Calculate percentage changes
    const current = currentOrders[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
    const prev = prevOrders[0] || { totalRevenue: 0, totalOrders: 0 }

    const revenueChange = prev.totalRevenue 
      ? ((current.totalRevenue - prev.totalRevenue) / prev.totalRevenue * 100).toFixed(1)
      : 0
    const ordersChange = prev.totalOrders 
      ? ((current.totalOrders - prev.totalOrders) / prev.totalOrders * 100).toFixed(1)
      : 0
    const customersChange = prevNewCustomers 
      ? ((newCustomers - prevNewCustomers) / prevNewCustomers * 100).toFixed(1)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue: current.totalRevenue || 0,
          totalOrders: current.totalOrders || 0,
          avgOrderValue: current.avgOrderValue || 0,
          newCustomers,
          totalProducts,
          totalCustomers,
          changes: {
            revenue: revenueChange,
            orders: ordersChange,
            customers: customersChange
          }
        },
        charts: {
          revenueByDay,
          ordersByStatus,
          revenueByCategory
        },
        topProducts,
        recentOrders
      }
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
