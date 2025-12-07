'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Instagram, Clock, Send, MessageCircle, Check } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitted(true)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    setTimeout(() => setIsSubmitted(false), 3000)
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
            <h1 className="text-4xl font-serif font-bold text-charcoal-700 mb-4">
              Get in Touch
            </h1>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Have a question, feedback, or want to discuss a custom order?
              We'd love to hear from you. Reach out and we'll respond as soon as we can!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              <h2 className="text-2xl font-serif font-bold text-charcoal-700 mb-6">
                Send Us a Message
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-charcoal-500">
                    We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Status</option>
                        <option value="custom">Custom Order</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="textarea-field"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-charcoal-700 mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:anvima.creations@gmail.com"
                    className="flex items-center gap-3 text-charcoal-600 hover:text-forest-500 transition-colors"
                  >
                    <div className="w-10 h-10 bg-peach-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-peach-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Email</p>
                      <p className="font-medium">anvima.creations@gmail.com</p>
                    </div>
                  </a>

                  <a
                    href="tel:+916304742807"
                    className="flex items-center gap-3 text-charcoal-600 hover:text-forest-500 transition-colors"
                  >
                    <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-forest-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Phone</p>
                      <p className="font-medium">+91 6304742807</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 text-charcoal-600">
                    <div className="w-10 h-10 bg-blush-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blush-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Location</p>
                      <p className="font-medium">Hyderabad, Telangana, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-[#25D366] rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Prefer WhatsApp?</h3>
                <p className="text-white/80 text-sm mb-4">
                  Get instant replies! Chat with us directly on WhatsApp.
                </p>
                <a
                  href="https://wa.me/916304742807"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-[#25D366] px-4 py-2 rounded-full font-medium hover:bg-white/90 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat Now
                </a>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-forest-500" />
                  <h3 className="font-semibold text-charcoal-700">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm text-charcoal-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">10:00 AM - 7:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">10:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-medium text-charcoal-400">Closed</span>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-charcoal-700 mb-4">Follow Us</h3>
                <a
                  href="https://instagram.com/anvima.creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-charcoal-600 hover:text-forest-500 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">@anvima.creations</p>
                    <p className="text-sm text-charcoal-500">Follow for updates</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
