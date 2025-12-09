import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CustomOrder from '@/models/CustomOrder'
import { getAuthUser } from '@/lib/auth/middleware'

// GET - Fetch all custom orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-createdAt'

    // Build query
    const query: Record<string, unknown> = {}
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { requestNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    
    const [orders, total] = await Promise.all([
      CustomOrder.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email')
        .lean(),
      CustomOrder.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch custom orders'
    console.error('Admin custom orders fetch error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
