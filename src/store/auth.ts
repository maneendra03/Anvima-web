import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar?: string
  phone?: string
  isVerified?: boolean
  createdAt?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  _hasHydrated: boolean
  _isLoggingOut: boolean  // Flag to prevent re-auth during logout
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setHasHydrated: (state: boolean) => void
  setLoggingOut: (state: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      _hasHydrated: false,
      _isLoggingOut: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      setLoggingOut: (state) => set({ _isLoggingOut: state }),

      login: async (email, password) => {
        // Clear any pending logout state since user is explicitly logging in
        set({ isLoading: true, _isLoggingOut: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('anvima-logout-pending')
        }
        
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (data.success) {
            const user = data.data.user
            set({ 
              user, 
              isAuthenticated: true,
              isLoading: false 
            })
            return { success: true, message: data.message, user }
          }

          set({ isLoading: false })
          return { success: false, message: data.message }
        } catch {
          set({ isLoading: false })
          return { success: false, message: 'An error occurred during login' }
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })

          const result = await response.json()
          set({ isLoading: false })

          return { 
            success: result.success, 
            message: result.message 
          }
        } catch {
          set({ isLoading: false })
          return { success: false, message: 'An error occurred during registration' }
        }
      },

      logout: async () => {
        // Set logging out flag FIRST to prevent re-auth
        set({ _isLoggingOut: true })
        
        // Persist logout state in localStorage to survive page navigation
        if (typeof window !== 'undefined') {
          localStorage.setItem('anvima-logout-pending', 'true')
        }
        
        try {
          // Also sign out from NextAuth FIRST (for Google OAuth users)
          // This is critical - must clear NextAuth session before custom logout
          const { signOut } = await import('next-auth/react')
          await signOut({ redirect: false })
          
          // Clear custom auth cookie
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        } catch (error) {
          console.error('Logout error:', error)
        }
        
        // Clear auth state (keep _isLoggingOut true - it will be reset on next login)
        set({ user: null, isAuthenticated: false })
        
        // Clear all auth-related storage except the logout flag
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
          sessionStorage.clear()
        }
      },

      fetchUser: async () => {
        // Don't fetch if we're in the process of logging out
        if (get()._isLoggingOut) {
          return
        }
        
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/me')
          const data = await response.json()

          // Double-check we're not logging out (race condition protection)
          if (get()._isLoggingOut) {
            set({ isLoading: false })
            return
          }

          if (data.success) {
            set({ 
              user: data.data.user, 
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false 
            })
          }
        } catch {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },

      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Hook to wait for hydration
export const useAuthHydration = () => {
  return useAuthStore((state) => state._hasHydrated)
}
