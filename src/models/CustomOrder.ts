import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICustomOrder extends Document {
  _id: mongoose.Types.ObjectId
  requestNumber: string
  user?: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  occasion: string
  budget: string
  deadline: Date
  description: string
  images?: string[]
  referenceLinks?: string[]
  status: 'pending' | 'contacted' | 'quoted' | 'accepted' | 'in-progress' | 'completed' | 'cancelled'
  adminNotes?: string
  quotedPrice?: number
  assignedTo?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    occasion: {
      type: String,
      required: [true, 'Occasion is required'],
    },
    budget: {
      type: String,
      required: [true, 'Budget range is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [{ type: String }],
    referenceLinks: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'contacted', 'quoted', 'accepted', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    adminNotes: String,
    quotedPrice: Number,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Generate request number before saving
CustomOrderSchema.pre('save', async function () {
  if (!this.requestNumber) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.requestNumber = `CUS${year}${month}${random}`
  }
})

// Indexes
CustomOrderSchema.index({ status: 1, createdAt: -1 })
CustomOrderSchema.index({ email: 1 })

const CustomOrder: Model<ICustomOrder> =
  mongoose.models.CustomOrder || mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema)

export default CustomOrder
