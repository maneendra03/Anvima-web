'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0)
      setQuantity(1)
      setSelectedSize(product.customizationOptions?.sizes?.[0]?.name || '')
      setSelectedColor(product.customizationOptions?.colors?.[0]?.name || '')
    }
  }, [product])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!product) return null

  const calculatePrice = () => {
    let price = product.price
    if (selectedSize && product.customizationOptions?.sizes) {
      const sizeOption = product.customizationOptions.sizes.find(
        (s) => s.name === selectedSize
      )
      if (sizeOption) price += sizeOption.price
    }
    return price
  }

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      slug: product.slug, // Include slug for order API compatibility
      name: product.name,
      price: calculatePrice(),
      quantity,
      image: product.images[0],
      customization: {
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      },
    })
    toast.success(`${product.name} added to cart!`)
    onClose()
  }

  const handlePrevImage = () => {
    setSelectedImage((prev) => 
      (prev - 1 + product.images.length) % product.images.length
    )
  }

  const handleNextImage = () => {
    setSelectedImage((prev) => 
      (prev + 1) % product.images.length
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-4xl sm:w-full bg-white rounded-2xl z-50 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image Gallery */}
              <div className="relative aspect-square bg-cream-50">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {product.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === selectedImage
                              ? 'bg-forest-600 w-4'
                              : 'bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.bestSeller && (
                    <span className="badge badge-peach">Bestseller</span>
                  )}
                  {product.newArrival && (
                    <span className="badge badge-forest">New</span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-charcoal-400">({product.reviewCount} reviews)</span>
                </div>

                <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-2">
                  {product.name}
                </h2>

                <p className="text-charcoal-500 mb-4 line-clamp-3">
                  {product.shortDescription}
                </p>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-forest-600">
                    ₹{calculatePrice().toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-xl text-charcoal-400 line-through">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Size Options */}
                {product.customizationOptions?.sizes && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.customizationOptions.sizes.map((size) => (
                        <button
                          key={size.name}
                          onClick={() => setSelectedSize(size.name)}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedSize === size.name
                              ? 'border-forest-600 bg-forest-50 text-forest-700'
                              : 'border-charcoal-200 hover:border-charcoal-300'
                          }`}
                        >
                          {size.name}
                          {size.price > 0 && ` (+₹${size.price})`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Options */}
                {product.customizationOptions?.colors && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">
                      Color: {selectedColor}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.customizationOptions.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            selectedColor === color.name
                              ? 'border-forest-600 ring-2 ring-forest-200'
                              : 'border-transparent hover:border-charcoal-300'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Quantity
                  </label>
                  <div className="inline-flex items-center border border-charcoal-200 rounded-full">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-cream-50 rounded-l-full"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-cream-50 rounded-r-full"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </motion.button>
                  <button className="p-3 border border-cream-200 rounded-full hover:bg-cream-50 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* View Full Details Link */}
                <Link
                  href={`/product/${product.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-forest-600 hover:text-forest-700 text-sm font-medium"
                  onClick={onClose}
                >
                  View Full Details
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {/* Stock Info */}
                {product.inStock ? (
                  <p className="mt-4 text-sm text-green-600">✓ In Stock</p>
                ) : (
                  <p className="mt-4 text-sm text-red-600">✗ Out of Stock</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
