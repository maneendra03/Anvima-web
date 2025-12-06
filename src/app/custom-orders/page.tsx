'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Calendar, Send, Sparkles, Check, MessageCircle, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadedImage {
  url: string
  publicId: string
  isUploading?: boolean
  previewUrl?: string
}

export default function CustomOrdersPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    description: '',
    budget: '',
    targetDate: '',
  })
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Limit to 5 images
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    for (const file of Array.from(files)) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size: 10MB`)
        continue
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      const tempId = `temp-${Date.now()}-${Math.random()}`
      
      // Add placeholder with loading state
      setImages(prev => [...prev, { 
        url: '', 
        publicId: tempId, 
        isUploading: true, 
        previewUrl 
      }])

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload/custom-order', {
          method: 'POST',
          body: formData
        })

        const data = await res.json()
        
        if (data.success) {
          // Replace temp with actual uploaded data
          setImages(prev => prev.map(img => 
            img.publicId === tempId 
              ? { url: data.url, publicId: data.publicId, isUploading: false }
              : img
          ))
          toast.success('Image uploaded!')
        } else {
          // Remove failed upload
          setImages(prev => prev.filter(img => img.publicId !== tempId))
          toast.error(data.error || 'Upload failed')
        }
      } catch (error) {
        setImages(prev => prev.filter(img => img.publicId !== tempId))
        toast.error('Failed to upload image')
      }
    }
    
    // Reset input
    e.target.value = ''
  }

  const removeImage = async (index: number) => {
    const image = images[index]
    
    // Remove from UI immediately
    setImages(prev => prev.filter((_, i) => i !== index))
    
    // If it was uploaded to Cloudinary, delete it
    if (image.publicId && !image.publicId.startsWith('temp-')) {
      try {
        await fetch('/api/upload/custom-order', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: image.publicId })
        })
      } catch (error) {
        console.error('Failed to delete image from cloud')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.name || !formData.email || !formData.phone || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if any images are still uploading
    if (images.some(img => img.isUploading)) {
      toast.error('Please wait for images to finish uploading')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.map(img => ({ url: img.url, publicId: img.publicId }))
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setIsSubmitted(true)
        toast.success('Request submitted successfully!')
      } else {
        toast.error(data.error || 'Failed to submit request')
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                        <div key={img.publicId} className="relative group">
                          {img.isUploading ? (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-forest-500 animate-spin" />
                            </div>
                          ) : (
                            <img
                              src={img.previewUrl || img.url}
                              alt={`Reference ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={img.isUploading}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600 disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-charcoal-400 mt-2">
                    {images.length}/5 images uploaded
                  </p>
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
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
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
