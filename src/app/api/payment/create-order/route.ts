import { NextRequest, NextResponse } from 'next/server'
import { razorpay, formatAmountForRazorpay, isPaymentEnabled } from '@/lib/razorpay'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import dbConnect from '@/lib/mongodb'

// Create Razorpay Order
export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!isPaymentEnabled() || !razorpay) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 503 }
      )
    }

    // Verify authentication
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()

    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes = {} } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create a Razorpay Order
    const order = await razorpay.orders.create({
      amount: formatAmountForRazorpay(amount),
      currency: currency.toUpperCase(),
      receipt: receipt || `order_${Date.now()}`,
      notes: {
        userId: authResult.userId,
        ...notes,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    })
  } catch (error) {
    console.error('Razorpay Order Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    )
  }
}
