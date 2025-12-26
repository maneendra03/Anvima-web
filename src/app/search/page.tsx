'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Package, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  Star,
  Heart,
  ShoppingCart,
  Grid3X3,
  LayoutList,
  Check,
  Filter,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  id?: string
  name: string
  slug: string
  price: number
  originalPrice?: number
  comparePrice?: number
  images: string[]
  category: { name: string; slug: string } | string
  rating?: number
  reviewCount?: number
  inStock?: boolean
  bestSeller?: boolean
  newArrival?: boolean
  customizable?: boolean
  shortDescription?: string
  deliveryTime?: string
}

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'rating', label: 'Avg. Customer Review' },
  { value: 'discount', label: 'Discount' },
]

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹5,000', min: 2000, max: 5000 },
  { label: 'Over ₹5,000', min: 5000, max: 100000 },
]

const categories = [
  { name: 'All Categories', slug: 'all' },
  { name: 'Custom Frames', slug: 'frames' },
  { name: 'Polaroid Prints', slug: 'polaroids' },
  { name: 'Gift Hampers', slug: 'hampers' },
  { name: 'Photo Gifts', slug: 'photo-gifts' },
  { name: 'Personalized Items', slug: 'personalized' },
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(query)
  const [sortBy, setSortBy] = useState('relevance')
  const [selectedPriceRange, setSelectedPriceRange] = useState<{min: number, max: number} | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [discountedOnly, setDiscountedOnly] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  const addItem = useCartStore((state) => state.addItem)
  const itemsPerPage = 20

  // Handle image error without infinite loops
  const handleImageError = (productId: string) => {
    setFailedImages(prev => new Set(prev).add(productId))
  }

  // Check if image should show
  const shouldShowImage = (product: Product): boolean => {
    const id = product._id || product.id || ''
    return !failedImages.has(id) && !!product.images?.[0]
  }

  // Check if URL is external
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://')
  }

  const fetchProducts = useCallback(async () => {
    if (!query) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({
        search: query,
        sort: sortBy,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })

      if (selectedPriceRange) {
        params.append('minPrice', selectedPriceRange.min.toString())
        params.append('maxPrice', selectedPriceRange.max.toString())
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        let filteredProducts = data.data.products || data.data || []
        
        if (inStockOnly) {
          filteredProducts = filteredProducts.filter((p: Product) => p.inStock !== false)
        }
        if (discountedOnly) {
          filteredProducts = filteredProducts.filter((p: Product) => 
            (p.originalPrice && p.originalPrice > p.price) || 
            (p.comparePrice && p.comparePrice > p.price)
          )
        }
        
        setProducts(filteredProducts)
        setTotalResults(data.data.total || filteredProducts.length)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [query, sortBy, selectedPriceRange, selectedCategory, currentPage, inStockOnly, discountedOnly])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setSearchTerm(query)
    setCurrentPage(1)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: `${product._id || product.id}-${Date.now()}`,
      productId: product._id || product.id || '',
      slug: product.slug, // Include slug for order API compatibility
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/placeholder.svg',
    })
    toast.success('Added to cart!')
  }

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDiscountPercent = (product: Product) => {
    const originalPrice = product.originalPrice || product.comparePrice
    if (originalPrice && originalPrice > product.price) {
      return Math.round((1 - product.price / originalPrice) * 100)
    }
    return 0
  }

  const getCategoryName = (category: Product['category']) => {
    if (typeof category === 'string') return category
    return category?.name || 'Uncategorized'
  }

  const clearAllFilters = () => {
    setSelectedPriceRange(null)
    setSelectedCategory('all')
    setInStockOnly(false)
    setDiscountedOnly(false)
    setSortBy('relevance')
  }

  const hasActiveFilters = selectedPriceRange || selectedCategory !== 'all' || inStockOnly || discountedOnly

  const totalPages = Math.ceil(totalResults / itemsPerPage)

  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? '' : 'sticky top-24'} space-y-4`}>
      {/* Category Filter */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
          <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wide">Category</h3>
        </div>
        <div className="p-3 space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                selectedCategory === cat.slug
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-charcoal-700 hover:bg-cream-50'
              }`}
            >
              <span>{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
          <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wide">Price</h3>
        </div>
        <div className="p-3 space-y-1">
          <button
            onClick={() => setSelectedPriceRange(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
              !selectedPriceRange
                ? 'bg-orange-50 text-orange-700 font-medium'
                : 'text-charcoal-700 hover:bg-cream-50'
            }`}
          >
            <span>All Prices</span>
            {!selectedPriceRange && <Check className="w-4 h-4" />}
          </button>
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedPriceRange({ min: range.min, max: range.max })}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
                  ? 'bg-orange-50 text-orange-700 font-medium'
                  : 'text-charcoal-700 hover:bg-cream-50'
              }`}
            >
              <span>{range.label}</span>
              {selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max && (
                <Check className="w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
          <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wide">Availability</h3>
        </div>
        <div className="p-3 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-forest-600 border-cream-200 rounded focus:ring-forest-500"
            />
            <span className="text-sm text-charcoal-700">In Stock Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={discountedOnly}
              onChange={(e) => setDiscountedOnly(e.target.checked)}
              className="w-4 h-4 text-forest-600 border-cream-200 rounded focus:ring-forest-500"
            />
            <span className="text-sm text-charcoal-700">On Sale</span>
          </label>
        </div>
      </div>

      {/* Customer Ratings */}
      <div className="bg-white rounded-lg border border-cream-200 overflow-hidden">
        <div className="px-4 py-3 bg-cream-50 border-b border-cream-200">
          <h3 className="font-semibold text-charcoal-900 text-sm uppercase tracking-wide">Customer Rating</h3>
        </div>
        <div className="p-3 space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              className="w-full text-left px-3 py-2 rounded-md text-sm text-charcoal-700 hover:bg-cream-50 flex items-center gap-2"
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-charcoal-300'}`}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2.5 text-sm font-medium text-forest-600 hover:text-orange-700 border border-forest-200 rounded-lg hover:bg-forest-50 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = getDiscountPercent(product)
    const originalPrice = product.originalPrice || product.comparePrice
    const isWishlisted = wishlist.includes(product._id || product.id || '')

    if (viewMode === 'list') {
      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-cream-200 overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="flex flex-col sm:flex-row">
            <Link href={`/product/${product.slug}`} className="sm:w-48 md:w-56 flex-shrink-0">
              <div className="relative aspect-square sm:h-full bg-gradient-to-br from-cream-100 to-cream-200">
                {shouldShowImage(product) ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => handleImageError(product._id || product.id || '')}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-12 h-12 text-charcoal-300" />
                  </div>
                )}
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                )}
                {product.bestSeller && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Bestseller
                  </span>
                )}
              </div>
            </Link>
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex-1">
                <p className="text-xs text-charcoal-500 mb-1">{getCategoryName(product.category)}</p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-medium text-charcoal-900 hover:text-forest-600 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                </Link>
                {product.shortDescription && (
                  <p className="text-sm text-charcoal-600 line-clamp-2 mb-3">{product.shortDescription}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-charcoal-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-charcoal-600">({product.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-charcoal-900">{formatCurrency(product.price)}</span>
                  {originalPrice && originalPrice > product.price && (
                    <span className="text-sm text-charcoal-500 line-through">{formatCurrency(originalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-charcoal-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Free Delivery
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 py-2.5 bg-forest-500 text-white font-medium rounded-lg hover:bg-forest-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product._id || product.id || '')}
                  className={`p-2.5 border rounded-lg transition-colors ${
                    isWishlisted
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-cream-200 hover:bg-cream-50 text-charcoal-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-cream-200 overflow-hidden group hover:shadow-lg transition-all"
      >
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-cream-100 to-cream-200">
          {shouldShowImage(product) ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
              onError={() => handleImageError(product._id || product.id || '')}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-16 h-16 text-charcoal-300" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discount}% OFF
              </span>
            )}
            {product.bestSeller && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                Bestseller
              </span>
            )}
            {product.newArrival && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                New
              </span>
            )}
          </div>
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              toggleWishlist(product._id || product.id || '')
            }}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              isWishlisted
                ? 'bg-red-50 text-red-500'
                : 'bg-white/80 text-charcoal-600 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          {/* Quick Add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault()
                handleAddToCart(product)
              }}
              className="w-full py-2 bg-white text-charcoal-900 font-medium rounded-lg hover:bg-cream-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </Link>
        <div className="p-4">
          <p className="text-xs text-charcoal-500 mb-1">{getCategoryName(product.category)}</p>
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-medium text-charcoal-900 hover:text-forest-600 line-clamp-2 mb-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-charcoal-300'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-charcoal-600">({product.reviewCount || 0})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-charcoal-900">{formatCurrency(product.price)}</span>
            {originalPrice && originalPrice > product.price && (
              <span className="text-sm text-charcoal-500 line-through">{formatCurrency(originalPrice)}</span>
            )}
          </div>
          {product.customizable && (
            <span className="inline-block mt-2 text-xs text-forest-600 font-medium">
              ✨ Customizable
            </span>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-14 sm:pt-16 lg:pt-20">
      {/* Search Header */}
      <div className="bg-white border-b border-cream-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for customized gifts, frames, hampers..."
                  className="w-full pl-4 pr-10 py-3 border-2 border-cream-200 rounded-lg focus:border-forest-500 focus:ring-0 text-base bg-cream-50"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-forest-500 text-white font-medium rounded-lg hover:bg-forest-600 transition-colors flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-[1400px] mx-auto px-4 py-2">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-charcoal-500 hover:text-forest-600">Home</Link>
            <ChevronRight className="w-4 h-4 text-charcoal-400" />
            <span className="text-charcoal-900">Search Results</span>
            {query && (
              <>
                <ChevronRight className="w-4 h-4 text-charcoal-400" />
                <span className="text-charcoal-500">&quot;{query}&quot;</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {!query ? (
          /* Empty State - No Query */
          <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-forest-500" />
            </div>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">Search Our Collection</h2>
            <p className="text-charcoal-600 mb-8 max-w-md mx-auto">
              Find the perfect customized gift. Search for frames, polaroids, hampers, and more!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Photo Frames', 'Gift Hampers', 'Polaroid Sets', 'Custom Prints'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(suggestion)}`)}
                  className="px-4 py-2 bg-cream-50 text-charcoal-700 rounded-full hover:bg-forest-100 hover:text-orange-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-cream-200 p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded mb-2" />
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-cream-200 p-4 mb-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-cream-200 overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          /* No Results State */
          <div className="bg-white rounded-xl shadow-sm border border-cream-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-cream-50 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-charcoal-400" />
            </div>
            <h2 className="text-2xl font-semibold text-charcoal-900 mb-2">No Results Found</h2>
            <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any products matching &quot;{query}&quot;. Try different keywords or browse our categories.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/shop"
                className="px-6 py-3 bg-forest-500 text-white font-medium rounded-lg hover:bg-forest-600 transition-colors"
              >
                Browse All Products
              </Link>
              <button
                onClick={() => {
                  setSearchTerm('')
                  router.push('/search')
                }}
                className="px-6 py-3 border border-cream-200 text-charcoal-700 font-medium rounded-lg hover:bg-cream-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Search
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Header */}
              <div className="bg-white rounded-lg border border-cream-200 p-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-charcoal-900">
                      <span className="font-semibold">{totalResults.toLocaleString()}</span> results for{' '}
                      <span className="font-semibold">&quot;{query}&quot;</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mobile Filter Button */}
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden px-4 py-2 border border-cream-200 rounded-lg flex items-center gap-2 hover:bg-cream-50"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {hasActiveFilters && (
                        <span className="w-2 h-2 bg-forest-500 rounded-full" />
                      )}
                    </button>
                    
                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center border border-cream-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-cream-50 text-charcoal-900' : 'text-charcoal-500 hover:bg-cream-50'}`}
                      >
                        <Grid3X3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-cream-50 text-charcoal-900' : 'text-charcoal-500 hover:bg-cream-50'}`}
                      >
                        <LayoutList className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                        className="px-4 py-2 border border-cream-200 rounded-lg flex items-center gap-2 hover:bg-cream-50 min-w-[180px] justify-between"
                      >
                        <span className="text-sm text-charcoal-700">
                          {sortOptions.find(o => o.value === sortBy)?.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showSortDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-1 w-full bg-white border border-cream-200 rounded-lg shadow-lg z-20 overflow-hidden"
                          >
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value)
                                  setShowSortDropdown(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-cream-50 flex items-center justify-between ${
                                  sortBy === option.value ? 'bg-orange-50 text-orange-700' : 'text-charcoal-700'
                                }`}
                              >
                                {option.label}
                                {sortBy === option.value && <Check className="w-4 h-4" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-cream-200">
                    <span className="text-sm text-charcoal-500">Active filters:</span>
                    {selectedCategory !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        {categories.find(c => c.slug === selectedCategory)?.name}
                        <button onClick={() => setSelectedCategory('all')} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedPriceRange && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        {priceRanges.find(r => r.min === selectedPriceRange.min && r.max === selectedPriceRange.max)?.label}
                        <button onClick={() => setSelectedPriceRange(null)} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        In Stock
                        <button onClick={() => setInStockOnly(false)} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {discountedOnly && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                        On Sale
                        <button onClick={() => setDiscountedOnly(false)} className="hover:text-orange-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-charcoal-500 hover:text-forest-600 underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Product Grid/List */}
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-cream-200 rounded-lg text-charcoal-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-forest-500 text-white'
                              : 'border border-cream-200 text-charcoal-700 hover:bg-cream-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-cream-200 rounded-lg text-charcoal-700 hover:bg-cream-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-charcoal-900">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-cream-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <FilterSidebar isMobile />
              </div>
              <div className="sticky bottom-0 bg-white border-t border-cream-200 p-4">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-forest-500 text-white font-medium rounded-lg hover:bg-forest-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-forest-500 animate-spin mx-auto mb-4" />
        <p className="text-charcoal-600">Loading search...</p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}
