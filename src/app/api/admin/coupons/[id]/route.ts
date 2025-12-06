import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/coupons/[id] - Get single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    const { id } = await params

    const coupon = await Coupon.findById(id)
      .populate('applicableCategories', 'name slug')
      .populate('applicableProducts', 'name slug')
      .populate('excludedProducts', 'name slug')
      .lean()

    if (!coupon) {
      return errorResponse('Coupon not found', 404)
    }

    return successResponse(coupon, 'Coupon fetched successfully')
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return errorResponse('Failed to fetch coupon')
  }
}

// PUT /api/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    const { id } = await params

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

    // Check if coupon exists
    const existingCoupon = await Coupon.findById(id)
    if (!existingCoupon) {
      return errorResponse('Coupon not found', 404)
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: id }
      })
      if (duplicateCoupon) {
        return errorResponse('Coupon code already exists', 400)
      }
    }

    // Validate discount value for percentage
    if (discountType === 'percentage' && discountValue > 100) {
      return errorResponse('Percentage discount cannot exceed 100%', 400)
    }

    // Update coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      id,
      {
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { discountValue }),
        ...(minOrderAmount !== undefined && { minOrderAmount }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount }),
        ...(usageLimit !== undefined && { usageLimit }),
        ...(perUserLimit !== undefined && { perUserLimit }),
        ...(validFrom && { validFrom: new Date(validFrom) }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(isActive !== undefined && { isActive }),
        ...(applicableCategories && { applicableCategories }),
        ...(applicableProducts && { applicableProducts }),
        ...(excludedProducts && { excludedProducts }),
      },
      { new: true, runValidators: true }
    )

    return successResponse(updatedCoupon, 'Coupon updated successfully')
  } catch (error) {
    console.error('Error updating coupon:', error)
    if ((error as Error).name === 'ValidationError') {
      return errorResponse((error as Error).message, 400)
    }
    return errorResponse('Failed to update coupon')
  }
}

// DELETE /api/admin/coupons/[id] - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    const { id } = await params

    const coupon = await Coupon.findByIdAndDelete(id)
    if (!coupon) {
      return errorResponse('Coupon not found', 404)
    }

    return successResponse(null, 'Coupon deleted successfully')
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return errorResponse('Failed to delete coupon')
  }
}
