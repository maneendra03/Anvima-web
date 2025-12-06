'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ThumbsUp, User, MessageSquare, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

interface Review {
  _id: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  title?: string
  comment: string
  helpfulCount: number
  createdAt: string
  isVerifiedPurchase?: boolean
}

interface ProductReviewsProps {
  productId: string
  productSlug: string
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0])
  const { user, isAuthenticated } = useAuthStore()

  // Write review form state
  const [newRating, setNewRating] = useState(5)
  const [newTitle, setNewTitle] = useState('')
  const [newComment, setNewComment] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productSlug}/reviews`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.data.reviews || [])
        setAverageRating(data.data.averageRating || 0)
        setRatingDistribution(data.data.distribution || [0, 0, 0, 0, 0])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please login to write a review')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/products/${productSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: newRating,
          title: newTitle.trim(),
          comment: newComment.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Review submitted successfully!')
        setShowWriteReview(false)
        setNewRating(5)
        setNewTitle('')
        setNewComment('')
        fetchReviews()
      } else {
        toast.error(data.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Submit review error:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/products/${productSlug}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      })
      
      if (response.ok) {
        setReviews(reviews.map(r => 
          r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        ))
      }
    } catch (error) {
      console.error('Helpful error:', error)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const renderStars = (rating: number, interactive = false, size = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
    const displayRating = interactive ? (hoveredStar || newRating) : rating

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setNewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClass} ${
                star <= displayRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              } ${interactive ? 'hover:scale-110 transition-transform' : ''}`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-12 pt-12 border-t border-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            {renderStars(averageRating)}
            <span className="text-lg font-semibold text-charcoal">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowWriteReview(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-full hover:bg-forest/90 transition-colors font-medium"
        >
          <MessageSquare className="h-5 w-5" />
          Write a Review
        </button>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="bg-cream/50 rounded-xl p-6 mb-8">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingDistribution[stars - 1] || 0
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{stars} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-forest/20 border-t-forest"></div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-forest" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">{review.user.name}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, false, 'sm')}
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>

              {review.title && (
                <h4 className="font-semibold text-charcoal mb-2">{review.title}</h4>
              )}
              <p className="text-gray-600 leading-relaxed">{review.comment}</p>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => handleHelpful(review._id)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-forest transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Helpful ({review.helpfulCount})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      )}

      {/* Write Review Modal */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWriteReview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-charcoal">Write a Review</h3>
                <button
                  onClick={() => setShowWriteReview(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Please login to write a review</p>
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white rounded-full hover:bg-forest/90 transition-colors"
                  >
                    Login to Continue
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {renderStars(newRating, true, 'lg')}
                      <span className="text-lg font-medium text-gray-600 ml-2">
                        {newRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Sum up your review in a few words"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What did you like or dislike about this product?"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-forest/20 focus:border-forest resize-none"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowWriteReview(false)}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-forest text-white rounded-full hover:bg-forest/90 transition-colors font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
