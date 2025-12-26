'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Camera, Check } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useWishlistStore } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

interface AccountStats {
  orders: number
  reviews: number
  coupons: number
}

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore()
  const wishlistItems = useWishlistStore((state) => state.items)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<AccountStats>({ orders: 0, reviews: 0, coupons: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })

  // Fetch account stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders count
        const ordersRes = await fetch('/api/user/orders')
        const ordersData = await ordersRes.json()
        const ordersCount = ordersData.success ? ordersData.data?.orders?.length || 0 : 0

        // Fetch available coupons
        const couponsRes = await fetch('/api/coupons')
        const couponsData = await couponsRes.json()
        const couponsCount = couponsData.success ? couponsData.data?.length || 0 : 0

        setStats({
          orders: ordersCount,
          reviews: 0, // Reviews count could be fetched if there's an API
          coupons: couponsCount,
        })
      } catch (error) {
        console.error('Failed to fetch account stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Profile updated successfully!')
        await fetchUser()
        setIsEditing(false)
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal-800">Profile Information</h2>
          <p className="text-charcoal-500 mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-charcoal-900 hover:bg-charcoal-50 rounded-lg transition-colors font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-cream-200">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-peach-400 to-blush-400 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-charcoal-900 rounded-full flex items-center justify-center text-white hover:bg-charcoal-800 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-charcoal-800">{user.name}</h3>
          <p className="text-charcoal-500">{user.email}</p>
          {user.isVerified && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-charcoal-100 text-charcoal-700 text-xs rounded-full">
              <Check className="w-3 h-3" />
              Verified Account
            </span>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500"
                  placeholder="Your full name"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                <User className="w-5 h-5 text-charcoal-400" />
                <span className="text-charcoal-800">{user.name}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
              <Mail className="w-5 h-5 text-charcoal-400" />
              <span className="text-charcoal-800">{user.email}</span>
              <span className="ml-auto text-xs text-charcoal-400">Cannot be changed</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500"
                  placeholder="Your phone number"
                  maxLength={10}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
                <Phone className="w-5 h-5 text-charcoal-400" />
                <span className="text-charcoal-800">
                  {user.phone || 'Not provided'}
                </span>
              </div>
            )}
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-lg">
              <span className="text-charcoal-800">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-8"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  name: user.name,
                  phone: user.phone || '',
                })
              }}
              className="px-6 py-3 border border-charcoal-200 text-charcoal-600 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </form>

      {/* Account Stats */}
      <div className="mt-12 pt-8 border-t border-cream-200">
        <h3 className="text-lg font-semibold text-charcoal-800 mb-4">Account Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-peach-50 to-peach-100 rounded-xl p-4 text-center">
            {statsLoading ? (
              <div className="h-9 w-8 mx-auto bg-peach-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-peach-600">{stats.orders}</p>
            )}
            <p className="text-sm text-charcoal-600">Orders</p>
          </div>
          <div className="bg-gradient-to-br from-blush-50 to-blush-100 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blush-600">{wishlistItems.length}</p>
            <p className="text-sm text-charcoal-600">Wishlist</p>
          </div>
          <div className="bg-gradient-to-br from-charcoal-50 to-charcoal-100 rounded-xl p-4 text-center">
            {statsLoading ? (
              <div className="h-9 w-8 mx-auto bg-charcoal-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-charcoal-900">{stats.reviews}</p>
            )}
            <p className="text-sm text-charcoal-600">Reviews</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
            {statsLoading ? (
              <div className="h-9 w-8 mx-auto bg-amber-200 animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold text-amber-600">{stats.coupons}</p>
            )}
            <p className="text-sm text-charcoal-600">Coupons</p>
          </div>
        </div>
      </div>
    </div>
  )
}
