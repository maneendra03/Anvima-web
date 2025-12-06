import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/coupons - List all coupons with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {}

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const now = new Date()
    if (status === 'active') {
      query.isActive = true
      query.validUntil = { $gte: now }
      query.validFrom = { $lte: now }
    } else if (status === 'inactive') {
      query.isActive = false
    } else if (status === 'expired') {
      query.validUntil = { $lt: now }
    } else if (status === 'scheduled') {
      query.validFrom = { $gt: now }
    }

    const skip = (page - 1) * limit
    const sortOptions: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query),
    ])

    // Get statistics
    const [totalCoupons, activeCoupons, expiredCoupons, totalUsage] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true, validUntil: { $gte: now }, validFrom: { $lte: now } }),
      Coupon.countDocuments({ validUntil: { $lt: now } }),
      Coupon.aggregate([{ $group: { _id: null, total: { $sum: '$usedCount' } } }]),
    ])

    return successResponse({
      coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalCoupons,
        active: activeCoupons,
        expired: expiredCoupons,
        totalUsage: totalUsage[0]?.total || 0,
      },
    }, 'Coupons fetched successfully')
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return errorResponse('Failed to fetch coupons')
  }
}

// POST /api/admin/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const body = await request.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      validFrom,
      validUntil,
      isActive,
      applicableCategories,
      applicableProducts,
      excludedProducts,
    } = body

    // Validate required fields
    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return errorResponse('Missing required fields: code, discountType, discountValue, validFrom, validUntil', 400)
    }

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return errorResponse('Coupon code already exists', 400)
    }

    // Validate discount value for percentage
    if (discountType === 'percentage' && discountValue > 100) {
      return errorResponse('Percentage discount cannot exceed 100%', 400)
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || undefined,
      usageLimit: usageLimit || undefined,
      perUserLimit: perUserLimit || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: isActive !== false,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedProducts: excludedProducts || [],
    })

    return successResponse(coupon, 'Coupon created successfully')
  } catch (error) {
    console.error('Error creating coupon:', error)
    if ((error as Error).name === 'ValidationError') {
      return errorResponse((error as Error).message, 400)
    }
    return errorResponse('Failed to create coupon')
  }
}
