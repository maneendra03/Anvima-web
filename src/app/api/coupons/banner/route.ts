import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Coupon from '@/models/Coupon'

export async function GET() {
  try {
    await connectDB()

    const now = new Date()

    // Find active coupon marked to show in banner
    const bannerCoupon = await Coupon.findOne({
      isActive: true,
      showInBanner: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).select('code description discountType discountValue minOrderAmount bannerText')
      .sort({ createdAt: -1 })
      .lean()

    if (!bannerCoupon) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    // Generate banner text if not provided
    let text = bannerCoupon.bannerText
    if (!text) {
      if (bannerCoupon.discountType === 'percentage') {
        text = `Use code ${bannerCoupon.code} to get ${bannerCoupon.discountValue}% off`
      } else {
        text = `Use code ${bannerCoupon.code} to get ₹${bannerCoupon.discountValue} off`
      }
      if (bannerCoupon.minOrderAmount) {
        text += ` on orders above ₹${bannerCoupon.minOrderAmount}`
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        code: bannerCoupon.code,
        text: text,
        discountType: bannerCoupon.discountType,
        discountValue: bannerCoupon.discountValue
      }
    })
  } catch (error) {
    console.error('Error fetching banner coupon:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch banner coupon' },
      { status: 500 }
    )
  }
}
