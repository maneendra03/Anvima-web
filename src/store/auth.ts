import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
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

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true })
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
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } finally {
          set({ user: null, isAuthenticated: false })
          // Clear cart from localStorage directly to ensure it's cleared
          if (typeof window !== 'undefined') {
            localStorage.removeItem('anvima-cart')
          }
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/auth/me')
          const data = await response.json()

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
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
