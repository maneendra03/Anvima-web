'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X, Check, Loader2, Percent } from 'lucide-react'
import toast from 'react-hot-toast'

interface CouponData {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
  description?: string
}

interface CouponInputProps {
  cartTotal: number
  onCouponApplied: (coupon: CouponData | null) => void
  appliedCoupon: CouponData | null
}

export default function CouponInput({ cartTotal, onCouponApplied, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApplyCoupon = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), cartTotal }),
      })

      const data = await response.json()

      if (data.success) {
        onCouponApplied(data.data)
        toast.success(`Coupon applied! You save ₹${data.data.discountAmount}`)
        setCode('')
      } else {
        setError(data.message || 'Invalid coupon code')
      }
    } catch (err) {
      setError('Failed to validate coupon')
      console.error('Coupon validation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponApplied(null)
    toast.success('Coupon removed')
  }

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between p-3 bg-charcoal-50 border border-charcoal-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-charcoal-100 rounded-full flex items-center justify-center">
                <Percent className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="font-medium text-charcoal-700">{appliedCoupon.code}</p>
                <p className="text-sm text-charcoal-600">
                  {appliedCoupon.discountType === 'percentage'
                    ? `${appliedCoupon.discountValue}% off`
                    : `₹${appliedCoupon.discountValue} off`}
                  {appliedCoupon.description && ` • ${appliedCoupon.description}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-charcoal-700 font-semibold">
                -₹{appliedCoupon.discountAmount}
              </span>
              <button
                onClick={handleRemoveCoupon}
                className="p-1 hover:bg-charcoal-100 rounded-full transition-colors"
                title="Remove coupon"
              >
                <X className="w-4 h-4 text-charcoal-600" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              <Tag className="w-4 h-4 inline-block mr-1" />
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="Enter coupon code"
                className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500 transition-colors uppercase ${
                  error ? 'border-red-300' : 'border-charcoal-200'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleApplyCoupon()
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApplyCoupon}
                disabled={loading || !code.trim()}
                className="px-4 py-2.5 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Apply
              </motion.button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
