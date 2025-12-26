'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gift, Heart, Star, Camera, Home, Package } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  image?: string
}

// Default icons for categories without images
const categoryIcons = [Gift, Heart, Star, Camera, Home, Package]

// Pastel background colors for icons
const iconBgColors = [
  'bg-rose-100',
  'bg-amber-100',
  'bg-emerald-100',
  'bg-sky-100',
  'bg-violet-100',
  'bg-orange-100',
]

export default function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([])
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => new Set(prev).add(categoryId))
  }

  if (categories.length === 0) return null

  // Duplicate categories for seamless infinite scroll
  const displayCategories = [...categories, ...categories]

  return (
    <section className="py-8 md:py-12 bg-white border-b border-charcoal-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div 
          ref={scrollRef}
          className="flex items-center gap-8 md:gap-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            animation: isPaused ? 'none' : 'scroll 20s linear infinite',
          }}
        >
          {displayCategories.map((category, index) => {
            const IconComponent = categoryIcons[index % categoryIcons.length]
            const bgColor = iconBgColors[index % iconBgColors.length]
            const hasValidImage = category.image && !imageErrors.has(category._id)

            return (
              <Link
                key={`${category._id}-${index}`}
                href={`/shop?category=${category.slug}`}
                className="flex flex-col items-center gap-3 group flex-shrink-0"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-charcoal-900 transition-all ${!hasValidImage ? bgColor : 'bg-cream-100'}`}>
                  {hasValidImage ? (
                    <Image
                      src={category.image!}
                      alt={category.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={() => handleImageError(category._id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <IconComponent className="w-7 h-7 md:w-9 md:h-9 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
                    </div>
                  )}
                </div>
                <span className="text-xs uppercase tracking-wider text-charcoal-600 group-hover:text-charcoal-900 transition-colors whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  )
}
