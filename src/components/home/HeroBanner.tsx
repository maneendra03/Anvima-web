'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Gift, Frame, Package } from 'lucide-react'

const banners = [
  {
    id: 1,
    bgColor: 'bg-gradient-to-br from-rose-100 via-cream-50 to-amber-100',
    icon: Gift,
    title: 'Personalized Gifts',
    subtitle: 'Create memories that last forever',
    link: '/shop',
    cta: 'Shop Now'
  },
  {
    id: 2,
    bgColor: 'bg-gradient-to-br from-emerald-100 via-cream-50 to-teal-100',
    icon: Frame,
    title: 'Custom Photo Frames',
    subtitle: 'Starting from ₹499',
    link: '/shop?category=frames',
    cta: 'Explore'
  },
  {
    id: 3,
    bgColor: 'bg-gradient-to-br from-violet-100 via-cream-50 to-indigo-100',
    icon: Package,
    title: 'Gift Hampers',
    subtitle: 'Perfect for every occasion',
    link: '/shop?category=hampers',
    cta: 'View Collection'
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative w-full mt-[68px] md:mt-[80px] h-[45vh] md:h-[55vh] lg:h-[65vh] overflow-hidden">
      {/* Slides */}
      {banners.map((banner, index) => {
        const IconComponent = banner.icon
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${banner.bgColor} ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 md:w-64 md:h-64 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            </div>
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="max-w-2xl px-4">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 bg-white/40 backdrop-blur-sm rounded-full">
                    <IconComponent className="w-10 h-10 md:w-14 md:h-14 text-charcoal-700" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-3 text-charcoal-600">
                  {banner.subtitle}
                </p>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif mb-6 text-charcoal-900">
                  {banner.title}
                </h1>
                <Link href={banner.link}>
                  <button className="px-8 py-3 bg-charcoal-900 text-white text-sm uppercase tracking-wider hover:bg-charcoal-800 transition-colors">
                    {banner.cta}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors rounded-full"
      >
        <ChevronLeft className="w-6 h-6 text-charcoal-700" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors rounded-full"
      >
        <ChevronRight className="w-6 h-6 text-charcoal-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-charcoal-900 w-8' 
                : 'bg-charcoal-400/50 w-2 hover:bg-charcoal-600'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
