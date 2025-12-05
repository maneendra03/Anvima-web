'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  ChevronRight 
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cartStore'

const accountNavigation = [
  { name: 'Profile', href: '/account', icon: User },
  { name: 'My Orders', href: '/account/orders', icon: Package },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { name: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, fetchUser, isLoading } = useAuthStore()
  const clearCart = useCartStore((state) => state.clearCart)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/account')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    // Clear cart first (this also clears localStorage via persist)
    clearCart()
    // Then logout
    await logout()
    // Navigate to login
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl text-charcoal-800">
            My Account
          </h1>
          <p className="text-charcoal-500 mt-2">
            Welcome back, {user.name}!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4"
            >
              <span className="font-medium text-charcoal-800">Account Menu</span>
              <ChevronRight className={`w-5 h-5 text-charcoal-500 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* User Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:block bg-white rounded-xl shadow-sm p-6 mb-6"
            >
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-peach-400 to-blush-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-charcoal-800">{user.name}</h3>
                  <p className="text-sm text-charcoal-500">{user.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Navigation Links */}
            <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block bg-white rounded-xl shadow-sm overflow-hidden`}>
              {accountNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-6 py-4 transition-colors ${
                      isActive
                        ? 'bg-forest-50 text-forest-600 border-l-4 border-forest-600'
                        : 'text-charcoal-600 hover:bg-cream-50 border-l-4 border-transparent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 text-red-600 hover:bg-red-50 transition-colors border-t border-cream-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
