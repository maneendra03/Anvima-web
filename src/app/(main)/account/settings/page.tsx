'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Bell, Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    sms: false,
  })

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchNotificationPreferences = async () => {
      try {
        const response = await fetch('/api/user/notifications')
        const data = await response.json()
        if (data.success && data.data) {
          setNotifications({
            orderUpdates: data.data.orderUpdates ?? true,
            promotions: data.data.promotions ?? false,
            newsletter: data.data.newsletter ?? true,
            sms: data.data.sms ?? false,
          })
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
      } finally {
        setNotificationsLoading(false)
      }
    }

    fetchNotificationPreferences()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validatePassword = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key]
    setNotifications((prev) => ({ ...prev, [key]: newValue }))

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      })

      const data = await response.json()
      if (!data.success) {
        // Revert on error
        setNotifications((prev) => ({ ...prev, [key]: !newValue }))
        toast.error(data.message || 'Failed to update preferences')
      }
    } catch {
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }))
      toast.error('Failed to update preferences')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
    )

    if (!confirmed) return

    const doubleConfirm = prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Account deleted successfully')
        window.location.href = '/'
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="space-y-8">
      {/* Password Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-charcoal-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-charcoal-900" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-800">Password</h3>
              <p className="text-sm text-charcoal-500">Change your password</p>
            </div>
          </div>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 text-charcoal-900 hover:bg-charcoal-50 rounded-lg font-medium transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {isChangingPassword && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handlePasswordSubmit}
            className="bg-cream-50 rounded-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500 ${
                    errors.currentPassword ? 'border-red-500' : 'border-charcoal-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-charcoal-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-charcoal-500 focus:border-charcoal-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-charcoal-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Update Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                  setErrors({})
                }}
                className="px-6 py-2.5 border border-charcoal-200 text-charcoal-600 rounded-lg font-medium hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </section>

      <hr className="border-cream-200" />

      {/* Notifications Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blush-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-blush-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-800">Notifications</h3>
            <p className="text-sm text-charcoal-500">Manage your notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          {notificationsLoading ? (
            // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-cream-50 rounded-xl animate-pulse">
                <div>
                  <div className="h-5 w-32 bg-cream-200 rounded mb-2" />
                  <div className="h-4 w-48 bg-cream-200 rounded" />
                </div>
                <div className="w-11 h-6 bg-cream-200 rounded-full" />
              </div>
            ))
          ) : (
          [
            { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes' },
            { key: 'promotions', label: 'Promotions & Offers', description: 'Receive exclusive deals and discounts' },
            { key: 'newsletter', label: 'Newsletter', description: 'Weekly updates about new products' },
            { key: 'sms', label: 'SMS Notifications', description: 'Receive updates via SMS' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-4 bg-cream-50 rounded-xl cursor-pointer hover:bg-cream-100 transition-colors"
            >
              <div>
                <p className="font-medium text-charcoal-800">{item.label}</p>
                <p className="text-sm text-charcoal-500">{item.description}</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-charcoal-900'
                      : 'bg-charcoal-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    } translate-y-0.5`}
                  />
                </div>
              </div>
            </label>
          ))
          )}
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Privacy & Security Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-peach-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-peach-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-800">Privacy & Security</h3>
            <p className="text-sm text-charcoal-500">Manage your account security</p>
          </div>
        </div>

        <div className="bg-cream-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-charcoal-800">Two-Factor Authentication</p>
              <p className="text-sm text-charcoal-500">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 border border-charcoal-900 text-charcoal-900 rounded-lg font-medium hover:bg-charcoal-50 transition-colors">
              Enable
            </button>
          </div>

          <hr className="border-cream-200" />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-charcoal-800">Download My Data</p>
              <p className="text-sm text-charcoal-500">Get a copy of your personal data</p>
            </div>
            <button className="px-4 py-2 border border-charcoal-200 text-charcoal-600 rounded-lg font-medium hover:bg-charcoal-50 transition-colors">
              Request
            </button>
          </div>
        </div>
      </section>

      <hr className="border-cream-200" />

      {/* Danger Zone */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-red-600">Danger Zone</h3>
            <p className="text-sm text-charcoal-500">Irreversible account actions</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
          <p className="text-sm text-red-700 mb-4">
            Once you delete your account, there is no going back. All your data, orders, and preferences will be permanently deleted.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </section>
    </div>
  )
}
