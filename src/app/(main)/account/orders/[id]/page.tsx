'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Calendar,
  User,
  Box,
  ShoppingBag,
  FileText,
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface OrderItem {
  product: { _id: string; slug: string }
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  variant?: { name: string; option: string }
  customization?: { text?: string; images?: string[]; notes?: string }
}

interface TimelineEvent {
  status: string
  message: string
  timestamp: string
}

interface Order {
  _id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  subtotal: number
  shippingCost: number
  discount: number
  couponCode?: string
  tax: number
  total: number
  tracking?: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: string
  }
  timeline: TimelineEvent[]
  notes?: string
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  pending: { 
    label: 'Order Placed', 
    color: 'text-yellow-600 bg-yellow-100', 
    icon: Clock,
    description: 'Your order has been placed and is awaiting confirmation'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'text-blue-600 bg-blue-100', 
    icon: CheckCircle,
    description: 'Your order has been confirmed and is being prepared'
  },
  processing: { 
    label: 'Processing', 
    color: 'text-purple-600 bg-purple-100', 
    icon: Package,
    description: 'Your order is being carefully prepared with love'
  },
  shipped: { 
    label: 'Shipped', 
    color: 'text-indigo-600 bg-indigo-100', 
    icon: Truck,
    description: 'Your order is on its way to you'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'text-green-600 bg-green-100', 
    icon: CheckCircle,
    description: 'Your order has been delivered successfully'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'text-red-600 bg-red-100', 
    icon: XCircle,
    description: 'This order has been cancelled'
  },
  refunded: { 
    label: 'Refunded', 
    color: 'text-orange-600 bg-orange-100', 
    icon: RefreshCw,
    description: 'This order has been refunded'
  },
}

const paymentStatusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
  paid: { label: 'Paid', color: 'text-green-600 bg-green-100' },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-100' },
  refunded: { label: 'Refunded', color: 'text-orange-600 bg-orange-100' },
}

const orderSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

interface Props {
  params: Promise<{ id: string }>
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/user/orders/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setOrder(data.data)
        } else {
          toast.error('Order not found')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const canCancelOrder = () => {
    if (!order) return false
    return ['pending', 'confirmed'].includes(order.status)
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    setCancelling(true)
    try {
      const response = await fetch(`/api/user/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel',
          reason: cancelReason || 'Cancelled by customer'
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Order cancelled successfully')
        // Update local state
        setOrder({
          ...order,
          status: 'cancelled',
          paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus,
          timeline: [
            ...order.timeline,
            {
              status: 'cancelled',
              message: cancelReason || 'Cancelled by customer',
              timestamp: new Date().toISOString()
            }
          ]
        })
        setShowCancelModal(false)
        setCancelReason('')
      } else {
        toast.error(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCurrentStepIndex = () => {
    if (!order) return 0
    if (order.status === 'cancelled' || order.status === 'refunded') return -1
    return orderSteps.indexOf(order.status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status]
  const StatusIcon = statusInfo.icon
  const currentStep = getCurrentStepIndex()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <button
              onClick={() => copyToClipboard(order.orderNumber, 'Order number')}
              className="p-1.5 hover:bg-gray-100 rounded"
            >
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </span>
          {canCancelOrder() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Cancel Order Info Banner */}
      {canCancelOrder() && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">You can still cancel this order</p>
              <p className="text-sm text-amber-700 mt-1">
                Orders can be cancelled before they are processed. Once the order is being processed or shipped, it cannot be cancelled.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Tracker */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          {/* Desktop Progress */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-forest-500 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
                />
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {orderSteps.map((step, index) => {
                  const stepConfig = statusConfig[step as keyof typeof statusConfig]
                  const StepIcon = stepConfig.icon
                  const isCompleted = index <= currentStep
                  const isCurrent = index === currentStep
                  
                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors ${
                        isCompleted 
                          ? 'bg-forest-500 text-white' 
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-forest-100' : ''}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`mt-2 text-sm font-medium ${
                        isCompleted ? 'text-forest-600' : 'text-gray-400'
                      }`}>
                        {stepConfig.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile Progress */}
          <div className="md:hidden space-y-4">
            {orderSteps.map((step, index) => {
              const stepConfig = statusConfig[step as keyof typeof statusConfig]
              const StepIcon = stepConfig.icon
              const isCompleted = index <= currentStep
              const isCurrent = index === currentStep
              
              return (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-forest-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-forest-100' : ''}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stepConfig.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-gray-500">{stepConfig.description}</p>
                    )}
                  </div>
                  {isCompleted && index < currentStep && (
                    <CheckCircle className="w-5 h-5 text-forest-500" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Estimated Delivery */}
          {order.tracking?.estimatedDelivery && order.status !== 'delivered' && (
            <div className="mt-6 p-4 bg-forest-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-forest-600" />
                <div>
                  <p className="text-sm text-forest-600 font-medium">Estimated Delivery</p>
                  <p className="text-forest-800 font-semibold">
                    {new Date(order.tracking.estimatedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tracking Info */}
      {order.tracking?.trackingNumber && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-forest-600" />
            Tracking Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {order.tracking.carrier && (
              <div>
                <p className="text-sm text-gray-500">Carrier</p>
                <p className="font-medium text-gray-900">{order.tracking.carrier}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium text-gray-900">{order.tracking.trackingNumber}</p>
                <button
                  onClick={() => copyToClipboard(order.tracking!.trackingNumber!, 'Tracking number')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          {order.tracking.trackingUrl && (
            <a
              href={order.tracking.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700"
            >
              <ExternalLink className="w-4 h-4" />
              Track Package
            </a>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-forest-600" />
              Order Items ({order.items.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <div key={index} className="p-4 flex gap-4">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-cream-100 to-cream-200">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-charcoal-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug || item.product?.slug}`}
                    className="font-medium text-gray-900 hover:text-forest-600 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-gray-500 mt-1">
                      {item.variant.name}: {item.variant.option}
                    </p>
                  )}
                  {item.customization?.text && (
                    <p className="text-sm text-gray-500 mt-1">
                      Custom text: &quot;{item.customization.text}&quot;
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-forest-600" />
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Discount {order.couponCode && `(${order.couponCode})`}
                  </span>
                  <span className="text-green-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">
                  {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-lg text-gray-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-forest-600" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatusConfig[order.paymentStatus].color}`}>
                  {paymentStatusConfig[order.paymentStatus].label}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-forest-600" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {order.shippingAddress.name}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                {order.shippingAddress.phone}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.address}
                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
              </p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-600" />
            Order Timeline
          </h2>
          <div className="space-y-4">
            {order.timeline.slice().reverse().map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-forest-500' : 'bg-gray-300'}`} />
                  {index < order.timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{event.message}</p>
                  <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Need Help */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-forest-50 to-peach-50 rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Need Help with Your Order?</h3>
            <p className="text-gray-600 text-sm mt-1">
              Our support team is here to assist you with any questions.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={`https://wa.me/919876543210?text=Hi, I need help with order ${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
              {order.paymentStatus === 'paid' && (
                <span className="block mt-2 text-sm text-amber-600">
                  Your payment will be refunded within 5-7 business days.
                </span>
              )}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price">Found a better price</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">Delivery time too long</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
