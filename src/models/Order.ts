import mongoose, { Schema, Document, Model } from 'mongoose'

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  variant?: {
    name: string
    option: string
  }
  customization?: {
    text?: string
    images?: string[]
    notes?: string
  }
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  orderNumber: string
  user: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  billingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  subtotal: number
  shippingCost: number
  discount: number
  couponCode?: string
  tax: number
  total: number
  status: OrderStatus
  paymentMethod: 'cod' | 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'stripe' | 'pay_later'
  paymentStatus: PaymentStatus
  paymentDetails?: {
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    transactionId?: string
    paymentId?: string
    method?: string
    paidAt?: Date
  }
  tracking?: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: Date
  }
  notes?: string
  adminNotes?: string
  timeline: {
    status: string
    message: string
    timestamp: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    name: String,
    option: String,
  },
  customization: {
    text: String,
    images: [String],
    notes: String,
  },
})

const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: String,
})

const TimelineSchema = new Schema({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: String,
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'razorpay', 'stripe', 'upi', 'pay_later', 'card', 'netbanking', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      transactionId: String,
      paymentId: String,
      method: String,
      paidAt: Date,
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
    },
    notes: String,
    adminNotes: String,
    timeline: [TimelineSchema],
  },
  {
    timestamps: true,
  }
)

// Generate order number before saving
OrderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.orderNumber = `ANV${year}${month}${random}`
  }
})

// Add to timeline when status changes
OrderSchema.pre('save', function () {
  if (this.isModified('status')) {
    const messages: Record<OrderStatus, string> = {
      pending: 'Order placed successfully',
      confirmed: 'Order has been confirmed',
      processing: 'Order is being prepared',
      shipped: 'Order has been shipped',
      delivered: 'Order delivered successfully',
      cancelled: 'Order has been cancelled',
      refunded: 'Order has been refunded',
    }
    this.timeline.push({
      status: this.status,
      message: messages[this.status],
      timestamp: new Date(),
    })
  }
})

// Indexes
OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ orderNumber: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default Order
