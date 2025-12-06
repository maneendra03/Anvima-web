'use client'

import { useState, use, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
} from 'lucide-react'
import { products } from '@/data'
import { useCartStore } from '@/store/cartStore'
import { useRecentlyViewedStore } from '@/store/recentlyViewed'
import ProductReviews from '@/components/product/ProductReviews'
import RelatedProducts from '@/components/product/RelatedProducts'
import RecentlyViewed from '@/components/product/RecentlyViewed'
import SizeGuide, { SizeGuideButton } from '@/components/product/SizeGuide'

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const product = products.find((p) => p.slug === slug)
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(
    product?.customizationOptions?.sizes?.[0]?.name || ''
  )
  const [selectedColor, setSelectedColor] = useState(
    product?.customizationOptions?.colors?.[0]?.name || ''
  )
  const [customText, setCustomText] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [hasEngraving, setHasEngraving] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  
  const addItem = useCartStore((state) => state.addItem)
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addItem)

  // Track recently viewed product
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
      })
    }
  }, [product, addToRecentlyViewed])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-charcoal-700 mb-4">
            Product Not Found
          </h1>
          <Link href="/shop" className="text-forest-500 hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  // Calculate price with options
  const calculatePrice = () => {
    let price = product.price
    
    if (selectedSize && product.customizationOptions?.sizes) {
      const sizeOption = product.customizationOptions.sizes.find(
        (s) => s.name === selectedSize
      )
      if (sizeOption) price += sizeOption.price
    }
    
    if (hasEngraving && product.customizationOptions?.engravingPrice) {
      price += product.customizationOptions.engravingPrice
    }
    
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
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: calculatePrice(),
      quantity,
      image: product.images[0],
      customization: {
        text: customText,
        imageUrl: uploadedImage || undefined,
        size: selectedSize,
        color: selectedColor,
        engraving: hasEngraving ? 'Yes' : undefined,
      },
    })
  }

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
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
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
              <div className="flex gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-forest-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
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
              {product.bestSeller && (
                <span className="badge badge-peach">Bestseller</span>
              )}
              {product.newArrival && (
                <span className="badge badge-forest">New Arrival</span>
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
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-charcoal-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-charcoal-700">
                ₹{calculatePrice().toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-charcoal-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="badge bg-red-100 text-red-600">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-charcoal-600 mb-6">{product.shortDescription}</p>

            {/* Customization Options */}
            {product.customizable && (
              <div className="space-y-6 border-t border-cream-200 pt-6">
                <h3 className="font-semibold text-charcoal-700">
                  Customize Your Gift
                </h3>

                {/* Size Selection */}
                {product.customizationOptions?.sizes && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-charcoal-700">
                        Size
                      </label>
                      <SizeGuideButton onClick={() => setShowSizeGuide(true)} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.customizationOptions.sizes.map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedSize === size.name
                              ? 'border-forest-500 bg-forest-50'
                              : 'border-cream-200 hover:border-cream-300'
                          }`}
                        >
                          <span className="font-medium">{size.name}</span>
                          {size.price > 0 && (
                            <span className="text-sm text-charcoal-500 ml-1">
                              (+₹{size.price})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.customizationOptions?.colors && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Color / Style
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {product.customizationOptions.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                            selectedColor === color.name
                              ? 'border-forest-500 bg-forest-50'
                              : 'border-cream-200 hover:border-cream-300'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full border border-charcoal-200"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Input */}
                {product.customizationOptions?.hasText && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Custom Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      maxLength={product.customizationOptions.textMaxLength || 50}
                      placeholder="Enter your message or name"
                      className="input-field"
                    />
                    <p className="text-sm text-charcoal-500 mt-1">
                      {customText.length}/
                      {product.customizationOptions.textMaxLength || 50} characters
                    </p>
                  </div>
                )}

                {/* Image Upload */}
                {product.customizationOptions?.hasImageUpload && (
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

                {/* Engraving Option */}
                {product.customizationOptions?.hasEngraving && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setHasEngraving(!hasEngraving)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        hasEngraving
                          ? 'border-forest-500 bg-forest-500'
                          : 'border-cream-300'
                      }`}
                    >
                      {hasEngraving && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <span className="text-charcoal-700">
                      Add engraving (+₹{product.customizationOptions.engravingPrice})
                    </span>
                  </div>
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
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-cream-50 rounded-r-full"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </motion.button>

              {/* Wishlist */}
              <button className="p-3 border border-cream-200 rounded-full hover:bg-cream-50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-cream-200">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-forest-500 mb-2" />
                <span className="text-sm text-charcoal-600">
                  {product.deliveryTime} delivery
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
            <p className="text-charcoal-600 leading-relaxed">{product.description}</p>

            {/* Tags */}
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
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-16">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts
        currentProductId={product.id}
        category={product.category}
        tags={product.tags}
      />

      {/* Recently Viewed */}
      <RecentlyViewed excludeId={product.id} />

      {/* Size Guide Modal */}
      {product.customizationOptions?.sizes && (
        <SizeGuide
          sizes={product.customizationOptions.sizes}
          productType={
            product.category === 'frames' ? 'frame' :
            product.category === 'polaroids' ? 'polaroid' :
            product.category === 'hampers' ? 'gift' : 'general'
          }
          isOpen={showSizeGuide}
          onClose={() => setShowSizeGuide(false)}
        />
      )}
    </div>
  )
}
