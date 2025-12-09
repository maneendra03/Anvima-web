'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronDown,
  Loader2,
  X,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CustomOrder {
  _id: string
  requestNumber: string
  name: string
  email: string
  phone: string
  occasion: string
  budget: string
  deadline: string
  description: string
  images?: string[]
  referenceLinks?: string[]
  status: 'pending' | 'contacted' | 'quoted' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'
  adminNotes?: string
  quotedPrice?: number
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  contacted: { bg: 'bg-blue-100', text: 'text-blue-700', icon: MessageCircle },
  quoted: { bg: 'bg-purple-100', text: 'text-purple-700', icon: AlertCircle },
  accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  'in-progress': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: RefreshCw },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
}

export default function AdminCustomOrdersPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  })

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/admin/custom-orders?${params}`)
      const data = await res.json()

      if (data.success) {
        setOrders(data.data.orders)
        setPagination(prev => ({ ...prev, ...data.data.pagination }))
      } else {
        toast.error(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, status: string, adminNotes?: string, quotedPrice?: number) => {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/custom-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes, quotedPrice })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Order updated successfully')
        fetchOrders()
        setShowModal(false)
        setSelectedOrder(null)
      } else {
        toast.error(data.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-800">Custom Orders</h1>
          <p className="text-charcoal-500">Manage custom order requests from customers</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-forest-500 text-white rounded-lg hover:bg-forest-600"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or request number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-forest-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No custom orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 border-b border-cream-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Request #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((order) => {
                  const StatusIcon = statusColors[order.status]?.icon || Clock
                  return (
                    <tr key={order._id} className="hover:bg-cream-50">
                      <td className="px-4 py-4">
                        <span className="font-mono text-sm font-medium text-forest-600">
                          {order.requestNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-charcoal-800">{order.name}</p>
                          <p className="text-sm text-charcoal-500">{order.email}</p>
                          <p className="text-sm text-charcoal-500">{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-charcoal-600">{order.budget}</td>
                      <td className="px-4 py-4 text-charcoal-600">{formatDate(order.deadline)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status]?.bg} ${statusColors[order.status]?.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-charcoal-600">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowModal(true)
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-charcoal-200 rounded-lg disabled:opacity-50 hover:bg-cream-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-charcoal-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-charcoal-200 rounded-lg disabled:opacity-50 hover:bg-cream-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false)
            setSelectedOrder(null)
          }}
          onUpdate={updateOrderStatus}
          updating={updating}
        />
      )}
    </div>
  )
}

// Order Detail Modal Component
function OrderDetailModal({
  order,
  onClose,
  onUpdate,
  updating
}: {
  order: CustomOrder
  onClose: () => void
  onUpdate: (id: string, status: string, notes?: string, price?: number) => void
  updating: boolean
}) {
  const [status, setStatus] = useState(order.status)
  const [adminNotes, setAdminNotes] = useState(order.adminNotes || '')
  const [quotedPrice, setQuotedPrice] = useState(order.quotedPrice?.toString() || '')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-charcoal-800">
              Custom Order Details
            </h2>
            <p className="text-sm text-charcoal-500 font-mono">{order.requestNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-charcoal-700 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-charcoal-500">Name:</span> <span className="font-medium">{order.name}</span></p>
                <p><span className="text-charcoal-500">Email:</span> <span className="font-medium">{order.email}</span></p>
                <p><span className="text-charcoal-500">Phone:</span> <span className="font-medium">{order.phone}</span></p>
              </div>
              <a
                href={`https://wa.me/${order.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>

            <div>
              <h3 className="font-semibold text-charcoal-700 mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-charcoal-500">Occasion:</span> <span className="font-medium">{order.occasion}</span></p>
                <p><span className="text-charcoal-500">Budget:</span> <span className="font-medium">{order.budget}</span></p>
                <p><span className="text-charcoal-500">Deadline:</span> <span className="font-medium">{formatDate(order.deadline)}</span></p>
                <p><span className="text-charcoal-500">Created:</span> <span className="font-medium">{formatDate(order.createdAt)}</span></p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-charcoal-700 mb-2">Description</h3>
            <p className="text-charcoal-600 bg-cream-50 p-4 rounded-lg whitespace-pre-wrap">
              {order.description}
            </p>
          </div>

          {/* Reference Images */}
          {order.images && order.images.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Reference Images ({order.images.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {order.images.map((img, index) => (
                  <a
                    key={index}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-24 h-24 rounded-lg overflow-hidden border border-cream-200 hover:border-forest-500 transition-colors"
                  >
                    <img
                      src={img}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reference Links */}
          {order.referenceLinks && order.referenceLinks.length > 0 && (
            <div>
              <h3 className="font-semibold text-charcoal-700 mb-3 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Reference Links ({order.referenceLinks.length})
              </h3>
              <div className="space-y-2">
                {order.referenceLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-cream-50 rounded-lg text-forest-600 hover:bg-cream-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm truncate">{link}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Admin Section */}
          <div className="border-t border-cream-200 pt-6">
            <h3 className="font-semibold text-charcoal-700 mb-4">Admin Actions</h3>
            
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomOrder['status'])}
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="accepted">Accepted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-charcoal-600 mb-1">
                  Quoted Price (₹)
                </label>
                <input
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Enter quoted price"
                  className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal-600 mb-1">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add internal notes about this order..."
                className="w-full px-3 py-2 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-charcoal-200 rounded-lg hover:bg-cream-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onUpdate(
                  order._id,
                  status,
                  adminNotes,
                  quotedPrice ? parseFloat(quotedPrice) : undefined
                )}
                disabled={updating}
                className="px-4 py-2 bg-forest-500 text-white rounded-lg hover:bg-forest-600 disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
