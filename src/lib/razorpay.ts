import Razorpay from 'razorpay'
import crypto from 'crypto'

// Server-side Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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
