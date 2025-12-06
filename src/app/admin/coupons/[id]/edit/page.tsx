'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Users,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditCouponPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    validFrom: '',
    validUntil: '',
    isActive: true,
  })

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const response = await fetch(`/api/admin/coupons/${id}`)
        const data = await response.json()

        if (data.success) {
          const coupon = data.data
          setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discountType: coupon.discountType,
            discountValue: coupon.discountValue.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
            usageLimit: coupon.usageLimit?.toString() || '',
            perUserLimit: coupon.perUserLimit?.toString() || '1',
            validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
            validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
            isActive: coupon.isActive,
          })
        } else {
          toast.error('Coupon not found')
          router.push('/admin/coupons')
        }
      } catch (error) {
        console.error('Failed to fetch coupon:', error)
        toast.error('Failed to load coupon')
        router.push('/admin/coupons')
      } finally {
        setLoading(false)
      }
    }

    fetchCoupon()
  }, [id, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required'
    } else if (formData.code.length > 20) {
      newErrors.code = 'Code cannot exceed 20 characters'
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = 'Valid discount value is required'
    } else if (formData.discountType === 'percentage' && parseFloat(formData.discountValue) > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%'
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Start date is required'
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'End date is required'
    } else if (formData.validFrom && new Date(formData.validUntil) <= new Date(formData.validFrom)) {
      newErrors.validUntil = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase().trim(),
          description: formData.description.trim() || undefined,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
          maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
          perUserLimit: parseInt(formData.perUserLimit) || 1,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          isActive: formData.isActive,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Coupon updated successfully!')
        router.push('/admin/coupons')
      } else {
        toast.error(data.message || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Failed to update coupon:', error)
      toast.error('Failed to update coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-forest-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading coupon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/coupons"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Coupons
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
        <p className="text-gray-500 text-sm mt-1">Update coupon details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-forest-600" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g., SUMMER20"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 uppercase ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={20}
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Summer sale - 20% off on all items"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                maxLength={200}
              />
              <p className="text-gray-500 text-xs mt-1">{formData.description.length}/200 characters</p>
            </div>
          </div>
        </motion.div>

        {/* Discount Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {formData.discountType === 'percentage' ? (
              <Percent className="w-5 h-5 text-forest-600" />
            ) : (
              <IndianRupee className="w-5 h-5 text-forest-600" />
            )}
            Discount Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {formData.discountType === 'percentage' ? '%' : '₹'}
                </span>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className={`w-full pl-8 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                    errors.discountValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step="0.01"
                />
              </div>
              {errors.discountValue && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.discountValue}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                  min="0"
                />
              </div>
            </div>

            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Discount Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleChange}
                    placeholder="No limit"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Usage Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-forest-600" />
            Usage Limits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                placeholder="Unlimited"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uses Per Customer
              </label>
              <input
                type="number"
                name="perUserLimit"
                value={formData.perUserLimit}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                min="1"
              />
            </div>
          </div>
        </motion.div>

        {/* Validity Period */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-600" />
            Validity Period
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                  errors.validFrom ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.validFrom && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.validFrom}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 ${
                  errors.validUntil ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.validUntil && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.validUntil}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-forest-600 border-gray-300 rounded focus:ring-forest-500"
              />
              <span className="text-sm text-gray-700">
                Coupon is active
              </span>
            </label>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-end gap-4"
        >
          <Link
            href="/admin/coupons"
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Coupon
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  )
}
