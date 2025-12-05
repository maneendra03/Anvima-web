'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, ShoppingBag } from 'lucide-react'
import { products } from '@/data'

export default function Bestsellers() {
  const bestsellers = products.filter((p) => p.bestSeller || p.featured).slice(0, 4)

  return (
    <section className="py-20 gradient-peach">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-700 mb-2">
              Bestsellers
            </h2>
            <p className="text-charcoal-500">
              Our most loved customized gifts
            </p>
          </div>
          <Link
            href="/shop"
            className="text-forest-500 font-medium hover:text-forest-600 transition-colors"
          >
            View All Products →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/product/${product.slug}`}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-cream-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.bestSeller && (
                        <span className="badge badge-peach">Bestseller</span>
                      )}
                      {product.newArrival && (
                        <span className="badge badge-forest">New</span>
                      )}
                      {product.originalPrice && (
                        <span className="badge bg-red-100 text-red-600">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Quick add button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute bottom-3 right-3 p-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ShoppingBag className="w-5 h-5 text-forest-500" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-peach-500 font-medium mb-1 capitalize">
                      {product.category.replace('-', ' ')}
                    </p>
                    <h3 className="font-semibold text-charcoal-700 mb-2 group-hover:text-forest-500 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-charcoal-600">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-charcoal-700">
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
