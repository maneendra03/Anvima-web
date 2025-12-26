import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface ICartItem {
  _id?: mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  slug: string
  name: string
  price: number
  quantity: number
  image: string
  customization?: {
    text?: string
    imageUrl?: string
    size?: string
    color?: string
    engraving?: string
  }
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  phone?: string
  role: 'user' | 'admin'
  avatar?: string
  isVerified: boolean
  verificationToken?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  addresses: {
    _id: mongoose.Types.ObjectId
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
    location?: {
      lat: number
      lng: number
    }
  }[]
  wishlist: mongoose.Types.ObjectId[]
  cart: ICartItem[]
  notificationPreferences?: {
    orderUpdates: boolean
    promotions: boolean
    newsletter: boolean
    sms: boolean
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
})

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, required: true },
  customization: {
    text: { type: String },
    imageUrl: { type: String },
    size: { type: String },
    color: { type: String },
    engraving: { type: String },
  },
}, { _id: true })

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    addresses: [AddressSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    cart: [CartItemSchema],
    notificationPreferences: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return
  }
  
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
