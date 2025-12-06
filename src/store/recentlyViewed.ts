import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ViewedProduct {
  id: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  image: string
  viewedAt: number
}

interface RecentlyViewedState {
  items: ViewedProduct[]
  addItem: (product: Omit<ViewedProduct, 'viewedAt'>) => void
  removeItem: (productId: string) => void
  clearItems: () => void
}

const MAX_ITEMS = 10

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.items.filter((item) => item.id !== product.id)
          
          // Add to beginning with timestamp
          const newItems = [
            { ...product, viewedAt: Date.now() },
            ...filtered,
          ].slice(0, MAX_ITEMS)
          
          return { items: newItems }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'anvima-recently-viewed',
    }
  )
)
