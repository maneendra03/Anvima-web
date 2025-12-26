'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRecentlyViewedStore } from '@/store/recentlyViewed'

interface RecentlyViewedProps {
  excludeId?: string
  title?: string
  maxItems?: number
}

export default function RecentlyViewed({ 
  excludeId, 
  title = 'Recently Viewed',
  maxItems = 6 
}: RecentlyViewedProps) {
  const items = useRecentlyViewedStore((state) => state.items)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on server
  if (!mounted) return null

  // Filter out excluded product and limit items
  const displayItems = items
    .filter((item) => item.id !== excludeId)
    .slice(0, maxItems)

  if (displayItems.length === 0) return null

  const itemsPerView = 4
  const maxIndex = Math.max(0, displayItems.length - itemsPerView)

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  return (
    <section className="py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-charcoal-700 flex items-center gap-2">
            <Clock className="w-6 h-6 text-charcoal-500" />
            {title}
          </h2>
          
          {displayItems.length > itemsPerView && (
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 rounded-full border border-charcoal-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="p-2 rounded-full border border-charcoal-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{ x: -currentIndex * (256 + 24) }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-64"
              >
                <Link href={`/product/${item.slug}`}>
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-charcoal-700 truncate group-hover:text-charcoal-900 transition-colors">
                        {item.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-charcoal-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-charcoal-400 line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
