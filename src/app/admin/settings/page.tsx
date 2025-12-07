'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Store,
  Mail,
  CreditCard,
  Truck,
  Bell,
  Save,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Instagram,
  Phone,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsSection {
  id: string
  title: string
  icon: React.ElementType
  description: string
}

const settingsSections: SettingsSection[] = [
  { id: 'store', title: 'Store Information', icon: Store, description: 'Basic store details and branding' },
  { id: 'contact', title: 'Contact & Social', icon: Phone, description: 'Contact info and social media links' },
  { id: 'payment', title: 'Payment Gateway', icon: CreditCard, description: 'Razorpay and payment settings' },
  { id: 'shipping', title: 'Shipping', icon: Truck, description: 'Shipping zones and rates' },
  { id: 'email', title: 'Email Settings', icon: Mail, description: 'Email notifications and templates' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Admin and customer notifications' },
]

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('store')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  
  // Store settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Anvima Creations',
    tagline: 'Customized Gifts & Creations',
    email: 'anvimacreations@gmail.com',
    phone: '+91 9876543210',
    address: 'Hyderabad, Telangana, India',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  })

  // Contact & Social settings
  const [contactSettings, setContactSettings] = useState({
    whatsapp: '+919876543210',
    instagram: 'anvimacreations',
    facebook: '',
    twitter: '',
    youtube: ''
  })

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    codEnabled: true,
    codMinOrder: '500',
    codMaxOrder: '10000'
  })

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingEnabled: true,
    freeShippingThreshold: '999',
    flatRateEnabled: true,
    flatRateAmount: '50',
    localPickupEnabled: false,
    estimatedDelivery: '5-7 business days'
  })

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromName: 'Anvima Creations',
    fromEmail: 'noreply@anvima.com'
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    newOrderAdmin: true,
    lowStockAlert: true,
    lowStockThreshold: '10'
  })

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          const settings = data.data
          
          // Populate store settings
          if (settings.store) {
            setStoreSettings({
              storeName: settings.store.storeName || 'Anvima Creations',
              tagline: settings.store.tagline || 'Customized Gifts & Creations',
              email: settings.store.email || '',
              phone: settings.store.phone || '',
              address: settings.store.address || '',
              currency: settings.store.currency || 'INR',
              timezone: settings.store.timezone || 'Asia/Kolkata'
            })
          }
          
          // Populate contact settings
          if (settings.contact) {
            setContactSettings({
              whatsapp: settings.contact.whatsapp || '',
              instagram: settings.contact.instagram || '',
              facebook: settings.contact.facebook || '',
              twitter: settings.contact.twitter || '',
              youtube: settings.contact.youtube || ''
            })
          }
          
          // Populate payment settings
          if (settings.payment) {
            setPaymentSettings({
              razorpayEnabled: settings.payment.razorpayEnabled ?? true,
              razorpayKeyId: settings.payment.razorpayKeyId || '',
              razorpayKeySecret: settings.payment.razorpayKeySecret || '',
              codEnabled: settings.payment.codEnabled ?? true,
              codMinOrder: String(settings.payment.codMinOrder || 500),
              codMaxOrder: String(settings.payment.codMaxOrder || 10000)
            })
          }
          
          // Populate shipping settings
          if (settings.shipping) {
            setShippingSettings({
              freeShippingEnabled: settings.shipping.freeShippingEnabled ?? true,
              freeShippingThreshold: String(settings.shipping.freeShippingThreshold || 999),
              flatRateEnabled: settings.shipping.flatRateEnabled ?? true,
              flatRateAmount: String(settings.shipping.flatRateAmount || 50),
              localPickupEnabled: settings.shipping.localPickupEnabled ?? false,
              estimatedDelivery: settings.shipping.estimatedDelivery || '5-7 business days'
            })
          }
          
          // Populate email settings
          if (settings.email) {
            setEmailSettings({
              smtpHost: settings.email.smtpHost || 'smtp.gmail.com',
              smtpPort: settings.email.smtpPort || '587',
              smtpUser: settings.email.smtpUser || '',
              smtpPassword: settings.email.smtpPassword || '',
              fromName: settings.email.fromName || 'Anvima Creations',
              fromEmail: settings.email.fromEmail || 'noreply@anvima.com'
            })
          }
          
          // Populate notification settings
          if (settings.notifications) {
            setNotificationSettings({
              orderConfirmation: settings.notifications.orderConfirmation ?? true,
              orderShipped: settings.notifications.orderShipped ?? true,
              orderDelivered: settings.notifications.orderDelivered ?? true,
              newOrderAdmin: settings.notifications.newOrderAdmin ?? true,
              lowStockAlert: settings.notifications.lowStockAlert ?? true,
              lowStockThreshold: String(settings.notifications.lowStockThreshold || 10)
            })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const validateSettings = () => {
    // Validate store settings
    if (!storeSettings.storeName.trim()) {
      toast.error('Store name is required')
      setActiveSection('store')
      return false
    }
    if (!storeSettings.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeSettings.email)) {
      toast.error('Valid store email is required')
      setActiveSection('store')
      return false
    }

    // Validate payment settings
    if (paymentSettings.codEnabled) {
      const minOrder = Number(paymentSettings.codMinOrder)
      const maxOrder = Number(paymentSettings.codMaxOrder)
      if (isNaN(minOrder) || minOrder < 0) {
        toast.error('COD minimum order must be a valid positive number')
        setActiveSection('payment')
        return false
      }
      if (isNaN(maxOrder) || maxOrder < 0) {
        toast.error('COD maximum order must be a valid positive number')
        setActiveSection('payment')
        return false
      }
      if (minOrder > maxOrder) {
        toast.error('COD minimum order cannot be greater than maximum order')
        setActiveSection('payment')
        return false
      }
    }

    // Validate shipping settings
    if (shippingSettings.freeShippingEnabled) {
      const threshold = Number(shippingSettings.freeShippingThreshold)
      if (isNaN(threshold) || threshold < 0) {
        toast.error('Free shipping threshold must be a valid positive number')
        setActiveSection('shipping')
        return false
      }
    }
    if (shippingSettings.flatRateEnabled) {
      const amount = Number(shippingSettings.flatRateAmount)
      if (isNaN(amount) || amount < 0) {
        toast.error('Flat rate amount must be a valid positive number')
        setActiveSection('shipping')
        return false
      }
    }

    // Validate notification settings
    if (notificationSettings.lowStockAlert) {
      const threshold = Number(notificationSettings.lowStockThreshold)
      if (isNaN(threshold) || threshold < 1) {
        toast.error('Low stock threshold must be at least 1')
        setActiveSection('notifications')
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    // Validate before saving
    if (!validateSettings()) {
      return
    }

    setSaving(true)
    
    try {
      const payload = {
        store: storeSettings,
        contact: contactSettings,
        payment: {
          ...paymentSettings,
          codMinOrder: Number(paymentSettings.codMinOrder),
          codMaxOrder: Number(paymentSettings.codMaxOrder)
        },
        shipping: {
          ...shippingSettings,
          freeShippingThreshold: Number(shippingSettings.freeShippingThreshold),
          flatRateAmount: Number(shippingSettings.flatRateAmount)
        },
        email: emailSettings,
        notifications: {
          ...notificationSettings,
          lowStockThreshold: Number(notificationSettings.lowStockThreshold)
        }
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const renderStoreSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
          <input
            type="text"
            value={storeSettings.storeName}
            onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
          <input
            type="text"
            value={storeSettings.tagline}
            onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={storeSettings.email}
            onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={storeSettings.phone}
            onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={storeSettings.address}
            onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={storeSettings.currency}
            onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={storeSettings.timezone}
            onChange={(e) => setStoreSettings({ ...storeSettings, timezone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderContactSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              WhatsApp Number
            </span>
          </label>
          <input
            type="tel"
            value={contactSettings.whatsapp}
            onChange={(e) => setContactSettings({ ...contactSettings, whatsapp: e.target.value })}
            placeholder="+919876543210"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
          <p className="text-xs text-gray-500 mt-1">Include country code without spaces</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <span className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram Username
            </span>
          </label>
          <div className="flex">
            <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">@</span>
            <input
              type="text"
              value={contactSettings.instagram}
              onChange={(e) => setContactSettings({ ...contactSettings, instagram: e.target.value })}
              placeholder="anvimacreations"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Page URL</label>
          <input
            type="url"
            value={contactSettings.facebook}
            onChange={(e) => setContactSettings({ ...contactSettings, facebook: e.target.value })}
            placeholder="https://facebook.com/yourpage"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Channel URL</label>
          <input
            type="url"
            value={contactSettings.youtube}
            onChange={(e) => setContactSettings({ ...contactSettings, youtube: e.target.value })}
            placeholder="https://youtube.com/@yourchannel"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      {/* Razorpay */}
      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Razorpay</h4>
              <p className="text-sm text-gray-500">Accept online payments</p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSettings({ ...paymentSettings, razorpayEnabled: !paymentSettings.razorpayEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              paymentSettings.razorpayEnabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              paymentSettings.razorpayEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {paymentSettings.razorpayEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key ID</label>
              <input
                type="text"
                value={paymentSettings.razorpayKeyId}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeyId: e.target.value })}
                placeholder="rzp_test_xxxxx"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Key Secret</label>
              <div className="relative">
                <input
                  type={showSecrets.razorpay ? 'text' : 'password'}
                  value={paymentSettings.razorpayKeySecret}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeySecret: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('razorpay')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSecrets.razorpay ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COD */}
      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
              <p className="text-sm text-gray-500">Pay when you receive</p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSettings({ ...paymentSettings, codEnabled: !paymentSettings.codEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              paymentSettings.codEnabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              paymentSettings.codEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {paymentSettings.codEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order (₹)</label>
              <input
                type="number"
                value={paymentSettings.codMinOrder}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, codMinOrder: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Order (₹)</label>
              <input
                type="number"
                value={paymentSettings.codMaxOrder}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, codMaxOrder: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderShippingSettings = () => (
    <div className="space-y-6">
      {/* Free Shipping */}
      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Free Shipping</h4>
            <p className="text-sm text-gray-500">Offer free shipping above a threshold</p>
          </div>
          <button
            onClick={() => setShippingSettings({ ...shippingSettings, freeShippingEnabled: !shippingSettings.freeShippingEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              shippingSettings.freeShippingEnabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              shippingSettings.freeShippingEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        {shippingSettings.freeShippingEnabled && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Amount (₹)</label>
            <input
              type="number"
              value={shippingSettings.freeShippingThreshold}
              onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
            />
          </div>
        )}
      </div>

      {/* Flat Rate */}
      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Flat Rate Shipping</h4>
            <p className="text-sm text-gray-500">Fixed shipping cost for all orders</p>
          </div>
          <button
            onClick={() => setShippingSettings({ ...shippingSettings, flatRateEnabled: !shippingSettings.flatRateEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              shippingSettings.flatRateEnabled ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              shippingSettings.flatRateEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        {shippingSettings.flatRateEnabled && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Amount (₹)</label>
            <input
              type="number"
              value={shippingSettings.flatRateAmount}
              onChange={(e) => setShippingSettings({ ...shippingSettings, flatRateAmount: e.target.value })}
              className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
            />
          </div>
        )}
      </div>

      {/* Estimated Delivery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Time</label>
        <input
          type="text"
          value={shippingSettings.estimatedDelivery}
          onChange={(e) => setShippingSettings({ ...shippingSettings, estimatedDelivery: e.target.value })}
          placeholder="5-7 business days"
          className="w-full md:w-1/2 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
        />
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">SMTP Configuration</h4>
            <p className="text-sm text-amber-700 mt-1">
              Configure your email server to send transactional emails. For Gmail, you may need to create an App Password.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
          <input
            type="text"
            value={emailSettings.smtpHost}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
          <input
            type="text"
            value={emailSettings.smtpPort}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
            placeholder="587"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
          <input
            type="email"
            value={emailSettings.smtpUser}
            onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
          <div className="relative">
            <input
              type={showSecrets.smtp ? 'text' : 'password'}
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
            />
            <button
              type="button"
              onClick={() => toggleSecret('smtp')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecrets.smtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
          <input
            type="text"
            value={emailSettings.fromName}
            onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
            placeholder="Anvima Creations"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
          <input
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
            placeholder="noreply@anvima.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
          />
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">Customer Notifications</h4>
      <div className="space-y-4">
        {[
          { key: 'orderConfirmation', label: 'Order Confirmation', description: 'Send email when order is placed' },
          { key: 'orderShipped', label: 'Order Shipped', description: 'Send email when order is shipped' },
          { key: 'orderDelivered', label: 'Order Delivered', description: 'Send email when order is delivered' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h5 className="font-medium text-gray-900">{item.label}</h5>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ 
                ...notificationSettings, 
                [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings[item.key as keyof typeof notificationSettings] ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings[item.key as keyof typeof notificationSettings] ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <h4 className="font-medium text-gray-900 pt-4">Admin Notifications</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <h5 className="font-medium text-gray-900">New Order Alert</h5>
            <p className="text-sm text-gray-500">Get notified when a new order is placed</p>
          </div>
          <button
            onClick={() => setNotificationSettings({ ...notificationSettings, newOrderAdmin: !notificationSettings.newOrderAdmin })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.newOrderAdmin ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationSettings.newOrderAdmin ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">Low Stock Alert</h5>
              <p className="text-sm text-gray-500">Get notified when products are running low</p>
            </div>
            <button
              onClick={() => setNotificationSettings({ ...notificationSettings, lowStockAlert: !notificationSettings.lowStockAlert })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings.lowStockAlert ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.lowStockAlert ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {notificationSettings.lowStockAlert && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Threshold</label>
              <input
                type="number"
                value={notificationSettings.lowStockThreshold}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockThreshold: e.target.value })}
                className="w-32 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'store': return renderStoreSettings()
      case 'contact': return renderContactSettings()
      case 'payment': return renderPaymentSettings()
      case 'shipping': return renderShippingSettings()
      case 'email': return renderEmailSettings()
      case 'notifications': return renderNotificationSettings()
      default: return null
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-forest mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl hover:bg-forest-700 transition-all shadow-lg shadow-forest-600/25 font-medium disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
            {settingsSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-forest text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">{section.title}</p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                      {section.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {settingsSections.find(s => s.id === activeSection)?.title}
            </h2>
            {renderSectionContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
