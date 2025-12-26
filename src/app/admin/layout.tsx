'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  ChevronRight,
  Bell,
  Store,
  Tag,
  AlertTriangle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { useAuthStore, useAuthHydration } from '@/store/auth'
import { useCartStore } from '@/store/cartStore'

interface Notification {
  id: string
  type: 'order' | 'stock' | 'user' | 'system'
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/custom-orders', label: 'Custom Orders', icon: Gift },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, fetchUser, logout, isLoading } = useAuthStore()
  const hasHydrated = useAuthHydration()
  const clearCart = useCartStore((state) => state.clearCart)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasFetchedUser, setHasFetchedUser] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true)
    try {
      // Fetch recent orders for notifications
      const ordersRes = await fetch('/api/admin/orders?limit=5&sort=-createdAt')
      const ordersData = await ordersRes.json()
      
      // Fetch low stock products
      const productsRes = await fetch('/api/admin/products?stock=low&limit=3')
      const productsData = await productsRes.json()
      
      const newNotifications: Notification[] = []
      
      // Add recent order notifications
      if (ordersData.success && ordersData.data?.orders) {
        ordersData.data.orders.slice(0, 3).forEach((order: { _id: string; orderNumber: string; status: string; createdAt: string; total: number }) => {
          const isRecent = new Date(order.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
          if (isRecent) {
            newNotifications.push({
              id: `order-${order._id}`,
              type: 'order',
              title: 'New Order',
              message: `Order #${order.orderNumber} - ₹${order.total?.toLocaleString('en-IN')}`,
              time: formatTimeAgo(order.createdAt),
              read: order.status !== 'pending',
              link: `/admin/orders/${order._id}`
            })
          }
        })
      }
      
      // Add low stock notifications
      if (productsData.success && productsData.data?.products) {
        productsData.data.products.forEach((product: { _id: string; name: string; stock: number }) => {
          if (product.stock <= 10) {
            newNotifications.push({
              id: `stock-${product._id}`,
              type: 'stock',
              title: 'Low Stock Alert',
              message: `${product.name} - Only ${product.stock} left`,
              time: 'Now',
              read: false,
              link: `/admin/products/${product._id}/edit`
            })
          }
        })
      }
      
      // Add a welcome notification if no notifications
      if (newNotifications.length === 0) {
        newNotifications.push({
          id: 'welcome',
          type: 'system',
          title: 'All caught up!',
          message: 'No new notifications at the moment',
          time: 'Now',
          read: true
        })
      }
      
      setNotifications(newNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />
      case 'stock': return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'user': return <Users className="w-4 h-4 text-green-500" />
      default: return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only fetch user once after hydration
  useEffect(() => {
    if (hasHydrated && !hasFetchedUser) {
      setHasFetchedUser(true)
      fetchUser()
    }
  }, [hasHydrated, hasFetchedUser, fetchUser])

  useEffect(() => {
    // Only fetch notifications after we've verified authentication
    // Add a small delay to prioritize rendering the UI first
    if (mounted && hasHydrated && hasFetchedUser && !isLoading && isAuthenticated && user?.role === 'admin') {
      const timeoutId = setTimeout(() => {
        fetchNotifications()
      }, 1000) // Delay notification fetch by 1 second
      
      // Refresh notifications every 5 minutes (less frequent to reduce load)
      const interval = setInterval(fetchNotifications, 300000)
      return () => {
        clearTimeout(timeoutId)
        clearInterval(interval)
      }
    }
  }, [mounted, hasHydrated, hasFetchedUser, isLoading, isAuthenticated, user, fetchNotifications])

  useEffect(() => {
    // Only redirect after hydration and user fetch is complete
    if (mounted && hasHydrated && hasFetchedUser && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/admin')
      } else if (user?.role !== 'admin') {
        router.push('/')
      }
    }
  }, [mounted, hasHydrated, hasFetchedUser, isAuthenticated, isLoading, user, router])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showNotifications && !target.closest('[data-notifications]')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const handleLogout = async () => {
    // Clear cart first (this also clears localStorage via persist)
    clearCart()
    // Then logout - clears auth state, localStorage, and NextAuth session
    await logout()
    // Small delay to ensure NextAuth session is cleared
    await new Promise(resolve => setTimeout(resolve, 100))
    // Navigate to login
    router.push('/login')
  }

  // Show loading while hydrating, fetching user, or loading
  if (!mounted || !hasHydrated || !hasFetchedUser || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-forest-200 border-t-forest-600"></div>
          <p className="text-gray-500 font-medium">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  // Check if current path matches nav item
  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-lg shadow-forest-500/20">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-playfair text-xl font-bold text-gray-900">
                  Anvima
                </span>
                <span className="block text-xs text-gray-500 -mt-0.5">Admin Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-forest-500 to-forest-600 text-white shadow-lg shadow-forest-500/25'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-forest-600'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm mb-3">
              <div className="h-11 w-11 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-forest-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-forest-600 bg-forest-50 hover:bg-forest-100 rounded-xl transition-colors font-medium"
              >
                <Store className="h-4 w-4" />
                <span>View Store</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative" data-notifications>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (!showNotifications) fetchNotifications()
                  }}
                  className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-forest-600 hover:text-forest-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="p-4 text-center">
                            <div className="w-6 h-6 border-2 border-gray-200 border-t-forest-500 rounded-full animate-spin mx-auto" />
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href={notification.link || '#'}
                              onClick={() => {
                                markAsRead(notification.id)
                                setShowNotifications(false)
                              }}
                              className={`block p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="flex-shrink-0">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full block" />
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      
                      <Link
                        href="/admin/orders"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 text-center text-sm text-forest-600 hover:bg-gray-50 font-medium border-t border-gray-100"
                      >
                        View All Orders →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="h-9 w-9 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full flex items-center justify-center text-white font-medium shadow-lg shadow-forest-500/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 bg-white/50 px-4 lg:px-6 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Anvima Creations. Admin Portal v1.0
          </p>
        </footer>
      </div>
    </div>
  )
}
