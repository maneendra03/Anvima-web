'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Filter, Grid, List, Star, ShoppingBag, X, SlidersHorizontal, Eye, Loader2, Package } from 'lucide-react'
// QuickViewModal disabled temporarily - will be updated to work with API products
// import QuickViewModal from '@/components/product/QuickViewModal'

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
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  images: ProductImage[]
  category: Category
  tags: string[]
  customizable: boolean
  isFeatured: boolean
  ratings: {
    average: number
    count: number
  }
}

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Handle image load errors without causing infinite loops
  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set(prev).add(productId))
  }
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  // const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '24'
        })

        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }

        if (priceRange[0] > 0) {
          params.append('minPrice', priceRange[0].toString())
        }
        if (priceRange[1] < 10000) {
          params.append('maxPrice', priceRange[1].toString())
        }

        // Handle sorting
        switch (sortBy) {
          case 'price-low':
            params.append('sort', 'price')
            params.append('order', 'asc')
            break
          case 'price-high':
            params.append('sort', 'price')
            params.append('order', 'desc')
            break
          case 'rating':
            params.append('sort', 'ratings.average')
            params.append('order', 'desc')
            break
          case 'newest':
            params.append('sort', 'createdAt')
            params.append('order', 'desc')
            break
          default:
            params.append('featured', 'true')
            break
        }

        const response = await fetch(`/api/products?${params}`)
        const data = await response.json()

        if (data.success) {
          setProducts(data.data.products)
          setTotalPages(data.data.pagination?.totalPages || 1)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory, priceRange, sortBy, page])

  // Helper to get image URL
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

  // Check if product has valid image URL
  const hasValidImage = (product: Product): boolean => {
    if (failedImages.has(product._id)) return false
    const imageUrl = getPrimaryImage(product)
    return imageUrl !== '/placeholder.jpg' && imageUrl.length > 0
  }

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-24">
      {/* Header */}
      <div className="bg-cream-50 py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm tracking-[0.2em] uppercase text-charcoal-400 mb-4">
              Explore Our Collection
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900 mb-4">
              Shop All Products
            </h1>
            <p className="text-charcoal-500 max-w-xl mx-auto">
              Discover personalized gifts crafted with care to create meaningful memories.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-charcoal-500 mb-4">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCategory('all'); setPage(1); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-charcoal-900 text-white'
                        : 'hover:bg-cream-100 text-charcoal-600'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-charcoal-900 text-white'
                          : 'hover:bg-cream-100 text-charcoal-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs uppercase tracking-[0.15em] text-charcoal-500 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-charcoal-900"
                  />
                  <div className="flex justify-between text-sm text-charcoal-500">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-charcoal-100">
              <p className="text-sm text-charcoal-500">
                {loading ? 'Loading...' : `Showing ${products.length} products`}
              </p>
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-charcoal-200 text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
                  className="px-4 py-2 border border-charcoal-200 text-sm bg-white outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border border-charcoal-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-charcoal-900 text-white'
                        : 'text-charcoal-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list'
                        ? 'bg-charcoal-900 text-white'
                        : 'text-charcoal-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-charcoal-400 mb-4" />
                <p className="text-charcoal-500 text-sm">Loading products...</p>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <div
                  className={`grid gap-4 md:gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                      : 'grid-cols-1'
                  }`}
                >
                  {products.map((product) => (
                    <div key={product._id}>
                      <Link href={`/product/${product.slug}`}>
                        <div
                          className={`group product-card ${
                            viewMode === 'list' ? 'flex' : ''
                          }`}
                        >
                          {/* Image */}
                          <div
                            className={`relative overflow-hidden bg-cream-100 ${
                              viewMode === 'list'
                                ? 'w-32 sm:w-48 h-32 sm:h-48 flex-shrink-0'
                                : 'aspect-[3/4]'
                            }`}
                          >
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

                            {/* Badges */}
                            {(product.isFeatured || (product.comparePrice && product.comparePrice > product.price)) && (
                              <div className="absolute top-3 left-3">
                                {product.isFeatured && (
                                  <span className="inline-block px-3 py-1 bg-charcoal-900 text-white text-xs uppercase tracking-wider">
                                    Featured
                                  </span>
                                )}
                                {!product.isFeatured && product.comparePrice && product.comparePrice > product.price && (
                                  <span className="inline-block px-3 py-1 bg-forest-600 text-white text-xs uppercase tracking-wider">
                                    {Math.round(
                                      ((product.comparePrice - product.price) /
                                        product.comparePrice) *
                                        100
                                    )}% Off
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Quick view on hover */}
                            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                              <button className="w-full py-2.5 bg-white text-charcoal-900 text-xs uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-colors">
                                Quick View
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4 flex-1">
                            <p className="text-xs uppercase tracking-wider text-charcoal-400 mb-2">
                              {product.category?.name || 'Uncategorized'}
                            </p>
                            <h3 className="font-medium text-sm text-charcoal-900 mb-2 group-hover:text-forest-600 transition-colors line-clamp-2">
                              {product.name}
                            </h3>

                            {viewMode === 'list' && (
                              <p className="text-charcoal-500 text-xs mb-3 line-clamp-2">
                                {product.shortDescription || product.description}
                              </p>
                            )}

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-3">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < Math.floor(product.ratings?.average || 0)
                                        ? 'fill-charcoal-900 text-charcoal-900'
                                        : 'fill-charcoal-200 text-charcoal-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-charcoal-400 ml-1">
                                ({product.ratings?.count || 0})
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium text-charcoal-900">
                                ₹{product.price.toLocaleString()}
                              </span>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <span className="text-sm text-charcoal-400 line-through">
                                  ₹{product.comparePrice.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {product.customizable && (
                              <p className="mt-2 text-xs text-forest-600 uppercase tracking-wider">
                                Customizable
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {products.length === 0 && (
                  <div className="text-center py-16 col-span-full">
                    <p className="text-charcoal-500">
                      No products found matching your filters.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory('all')
                        setPriceRange([0, 10000])
                        setPage(1)
                      }}
                      className="mt-4 text-sm uppercase tracking-wider text-charcoal-700 hover:text-charcoal-900 underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12 col-span-full">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-6 py-2 border border-charcoal-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-charcoal-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-6 py-2 border border-charcoal-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-charcoal-900 hover:text-white hover:border-charcoal-900 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal-900/50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-medium text-charcoal-900">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-[0.15em] text-charcoal-500 mb-4">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => { setSelectedCategory('all'); setPage(1); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-charcoal-900 text-white'
                      : 'hover:bg-cream-100 text-charcoal-600'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-charcoal-900 text-white'
                        : 'hover:bg-cream-100 text-charcoal-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-[0.15em] text-charcoal-500 mb-4">Price Range</h3>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full accent-charcoal-900"
              />
              <div className="flex justify-between text-sm text-charcoal-500 mt-2">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full btn-primary"
            >
              Apply Filters
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Quick View Modal - Disabled temporarily
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
      */}
    </div>
  )
}
