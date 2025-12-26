'use client'

import { motion } from 'framer-motion'
import { Upload, Palette, Truck } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    number: '01',
    title: 'Choose & Upload',
    description: 'Select your favorite product and upload your photos or add personalized text',
  },
  {
    icon: Palette,
    number: '02',
    title: 'We Customize',
    description: 'Our artisans carefully craft your design with attention to every detail',
  },
  {
    icon: Truck,
    number: '03',
    title: 'Delivered to You',
    description: 'Receive your beautifully packaged gift, ready to create memories',
  },
]

export default function HowItWorks() {
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
            Simple Process
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900 mb-4">
            How It Works
          </h2>
          <p className="text-charcoal-500 max-w-xl mx-auto">
            Creating your perfect personalized gift is easy
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center relative"
            >
              {/* Number */}
              <div className="text-7xl md:text-8xl font-serif text-charcoal-100 mb-4">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 mx-auto border border-charcoal-200 flex items-center justify-center mb-6 -mt-8 bg-white relative z-10">
                <step.icon className="w-6 h-6 text-charcoal-700" />
              </div>

              <h3 className="text-lg font-medium text-charcoal-900 mb-3 tracking-wide">
                {step.title}
              </h3>
              <p className="text-charcoal-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
