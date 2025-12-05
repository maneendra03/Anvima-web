import mongoose from 'mongoose'

export interface ISettings {
  _id?: string
  
  // Store Information
  store: {
    storeName: string
    tagline: string
    email: string
    phone: string
    address: string
    currency: string
    timezone: string
    logo?: string
    favicon?: string
  }
  
  // Contact & Social
  contact: {
    whatsapp: string
    instagram: string
    facebook: string
    twitter: string
    youtube: string
  }
  
  // Payment Settings
  payment: {
    razorpayEnabled: boolean
    razorpayKeyId: string
    razorpayKeySecret: string
    codEnabled: boolean
    codMinOrder: number
    codMaxOrder: number
  }
  
  // Shipping Settings
  shipping: {
    freeShippingEnabled: boolean
    freeShippingThreshold: number
    flatRateEnabled: boolean
    flatRateAmount: number
    localPickupEnabled: boolean
    estimatedDelivery: string
  }
  
  // Email Settings
  email: {
    smtpHost: string
    smtpPort: string
    smtpUser: string
    smtpPassword: string
    fromName: string
    fromEmail: string
  }
  
  // Notification Settings
  notifications: {
    orderConfirmation: boolean
    orderShipped: boolean
    orderDelivered: boolean
    newOrderAdmin: boolean
    lowStockAlert: boolean
    lowStockThreshold: number
  }
  
  updatedAt?: Date
  createdAt?: Date
}

const SettingsSchema = new mongoose.Schema<ISettings>({
  store: {
    storeName: { type: String, default: 'Anvima Creations' },
    tagline: { type: String, default: 'Customized Gifts & Creations' },
    email: { type: String, default: 'anvimacreations@gmail.com' },
    phone: { type: String, default: '+91 9876543210' },
    address: { type: String, default: 'Hyderabad, Telangana, India' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    logo: { type: String, default: '' },
    favicon: { type: String, default: '' }
  },
  
  contact: {
    whatsapp: { type: String, default: '+919876543210' },
    instagram: { type: String, default: 'anvimacreations' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  
  payment: {
    razorpayEnabled: { type: Boolean, default: true },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    codEnabled: { type: Boolean, default: true },
    codMinOrder: { type: Number, default: 500 },
    codMaxOrder: { type: Number, default: 10000 }
  },
  
  shipping: {
    freeShippingEnabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, default: 999 },
    flatRateEnabled: { type: Boolean, default: true },
    flatRateAmount: { type: Number, default: 50 },
    localPickupEnabled: { type: Boolean, default: false },
    estimatedDelivery: { type: String, default: '5-7 business days' }
  },
  
  email: {
    smtpHost: { type: String, default: 'smtp.gmail.com' },
    smtpPort: { type: String, default: '587' },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
    fromName: { type: String, default: 'Anvima Creations' },
    fromEmail: { type: String, default: 'noreply@anvima.com' }
  },
  
  notifications: {
    orderConfirmation: { type: Boolean, default: true },
    orderShipped: { type: Boolean, default: true },
    orderDelivered: { type: Boolean, default: true },
    newOrderAdmin: { type: Boolean, default: true },
    lowStockAlert: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 10 }
  }
}, {
  timestamps: true
})

// Ensure only one settings document exists (singleton pattern)
SettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({})
  }
  return settings
}

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema)
