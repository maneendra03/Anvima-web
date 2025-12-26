'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

// Check if logout is pending (survives page navigation)
function isLogoutPending(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('anvima-logout-pending') === 'true'
}

// Clear the pending logout flag
function clearLogoutPending(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('anvima-logout-pending')
  }
}

/**
 * This component syncs the NextAuth session (from Google OAuth) with our custom auth system.
 * It should be included in layouts where users land after Google sign-in.
 */
export function GoogleSessionSync() {
  const { data: session, status } = useSession()
  const { user, fetchUser, isAuthenticated, _isLoggingOut, setLoggingOut } = useAuthStore()
  const hasSynced = useRef(false)
  const router = useRouter()
  const pathname = usePathname()

  // Handle pending logout state that survives page navigation
  useEffect(() => {
    if (isLogoutPending()) {
      console.log('🚫 Logout pending - clearing any remaining session')
      // Clear the flag
      clearLogoutPending()
      // Ensure NextAuth session is cleared
      if (status === 'authenticated') {
        signOut({ redirect: false })
      }
      // Reset the logging out flag in store
      setLoggingOut(false)
      return
    }
  }, [status, setLoggingOut])

  useEffect(() => {
    // Don't sync if we're logging out or logout is pending
    if (_isLoggingOut || isLogoutPending()) {
      hasSynced.current = false // Reset sync flag so next login works
      return
    }
    
    // Only sync if:
    // 1. NextAuth session exists with a user
    // 2. Our custom auth doesn't have a user yet
    // 3. We haven't already synced in this component lifecycle
    if (
      status === 'authenticated' &&
      session?.user?.email &&
      !isAuthenticated &&
      !hasSynced.current
    ) {
      hasSynced.current = true
      console.log('🔄 Syncing Google session with custom auth...')
      
      // Call our sync endpoint to set the custom auth cookie
      fetch('/api/auth/google-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success) {
            console.log('✅ Google session synced successfully')
            // Clear logout pending flag since we're now logged in
            clearLogoutPending()
            // Fetch the user to update the auth store
            await fetchUser()
            // Redirect to home page if on login/register page
            if (pathname === '/login' || pathname === '/register' || pathname === '/account') {
              router.push('/')
            }
          } else {
            console.error('❌ Failed to sync Google session:', data.message)
          }
        })
        .catch((error) => {
          console.error('❌ Error syncing Google session:', error)
        })
    }
  }, [session, status, isAuthenticated, fetchUser, router, pathname, _isLoggingOut])

  // Reset sync flag when session becomes unauthenticated (user logged out)
  useEffect(() => {
    if (status === 'unauthenticated') {
      hasSynced.current = false
    }
  }, [status])

  // NOTE: We intentionally removed the auto-fetch on !isAuthenticated
  // This was causing re-login after logout. The fetchUser should only
  // be called explicitly after successful login, not automatically.

  return null
}
