'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Truck, RotateCcw, CreditCard, Palette, Shield, FileText } from 'lucide-react'
import { faqItems } from '@/data'

const categories = [
  { id: 'all', name: 'All Questions', icon: FileText },
  { id: 'shipping', name: 'Shipping', icon: Truck },
  { id: 'returns', name: 'Returns', icon: RotateCcw },
  { id: 'payment', name: 'Payment', icon: CreditCard },
  { id: 'customization', name: 'Customization', icon: Palette },
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [openQuestion, setOpenQuestion] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQs = faqItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-peach-50 to-cream-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-serif font-bold text-charcoal-700 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-charcoal-500 mb-8">
              Find answers to common questions about orders, shipping, returns, and more.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-cream-200 bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-forest-500 text-white'
                  : 'bg-white text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-charcoal-700 pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-charcoal-500 flex-shrink-0 transition-transform ${
                    openQuestion === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openQuestion === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-5 pb-5 text-charcoal-600 border-t border-cream-100 pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-charcoal-500">No questions found matching your search.</p>
          </div>
        )}

        {/* Policies Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8" id="policies">
          {/* Shipping Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            id="shipping"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-forest-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-700">Shipping Policy</h2>
            </div>
            <div className="text-charcoal-600 space-y-3 text-sm">
              <p>• Standard delivery: 3-7 business days</p>
              <p>• Custom orders: 7-14 business days</p>
              <p>• Free shipping on all orders above ₹999</p>
              <p>• Currently shipping within India only</p>
              <p>• Tracking details sent via email and SMS</p>
            </div>
          </motion.div>

          {/* Returns Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            id="returns"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-peach-100 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-peach-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-700">Returns & Refunds</h2>
            </div>
            <div className="text-charcoal-600 space-y-3 text-sm">
              <p>• Report damaged items within 48 hours</p>
              <p>• Photo evidence required for damage claims</p>
              <p>• Customized items are non-returnable</p>
              <p>• Refunds processed within 5-7 business days</p>
              <p>• Contact us for any concerns</p>
            </div>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            id="privacy"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blush-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-blush-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-700">Privacy Policy</h2>
            </div>
            <div className="text-charcoal-600 space-y-3 text-sm">
              <p>• Your personal data is protected with SSL encryption</p>
              <p>• We never share your information with third parties</p>
              <p>• Photos uploaded for customization are stored securely</p>
              <p>• You can request deletion of your data anytime</p>
              <p>• We comply with all applicable privacy laws</p>
            </div>
          </motion.div>

          {/* Terms of Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm"
            id="terms"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cream-200 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-charcoal-600" />
              </div>
              <h2 className="text-xl font-semibold text-charcoal-700">Terms of Service</h2>
            </div>
            <div className="text-charcoal-600 space-y-3 text-sm">
              <p>• All products are for personal use only</p>
              <p>• Images must not violate copyright laws</p>
              <p>• Prices are subject to change without notice</p>
              <p>• Custom order quotes are valid for 7 days</p>
              <p>• Full terms available upon request</p>
            </div>
          </motion.div>
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-forest-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-2xl font-serif font-bold mb-4">Still Have Questions?</h2>
          <p className="text-cream-200 mb-6">
            Can't find what you're looking for? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-white text-forest-600 rounded-full font-medium hover:bg-cream-50 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/919XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-white rounded-full font-medium hover:bg-white hover:text-forest-600 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
