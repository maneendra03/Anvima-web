'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { testimonials } from '@/data'

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-16 md:py-24 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-charcoal-400 mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900 mb-4">
            What Our Customers Say
          </h2>
        </motion.div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 relative"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-charcoal-900 text-charcoal-900" />
                ))}
              </div>

              <p className="text-charcoal-600 mb-8 leading-relaxed text-sm">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal-100 flex items-center justify-center text-charcoal-700 font-medium text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-charcoal-900 text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>

              {testimonial.productBought && (
                <p className="mt-6 text-xs text-charcoal-400 uppercase tracking-wider">
                  Purchased: {testimonial.productBought}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white p-6"
            >
              <div className="flex gap-0.5 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-charcoal-900 text-charcoal-900" />
                ))}
              </div>

              <p className="text-charcoal-600 mb-6 leading-relaxed text-sm">
                &ldquo;{testimonials[currentIndex].text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal-100 flex items-center justify-center text-charcoal-700 font-medium text-sm">
                  {testimonials[currentIndex].name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-charcoal-900 text-sm">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-xs text-charcoal-400">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="p-2 border border-charcoal-200 hover:border-charcoal-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-charcoal-600" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 transition-colors ${
                    index === currentIndex ? 'bg-charcoal-900' : 'bg-charcoal-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 border border-charcoal-200 hover:border-charcoal-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-charcoal-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
