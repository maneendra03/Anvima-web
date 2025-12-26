'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { products } from '@/data'

export default function Bestsellers() {
  const bestsellers = products.filter((p) => p.bestSeller || p.featured).slice(0, 4)

  return (
    <section className="py-16 md:py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12 md:mb-16"
        >
          <div>
            <p className="text-sm tracking-[0.2em] uppercase text-charcoal-400 mb-3">
              Customer Favorites
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900">
              Bestsellers
            </h2>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-sm uppercase tracking-wider text-charcoal-700 hover:text-forest-600 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bestsellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/product/${product.slug}`}>
                <div className="group product-card">
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    {(product.bestSeller || product.newArrival || product.originalPrice) && (
                      <div className="absolute top-3 left-3">
                        {product.bestSeller && (
                          <span className="inline-block px-3 py-1 bg-charcoal-900 text-white text-xs uppercase tracking-wider">
                            Bestseller
                          </span>
                        )}
                        {product.newArrival && !product.bestSeller && (
                          <span className="inline-block px-3 py-1 bg-forest-600 text-white text-xs uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quick view on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button className="w-full py-3 bg-white text-charcoal-900 text-sm uppercase tracking-wider hover:bg-charcoal-900 hover:text-white transition-colors">
                        Quick View
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider text-charcoal-400 mb-2">
                      {product.category.replace('-', ' ')}
                    </p>
                    <h3 className="font-medium text-charcoal-900 mb-2 group-hover:text-forest-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? 'fill-charcoal-900 text-charcoal-900'
                                : 'fill-charcoal-200 text-charcoal-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-charcoal-400 ml-1">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-charcoal-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-charcoal-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
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
