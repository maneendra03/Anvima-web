import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anvima'

// Models (simplified for seeding)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, default: 'customer' },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addresses: [{
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }]
}, { timestamps: true })

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  shortDescription: String,
  price: Number,
  comparePrice: Number,
  sku: String,
  stock: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isCustomizable: { type: Boolean, default: true },
  customizationOptions: {
    allowText: Boolean,
    maxTextLength: Number,
    allowImage: Boolean,
    maxImages: Number
  },
  variants: [{
    name: String,
    options: [{
      value: String,
      priceModifier: Number
    }]
  }]
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

// Seed data
const categories = [
  {
    name: 'Photo Frames',
    slug: 'photo-frames',
    description: 'Beautiful customized photo frames for every occasion',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400',
    order: 1
  },
  {
    name: 'Mugs & Cups',
    slug: 'mugs-cups',
    description: 'Personalized mugs and cups for your daily coffee',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    order: 2
  },
  {
    name: 'Cushions & Pillows',
    slug: 'cushions-pillows',
    description: 'Custom cushions and pillows for home decor',
    image: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=400',
    order: 3
  },
  {
    name: 'Keychains',
    slug: 'keychains',
    description: 'Personalized keychains that make perfect gifts',
    image: 'https://images.unsplash.com/photo-1585634917202-6f044d8c9a87?w=400',
    order: 4
  },
  {
    name: 'Lamps & Lights',
    slug: 'lamps-lights',
    description: 'Custom photo lamps and night lights',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    order: 5
  },
  {
    name: 'Gifts for Him',
    slug: 'gifts-for-him',
    description: 'Special customized gifts for men',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
    order: 6
  },
  {
    name: 'Gifts for Her',
    slug: 'gifts-for-her',
    description: 'Beautiful personalized gifts for women',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400',
    order: 7
  },
  {
    name: 'Anniversary Gifts',
    slug: 'anniversary-gifts',
    description: 'Make anniversaries special with custom gifts',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
    order: 8
  }
]

