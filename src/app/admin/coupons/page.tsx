'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  MoreVertical,
  Eye,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  usageLimit?: number
  usedCount: number
  perUserLimit?: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}

interface Stats {
  total: number
  active: number
  expired: number
  totalUsage: number
}

const statusFilters = [
  { value: '', label: 'All Coupons' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
  { value: 'scheduled', label: 'Scheduled' },
]

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.append('search', search)
      if (status) params.append('status', status)

      const response = await fetch(`/api/admin/coupons?${params}`)
      const data = await response.json()

      if (data.success) {
        setCoupons(data.data.coupons)
        setTotalPages(data.data.pagination.totalPages)
        setStats(data.data.stats)
      } else {
        toast.error(data.message || 'Failed to load coupons')
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (data.success) {
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        toast.error(data.message || 'Failed to delete coupon')
      }
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      toast.error('Failed to delete coupon')
    } finally {
      setDeleteModal(null)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await response.json()

      if (data.success) {
        toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully`)
        fetchCoupons()
      } else {
        toast.error(data.message || 'Failed to update coupon')
      }
    } catch (error) {
      console.error('Failed to update coupon:', error)
      toast.error('Failed to update coupon')
    }
    setActionMenu(null)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)

    if (!coupon.isActive) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-700', icon: XCircle }
    }
    if (validUntil < now) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertCircle }
    }
    if (validFrom > now) {
      return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock }
    }
    return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle }
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`
    }
    return `₹${coupon.discountValue} OFF`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage discount coupons and promotions</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Coupons</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                <p className="text-sm text-gray-500">Expired</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
                <p className="text-sm text-gray-500">Total Used</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 h-10 bg-gray-200 rounded" />
                  <div className="flex-1 h-10 bg-gray-200 rounded" />
                  <div className="w-20 h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-500 mb-6">
              {search || status ? 'Try adjusting your filters' : 'Create your first coupon to get started'}
            </p>
            {!search && !status && (
              <Link
                href="/admin/coupons/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Coupon
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Coupon
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => {
                  const statusInfo = getCouponStatus(coupon)
                  const StatusIcon = statusInfo.icon
                  return (
                    <motion.tr
                      key={coupon._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-peach-100 rounded-lg">
                            {coupon.discountType === 'percentage' ? (
                              <Percent className="w-5 h-5 text-peach-600" />
                            ) : (
                              <IndianRupee className="w-5 h-5 text-peach-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => copyToClipboard(coupon.code)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Copy code"
                              >
                                <Copy className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                            {coupon.description && (
                              <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                                {coupon.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-semibold text-forest-600">
                            {formatDiscount(coupon)}
                          </span>
                          {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Min. order: ₹{coupon.minOrderAmount}
                            </p>
                          )}
                          {coupon.maxDiscountAmount && (
                            <p className="text-xs text-gray-500">
                              Max: ₹{coupon.maxDiscountAmount}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {coupon.usedCount}
                            {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === coupon._id ? null : coupon._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                          <AnimatePresence>
                            {actionMenu === coupon._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                              >
                                <Link
                                  href={`/admin/coupons/${coupon._id}`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/admin/coupons/${coupon._id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleToggleStatus(coupon)}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {coupon.isActive ? (
                                    <>
                                      <XCircle className="w-4 h-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteModal(coupon._id)
                                    setActionMenu(null)
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setDeleteModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 max-w-md w-full mx-4 z-50"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Coupon</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this coupon? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteModal)}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
