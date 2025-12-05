'use client'

import { motion } from 'framer-motion'
import { Instagram, ExternalLink } from 'lucide-react'

const instagramPosts = [
  { id: 1, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop' },
  { id: 2, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop' },
  { id: 3, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop' },
  { id: 4, image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=400&fit=crop' },
  { id: 5, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop' },
  { id: 6, image: 'https://images.unsplash.com/photo-1607469256872-48074e807b0f?w=400&h=400&fit=crop' },
]

export default function InstagramFeed() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-forest-500 mb-4">
            <Instagram className="w-6 h-6" />
            <span className="font-medium">@anvima.creations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-700 mb-4">
            Follow Our Journey
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Get inspired by our latest creations and see how customers style their personalized gifts
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/anvima.creations"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-charcoal-800/0 group-hover:bg-charcoal-800/50 transition-colors duration-300 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/anvima.creations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-forest-500 font-medium hover:text-forest-600 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            Follow us on Instagram
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
