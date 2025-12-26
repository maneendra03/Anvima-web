'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingBag className="w-20 h-20 text-cream-400 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-charcoal-500 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
              >
                Continue Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-serif font-bold text-charcoal-700 mb-8">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-700 mb-1">
                        {item.name}
                      </h3>

                      {/* Customization details */}
                      {item.customization && (
                        <div className="text-sm text-charcoal-500 space-y-1 mb-3">
                          {item.customization.size && (
                            <p>Size: {item.customization.size}</p>
                          )}
                          {item.customization.color && (
                            <p>Color: {item.customization.color}</p>
                          )}
                          {item.customization.text && (
                            <p>Text: "{item.customization.text}"</p>
                          )}
                          {item.customization.engraving && (
                            <p>Engraving: Yes</p>
                          )}
                          {item.customization.imageUrl && (
                            <p className="text-charcoal-700">📷 Custom photo uploaded</p>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-cream-200 rounded-full">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-cream-50 rounded-l-full"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-cream-50 rounded-r-full"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-charcoal-700">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-charcoal-500">
                          ₹{item.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-600 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold text-charcoal-700 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-charcoal-600">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-charcoal-600">
                    <span>Shipping</span>
                    <span className="text-charcoal-700">Free</span>
                  </div>
                  <div className="border-t border-cream-200 pt-4 flex justify-between text-lg font-bold text-charcoal-700">
                    <span>Total</span>
                    <span>₹{getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      className="flex-1 px-4 py-2 border border-cream-200 rounded-lg focus:border-charcoal-500 outline-none"
                    />
                    <button className="px-4 py-2 bg-cream-100 rounded-lg font-medium hover:bg-cream-200 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                <Link href="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <Link href="/shop">
                  <button className="w-full mt-3 text-charcoal-700 font-medium hover:underline">
                    ← Continue Shopping
                  </button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-cream-200">
                  <div className="flex items-center gap-2 text-sm text-charcoal-500">
                    <span className="w-2 h-2 bg-charcoal-700 rounded-full" />
                    Secure checkout with SSL encryption
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal-500 mt-2">
                    <span className="w-2 h-2 bg-charcoal-700 rounded-full" />
                    Free shipping on all orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
