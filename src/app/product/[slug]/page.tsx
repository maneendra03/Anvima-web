'use client'

import { useState, use, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useRecentlyViewedStore } from '@/store/recentlyViewed'
import { useWishlistStore } from '@/store/wishlistStore'
import ProductReviews from '@/components/product/ProductReviews'
import RelatedProducts from '@/components/product/RelatedProducts'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import SizeGuide, { SizeGuideButton } from '@/components/product/SizeGuide'
import toast from 'react-hot-toast'

interface ProductImage {
  url: string
  alt?: string
  isPrimary: boolean
}

interface ProductVariant {
  name: string
  options: string[]
  prices?: { option: string; price: number }[]
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
  category: { _id: string; name: string; slug: string }
  tags: string[]
  variants: ProductVariant[]
  customizable: boolean
  customizationOptions?: {
    allowText: boolean
    maxTextLength?: number
    allowImage: boolean
    maxImages?: number
    instructions?: string
  }
  stock: number
  isFeatured: boolean
  isActive: boolean
  ratings: {
    average: number
    count: number
  }
}

interface RelatedProduct {
  _id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  images: ProductImage[]
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  
  // Animation states
  const [addedToCart, setAddedToCart] = useState(false)
  const [wishlistAnimating, setWishlistAnimating] = useState(false)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [customText, setCustomText] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  
  const addItem = useCartStore((state) => state.addItem)
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/products/${slug}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.data.product)
          setRelatedProducts(data.data.relatedProducts || [])
          
          // Initialize variant selections
          if (data.data.product.variants?.length > 0) {
            const initialVariants: Record<string, string> = {}
            data.data.product.variants.forEach((variant: ProductVariant) => {
              if (variant.options?.length > 0) {
                initialVariants[variant.name] = variant.options[0]
              }
            })
            setSelectedVariants(initialVariants)
          }
        } else {
          setError(data.message || 'Product not found')
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [slug])

  // Track recently viewed product
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.comparePrice,
        image: product.images[0]?.url || '/placeholder.jpg',
      })
    }
  }, [product, addToRecentlyViewed])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-forest-500" />
          <p className="text-charcoal-600">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-charcoal-700 mb-4">
            Product Not Found
          </h1>
          <p className="text-charcoal-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/shop" className="text-forest-500 hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Get image URL helper
  const getImageUrl = (image: ProductImage | string, index?: number): string => {
    if (typeof image === 'string') return image
    return image.url || '/placeholder.jpg'
  }

  // Calculate price with variant options
  const calculatePrice = () => {
    let price = product.price
    
    // Add variant price modifiers if available
    product.variants?.forEach(variant => {
      const selectedOption = selectedVariants[variant.name]
      if (selectedOption && variant.prices) {
        const priceInfo = variant.prices.find(p => p.option === selectedOption)
        if (priceInfo) {
          price += priceInfo.price
        }
      }
    })
    
    return price
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddToCart = () => {
    addItem({
      id: `${product._id}-${Date.now()}`,
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: calculatePrice(),
      quantity,
      image: getImageUrl(product.images[0]),
      customization: {
        text: customText || undefined,
        imageUrl: uploadedImage || undefined,
        ...selectedVariants,
      },
    })
    
    // Trigger animation
    setAddedToCart(true)
    toast.success('Added to cart!')
    setTimeout(() => setAddedToCart(false), 1500)
  }

  const handleWishlistToggle = () => {
    setWishlistAnimating(true)
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        comparePrice: product.comparePrice,
        image: getImageUrl(product.images[0]),
      })
      toast.success('Added to wishlist!')
    }
    
    setTimeout(() => setWishlistAnimating(false), 600)
  }

  const isWishlisted = isInWishlist(product._id)

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-charcoal-500">
            <li>
              <Link href="/" className="hover:text-forest-500">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/shop" className="hover:text-forest-500">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li className="text-charcoal-700 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-white"
            >
              {product.images[selectedImage] ? (
                <Image
                  src={getImageUrl(product.images[selectedImage])}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              
              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (prev) => (prev - 1 + product.images.length) % product.images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev + 1) % product.images.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-forest-500'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.isFeatured && (
                <span className="badge badge-peach">Featured</span>
              )}
              {product.stock === 0 && (
                <span className="badge bg-red-100 text-red-600">Out of Stock</span>
              )}
              {product.stock > 0 && product.stock < 10 && (
                <span className="badge bg-amber-100 text-amber-600">Only {product.stock} left</span>
              )}
            </div>

            <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.ratings?.average || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-charcoal-600">
                {product.ratings?.average?.toFixed(1) || '0'} ({product.ratings?.count || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-charcoal-700">
                ₹{calculatePrice().toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-xl text-charcoal-400 line-through">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                  <span className="badge bg-red-100 text-red-600">
                    {Math.round(
                      ((product.comparePrice - product.price) / product.comparePrice) * 100
                    )}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-charcoal-600 mb-6">{product.shortDescription || product.description}</p>

            {/* Variant Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-6 border-t border-cream-200 pt-6">
                <h3 className="font-semibold text-charcoal-700">
                  Choose Your Options
                </h3>

                {product.variants.map((variant) => (
                  <div key={variant.name}>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      {variant.name}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {variant.options?.map((option) => {
                        const priceInfo = variant.prices?.find(p => p.option === option)
                        return (
                          <button
                            key={option}
                            onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              selectedVariants[variant.name] === option
                                ? 'border-forest-500 bg-forest-50'
                                : 'border-cream-200 hover:border-cream-300'
                            }`}
                          >
                            <span className="font-medium">{option}</span>
                            {priceInfo && priceInfo.price > 0 && (
                              <span className="text-sm text-charcoal-500 ml-1">
                                (+₹{priceInfo.price})
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customization Options */}
            {product.customizable && product.customizationOptions && (
              <div className="space-y-6 border-t border-cream-200 pt-6 mt-6">
                <h3 className="font-semibold text-charcoal-700">
                  Customize Your Gift
                </h3>

                {/* Text Input */}
                {product.customizationOptions.allowText && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Custom Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      maxLength={product.customizationOptions.maxTextLength || 50}
                      placeholder="Enter your message or name"
                      className="input-field"
                    />
                    <p className="text-sm text-charcoal-500 mt-1">
                      {customText.length}/{product.customizationOptions.maxTextLength || 50} characters
                    </p>
                  </div>
                )}

                {/* Image Upload */}
                {product.customizationOptions.allowImage && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Upload Your Photo
                    </label>
                    <div className="border-2 border-dashed border-cream-300 rounded-xl p-6 text-center hover:border-forest-500 transition-colors">
                      {uploadedImage ? (
                        <div className="relative inline-block">
                          <img
                            src={uploadedImage}
                            alt="Uploaded"
                            className="max-w-32 max-h-32 rounded-lg mx-auto"
                          />
                          <button
                            onClick={() => setUploadedImage(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
                          <p className="text-charcoal-600">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-sm text-charcoal-500">
                            JPG, PNG (min. 1000x1000px)
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {product.customizationOptions.instructions && (
                  <p className="text-sm text-charcoal-500 italic">
                    {product.customizationOptions.instructions}
                  </p>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {/* Quantity */}
              <div className="flex items-center border border-cream-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-cream-50 rounded-l-full"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="p-3 hover:bg-cream-50 rounded-r-full"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                animate={addedToCart ? { scale: [1, 1.05, 1] } : {}}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-medium transition-all ${
                  addedToCart 
                    ? 'bg-emerald-500 text-white' 
                    : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <motion.div
                  animate={addedToCart ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {addedToCart ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <ShoppingBag className="w-5 h-5" />
                  )}
                </motion.div>
                {product.stock === 0 ? 'Out of Stock' : addedToCart ? 'Added!' : 'Add to Cart'}
              </motion.button>

              {/* Wishlist */}
              <motion.button 
                whileTap={{ scale: 0.85 }}
                animate={wishlistAnimating ? { scale: [1, 1.3, 1] } : {}}
                onClick={handleWishlistToggle}
                className={`p-3 border rounded-full transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500' 
                    : 'border-cream-200 hover:bg-cream-50'
                }`}
              >
                <motion.div
                  animate={wishlistAnimating && !isWishlisted ? { 
                    scale: [1, 1.4, 1],
                  } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Heart className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.div>
              </motion.button>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-cream-200">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-forest-500 mb-2" />
                <span className="text-sm text-charcoal-600">
                  3-5 days delivery
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-6 h-6 text-forest-500 mb-2" />
                <span className="text-sm text-charcoal-600">Secure payment</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-forest-500 mb-2" />
                <span className="text-sm text-charcoal-600">Easy returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-4">
              About This Product
            </h2>
            <div className="text-charcoal-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-cream-100 text-charcoal-600 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-16">
          <ProductReviews productId={product._id} productSlug={product.slug} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct._id}
                  href={`/product/${relatedProduct.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-50 mb-3">
                    <Image
                      src={getImageUrl(relatedProduct.images[0])}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-medium text-charcoal-700 group-hover:text-forest-500 transition-colors line-clamp-2">
                    {relatedProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-charcoal-700">
                      ₹{relatedProduct.price.toLocaleString()}
                    </span>
                    {relatedProduct.comparePrice && (
                      <span className="text-sm text-charcoal-400 line-through">
                        ₹{relatedProduct.comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed excludeId={product._id} />
    </div>
  )
}
