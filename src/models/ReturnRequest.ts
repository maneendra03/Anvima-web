import mongoose, { Schema, Document, Model } from 'mongoose'

export type ReturnStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'picked_up'
  | 'received'
  | 'refunded'

export type ReturnReason = 
  | 'damaged'
  | 'wrong_item'
  | 'not_as_described'
  | 'quality_issue'
  | 'changed_mind'
  | 'other'

export interface IReturnRequest extends Document {
  _id: mongoose.Types.ObjectId
  returnNumber: string
  order: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  items: {
    orderItem: mongoose.Types.ObjectId
    quantity: number
    reason: ReturnReason
    description?: string
  }[]
  images?: string[]
  status: ReturnStatus
  refundAmount?: number
  refundMethod?: 'original' | 'store_credit'
  adminNotes?: string
  timeline: {
    status: ReturnStatus
    message: string
    timestamp: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        orderItem: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        reason: {
          type: String,
          enum: ['damaged', 'wrong_item', 'not_as_described', 'quality_issue', 'changed_mind', 'other'],
          required: true,
        },
        description: String,
      },
    ],
    images: [String],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'picked_up', 'received', 'refunded'],
      default: 'pending',
    },
    refundAmount: Number,
    refundMethod: {
      type: String,
      enum: ['original', 'store_credit'],
    },
    adminNotes: String,
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
ReturnRequestSchema.index({ user: 1, createdAt: -1 })
ReturnRequestSchema.index({ order: 1 })
ReturnRequestSchema.index({ status: 1 })

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.ReturnRequest || mongoose.model<IReturnRequest>('ReturnRequest', ReturnRequestSchema)

export default ReturnRequest
