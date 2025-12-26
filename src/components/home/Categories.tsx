'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { categories } from '@/data'

export default function Categories() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-charcoal-400 mb-4">
            Browse by category
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900 mb-4">
            Our Collections
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Find the perfect personalized gift for every occasion
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/shop?category=${category.slug}`}>
                <div className={`group relative overflow-hidden aspect-[4/5] ${
                  index === 0 ? 'bg-gradient-to-br from-peach-100 to-peach-300' :
                  index === 1 ? 'bg-gradient-to-br from-amber-100 to-amber-300' :
                  index === 2 ? 'bg-gradient-to-br from-rose-100 to-rose-300' :
                  index === 3 ? 'bg-gradient-to-br from-violet-100 to-violet-300' :
                  'bg-gradient-to-br from-teal-100 to-teal-300'
                }`}>
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                    <span className="text-6xl md:text-7xl opacity-60">
                      {index === 0 ? '🖼️' : index === 1 ? '☕' : index === 2 ? '🛋️' : index === 3 ? '🔑' : '💡'}
                    </span>
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                    <h3 className="text-white font-medium text-base md:text-lg tracking-wide">
                      {category.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-1 text-white/80 text-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
