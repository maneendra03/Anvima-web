'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-screen flex items-center gradient-hero overflow-hidden">
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-peach-100 rounded-full text-peach-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4 lg:mb-5"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Handcrafted with Love
            </motion.div>

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
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Customize Your Gift
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/custom-orders">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Request Custom Order
                </motion.button>
              </Link>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
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
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="space-y-4"
              >
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4] bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=500&fit=crop"
                    alt="Custom frame"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop"
                    alt="Gift hamper"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="space-y-4 pt-8"
              >
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop"
                    alt="Polaroid prints"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4] bg-cream-200">
                  <img
                    src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=500&fit=crop"
                    alt="Photo collage"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

            {/* Floating badge */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-8 top-1/2 bg-white rounded-xl shadow-lg p-4"
            >
              <p className="text-sm font-medium text-charcoal-700">
                ✨ 100% Customizable
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-charcoal-300 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-charcoal-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
