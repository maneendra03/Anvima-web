'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Send, Play, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

// Shop the Look data - Add your reel thumbnails/videos with linked products
// To add content:
// 1. Upload your reel thumbnail/video to Cloudinary
// 2. Update the thumbnailUrl/videoUrl below
// 3. The products are already linked to your store products
const shopTheLookItems = [
  {
    id: 1,
    // Upload your reel thumbnail to Cloudinary and paste URL here
    videoUrl: '', // Optional: '/videos/reel1.mp4' for video playback
    thumbnailUrl: '', // e.g., 'https://res.cloudinary.com/your-cloud/image/upload/v1234/reel1.jpg'
    views: '2.5K',
    // Linked to your actual product
    product: {
      name: 'Personalized Wooden Photo Frame',
      slug: 'personalized-wooden-photo-frame',
      image: '', // Product thumbnail (optional)
      price: 599,
      originalPrice: 799,
      discount: 25,
    }
  },
  {
    id: 2,
    videoUrl: '',
    thumbnailUrl: '',
    views: '1.8K',
    product: {
      name: 'Magic Photo Mug',
      slug: 'magic-photo-mug',
      image: '',
      price: 349,
      originalPrice: 449,
      discount: 22,
    }
  },
  {
    id: 3,
    videoUrl: '',
    thumbnailUrl: '',
    views: '3.2K',
    product: {
      name: '3D Moon Lamp with Photo',
      slug: '3d-moon-lamp-photo',
      image: '',
      price: 899,
      originalPrice: 1199,
      discount: 25,
    }
  },
  {
    id: 4,
    videoUrl: '',
    thumbnailUrl: '',
    views: '1.2K',
    product: {
      name: 'Custom Photo Cushion',
      slug: 'custom-photo-cushion',
      image: '',
      price: 499,
      originalPrice: 699,
      discount: 29,
    }
  },
]

export default function ShopTheLook() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [likedItems, setLikedItems] = useState<number[]>([])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const toggleLike = (id: number) => {
    setLikedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Check if any items have content
  const hasContent = shopTheLookItems.some(item => item.thumbnailUrl || item.videoUrl)

  if (!hasContent) {
    return null // Don't render if no content is configured
  }

  return (
    <section className="py-12 md:py-20 bg-cream-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-charcoal-900 tracking-tight">
            SHOP THE LOOK
          </h2>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5 text-charcoal-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex"
          >
            <ChevronRight className="w-5 h-5 text-charcoal-700" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {shopTheLookItems.filter(item => item.thumbnailUrl || item.videoUrl).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] snap-start"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Video/Image Section */}
                  <div className="relative aspect-[9/14] bg-gradient-to-br from-cream-100 to-cream-200 overflow-hidden group">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-charcoal-300" />
                      </div>
                    )}
                    
                    {/* Play Button Overlay (for videos) */}
                    {item.videoUrl && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-7 h-7 text-charcoal-900 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {/* Views Count */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full">
                      <Eye className="w-3.5 h-3.5" />
                      {item.views} Views
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          likedItems.includes(item.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-charcoal-700 hover:bg-white'
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={likedItems.includes(item.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-charcoal-700 hover:bg-white transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info Section */}
                  <div className="p-4">
                    <div className="flex gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-peach-100 to-peach-200" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-charcoal-800 line-clamp-2 leading-tight">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-charcoal-900">
                            RS. {item.product.price.toLocaleString()}
                          </span>
                          {item.product.originalPrice && (
                            <span className="text-xs text-charcoal-400 line-through">
                              RS. {item.product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {item.product.discount > 0 && (
                          <span className="text-xs font-medium text-green-600">
                            {item.product.discount}% Off
                          </span>
                        )}
                      </div>

                      {/* Arrow Link */}
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="self-center p-2 hover:bg-cream-100 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-charcoal-600" />
                      </Link>
                    </div>

                    {/* Buy Now Button */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="block w-full mt-4 py-3 bg-charcoal-900 text-white text-center text-sm font-medium rounded-lg hover:bg-charcoal-800 transition-colors"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
