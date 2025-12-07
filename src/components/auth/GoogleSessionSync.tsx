'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth'

/**
 * This component syncs the NextAuth session (from Google OAuth) with our custom auth system.
 * It should be included in layouts where users land after Google sign-in.
 */
export function GoogleSessionSync() {
  const { data: session, status } = useSession()
  const { user, fetchUser, isAuthenticated } = useAuthStore()
  const hasSynced = useRef(false)

  useEffect(() => {
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
        .then((data) => {
          if (data.success) {
            console.log('✅ Google session synced successfully')
            // Fetch the user to update the auth store
            fetchUser()
          } else {
            console.error('❌ Failed to sync Google session:', data.message)
          }
        })
        .catch((error) => {
          console.error('❌ Error syncing Google session:', error)
        })
    }
  }, [session, status, isAuthenticated, fetchUser])

  // Also fetch user if we have a custom auth cookie but no user in store
  useEffect(() => {
    if (!isAuthenticated && !user && status !== 'loading') {
      fetchUser()
    }
  }, [isAuthenticated, user, status, fetchUser])

  return null
}
