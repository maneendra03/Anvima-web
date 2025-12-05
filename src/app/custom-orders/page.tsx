'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Calendar, Send, Sparkles, Check, MessageCircle } from 'lucide-react'

export default function CustomOrdersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: '',
    targetDate: '',
  })
  const [images, setImages] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-4">
            Request Received!
          </h1>
          <p className="text-charcoal-500 mb-2">
            Thank you for your custom order request. Our team will review your requirements and get back to you within 24-48 hours.
          </p>
          <p className="text-charcoal-500 mb-8">
            For urgent queries, feel free to reach out on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/919XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
            <a href="/" className="btn-secondary">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-peach-50 to-cream-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-peach-100 rounded-full text-peach-600 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Bespoke Creations
            </div>
            <h1 className="text-4xl font-serif font-bold text-charcoal-700 mb-4">
              Create Something Unique
            </h1>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Have a special idea in mind? Share your vision with us, and our artisans will bring it to life.
              From one-of-a-kind gifts to bulk orders for events — we do it all!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-6">
                Tell Us About Your Project
              </h2>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Describe Your Idea *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="textarea-field"
                    placeholder="Tell us about your custom gift idea — the occasion, recipient, style preferences, colors, size, quantity, etc."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">
                    Reference Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-cream-300 rounded-xl p-6 text-center hover:border-forest-500 transition-colors">
                    <label className="cursor-pointer">
                      <Upload className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
                      <p className="text-charcoal-600">Click to upload reference images</p>
                      <p className="text-sm text-charcoal-500">PNG, JPG up to 5MB each</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded Images Preview */}
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Reference ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget & Date */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select budget</option>
                      <option value="500-1000">₹500 - ₹1,000</option>
                      <option value="1000-2500">₹1,000 - ₹2,500</option>
                      <option value="2500-5000">₹2,500 - ₹5,000</option>
                      <option value="5000-10000">₹5,000 - ₹10,000</option>
                      <option value="10000+">₹10,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Target Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="targetDate"
                        value={formData.targetDate}
                        onChange={handleInputChange}
                        className="input-field"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Request
                </motion.button>
              </div>
            </motion.form>
          </div>

          {/* Sidebar Info */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm sticky top-24"
            >
              <h3 className="font-semibold text-charcoal-700 mb-4">
                What We Can Create
              </h3>
              <ul className="space-y-3 text-charcoal-600">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                  <span>Custom designed frames & collages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                  <span>Personalized gift hampers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                  <span>Bulk orders for events</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                  <span>Corporate gifting solutions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-forest-500 flex-shrink-0 mt-0.5" />
                  <span>Wedding & event favors</span>
                </li>
              </ul>

              <div className="border-t border-cream-200 mt-6 pt-6">
                <h3 className="font-semibold text-charcoal-700 mb-2">
                  Response Time
                </h3>
                <p className="text-charcoal-600 text-sm">
                  We'll get back to you within 24-48 hours with a quote and timeline.
                </p>
              </div>

              <div className="border-t border-cream-200 mt-6 pt-6">
                <h3 className="font-semibold text-charcoal-700 mb-2">
                  Quick Connect
                </h3>
                <a
                  href="https://wa.me/919XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-forest-500 font-medium hover:text-forest-600"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
