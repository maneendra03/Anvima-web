import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Coupon from '@/models/Coupon'
import { getAuthUser } from '@/lib/auth/middleware'

// POST - Validate and apply coupon
export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { code, cartTotal } = body

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      )
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true 
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Invalid coupon code' },
        { status: 400 }
      )
    }

    // Check if coupon has expired
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json(
        { success: false, message: 'This coupon has expired' },
        { status: 400 }
      )
    }

    // Check if coupon has started
    if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
      return NextResponse.json(
        { success: false, message: 'This coupon is not yet active' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, message: 'This coupon has reached its usage limit' },
        { status: 400 }
      )
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
        },
        { status: 400 }
      )
    }

    // Check per-user limit (if user is logged in)
    const user = await getAuthUser()
    if (user && coupon.perUserLimit) {
      // Note: In production, you'd track user-specific coupon usage in a separate collection
      // For now, we just validate the per-user limit exists
      // This should be enhanced to check actual user usage from Order collection
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (cartTotal * coupon.discountValue) / 100
      // Apply max discount cap if set
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount
      }
    } else {
      // Fixed amount discount
      discountAmount = coupon.discountValue
    }

    // Make sure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
        description: coupon.description,
      },
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
