import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  image: string
  addedAt: Date
}

interface WishlistStore {
  items: WishlistItem[]
  isLoading: boolean
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  syncWithServer: () => Promise<void>
  loadFromServer: () => Promise<void>
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      addItem: async (item) => {
        const items = get().items
        const exists = items.some(i => i.productId === item.productId)
        
        if (!exists) {
          // Optimistically add to local state
          set({
            items: [...items, { ...item, addedAt: new Date() }]
          })
          
          // Sync with server (fire and forget for non-logged in users)
          try {
            const response = await fetch('/api/user/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.productId }),
              credentials: 'include',
            })
            
            if (!response.ok) {
              // If user is not authenticated, that's fine - keep local only
              const data = await response.json()
              if (response.status !== 401) {
                console.error('Failed to sync wishlist item:', data.message)
              }
            }
          } catch (error) {
            console.error('Error syncing wishlist to server:', error)
          }
        }
      },
      
      removeItem: async (productId) => {
        // Optimistically remove from local state
        set({
          items: get().items.filter(item => item.productId !== productId)
        })
        
        // Sync with server
        try {
          const response = await fetch(`/api/user/wishlist?productId=${productId}`, {
            method: 'DELETE',
            credentials: 'include',
          })
          
          if (!response.ok) {
            const data = await response.json()
            if (response.status !== 401) {
              console.error('Failed to remove wishlist item from server:', data.message)
            }
          }
        } catch (error) {
          console.error('Error removing wishlist item from server:', error)
        }
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId)
      },
      
      clearWishlist: () => {
        set({ items: [] })
      },
      
      // Sync local wishlist to server (called after login)
      syncWithServer: async () => {
        const localItems = get().items
        if (localItems.length === 0) return
        
        set({ isLoading: true })
        
        try {
          // Add each local item to server
          for (const item of localItems) {
            await fetch('/api/user/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: item.productId }),
              credentials: 'include',
            })
          }
        } catch (error) {
          console.error('Error syncing wishlist to server:', error)
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Load wishlist from server (called after login)
      loadFromServer: async () => {
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/user/wishlist', {
            credentials: 'include',
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && Array.isArray(data.data)) {
              const serverItems: WishlistItem[] = data.data.map((product: {
                _id: string
                name: string
                slug: string
                price: number
                comparePrice?: number
                images?: string[]
              }) => ({
                productId: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                comparePrice: product.comparePrice,
                image: product.images?.[0] || '',
                addedAt: new Date(),
              }))
              
              // Merge with local items (local takes priority for new items)
              const localItems = get().items
              const localProductIds = new Set(localItems.map(i => i.productId))
              const serverProductIds = new Set(serverItems.map(i => i.productId))
              
              // Items only in local (new items to sync up)
              const newLocalItems = localItems.filter(i => !serverProductIds.has(i.productId))
              
              // Combine server items with new local items
              const mergedItems = [...serverItems, ...newLocalItems]
              
              set({ items: mergedItems })
              
              // Sync new local items to server
              for (const item of newLocalItems) {
                try {
                  await fetch('/api/user/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: item.productId }),
                    credentials: 'include',
                  })
                } catch (error) {
                  console.error('Error syncing local wishlist item:', error)
                }
              }
            }
          }
        } catch (error) {
          console.error('Error loading wishlist from server:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'anvima-wishlist',
    }
  )
)
