'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Filter, Grid, List, Star, ShoppingBag, X, SlidersHorizontal, Eye } from 'lucide-react'
import { products, categories } from '@/data'
import { Product } from '@/types'
import QuickViewModal from '@/components/product/QuickViewModal'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0))
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [selectedCategory, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-cream-50 pt-16 sm:pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-peach-50 to-cream-50 py-6 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-charcoal-700 mb-2 sm:mb-3 lg:mb-4">
              Shop All Products
            </h1>
            <p className="text-sm sm:text-base text-charcoal-500 max-w-2xl mx-auto">
              Discover our collection of customizable gifts, each crafted with care
              to help you create meaningful memories.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-charcoal-700 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-forest-500 text-white'
                        : 'hover:bg-cream-100 text-charcoal-600'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-forest-500 text-white'
                          : 'hover:bg-cream-100 text-charcoal-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-charcoal-700 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    step={100}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-forest-500"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <p className="text-charcoal-500">
                Showing {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 bg-white rounded-lg shadow-sm border-none outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center bg-white rounded-lg shadow-sm p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-forest-500 text-white'
                        : 'text-charcoal-500'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-forest-500 text-white'
                        : 'text-charcoal-500'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div
              className={`grid gap-2 sm:gap-4 md:gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/product/${product.slug}`}>
                    <div
                      className={`group bg-white rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden bg-cream-100 ${
                          viewMode === 'list'
                            ? 'w-24 xs:w-32 sm:w-48 h-24 xs:h-32 sm:h-48 flex-shrink-0'
                            : 'aspect-square'
                        }`}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Badges */}
                        <div className="absolute top-1.5 sm:top-2 lg:top-3 left-1.5 sm:left-2 lg:left-3 flex flex-col gap-0.5 sm:gap-1 lg:gap-2">
                          {product.bestSeller && (
                            <span className="badge badge-peach text-[10px] sm:text-xs">Bestseller</span>
                          )}
                          {product.newArrival && (
                            <span className="badge badge-forest text-[10px] sm:text-xs">New</span>
                          )}
                          {product.originalPrice && (
                            <span className="badge bg-red-100 text-red-600 text-[10px] sm:text-xs">
                              {Math.round(
                                ((product.originalPrice - product.price) /
                                  product.originalPrice) *
                                  100
                              )}
                              % OFF
                            </span>
                          )}
                        </div>

                        {/* Quick actions */}
                        <div className="absolute bottom-1.5 sm:bottom-2 lg:bottom-3 right-1.5 sm:right-2 lg:right-3 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.preventDefault()
                              setQuickViewProduct(product)
                            }}
                            className="p-1.5 sm:p-2 lg:p-3 bg-white rounded-full shadow-lg"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-charcoal-600" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 sm:p-2 lg:p-3 bg-white rounded-full shadow-lg"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-forest-500" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-2 sm:p-3 lg:p-4 flex-1">
                        <p className="text-[10px] sm:text-xs lg:text-sm text-peach-500 font-medium mb-0.5 capitalize">
                          {product.category.replace('-', ' ')}
                        </p>
                        <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-charcoal-700 mb-1 sm:mb-2 group-hover:text-forest-500 transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        {viewMode === 'list' && (
                          <p className="text-charcoal-500 text-[10px] sm:text-xs lg:text-sm mb-1.5 sm:mb-3 lg:mb-4 line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2 lg:mb-3">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] sm:text-xs lg:text-sm text-charcoal-600">
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-sm sm:text-base lg:text-lg font-bold text-charcoal-700">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] sm:text-xs lg:text-sm text-charcoal-400 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {product.customizable && (
                          <p className="mt-2 text-xs text-forest-500 font-medium">
                            ✨ Customizable
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-charcoal-500 text-lg">
                  No products found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setPriceRange([0, 5000])
                  }}
                  className="mt-4 text-forest-500 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
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
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-charcoal-700">Filters</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-charcoal-500" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal-700 mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-forest-500 text-white'
                      : 'hover:bg-cream-100 text-charcoal-600'
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-forest-500 text-white'
                        : 'hover:bg-cream-100 text-charcoal-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-semibold text-charcoal-700 mb-4">Price Range</h3>
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full accent-forest-500"
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

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
