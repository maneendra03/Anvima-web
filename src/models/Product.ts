import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProductVariant {
  name: string
  options: string[]
  prices?: { option: string; price: number }[]
}

export interface IProductImage {
  url: string
  alt?: string
  isPrimary: boolean
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  comparePrice?: number
  costPrice?: number
  sku?: string
  barcode?: string
  images: IProductImage[]
  category: mongoose.Types.ObjectId
  tags: string[]
  variants: IProductVariant[]
  customizable: boolean
  customizationOptions?: {
    allowText: boolean
    maxTextLength?: number
    allowImage: boolean
    maxImages?: number
    instructions?: string
  }
  stock: number
  lowStockThreshold: number
  trackInventory: boolean
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  shippingClass?: string
  isFeatured: boolean
  isActive: boolean
  ratings: {
    average: number
    count: number
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: Date
  updatedAt: Date
}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String },
  isPrimary: { type: Boolean, default: false },
})

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  options: [{ type: String }],
  prices: [{
    option: String,
    price: Number,
  }],
})

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    barcode: {
      type: String,
    },
    images: [ProductImageSchema],
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    tags: [{ type: String }],
    variants: [ProductVariantSchema],
    customizable: {
      type: Boolean,
      default: false,
    },
    customizationOptions: {
      allowText: { type: Boolean, default: false },
      maxTextLength: { type: Number, default: 100 },
      allowImage: { type: Boolean, default: false },
      maxImages: { type: Number, default: 1 },
      instructions: { type: String },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative'],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'fragile', 'heavy'],
      default: 'standard',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
  }
)

// Create slug from name before saving
ProductSchema.pre('save', function () {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

// Index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ isFeatured: 1, isActive: 1 })

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
