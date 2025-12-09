import Razorpay from 'razorpay'
import crypto from 'crypto'

// Server-side Razorpay instance - only initialize if keys are available
const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && 
  process.env.RAZORPAY_KEY_ID.startsWith('rzp_')

export const razorpay = isRazorpayConfigured 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null

// Check if Razorpay is configured
export function isPaymentEnabled(): boolean {
  return !!isRazorpayConfigured && razorpay !== null
}

// Format amount for Razorpay (convert to paise - smallest currency unit)
export function formatAmountForRazorpay(amount: number): number {
  // Razorpay expects amount in paise (1 INR = 100 paise)
  return Math.round(amount * 100)
}

// Format amount from Razorpay (convert from paise to rupees)
export function formatAmountFromRazorpay(amount: number): number {
  return amount / 100
}

// Verify Razorpay payment signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex')

  return expectedSignature === signature
}
