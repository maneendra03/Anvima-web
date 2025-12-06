'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, Search, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: {
    name: string
    image: string
    quantity: number
    price: number
  }[]
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders')
      const data = await response.json()
      if (data.success) {
        setOrders(data.data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId)
    try {
      const response = await fetch(`/api/user/orders/${orderId}`, {
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
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' as const }
            : order
        ))
        setShowCancelModal(null)
        setCancelReason('')
      } else {
        toast.error(data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const canCancelOrder = (status: string) => {
    return ['pending', 'confirmed'].includes(status)
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal-800">My Orders</h2>
          <p className="text-charcoal-500 mt-1">Track and manage your orders</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 bg-white"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-800 mb-2">
            {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
          </h3>
          <p className="text-charcoal-500 mb-6">
            {orders.length === 0
              ? "You haven't placed any orders yet. Start shopping!"
              : 'Try adjusting your search or filter.'}
          </p>
          {orders.length === 0 && (
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors"
            >
              Start Shopping
              <ChevronRight className="w-5 h-5" />
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-cream-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-cream-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-sm text-charcoal-500">Order Number</p>
                      <p className="font-semibold text-charcoal-800">{order.orderNumber}</p>
                    </div>
                    <div className="hidden sm:block w-px h-8 bg-cream-300" />
                    <div>
                      <p className="text-sm text-charcoal-500">Order Date</p>
                      <p className="font-medium text-charcoal-800">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {status.label}
                  </span>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {order.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-charcoal-800 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-charcoal-500">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="mt-4 pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-charcoal-500">Total Amount</p>
                      <p className="text-xl font-bold text-charcoal-800">
                        ₹{order.total.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => setShowCancelModal(order.id)}
                          className="flex-1 sm:flex-none px-4 py-2 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <button className="flex-1 sm:flex-none px-4 py-2 border border-forest-600 text-forest-600 rounded-lg font-medium hover:bg-forest-50 transition-colors">
                          Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

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
                <p className="text-sm text-gray-500">
                  Order #{orders.find(o => o.id === showCancelModal)?.orderNumber}
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this order? This action cannot be undone.
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
                  setShowCancelModal(null)
                  setCancelReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={cancellingOrderId === showCancelModal}
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancelOrder(showCancelModal)}
                disabled={cancellingOrderId === showCancelModal}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancellingOrderId === showCancelModal ? (
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
