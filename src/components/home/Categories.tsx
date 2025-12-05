'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { categories } from '@/data'

export default function Categories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-700 mb-4">
            Explore Our Collections
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            From personalized frames to curated hampers, find the perfect gift for every occasion
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
                <div className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-cream-100">
                  {/* Image placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-b from-peach-100 to-cream-200">
                    <img
                      src={`https://images.unsplash.com/photo-${
                        index === 0 ? '1513519245088-0e12902e5a38' :
                        index === 1 ? '1526170375885-4d8ecf77b99f' :
                        index === 2 ? '1549465220-1a8b9238cd48' :
                        index === 3 ? '1518199266791-5375a83190b7' :
                        '1514228742587-6b1558fcca3d'
                      }?w=300&h=400&fit=crop`}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-800/80 via-charcoal-800/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {category.name}
                    </h3>
                    <p className="text-cream-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                      Explore <ArrowRight className="w-4 h-4" />
                    </p>
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
