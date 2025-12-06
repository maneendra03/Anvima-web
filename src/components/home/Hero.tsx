'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Disable animations on mobile for better performance
  const animationProps = isMobile ? {} : {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-screen flex items-center gradient-hero overflow-hidden pt-14 sm:pt-16 lg:pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 sm:w-56 lg:w-72 h-40 sm:h-56 lg:h-72 bg-peach-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-52 sm:w-72 lg:w-96 h-52 sm:h-72 lg:h-96 bg-blush-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[450px] lg:w-[600px] h-[250px] sm:h-[450px] lg:h-[600px] bg-cream-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <motion.div
            {...animationProps}
            className="text-center lg:text-left"
          >
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-peach-100 rounded-full text-peach-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4 lg:mb-5"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Handcrafted with Love
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-charcoal-700 leading-tight mb-3 sm:mb-4 lg:mb-6">
              Create Memories{' '}
              <span className="text-forest-500 relative">
                That Last
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 8C50 2 150 2 198 8"
                    stroke="#FFAA8A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              Forever
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-charcoal-500 mb-4 sm:mb-6 lg:mb-8 max-w-lg mx-auto lg:mx-0">
              Transform your precious moments into beautiful customized gifts.
              From personalized frames to curated hampers — every piece is crafted
              just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link href="/shop">
                <button
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Customize Your Gift
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/custom-orders">
                <button
                  className="btn-secondary w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  Request Custom Order
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="mt-6 sm:mt-8 lg:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 justify-center lg:justify-start text-xs sm:text-sm text-charcoal-500"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                500+ Happy Customers
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-peach-400 rounded-full" />
                4.9★ Rating
              </div>
            </div>
          </motion.div>

          {/* Image Grid - Desktop only */}
          <div
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4] bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=500&fit=crop"
                    alt="Custom frame"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop"
                    alt="Gift hamper"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop"
                    alt="Polaroid prints"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4] bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop"
                    alt="Photo collage"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -left-8 top-1/2 bg-white rounded-xl shadow-lg p-4">
              <p className="text-sm font-medium text-charcoal-700">
                ✨ 100% Customizable
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block">
        <div className="w-6 h-10 border-2 border-charcoal-300 rounded-full flex justify-center pt-2 animate-bounce">
          <div className="w-1.5 h-1.5 bg-charcoal-400 rounded-full" />
        </div>
      </div>
    </section>
  )
}
