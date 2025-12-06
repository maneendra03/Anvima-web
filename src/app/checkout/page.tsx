'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  CreditCard, 
  Smartphone, 
  Truck,
  ChevronLeft, 
  Lock, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useCartStore, CartItem } from '@/store/cartStore'
import { useAuthStore } from '@/store/auth'
import RazorpayCheckout from '@/components/checkout/CheckoutForm'
import CouponInput from '@/components/checkout/CouponInput'
import toast from 'react-hot-toast'
import { products } from '@/data'

// Helper to get slug from mock data by product ID or name
function getProductSlug(item: CartItem): string | undefined {
  // If item already has slug, use it
  if (item.slug) return item.slug
  
  // Try to find by productId in mock data (supports "1", "2", etc.)
  const productById = products.find(p => p.id === item.productId || p.id === item.id)
  if (productById) {
    console.log('Found product by ID:', productById.slug)
    return productById.slug
  }
  
  // Try to find by name (case-insensitive)
  if (item.name) {
    const productByName = products.find(p => 
      p.name.toLowerCase() === item.name.toLowerCase()
    )
    if (productByName) {
      console.log('Found product by name:', productByName.slug)
      return productByName.slug
    }
  }
  
  console.log('Could not find slug for item:', item)
  return undefined
}

type PaymentMethod = 'razorpay' | 'cod' | 'pay_later'

