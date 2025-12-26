'use client'

import { motion } from 'framer-motion'
import { Heart, Leaf, Award, Users, Instagram } from 'lucide-react'
import Link from 'next/link'

const values = [
  {
    icon: Heart,
    title: 'Crafted with Love',
    description:
      'Every product we create is made with genuine care and attention to detail.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Materials',
    description:
      'We prioritize eco-friendly materials and packaging whenever possible.',
  },
  {
    icon: Award,
    title: 'Quality First',
    description:
      'We never compromise on quality — your gift should be as special as the person receiving it.',
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description:
      'Your vision drives our creations. We listen, understand, and deliver.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-peach-50 to-cream-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal-700 mb-6">
              Our Story
            </h1>
            <p className="text-lg text-charcoal-500">
              At Anvima, we believe that the best gifts are the ones that carry a piece of your heart.
              That's why we create personalized gifts that help you express what words sometimes can't.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="rounded-2xl shadow-lg bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100 h-[450px] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto bg-white/40 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">🎁</span>
                    </div>
                    <p className="text-charcoal-600 font-serif text-xl">Crafting Memories</p>
                    <p className="text-charcoal-500 text-sm mt-2">Since 2020</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-peach-100 rounded-2xl p-6 shadow-lg">
                  <p className="text-2xl font-serif font-bold text-forest-600">500+</p>
                  <p className="text-charcoal-600">Happy Customers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif font-bold text-charcoal-700 mb-6">
                How It All Began
              </h2>
              <div className="space-y-4 text-charcoal-600">
                <p>
                  Anvima was born from a simple belief: that personalized gifts create the most
                  meaningful connections. What started as handmade gifts for friends and family
                  has grown into a passionate endeavor to help others create lasting memories.
                </p>
                <p>
                  Our journey began with crafting custom frames and photo gifts, carefully
                  selecting each material and paying attention to every detail. Today, we've
                  expanded to offer a wide range of customizable products — from polaroid prints
                  to curated hampers — each designed to bring joy to both the giver and receiver.
                </p>
                <p>
                  Every order we receive is a new story waiting to be told. We take pride in
                  being a small part of your special moments — birthdays, anniversaries, weddings,
                  or just because. Your trust inspires us to keep creating, one gift at a time.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Note */}
      <section className="py-20 gradient-peach">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-peach-200 to-blush-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-serif font-bold text-charcoal-700">A</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-charcoal-700 mb-6">
              A Note from the Founder
            </h2>
            <blockquote className="text-lg text-charcoal-600 italic leading-relaxed">
              "I started Anvima because I experienced firsthand the joy of giving a truly
              thoughtful, personalized gift. Seeing someone's eyes light up when they realize
              you put thought and effort into their present — that's priceless. My mission is
              to help you create that magic for your loved ones. Every product we craft carries
              our commitment to quality and a piece of our heart. Thank you for being part of
              the Anvima family."
            </blockquote>
            <p className="mt-6 font-semibold text-charcoal-700">— Founder, Anvima Creations</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-bold text-charcoal-700 mb-4">
              What We Stand For
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Our values guide everything we do — from material selection to the final delivery.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-peach-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-peach-600" />
                </div>
                <h3 className="font-semibold text-charcoal-700 mb-2">{value.title}</h3>
                <p className="text-charcoal-500 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials & Sustainability */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <h2 className="text-3xl font-serif font-bold text-charcoal-700 mb-6">
                Materials & Sustainability
              </h2>
              <div className="space-y-4 text-charcoal-600">
                <p>
                  We're committed to using materials that are not only high-quality but also
                  environmentally conscious. From sustainably sourced wood for our frames to
                  recycled paper for packaging, we make thoughtful choices at every step.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-forest-500 flex-shrink-0 mt-1" />
                    <span>FSC-certified wood for frames and boxes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-forest-500 flex-shrink-0 mt-1" />
                    <span>Recycled and recyclable packaging materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-forest-500 flex-shrink-0 mt-1" />
                    <span>Water-based, non-toxic inks for printing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-forest-500 flex-shrink-0 mt-1" />
                    <span>Minimal plastic use in all our products</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-2xl shadow-lg aspect-[6/5] flex items-center justify-center">
                <div className="text-center p-8">
                  <Leaf className="w-20 h-20 mx-auto text-forest-500 mb-4" />
                  <p className="text-forest-700 font-serif text-xl">Eco-Friendly Crafting</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-forest-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-serif font-bold mb-4">
              Let's Create Something Beautiful Together
            </h2>
            <p className="text-cream-200 mb-8 max-w-xl mx-auto">
              Have a question or want to discuss a custom order? We'd love to hear from you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-peach"
                >
                  Get in Touch
                </motion.button>
              </Link>
              <a
                href="https://instagram.com/anvima.creations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-forest-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                Follow @anvima.creations
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
