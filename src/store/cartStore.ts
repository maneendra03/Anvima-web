import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  slug: string // Added for order API compatibility
  name: string
  price: number
  quantity: number
  image: string
  customization?: {
    text?: string
    imageUrl?: string
    size?: string
    color?: string
    engraving?: string
  }
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  isSyncing: boolean
  lastSyncedAt: number | null
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  // Server sync methods
  syncWithServer: () => Promise<void>
  loadFromServer: () => Promise<void>
  setItems: (items: CartItem[]) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,
      lastSyncedAt: null,

      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.productId === item.productId &&
              JSON.stringify(i.customization) === JSON.stringify(item.customization)
          )

          let newItems: CartItem[]
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          } else {
            newItems = [...state.items, item]
          }

          return { items: newItems }
        })
        
        // Sync with server in background (don't await)
        get().syncWithServer()
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
        get().syncWithServer()
      },

      updateQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
          ).filter((item) => item.quantity > 0),
        }))
        get().syncWithServer()
      },

      clearCart: () => {
        set({ items: [] })
        get().syncWithServer()
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      setItems: (items: CartItem[]) => {
        set({ items, lastSyncedAt: Date.now() })
      },

      syncWithServer: async () => {
        const { items, isSyncing } = get()
        
        // Prevent multiple syncs at once
        if (isSyncing) return
        
        try {
          set({ isSyncing: true })
          
          const response = await fetch('/api/user/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
          })
          
          if (response.ok) {
            set({ lastSyncedAt: Date.now() })
          }
        } catch (error) {
          console.error('Failed to sync cart with server:', error)
        } finally {
          set({ isSyncing: false })
        }
      },

      loadFromServer: async () => {
        try {
          set({ isSyncing: true })
          
          const response = await fetch('/api/user/cart')
          const data = await response.json()
          
          if (data.success && Array.isArray(data.data)) {
            // Transform server items to match local format
            const serverItems: CartItem[] = data.data.map((item: Record<string, unknown>) => ({
              id: item._id?.toString() || item.productId?.toString() || String(Date.now()),
              productId: item.productId?.toString() || '',
              slug: item.slug || '',
              name: item.name || '',
              price: item.price || 0,
              quantity: item.quantity || 1,
              image: item.image || '',
              customization: item.customization || undefined,
            }))
            
            const { items: localItems } = get()
            
            // Merge server items with local items (local takes precedence for new items)
            // If server has items and local is empty, use server items
            // If both have items, merge them intelligently
            if (localItems.length === 0 && serverItems.length > 0) {
              set({ items: serverItems, lastSyncedAt: Date.now() })
            } else if (serverItems.length > 0 && localItems.length > 0) {
              // Merge: add server items that don't exist locally
              const mergedItems = [...localItems]
              
              serverItems.forEach((serverItem) => {
                const exists = localItems.some(
                  (localItem) =>
                    localItem.productId === serverItem.productId &&
                    JSON.stringify(localItem.customization) === JSON.stringify(serverItem.customization)
                )
                if (!exists) {
                  mergedItems.push(serverItem)
                }
              })
              
              set({ items: mergedItems, lastSyncedAt: Date.now() })
              // Sync merged result back to server
              get().syncWithServer()
            } else {
              set({ lastSyncedAt: Date.now() })
            }
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error)
        } finally {
          set({ isSyncing: false })
        }
      },
    }),
    {
      name: 'anvima-cart',
      partialize: (state) => ({
        items: state.items,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
)
