'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ruler, Info, HelpCircle } from 'lucide-react'

interface SizeOption {
  name: string
  dimensions?: string
  description?: string
  price: number
}

interface SizeGuideProps {
  sizes: SizeOption[]
  productType?: 'frame' | 'polaroid' | 'gift' | 'general'
  isOpen: boolean
  onClose: () => void
}

// Size data for different product types
const sizeGuideData = {
  frame: {
    title: 'Frame Size Guide',
    description: 'Choose the perfect frame size for your space',
    tips: [
      'Measure your wall space before selecting a size',
      'Consider the photo size and the border width',
      'Larger frames work well as focal points',
      'Group smaller frames for a gallery wall effect',
    ],
    sizeDetails: {
      'Small': {
        dimensions: '6" x 8" (15 x 20 cm)',
        idealFor: 'Desk, bedside table, small shelves',
        photoSize: 'Up to 4" x 6" photos',
      },
      'Medium': {
        dimensions: '8" x 10" (20 x 25 cm)',
        idealFor: 'Living room, bedroom walls',
        photoSize: 'Up to 6" x 8" photos',
      },
      'Large': {
        dimensions: '11" x 14" (28 x 36 cm)',
        idealFor: 'Statement pieces, entryway',
        photoSize: 'Up to 8" x 10" photos',
      },
      'Extra Large': {
        dimensions: '16" x 20" (41 x 51 cm)',
        idealFor: 'Main wall focal point, gallery wall centerpiece',
        photoSize: 'Up to 11" x 14" photos',
      },
    },
  },
  polaroid: {
    title: 'Polaroid Print Size Guide',
    description: 'Classic Polaroid-style prints for your memories',
    tips: [
      'Classic Polaroid size has a signature white border',
      'Instax Mini is wallet-sized, perfect for carrying',
      'Larger formats are great for display',
    ],
    sizeDetails: {
      'Classic': {
        dimensions: '3.5" x 4.25" (9 x 11 cm)',
        idealFor: 'Authentic Polaroid look, scrapbooks',
        photoSize: '3.1" x 3.1" image area',
      },
      'Instax Mini': {
        dimensions: '2.1" x 3.4" (5.4 x 8.6 cm)',
        idealFor: 'Wallets, mini albums, decoration',
        photoSize: '1.8" x 2.4" image area',
      },
      'Instax Wide': {
        dimensions: '3.4" x 4.25" (8.6 x 10.8 cm)',
        idealFor: 'Landscape photos, group shots',
        photoSize: '2.4" x 3.9" image area',
      },
    },
  },
  gift: {
    title: 'Gift Hamper Size Guide',
    description: 'Find the right hamper size for your occasion',
    tips: [
      'Mini hampers are perfect for small gestures',
      'Regular hampers suit most occasions',
      'Premium hampers make a grand impression',
    ],
    sizeDetails: {
      'Mini': {
        dimensions: 'Box: 8" x 6" x 4"',
        idealFor: 'Thank you gifts, small occasions',
        contents: '3-5 items',
      },
      'Regular': {
        dimensions: 'Box: 12" x 10" x 6"',
        idealFor: 'Birthdays, anniversaries',
        contents: '6-8 items',
      },
      'Premium': {
        dimensions: 'Box: 16" x 12" x 8"',
        idealFor: 'Weddings, corporate gifts, festivals',
        contents: '10-15 items',
      },
    },
  },
  general: {
    title: 'Size Guide',
    description: 'Select the right size for your needs',
    tips: [
      'Refer to specific measurements for accuracy',
      'Consider the intended use and placement',
    ],
    sizeDetails: {},
  },
}

export default function SizeGuide({ sizes, productType = 'general', isOpen, onClose }: SizeGuideProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]?.name || '')
  const guideData = sizeGuideData[productType]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-2xl sm:w-full bg-white rounded-2xl z-50 overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal-100 rounded-full flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-charcoal-900" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-charcoal-700">
                    {guideData.title}
                  </h2>
                  <p className="text-sm text-charcoal-500">{guideData.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cream-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-medium text-charcoal-700 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                        selectedSize === size.name
                          ? 'border-charcoal-900 bg-charcoal-50 text-charcoal-900'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      }`}
                    >
                      {size.name}
                      {size.price > 0 && (
                        <span className="text-sm text-charcoal-500 ml-1">
                          (+₹{size.price})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Details */}
              {selectedSize && guideData.sizeDetails[selectedSize as keyof typeof guideData.sizeDetails] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cream-50 rounded-xl p-6 mb-6"
                >
                  <h4 className="font-semibold text-charcoal-700 text-lg mb-4">
                    {selectedSize} Details
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(
                      guideData.sizeDetails[selectedSize as keyof typeof guideData.sizeDetails] || {}
                    ).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-charcoal-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium text-charcoal-700">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Visual Size Comparison */}
              {productType !== 'general' && (
                <div className="mb-6">
                  <h3 className="font-medium text-charcoal-700 mb-3">Visual Comparison</h3>
                  <div className="bg-cream-50 rounded-xl p-6">
                    <div className="flex items-end justify-center gap-4">
                      {sizes.map((size, index) => {
                        // Calculate visual size (just for illustration)
                        const baseSize = 40
                        const multiplier = 1 + index * 0.4
                        const width = baseSize * multiplier
                        const height = baseSize * multiplier * 1.25

                        return (
                          <div
                            key={size.name}
                            className="flex flex-col items-center"
                          >
                            <motion.div
                              animate={{
                                borderColor: selectedSize === size.name ? '#2D5A47' : '#E5E5E5',
                                backgroundColor: selectedSize === size.name ? '#F0F5F3' : '#FFFFFF',
                              }}
                              className="border-2 rounded-lg flex items-center justify-center text-xs text-charcoal-400"
                              style={{
                                width: `${width}px`,
                                height: `${height}px`,
                              }}
                            >
                              {selectedSize === size.name && (
                                <Info className="w-4 h-4 text-charcoal-900" />
                              )}
                            </motion.div>
                            <span className={`mt-2 text-xs font-medium ${
                              selectedSize === size.name ? 'text-charcoal-900' : 'text-charcoal-500'
                            }`}>
                              {size.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">Helpful Tips</h4>
                    <ul className="space-y-1">
                      {guideData.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-cream-200 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-charcoal-900 text-white rounded-lg font-medium hover:bg-charcoal-800 transition-colors"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper component for triggering the size guide
export function SizeGuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm text-charcoal-900 hover:text-charcoal-800 transition-colors"
    >
      <Ruler className="w-4 h-4" />
      Size Guide
    </button>
  )
}
