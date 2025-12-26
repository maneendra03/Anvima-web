'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Search, Heart, User, LogOut, Package, Settings } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore, useAuthHydration } from '@/store/auth'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Custom Orders', href: '/custom-orders' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

interface BannerCoupon {
  code: string
  text: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

export default function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [bannerCoupon, setBannerCoupon] = useState<BannerCoupon | null>(null)
  
  // Wait for hydration before showing auth-dependent UI
  const hasHydrated = useAuthHydration()
  const cartItems = useCartStore((state) => state.items)
  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems])
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = async () => {
    // Close menus immediately for responsive feedback
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    
    // Perform logout - this clears auth state, localStorage, and NextAuth session
    await logout()
    
    // Small delay to ensure NextAuth session is cleared before navigation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Navigate to login page (not a full reload to preserve logout state)
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Fetch banner coupon
  useEffect(() => {
    const fetchBannerCoupon = async () => {
      try {
        const response = await fetch('/api/coupons/banner')
        const data = await response.json()
        if (data.success && data.data) {
          setBannerCoupon(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch banner coupon:', error)
      }
    }
    fetchBannerCoupon()
  }, [])

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-sm'
          : 'bg-white'
      }`}
    >
      {/* Top Bar - Dynamic Coupon Banner */}
      {bannerCoupon && (
        <div className="bg-charcoal-900 text-white text-center py-2.5 px-4 text-[11px] sm:text-xs md:text-sm tracking-wide leading-tight">
          {bannerCoupon.text} • Code: <span className="font-semibold">{bannerCoupon.code}</span>
        </div>
      )}

      <nav className="border-b border-charcoal-100 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px] sm:h-20 md:h-24">
            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 -ml-1 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo - Center on mobile, left on desktop */}
            <Link href="/" className="flex items-center md:mr-12">
              <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold tracking-tight text-charcoal-900">
                ANVIMA
              </span>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link text-charcoal-700 hover:text-charcoal-900 text-sm tracking-wide uppercase"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions - Right */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-3">
              {/* Desktop Search Bar */}
              <div className="hidden lg:flex items-center">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-48 xl:w-56 pl-9 pr-4 py-2 text-sm border border-charcoal-200 focus:border-charcoal-400 focus:ring-0 bg-cream-50/50 placeholder:text-charcoal-400 transition-colors"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                </form>
              </div>

              {/* Mobile Search Button */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist - Hidden on small mobile */}
              <Link 
                href="/account/wishlist"
                className="hidden sm:flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* User Menu - Desktop */}
              {hasHydrated && isAuthenticated && user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg transition-colors"
                    aria-label="User menu"
                  >
                    <User className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-charcoal-100 shadow-lg py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-charcoal-100">
                          <p className="font-medium text-charcoal-900 text-sm">{user.name}</p>
                          <p className="text-xs text-charcoal-500">{user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                          My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-charcoal-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : hasHydrated ? (
                <Link
                  href="/login"
                  className="hidden md:flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <div className="hidden md:block w-10 h-10" />
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-charcoal-900 text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-medium">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Simplified without AnimatePresence */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[1000]" style={{ top: bannerCoupon ? '112px' : '72px' }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl overflow-y-auto">
            <div className="px-6 py-8 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-lg text-charcoal-800 hover:text-charcoal-600 border-b border-charcoal-100 tracking-wide"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-6 mt-6 border-t border-charcoal-200">
                {!hasHydrated ? (
                  <div className="h-12 bg-charcoal-100 animate-pulse" />
                ) : isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="py-3">
                      <p className="font-medium text-charcoal-900">{user.name}</p>
                      <p className="text-sm text-charcoal-500">{user.email}</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 text-charcoal-700"
                    >
                      <User className="w-5 h-5" />
                      My Account
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 text-charcoal-700"
                    >
                      <Package className="w-5 h-5" />
                      My Orders
                    </Link>
                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 text-charcoal-700"
                    >
                      <Heart className="w-5 h-5" />
                      Wishlist
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-3 text-charcoal-700"
                      >
                        <Settings className="w-5 h-5" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-3 text-red-600 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-3 bg-charcoal-900 text-white text-center text-sm tracking-wide uppercase"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-3 border border-charcoal-900 text-charcoal-900 text-center text-sm tracking-wide uppercase"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay - Full Screen - Must cover entire screen including navbar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-[10000]"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-[72px] sm:h-20 md:h-24 border-b border-charcoal-100">
                <span className="text-sm text-charcoal-500 uppercase tracking-wide">Search</span>
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="flex items-center justify-center w-10 h-10 text-charcoal-700 hover:text-charcoal-900 active:bg-gray-100 rounded-lg -mr-2"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 flex items-start justify-center pt-16 sm:pt-20 md:pt-32 px-4 sm:px-6">
                <form onSubmit={handleSearch} className="w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for products..."
                      className="w-full text-xl sm:text-2xl md:text-4xl font-serif text-charcoal-900 placeholder:text-charcoal-300 border-0 border-b-2 border-charcoal-200 focus:border-charcoal-900 focus:ring-0 pb-3 sm:pb-4 bg-transparent"
                      autoFocus
                    />
                  </div>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-charcoal-500">
                    Press Enter to search or tap X to close
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
