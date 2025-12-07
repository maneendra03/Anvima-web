'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ExternalLink, Package } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore, WishlistItem } from '@/store/wishlistStore'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { items: wishlistItems, removeItem } = useWishlistStore()
  const [mounted, setMounted] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const addToCart = useCartStore((state) => state.addItem)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRemove = (productId: string) => {
    setRemovingId(productId)
    setTimeout(() => {
      removeItem(productId)
      toast.success('Removed from wishlist')
      setRemovingId(null)
    }, 300)
  }

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: `${item.productId}-${Date.now()}`,
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })
    toast.success('Added to cart!')
  }

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-10 sm:py-12">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-charcoal-800">My Wishlist</h2>
          <p className="text-sm text-charcoal-500 mt-1">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10 sm:py-12"
        >
          <Heart className="w-14 h-14 sm:w-16 sm:h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-medium text-charcoal-800 mb-2">Your wishlist is empty</h3>
          <p className="text-sm text-charcoal-500 mb-5 sm:mb-6">
            Save items you love by clicking the heart icon on products
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-forest-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-forest-700 transition-colors"
          >
            Explore Products
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, index) => {
              const discount = item.comparePrice
                ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
                : 0
              return (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white border border-cream-200 rounded-lg sm:rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/product/${item.slug}`} className="block relative">
                    <div className="aspect-square bg-cream-50 relative overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-charcoal-200" />
                        </div>
                      )}
                    </div>
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 bg-blush-500 text-white text-xs font-medium rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </Link>
                  <div className="p-3 sm:p-4">
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="text-sm sm:text-base font-medium text-charcoal-800 hover:text-forest-600 transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                      <span className="text-base sm:text-lg font-bold text-charcoal-800">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      {item.comparePrice && (
                        <span className="text-xs sm:text-sm text-charcoal-400 line-through">
                          ₹{item.comparePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 bg-forest-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-forest-700 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(item.productId)}
                        disabled={removingId === item.productId}
                        className="p-2 sm:p-2.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Remove from wishlist"
                      >
                        {removingId === item.productId ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
