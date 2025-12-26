'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ShoppingBag, Heart } from 'lucide-react'
import { products } from '@/data'
import { Product } from '@/types'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface RelatedProductsProps {
  currentProductId: string
  category: string
  tags?: string[]
  title?: string
  maxItems?: number
}

export default function RelatedProducts({
  currentProductId,
  category,
  tags = [],
  title = 'You May Also Like',
  maxItems = 4,
}: RelatedProductsProps) {
  const addItem = useCartStore((state) => state.addItem)

  const relatedProducts = useMemo(() => {
    // First, filter out the current product
    const others = products.filter((p) => p.id !== currentProductId)

    // Score products based on category match and tag overlap
    const scored = others.map((product) => {
      let score = 0
      
      // Category match gets higher score
      if (product.category === category) score += 10
      
      // Tag overlap
      if (tags.length > 0 && product.tags) {
        const overlap = product.tags.filter((tag) => tags.includes(tag)).length
        score += overlap * 2
      }
      
      // Bestsellers get a boost
      if (product.bestSeller) score += 3
      
      // New arrivals get a small boost
      if (product.newArrival) score += 1
      
      return { product, score }
    })

    // Sort by score and take top items
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, maxItems)
      .map((item) => item.product)
  }, [currentProductId, category, tags, maxItems])

  if (relatedProducts.length === 0) return null

  const handleQuickAdd = (product: Product) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      slug: product.slug, // Include slug for order API compatibility
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-8 text-center">
          {title}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-cream-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Image */}
                <Link href={`/product/${product.slug}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.bestSeller && (
                        <span className="px-2 py-1 bg-peach-500 text-white text-xs font-medium rounded-full">
                          Bestseller
                        </span>
                      )}
                      {product.newArrival && (
                        <span className="px-2 py-1 bg-charcoal-900 text-white text-xs font-medium rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          // Add to wishlist logic
                          toast.success('Added to wishlist!')
                        }}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-cream-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-charcoal-600" />
                      </button>
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-charcoal-700 truncate group-hover:text-charcoal-900 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm text-charcoal-600">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-charcoal-400">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-charcoal-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-charcoal-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    
                    {!product.customizationOptions && (
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="p-2 bg-charcoal-900 text-white rounded-full hover:bg-charcoal-800 transition-colors"
                        title="Quick add to cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
