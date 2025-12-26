'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore, useAuthHydration } from '@/store/auth'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

export default function CartSyncProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const hasHydrated = useAuthHydration()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // Cart store
  const loadCartFromServer = useCartStore((state) => state.loadFromServer)
  const syncCartWithServer = useCartStore((state) => state.syncWithServer)
  const cartItems = useCartStore((state) => state.items)
  
  // Wishlist store
  const loadWishlistFromServer = useWishlistStore((state) => state.loadFromServer)
  
  const previousAuthState = useRef<boolean | null>(null)

  useEffect(() => {
    // Wait for auth hydration
    if (!hasHydrated) return

    // Only act on auth state changes
    if (previousAuthState.current === isAuthenticated) return
    
    previousAuthState.current = isAuthenticated

    if (isAuthenticated) {
      // User just logged in - load cart and wishlist from server and merge with local
      loadCartFromServer()
      loadWishlistFromServer()
    } else {
      // User logged out - data stays in localStorage, no need to do anything
    }
  }, [hasHydrated, isAuthenticated, loadCartFromServer, loadWishlistFromServer])

  // Sync cart to server when items change (for authenticated users)
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return
    
    // Debounce the sync to avoid too many requests
    const timeoutId = setTimeout(() => {
      syncCartWithServer()
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [cartItems, hasHydrated, isAuthenticated, syncCartWithServer])

  return <>{children}</>
}
