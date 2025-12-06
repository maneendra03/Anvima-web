import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth/middleware'

// GET - Fetch inventory overview
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    let query: any = { isActive: true }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ]
    }

    if (filter === 'low-stock') {
      query.$expr = { 
        $and: [
          { $gt: ['$stock', 0] },
          { $lte: ['$stock', '$lowStockThreshold'] }
        ]
      }
    } else if (filter === 'out-of-stock') {
      query.stock = 0
    } else if (filter === 'in-stock') {
      query.$expr = { $gt: ['$stock', '$lowStockThreshold'] }
    }

    // Get products with pagination
    const products = await Product.find(query)
      .select('name slug sku images stock lowStockThreshold trackInventory price category')
      .populate('category', 'name')
      .sort({ stock: 1 }) // Show lowest stock first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Product.countDocuments(query)

    // Get summary stats
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $gt: ['$stock', 0] },
                    { $lte: ['$stock', '$lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalValue: { $sum: { $multiply: ['$stock', '$price'] } }
        }
      }
    ])

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalProducts: 0,
        totalStock: 0,
        outOfStock: 0,
        lowStock: 0,
        totalValue: 0
      }
    })
  } catch (error: any) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Bulk update stock
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { updates } = await request.json()

    // updates: [{ productId: string, stock: number, lowStockThreshold?: number }]
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'Invalid updates array' }, { status: 400 })
    }

    const bulkOps = updates.map(({ productId, stock, lowStockThreshold }) => ({
      updateOne: {
        filter: { _id: productId },
        update: { 
          $set: { 
            stock,
            ...(lowStockThreshold !== undefined && { lowStockThreshold })
          }
        }
      }
    }))

    const result = await Product.bulkWrite(bulkOps)

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    })
  } catch (error: any) {
    console.error('Inventory update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
