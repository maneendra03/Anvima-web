'use client'

import { useState, useEffect } from 'react'
import { Loader2, Shield, CreditCard } from 'lucide-react'
import Script from 'next/script'

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  notes?: Record<string, string>
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, callback: () => void) => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayCheckoutProps {
  amount: number
  orderId: string
  razorpayOrderId: string
  razorpayKeyId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export default function RazorpayCheckout({
  amount,
  orderId,
  razorpayOrderId,
  razorpayKeyId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handlePayment = async () => {
    if (!window.Razorpay) {
      onError('Payment service not loaded. Please refresh and try again.')
      return
    }

    setIsProcessing(true)

    const options: RazorpayOptions = {
      key: razorpayKeyId,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Anvima Creations',
      description: `Order Payment`,
      order_id: razorpayOrderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      notes: {
        orderId: orderId,
      },
      theme: {
        color: '#000000', // Black
      },
      handler: async function (response: RazorpayResponse) {
        try {
          // Verify the payment on server
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            onSuccess(response.razorpay_payment_id)
          } else {
            onError(verifyData.message || 'Payment verification failed')
          }
        } catch (err) {
          console.error('Payment verification error:', err)
          onError('Payment verification failed. Please contact support.')
        }
        setIsProcessing(false)
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false)
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.on('payment.failed', function () {
      onError('Payment failed. Please try again.')
      setIsProcessing(false)
    })
    razorpay.open()
  }

  return (
    <div className="space-y-6">
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => onError('Failed to load payment service')}
      />

      {/* Payment Info */}
      <div className="bg-cream-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 text-charcoal-700">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-charcoal-600">
          Pay securely using UPI, Credit/Debit Cards, Net Banking, or Wallets through Razorpay.
        </p>
      </div>

      {/* Payment Methods Display */}
      <div className="grid grid-cols-4 gap-3">
        <div className="flex flex-col items-center p-3 bg-white border border-charcoal-100 rounded-lg">
          <CreditCard className="w-6 h-6 text-charcoal-500 mb-1" />
          <span className="text-xs text-charcoal-600">Cards</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-white border border-charcoal-100 rounded-lg">
          <img src="/images/upi.svg" alt="UPI" className="w-6 h-6 mb-1" onError={(e) => {
            e.currentTarget.style.display = 'none'
          }} />
          <span className="text-xs text-charcoal-600">UPI</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-white border border-charcoal-100 rounded-lg">
          <svg className="w-6 h-6 text-charcoal-500 mb-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v2h16V6H4zm0 4v8h16v-8H4zm2 2h4v2H6v-2zm6 0h4v2h-4v-2z"/>
          </svg>
          <span className="text-xs text-charcoal-600">Net Banking</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-white border border-charcoal-100 rounded-lg">
          <svg className="w-6 h-6 text-charcoal-500 mb-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span className="text-xs text-charcoal-600">Wallets</span>
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex justify-between items-center p-4 bg-charcoal-50 rounded-lg">
        <span className="font-medium text-charcoal-800">Amount to Pay</span>
        <span className="text-2xl font-bold text-charcoal-900">
          ₹{amount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isProcessing || !scriptLoaded}
        className="w-full bg-charcoal-900 text-white py-4 px-6 rounded-lg font-semibold hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : !scriptLoaded ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading Payment...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Pay ₹{amount.toLocaleString('en-IN')}
          </>
        )}
      </button>

      <p className="text-center text-sm text-charcoal-500">
        Your payment is secured by Razorpay. We never store your card details.
      </p>
    </div>
  )
}
