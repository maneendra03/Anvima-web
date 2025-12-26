'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[100svh] flex items-center bg-cream-100 overflow-hidden pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <p className="text-sm tracking-[0.2em] uppercase text-charcoal-500 mb-4 md:mb-6">
              Handcrafted Personalized Gifts
            </p>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-charcoal-900 leading-[1.1] mb-6 md:mb-8">
              Create Memories
              <br />
              <span className="italic">That Last Forever</span>
            </h1>

            <p className="text-base md:text-lg text-charcoal-500 mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Transform your precious moments into beautiful customized gifts.
              Every piece crafted with love, just for you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop">
                <button className="btn-primary w-full sm:w-auto">
                  Shop Collection
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
              <Link href="/custom-orders">
                <button className="btn-secondary w-full sm:w-auto">
                  Custom Orders
                </button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-8 justify-center lg:justify-start text-sm text-charcoal-500">
              <div className="flex items-center gap-2">
                <span className="text-2xl">500+</span>
                <span className="text-xs uppercase tracking-wide">Happy<br/>Customers</span>
              </div>
              <div className="w-px h-8 bg-charcoal-200" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">4.9</span>
                <span className="text-xs uppercase tracking-wide">Star<br/>Rating</span>
              </div>
              <div className="w-px h-8 bg-charcoal-200 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-2xl">100%</span>
                <span className="text-xs uppercase tracking-wide">Custom<br/>Made</span>
              </div>
            </div>
          </div>

          {/* Image - Clean & Professional */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/5] max-w-md mx-auto lg:max-w-none bg-gradient-to-br from-peach-200 via-cream-100 to-blush-200 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
                <p className="text-charcoal-700 font-serif text-xl">Handcrafted with Love</p>
              </div>
              {/* Overlay text on image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-4 md:p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-charcoal-500 mb-1">Featured</p>
                <p className="font-serif text-lg md:text-xl text-charcoal-900">Personalized Photo Frames</p>
                <p className="text-sm text-charcoal-500 mt-1">Starting from ₹499</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
