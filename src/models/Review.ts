import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  product: mongoose.Types.ObjectId
  order?: mongoose.Types.ObjectId
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerifiedPurchase: boolean
  isApproved: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [{ type: String }],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true })
ReviewSchema.index({ product: 1, isApproved: 1 })

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)

export default Review
