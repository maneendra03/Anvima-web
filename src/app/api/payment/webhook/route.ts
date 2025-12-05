import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { isPaymentEnabled } from '@/lib/razorpay'

// Verify Razorpay Webhook Signature
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return false
  }
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  return expectedSignature === signature
}

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!isPaymentEnabled()) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    
    if (!isValid) {
      console.error('Webhook signature verification failed')
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    await dbConnect()

    // Handle the event
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        console.log('💰 Payment captured:', payment.id)

        // Update order payment status
        const order = await Order.findOne({
          'paymentDetails.razorpayOrderId': payment.order_id,
        })

        if (order) {
          order.paymentStatus = 'paid'
          order.status = 'confirmed'
          order.paymentDetails = {
            ...order.paymentDetails,
            razorpayPaymentId: payment.id,
            method: payment.method,
            paidAt: new Date(),
          }
          order.timeline.push({
            status: 'paid',
            message: 'Payment captured successfully',
            timestamp: new Date(),
          })
          await order.save()
        }
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        console.log('❌ Payment failed:', payment.id)

        const order = await Order.findOne({
          'paymentDetails.razorpayOrderId': payment.order_id,
        })

        if (order) {
          order.paymentStatus = 'failed'
          order.timeline.push({
            status: 'payment_failed',
            message: `Payment failed: ${payment.error_description || 'Unknown error'}`,
            timestamp: new Date(),
          })
          await order.save()
        }
        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity
        console.log('🔄 Refund created:', refund.id)

        const order = await Order.findOne({
          'paymentDetails.razorpayPaymentId': refund.payment_id,
        })

        if (order) {
          order.paymentStatus = 'refunded'
          order.status = 'refunded'
          order.timeline.push({
            status: 'refunded',
            message: `Refund initiated: ₹${refund.amount / 100}`,
            timestamp: new Date(),
          })
          await order.save()
        }
        break
      }

      case 'order.paid': {
        const razorpayOrder = event.payload.order.entity
        console.log('✅ Order paid:', razorpayOrder.id)

        const order = await Order.findOne({
          'paymentDetails.razorpayOrderId': razorpayOrder.id,
        })

        if (order && order.paymentStatus !== 'paid') {
          order.paymentStatus = 'paid'
          order.status = 'confirmed'
          order.timeline.push({
            status: 'paid',
            message: 'Order payment confirmed',
            timestamp: new Date(),
          })
          await order.save()
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.event}`)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json(
      { success: false, message: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