interface AppliedCoupon {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  discountAmount: number
  description?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod') // Default to COD for now
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderData, setOrderData] = useState<{
    orderId: string
    orderNumber: string
    razorpayOrderId: string | null
    razorpayKeyId: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  // Update form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.name?.split(' ')[0] || prev.firstName,
        lastName: user.name?.split(' ').slice(1).join(' ') || prev.lastName,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const validateShippingForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name')
      return false
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number')
      return false
    }
    if (!formData.address) {
      setError('Please enter your address')
      return false
    }
    if (!formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all address fields')
      return false
    }
    if (formData.pincode.length !== 6) {
      setError('Please enter a valid 6-digit PIN code')
      return false
    }
    return true
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateShippingForm()) {
      setStep(2)
    }
  }

  const createOrder = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Debug: Log cart items
      console.log('Cart items:', items)
      
      // Prepare order items - include slug for product lookup (handles old cart items without slug)
      const orderItems = items.map(item => {
        const slug = getProductSlug(item)
        console.log('Item:', item.name, 'productId:', item.productId, 'found slug:', slug)
        return {
          productId: item.productId || item.id,
          slug: slug, // Get slug from item or lookup in mock data
          quantity: item.quantity,
          price: item.price,
          variant: item.customization?.size ? { name: 'Size', option: item.customization.size } : undefined,
          customization: item.customization ? { 
            text: item.customization.text,
            images: item.customization.imageUrl ? [item.customization.imageUrl] : undefined,
            notes: item.customization.engraving,
          } : undefined,
        }
      })

      // Build request body
      const requestBody = {
        items: orderItems,
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        paymentMethod,
      }
      
      // Debug: Log the full request body being sent
      console.log('Sending order request:', JSON.stringify(requestBody, null, 2))

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create order')
      }

      // If online payment, create Razorpay order
      if (paymentMethod === 'razorpay') {
        const razorpayResponse = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            receipt: data.data.order.orderNumber,
            notes: {
              orderId: data.data.order.id,
            },
          }),
        })

        const razorpayData = await razorpayResponse.json()

        if (!razorpayData.success) {
          throw new Error(razorpayData.message || 'Failed to create payment order')
        }

        // Update order with Razorpay order ID
        await fetch(`/api/orders/${data.data.order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentDetails: {
              razorpayOrderId: razorpayData.data.orderId,
            },
          }),
        })

        setOrderData({
          orderId: data.data.order.id,
          orderNumber: data.data.order.orderNumber,
          razorpayOrderId: razorpayData.data.orderId,
          razorpayKeyId: razorpayData.data.keyId,
        })
      } else {
        // COD or Pay Later order - just create order and show success
        setOrderData({
          orderId: data.data.order.id,
          orderNumber: data.data.order.orderNumber,
          razorpayOrderId: null,
          razorpayKeyId: null,
        })
        handleOrderSuccess()
      }
    } catch (err) {
      console.error('Create order error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create order')
      toast.error('Failed to create order')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createOrder()
  }

  const handleOrderSuccess = () => {
    setOrderPlaced(true)
    clearCart()
    toast.success('Order placed successfully!')
  }

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId)
    handleOrderSuccess()
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    toast.error(errorMessage)
  }

  // Calculate totals
  const subtotal = getTotalPrice()
  const couponDiscount = appliedCoupon?.discountAmount || 0
  const shipping = subtotal >= 999 ? 0 : 99
  const taxableAmount = subtotal - couponDiscount
  const tax = Math.round(taxableAmount * 0.18)
  const total = subtotal - couponDiscount + shipping + tax

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-charcoal-500 mb-2">
            Thank you for your order. We&apos;ve sent a confirmation to your email.
          </p>
          {orderData && (
            <p className="text-charcoal-600 mb-8">
              Order Number: <span className="font-bold text-forest-600">{orderData.orderNumber}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={orderData ? `/account/orders` : '/shop'}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-forest-600 text-white rounded-full font-medium hover:bg-forest-700"
              >
                View My Orders
              </motion.button>
            </Link>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 border-2 border-forest-600 text-forest-600 rounded-full font-medium hover:bg-forest-50"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Empty Cart
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold text-charcoal-700 mb-4">
            Your cart is empty
          </h1>
          <Link href="/shop" className="text-forest-600 hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-charcoal-600 hover:text-forest-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div
            className={`flex items-center gap-2 ${
              step >= 1 ? 'text-forest-600' : 'text-charcoal-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 1 ? 'bg-forest-600 text-white' : 'bg-cream-200'
              }`}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="font-medium hidden sm:block">Shipping</span>
          </div>
          <div className={`w-20 h-1 rounded ${step >= 2 ? 'bg-forest-600' : 'bg-cream-200'}`} />
          <div
            className={`flex items-center gap-2 ${
              step >= 2 ? 'text-forest-600' : 'text-charcoal-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= 2 ? 'bg-forest-600 text-white' : 'bg-cream-200'
              }`}
            >
              2
            </div>
            <span className="font-medium hidden sm:block">Payment</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-charcoal-700 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-forest-600" />
                  Shipping Information
                </h2>

                <form onSubmit={handleShippingSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                        placeholder="House no., Street, Locality"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                        placeholder="XXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
                        placeholder="Near..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-8 py-4 bg-forest-600 text-white rounded-lg font-semibold hover:bg-forest-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-charcoal-700 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-forest-600" />
                  Payment Method
                </h2>

                {/* Payment Method Selection */}
                {!orderData?.razorpayOrderId && (
                  <>
                    <div className="space-y-4 mb-6">
                      {/* Cash on Delivery - Default */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cod'
                            ? 'border-forest-600 bg-forest-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Truck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-charcoal-700">
                            Cash on Delivery
                          </p>
                          <p className="text-sm text-charcoal-500">
                            Pay when you receive your order
                          </p>
                        </div>
                        {paymentMethod === 'cod' && (
                          <Check className="w-5 h-5 text-forest-600" />
                        )}
                      </button>

                      {/* Pay Online - Razorpay */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('razorpay')}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === 'razorpay'
                            ? 'border-forest-600 bg-forest-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-charcoal-700">
                            Pay Online
                          </p>
                          <p className="text-sm text-charcoal-500">
                            UPI, Cards, Net Banking, Wallets
                          </p>
                        </div>
                        {paymentMethod === 'razorpay' && (
                          <Check className="w-5 h-5 text-forest-600" />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-charcoal-200 rounded-lg font-medium hover:bg-cream-50 transition-colors"
                      >
                        Back
                      </button>
                      <motion.button
                        onClick={handlePaymentSubmit}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-forest-600 text-white rounded-lg font-semibold hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating Order...
                          </>
                        ) : paymentMethod === 'cod' ? (
                          <>
                            <Check className="w-4 h-4" />
                            Place Order - ₹{total.toLocaleString('en-IN')}
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Proceed to Pay - ₹{total.toLocaleString('en-IN')}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}

                {/* Razorpay Payment */}
                {orderData?.razorpayOrderId && orderData?.razorpayKeyId && paymentMethod === 'razorpay' && (
                  <div className="mt-6">
                    <div className="mb-6 p-4 bg-forest-50 rounded-lg border border-forest-200">
                      <p className="text-sm text-forest-700">
                        <strong>Order Created:</strong> {orderData.orderNumber}
                      </p>
                      <p className="text-sm text-forest-600 mt-1">
                        Complete your payment below to confirm your order.
                      </p>
                    </div>
                    
                    <RazorpayCheckout
                      amount={total}
                      orderId={orderData.orderId}
                      razorpayOrderId={orderData.razorpayOrderId}
                      razorpayKeyId={orderData.razorpayKeyId}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      customerEmail={formData.email}
                      customerPhone={formData.phone}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-charcoal-700 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-700 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-charcoal-500">Qty: {item.quantity}</p>
                      {item.customization?.size && (
                        <p className="text-xs text-charcoal-400">Size: {item.customization.size}</p>
                      )}
                    </div>
                    <p className="font-medium text-charcoal-700 text-sm">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-charcoal-100 pt-4">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-charcoal-800 pt-3 border-t border-charcoal-100">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <CouponInput
                cartTotal={subtotal}
                onCouponApplied={setAppliedCoupon}
                appliedCoupon={appliedCoupon}
              />

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-charcoal-100">
                <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout powered by Razorpay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-500">
                  <Truck className="w-4 h-4" />
                  <span>Free shipping on orders over ₹999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
