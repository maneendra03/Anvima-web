'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Gift, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        setEmail('')
        toast.success(data.message || 'Subscribed successfully!')
        setTimeout(() => setIsSubmitted(false), 5000)
      } else {
        toast.error(data.message || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 gradient-peach relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20">
        <Gift className="w-24 h-24 text-peach-400" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20">
        <Sparkles className="w-20 h-20 text-blush-400" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal-700 mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-charcoal-500 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive offers, gift ideas, and early access to new collections
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 rounded-full border border-cream-300 bg-white focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all outline-none"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </motion.button>
          </form>

          {isSubmitted && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-forest-500 font-medium"
            >
              🎉 Thank you for subscribing! Check your inbox for your discount code.
            </motion.p>
          )}

          <p className="mt-4 text-sm text-charcoal-400">
            By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
