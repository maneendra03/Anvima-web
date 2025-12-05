import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature, isPaymentEnabled } from '@/lib/razorpay'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'

// Verify Razorpay Payment
export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!isPaymentEnabled()) {
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
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId // Our internal order ID
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment details' },
        { status: 400 }
      )
    }

    // Verify the payment signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // If we have an internal order ID, update the order
    if (orderId) {
      const order = await Order.findById(orderId)
      
      if (order) {
        order.paymentStatus = 'paid'
        order.status = 'confirmed'
        order.paymentDetails = {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          method: 'razorpay',
          paidAt: new Date(),
        }
        order.timeline.push({
          status: 'paid',
          message: 'Payment received successfully via Razorpay',
          timestamp: new Date(),
        })
        await order.save()
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      },
    })
  } catch (error) {
    console.error('Payment Verification Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to verify payment' 
      },
      { status: 500 }
    )
  }
}
