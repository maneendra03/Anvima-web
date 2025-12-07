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
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items
        const exists = items.some(i => i.productId === item.productId)
        
        if (!exists) {
          set({
            items: [...items, { ...item, addedAt: new Date() }]
          })
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId)
        })
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.productId === productId)
      },
      
      clearWishlist: () => {
        set({ items: [] })
      }
    }),
    {
      name: 'anvima-wishlist',
    }
  )
)