const products = [
  {
    name: 'Personalized Wooden Photo Frame',
    slug: 'personalized-wooden-photo-frame',
    description: 'A beautiful handcrafted wooden photo frame that can be personalized with your favorite photos and custom text. Perfect for gifting on birthdays, anniversaries, or any special occasion.',
    shortDescription: 'Handcrafted wooden frame with custom engraving',
    price: 599,
    comparePrice: 799,
    sku: 'PF-001',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600',
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600'
    ],
    categorySlug: 'photo-frames',
    tags: ['photo frame', 'wooden', 'personalized', 'gift'],
    isFeatured: true,
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 50,
      allowImage: true,
      maxImages: 1
    }
  },
  {
    name: 'Magic Photo Mug',
    slug: 'magic-photo-mug',
    description: 'A magical color-changing mug that reveals your photo when hot liquid is poured in. The perfect surprise gift!',
    shortDescription: 'Color-changing mug with your photo',
    price: 349,
    comparePrice: 449,
    sku: 'MG-001',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
      'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600'
    ],
    categorySlug: 'mugs-cups',
    tags: ['mug', 'magic', 'color changing', 'gift'],
    isFeatured: true,
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 30,
      allowImage: true,
      maxImages: 1
    }
  },
  {
    name: 'Custom Photo Cushion',
    slug: 'custom-photo-cushion',
    description: 'Soft and comfortable cushion printed with your favorite photo. Available in multiple sizes and shapes.',
    shortDescription: 'Soft cushion with custom photo print',
    price: 499,
    comparePrice: 699,
    sku: 'CU-001',
    stock: 75,
    images: [
      'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=600'
    ],
    categorySlug: 'cushions-pillows',
    tags: ['cushion', 'pillow', 'photo', 'home decor'],
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 25,
      allowImage: true,
      maxImages: 1
    },
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'Small (12x12)', priceModifier: 0 },
          { value: 'Medium (16x16)', priceModifier: 100 },
          { value: 'Large (20x20)', priceModifier: 200 }
        ]
      }
    ]
  },
  {
    name: '3D Moon Lamp with Photo',
    slug: '3d-moon-lamp-photo',
    description: 'A stunning 3D printed moon lamp with your photo printed on it. Features touch control and multiple brightness levels.',
    shortDescription: '3D moon lamp with custom photo',
    price: 899,
    comparePrice: 1199,
    sku: 'LM-001',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'
    ],
    categorySlug: 'lamps-lights',
    tags: ['lamp', 'moon', '3D', 'night light', 'photo'],
    isFeatured: true,
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: false,
      allowImage: true,
      maxImages: 1
    }
  },
  {
    name: 'Photo Crystal Keychain',
    slug: 'photo-crystal-keychain',
    description: 'A premium crystal keychain with your photo laser engraved inside. The LED light makes it glow beautifully.',
    shortDescription: 'Crystal keychain with laser engraved photo',
    price: 299,
    comparePrice: 399,
    sku: 'KC-001',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1585634917202-6f044d8c9a87?w=600'
    ],
    categorySlug: 'keychains',
    tags: ['keychain', 'crystal', 'LED', 'photo'],
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 20,
      allowImage: true,
      maxImages: 1
    }
  },
  {
    name: 'Personalized Wallet for Men',
    slug: 'personalized-wallet-men',
    description: 'Premium leather wallet with custom engraving. Perfect gift for fathers, husbands, or boyfriends.',
    shortDescription: 'Leather wallet with custom engraving',
    price: 799,
    comparePrice: 999,
    sku: 'GH-001',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600'
    ],
    categorySlug: 'gifts-for-him',
    tags: ['wallet', 'leather', 'men', 'personalized'],
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 30,
      allowImage: false
    }
  },
  {
    name: 'Custom Name Necklace',
    slug: 'custom-name-necklace',
    description: 'Elegant gold-plated necklace with custom name. A timeless piece that makes a perfect gift.',
    shortDescription: 'Gold-plated necklace with custom name',
    price: 649,
    comparePrice: 849,
    sku: 'GW-001',
    stock: 60,
    images: [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600'
    ],
    categorySlug: 'gifts-for-her',
    tags: ['necklace', 'jewelry', 'women', 'name', 'gold'],
    isFeatured: true,
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 15,
      allowImage: false
    }
  },
  {
    name: 'Anniversary Photo Collage Frame',
    slug: 'anniversary-photo-collage-frame',
    description: 'A beautiful collage frame featuring multiple photos. Perfect for celebrating years of love and memories.',
    shortDescription: 'Multi-photo collage frame for couples',
    price: 1299,
    comparePrice: 1599,
    sku: 'AN-001',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600'
    ],
    categorySlug: 'anniversary-gifts',
    tags: ['anniversary', 'collage', 'frame', 'couple', 'love'],
    isFeatured: true,
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 50,
      allowImage: true,
      maxImages: 5
    }
  },
  {
    name: 'Rotating Photo Cube',
    slug: 'rotating-photo-cube',
    description: 'An innovative rotating cube that displays 6 different photos. A unique way to showcase your memories.',
    shortDescription: '6-sided rotating photo cube',
    price: 449,
    comparePrice: 599,
    sku: 'PF-002',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600'
    ],
    categorySlug: 'photo-frames',
    tags: ['cube', 'rotating', 'photo', '3D'],
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: false,
      allowImage: true,
      maxImages: 6
    }
  },
  {
    name: 'Couple Mugs Set',
    slug: 'couple-mugs-set',
    description: 'A set of two matching mugs with custom photos or text. Perfect for couples!',
    shortDescription: 'Set of 2 matching custom mugs',
    price: 599,
    comparePrice: 799,
    sku: 'MG-002',
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600'
    ],
    categorySlug: 'mugs-cups',
    tags: ['mug', 'couple', 'set', 'matching'],
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 25,
      allowImage: true,
      maxImages: 2
    }
  }
]

async function seed() {
  try {
    console.log('🌱 Starting database seed...')
    
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12)
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@anvima.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      isVerified: true,
      isActive: true
    })
    console.log('👤 Created admin user:', admin.email)

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 12)
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: customerPassword,
      phone: '8888888888',
      role: 'customer',
      isVerified: true,
      isActive: true,
      addresses: [{
        name: 'Test Customer',
        phone: '8888888888',
        address: '123 Main Street, Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
      }]
    })
    console.log('👤 Created test customer:', customer.email)

    // Create categories
    const createdCategories = await Category.insertMany(categories)
    console.log(`📁 Created ${createdCategories.length} categories`)

    // Create category map for products
    const categoryMap = new Map()
    createdCategories.forEach(cat => {
      categoryMap.set(cat.slug, cat._id)
    })

    // Create products with category references
    const productsWithCategory = products.map(product => ({
      ...product,
      category: categoryMap.get(product.categorySlug),
      categorySlug: undefined // Remove temporary field
    }))

    const createdProducts = await Product.insertMany(productsWithCategory)
    console.log(`📦 Created ${createdProducts.length} products`)

    console.log('\n✅ Database seeded successfully!')
    console.log('\n📋 Summary:')
    console.log(`   - Admin: admin@anvima.com / admin123456`)
    console.log(`   - Customer: customer@example.com / customer123`)
    console.log(`   - Categories: ${createdCategories.length}`)
    console.log(`   - Products: ${createdProducts.length}`)

    await mongoose.disconnect()
    console.log('\n👋 Disconnected from MongoDB')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seed()
