'use client'

import Link from 'next/link'
import { Palette, Gift } from 'lucide-react'

export default function PromoBanner() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Promo 1 - Custom Orders */}
          <Link href="/custom-orders" className="group relative overflow-hidden">
            <div className="relative aspect-[16/9] md:aspect-[4/3] bg-gradient-to-br from-rose-200 via-pink-100 to-amber-100">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-8 left-8 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="mb-4 p-4 bg-white/40 backdrop-blur-sm rounded-full">
                  <Palette className="w-8 h-8 md:w-10 md:h-10 text-charcoal-700" strokeWidth={1.5} />
                </div>
                <p className="text-xs tracking-[0.2em] uppercase mb-2 text-charcoal-600">Made Just For You</p>
                <h3 className="text-2xl md:text-3xl font-serif mb-4 text-charcoal-900">Custom Orders</h3>
                <span className="px-6 py-2 bg-charcoal-900 text-white text-xs uppercase tracking-wider group-hover:bg-charcoal-800 transition-colors">
                  Create Yours
                </span>
              </div>
            </div>
          </Link>

          {/* Promo 2 - Gift Hampers */}
          <Link href="/shop?category=hampers" className="group relative overflow-hidden">
            <div className="relative aspect-[16/9] md:aspect-[4/3] bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100">
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-8 left-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute bottom-8 right-8 w-40 h-40 rounded-full bg-white/30 blur-3xl" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="mb-4 p-4 bg-white/40 backdrop-blur-sm rounded-full">
                  <Gift className="w-8 h-8 md:w-10 md:h-10 text-charcoal-700" strokeWidth={1.5} />
                </div>
                <p className="text-xs tracking-[0.2em] uppercase mb-2 text-charcoal-600">Perfect for Every Occasion</p>
                <h3 className="text-2xl md:text-3xl font-serif mb-4 text-charcoal-900">Gift Hampers</h3>
                <span className="px-6 py-2 bg-charcoal-900 text-white text-xs uppercase tracking-wider group-hover:bg-charcoal-800 transition-colors">
                  Shop Now
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
