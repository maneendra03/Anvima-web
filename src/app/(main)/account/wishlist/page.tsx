'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2, ExternalLink } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    images: { url: string; isPrimary: boolean }[]
    stock: number
  }
  addedAt: string
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const addToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/user/wishlist')
      const data = await response.json()
      if (data.success) {
        setWishlist(data.data.wishlist || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setWishlist((prev) => prev.filter((item) => item.product._id !== productId))
        toast.success('Removed from wishlist')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (item.product.stock === 0) {
      toast.error('This item is out of stock')
      return
    }

    addToCart({
      id: item.product._id,
      productId: item.product._id,
      slug: item.product.slug,
      name: item.product.name,
      price: item.product.price,
      image: item.product.images.find((img) => img.isPrimary)?.url || item.product.images[0]?.url || '',
      quantity: 1,
    })

    toast.success('Added to cart!')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-charcoal-800">My Wishlist</h2>
          <p className="text-charcoal-500 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Heart className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal-800 mb-2">Your wishlist is empty</h3>
          <p className="text-charcoal-500 mb-6">
            Save items you love by clicking the heart icon on products
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors"
          >
            Explore Products
            <ExternalLink className="w-5 h-5" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item, index) => {
            const primaryImage = item.product.images.find((img) => img.isPrimary)?.url || item.product.images[0]?.url
            const discount = item.product.comparePrice
              ? Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)
              : 0

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white border border-cream-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/product/${item.product.slug}`} className="block relative">
                  <div className="aspect-square bg-cream-50">
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-charcoal-200" />
                      </div>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-blush-500 text-white text-xs font-medium rounded">
                      {discount}% OFF
                    </span>
                  )}
                  {item.product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="px-4 py-2 bg-white text-charcoal-800 font-medium rounded-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-4">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-medium text-charcoal-800 hover:text-forest-600 transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-charcoal-800">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </span>
                    {item.product.comparePrice && (
                      <span className="text-sm text-charcoal-400 line-through">
                        ₹{item.product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-forest-600 text-white rounded-lg font-medium hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.product._id)}
                      className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-charcoal-400 mt-3">
                    Added {new Date(item.addedAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
