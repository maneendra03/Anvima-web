'use client'

import { motion } from 'framer-motion'
import { Upload, Palette, Truck } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Upload & Choose',
    description: 'Select your favorite product and upload your photos or add personalized text',
    color: 'bg-peach-100 text-peach-600',
  },
  {
    icon: Palette,
    title: 'Customize',
    description: 'Preview your design in real-time. Adjust size, color, and finishing touches',
    color: 'bg-blush-100 text-blush-600',
  },
  {
    icon: Truck,
    title: 'Receive & Enjoy',
    description: 'We carefully craft and ship your gift. Delivered to your doorstep with love',
    color: 'bg-forest-500/10 text-forest-600',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-700 mb-4">
            How It Works
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            Creating your perfect personalized gift is easy with our simple 3-step process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line - desktop only */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-peach-200 via-blush-200 to-forest-200" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="text-center relative"
            >
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-2 border-cream-200 rounded-full flex items-center justify-center text-sm font-bold text-charcoal-600 z-10">
                {index + 1}
              </div>

              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-20 h-20 mx-auto rounded-2xl ${step.color} flex items-center justify-center mb-6`}
              >
                <step.icon className="w-10 h-10" />
              </motion.div>

              <h3 className="text-xl font-semibold text-charcoal-700 mb-3">
                {step.title}
              </h3>
              <p className="text-charcoal-500">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
