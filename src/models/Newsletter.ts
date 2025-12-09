import mongoose, { Schema, Document, Model } from 'mongoose'

export interface INewsletter extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  name?: string
  isSubscribed: boolean
  subscribedAt: Date
  unsubscribedAt?: Date
  source: 'website' | 'checkout' | 'popup'
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: String,
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
    source: {
      type: String,
      enum: ['website', 'checkout', 'popup'],
      default: 'website',
    },
  },
  {
    timestamps: true,
  }
)

const Newsletter: Model<INewsletter> =
  mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema)

export default Newsletter
