'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Package } from 'lucide-react'

interface ProductImage {
  url: string
  alt?: string
  isPrimary: boolean
}

interface Category {
  _id: string
  name: string
  slug: string
}

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: ProductImage[]
  category: Category
  isFeatured: boolean
  ratings: {
    average: number
    count: number
  }
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=12&featured=true')
        const data = await response.json()
        if (data.success) {
          setProducts(data.data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const getImageUrl = (image: ProductImage | string | undefined | null): string => {
    if (!image) return '/placeholder.jpg'
    if (typeof image === 'string') return image || '/placeholder.jpg'
    return image?.url || '/placeholder.jpg'
  }

  // Get primary image from product
  const getPrimaryImage = (product: Product): string => {
    if (!product.images || product.images.length === 0) return '/placeholder.jpg'
    const primary = product.images.find(img => img.isPrimary)
    return getImageUrl(primary || product.images[0])
  }

  // Handle image error - mark as failed to show placeholder
  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set(prev).add(productId))
  }

  // Check if product has valid image URL
  const hasValidImage = (product: Product): boolean => {
    if (failedImages.has(product._id)) return false
    const imageUrl = getPrimaryImage(product)
    return imageUrl !== '/placeholder.jpg' && imageUrl.length > 0
  }

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-cream-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-cream-200 rounded w-1/3" />
                  <div className="h-4 bg-cream-200 rounded w-2/3" />
                  <div className="h-4 bg-cream-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-charcoal-400 mb-2">
              Handpicked for you
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-charcoal-900">
              Featured Products
            </h2>
          </div>
          <Link
            href="/shop"
            className="group hidden sm:flex items-center gap-2 text-sm uppercase tracking-wider text-charcoal-700 hover:text-charcoal-900 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/product/${product.slug}`}>
                <div className="group">
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream-100 mb-3">
                    {hasValidImage(product) ? (
                      <Image
                        src={getPrimaryImage(product)}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                        onError={() => handleImageError(product._id)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200">
                        <Package className="w-10 h-10 text-charcoal-300 mb-2" strokeWidth={1.5} />
                        <span className="text-charcoal-400 text-xs px-2 text-center line-clamp-2">{product.name}</span>
                      </div>
                    )}

                    {/* Badge */}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-block px-2 py-1 bg-charcoal-900 text-white text-[10px] uppercase tracking-wider">
                          Sale
                        </span>
                      </div>
                    )}

                    {/* Quick Add */}
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button className="w-full py-2 bg-white/95 backdrop-blur-sm text-charcoal-900 text-xs uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-colors">
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-400 mb-1">
                      {product.category?.name || 'Gift'}
                    </p>
                    <h3 className="text-sm font-medium text-charcoal-900 mb-1 group-hover:text-forest-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    {product.ratings?.count > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < Math.floor(product.ratings?.average || 0)
                                  ? 'fill-charcoal-900 text-charcoal-900'
                                  : 'fill-charcoal-200 text-charcoal-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-charcoal-400">
                          ({product.ratings?.count})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-xs text-charcoal-400 line-through">
                          ₹{product.comparePrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-charcoal-700"
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
