'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Search, Truck, CheckCircle, Clock, XCircle, MapPin, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface TrackingData {
  orderNumber: string
  status: string
  paymentStatus: string
  customerName: string
  city: string
  orderDate: string
  tracking: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
  } | null
  timeline: {
    status: string
    message: string
    timestamp: string
  }[]
  estimatedDelivery: string | null
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', label: 'Order Pending' },
  confirmed: { icon: CheckCircle, color: 'text-blue-500', label: 'Order Confirmed' },
  processing: { icon: Package, color: 'text-purple-500', label: 'Processing' },
  shipped: { icon: Truck, color: 'text-indigo-500', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-500', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-500', label: 'Cancelled' },
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number')
      return
    }

    setIsLoading(true)
    setTrackingData(null)

    try {
      const params = new URLSearchParams({ orderNumber: orderNumber.trim() })
      if (phone.trim()) {
        params.append('phone', phone.trim())
      }

      const res = await fetch(`/api/track?${params}`)
      const data = await res.json()

      if (data.success) {
        setTrackingData(data.data)
      } else {
        toast.error(data.message || 'Order not found')
      }
    } catch (error) {
      toast.error('Failed to track order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusStep = (status: string): number => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
    return steps.indexOf(status)
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-forest-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-2">
            Track Your Order
          </h1>
          <p className="text-charcoal-500">
            Enter your order number to see the current status
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleTrack}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Order Number *
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="ANV-XXXXX-XXXX"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Phone Number (Optional - for verification)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Last 4 digits of your phone"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Tracking Result */}
        {trackingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-200">
              <div>
                <p className="text-sm text-charcoal-500">Order Number</p>
                <p className="text-xl font-bold text-charcoal-700">
                  {trackingData.orderNumber}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full ${
                trackingData.status === 'delivered' 
                  ? 'bg-green-100 text-green-700'
                  : trackingData.status === 'cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-forest-100 text-forest-700'
              }`}>
                {statusConfig[trackingData.status]?.label || trackingData.status}
              </div>
            </div>

            {/* Progress Steps */}
            {trackingData.status !== 'cancelled' && (
              <div className="mb-8">
                <div className="flex items-center justify-between relative">
                  {['Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                    const currentStep = getStatusStep(trackingData.status)
                    const isCompleted = index <= currentStep - 1
                    const isCurrent = index === currentStep - 1
                    
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted || isCurrent
                            ? 'bg-forest-500 text-white'
                            : 'bg-cream-200 text-charcoal-400'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={`text-xs mt-2 ${
                          isCompleted || isCurrent ? 'text-forest-600 font-medium' : 'text-charcoal-400'
                        }`}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-cream-200 -z-0">
                    <div 
                      className="h-full bg-forest-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, (getStatusStep(trackingData.status) - 1) * 33.33)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                <Calendar className="w-5 h-5 text-forest-500" />
                <div>
                  <p className="text-xs text-charcoal-500">Order Date</p>
                  <p className="text-sm font-medium text-charcoal-700">
                    {new Date(trackingData.orderDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {trackingData.estimatedDelivery && (
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                  <Truck className="w-5 h-5 text-forest-500" />
                  <div>
                    <p className="text-xs text-charcoal-500">Estimated Delivery</p>
                    <p className="text-sm font-medium text-charcoal-700">
                      {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
              {trackingData.city && (
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-forest-500" />
                  <div>
                    <p className="text-xs text-charcoal-500">Shipping To</p>
                    <p className="text-sm font-medium text-charcoal-700">
                      {trackingData.customerName}, {trackingData.city}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Tracking Details */}
            {trackingData.tracking?.trackingNumber && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Tracking Number: {trackingData.tracking.trackingNumber}
                </p>
                {trackingData.tracking.carrier && (
                  <p className="text-sm text-blue-600">
                    Carrier: {trackingData.tracking.carrier}
                  </p>
                )}
                {trackingData.tracking.trackingUrl && (
                  <a
                    href={trackingData.tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 underline mt-2 inline-block"
                  >
                    Track on carrier website →
                  </a>
                )}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-charcoal-700 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {trackingData.timeline.slice().reverse().map((event, index) => {
                  const config = statusConfig[event.status] || { icon: Clock, color: 'text-gray-500' }
                  const Icon = config.icon
                  
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-forest-100' : 'bg-cream-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${index === 0 ? 'text-forest-600' : 'text-charcoal-400'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${index === 0 ? 'text-charcoal-700' : 'text-charcoal-500'}`}>
                          {event.message}
                        </p>
                        <p className="text-xs text-charcoal-400">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
