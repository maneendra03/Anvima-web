import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anvima'

console.log('Using MongoDB URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))

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
  // Match app's Product model schema for images
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isCustomizable: { type: Boolean, default: true },
  customizable: { type: Boolean, default: true },
  customizationOptions: {
    allowText: Boolean,
    maxTextLength: Number,
    allowImage: Boolean,
    maxImages: Number
  },
  // Match app's Product model schema for variants
  variants: [{
    name: String,
    options: [String],
    prices: [{
      option: String,
      price: Number
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
  },
  // ===== MOCK DATA PRODUCTS (matching src/data/index.ts) =====
  {
    name: 'Classic Memory Frame',
    slug: 'memory-frame-classic',
    description: 'A beautifully crafted wooden frame perfect for displaying your cherished memories. This elegant frame features a natural wood finish with subtle grain patterns that complement any photo. Available in multiple sizes to fit your favorite moments. Each frame is carefully handcrafted and can be personalized with custom engraving to make your gift truly special.',
    shortDescription: 'Elegant wooden frame with custom engraving option',
    price: 1299,
    comparePrice: 1599,
    sku: 'MF-001',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=600&h=600&fit=crop',
    ],
    categorySlug: 'photo-frames',
    tags: ['wooden', 'classic', 'engraving', 'gift'],
    isFeatured: true,
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 50,
      allowImage: true,
      maxImages: 1
    },
    variants: [
      {
        name: 'Size',
        options: [
          { value: '4x6 inches', priceModifier: 0 },
          { value: '5x7 inches', priceModifier: 200 },
          { value: '8x10 inches', priceModifier: 400 },
        ]
      },
      {
        name: 'Color',
        options: [
          { value: 'Natural Oak', priceModifier: 0 },
          { value: 'Walnut', priceModifier: 0 },
          { value: 'White Wash', priceModifier: 0 },
        ]
      }
    ]
  },
  {
    name: 'Vintage Polaroid Set',
    slug: 'polaroid-set-memories',
    description: 'Transform your digital photos into nostalgic polaroid prints. This set includes 10 high-quality printed polaroids with your chosen images, complete with the classic white border. Perfect for decorating your room, creating a gift, or preserving memories in a tangible format. Each polaroid is printed on premium photo paper with vivid colors and a matte finish.',
    shortDescription: 'Set of 10 custom printed polaroid-style photos',
    price: 899,
    comparePrice: 1099,
    sku: 'PS-001',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
    ],
    categorySlug: 'photo-frames',
    tags: ['vintage', 'photos', 'memories', 'prints'],
    isFeatured: true,
    isBestseller: true,
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 30,
      allowImage: true,
      maxImages: 10
    }
  },
  {
    name: 'Celebration Deluxe Hamper',
    slug: 'celebration-hamper-deluxe',
    description: 'The ultimate celebration hamper packed with premium goodies. This beautifully curated hamper includes artisanal chocolates, scented candles, a personalized greeting card, dried flowers, and more. Presented in an elegant keepsake box that can be reused. Perfect for birthdays, anniversaries, or any special occasion worth celebrating.',
    shortDescription: 'Premium curated gift hamper with chocolates, candles & more',
    price: 2499,
    comparePrice: 2999,
    sku: 'CH-001',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1607469256872-48074e807b0f?w=600&h=600&fit=crop',
    ],
    categorySlug: 'gifts-for-her',
    tags: ['luxury', 'celebration', 'chocolates', 'candles'],
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 100,
      allowImage: false
    }
  },
  {
    name: 'Heart Photo Collage',
    slug: 'photo-collage-heart',
    description: 'Express your love with this stunning heart-shaped photo collage. Upload up to 20 of your favorite photos and we\'ll arrange them into a beautiful heart design. Printed on premium canvas and stretched on a wooden frame, this piece is ready to hang and makes a perfect romantic gift. Each collage is designed with care to showcase your photos in the most beautiful way.',
    shortDescription: 'Heart-shaped collage with up to 20 photos on canvas',
    price: 1899,
    comparePrice: 2299,
    sku: 'HC-001',
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=600&h=600&fit=crop',
    ],
    categorySlug: 'anniversary-gifts',
    tags: ['romantic', 'collage', 'canvas', 'love'],
    isBestseller: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: false,
      allowImage: true,
      maxImages: 20
    },
    variants: [
      {
        name: 'Size',
        options: [
          { value: '12x12 inches', priceModifier: 0 },
          { value: '16x16 inches', priceModifier: 400 },
          { value: '20x20 inches', priceModifier: 800 },
        ]
      }
    ]
  },
  {
    name: 'Photo Magic Mug',
    slug: 'personalized-mug-photo',
    description: 'Start your day with a smile! This magic mug reveals your custom photo when filled with hot liquid. A perfect surprise gift that brings joy with every sip. Made with high-quality ceramic and food-safe printing that won\'t fade over time. Microwave and dishwasher safe for everyday use.',
    shortDescription: 'Color-changing magic mug with your custom photo',
    price: 599,
    comparePrice: 799,
    sku: 'MM-001',
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
    ],
    categorySlug: 'mugs-cups',
    tags: ['mug', 'magic', 'daily-use', 'surprise'],
    isNewArrival: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: true,
      maxTextLength: 40,
      allowImage: true,
      maxImages: 1
    }
  },
  {
    name: '3D Photo Crystal Lamp',
    slug: 'memory-lamp-3d',
    description: 'A mesmerizing 3D photo crystal lamp that brings your memories to life. Your photo is laser-engraved inside a crystal block with stunning depth and detail. The LED base illuminates the crystal beautifully, creating a magical display. Available in multiple shapes and perfect for bedside tables, desks, or as a centerpiece.',
    shortDescription: '3D laser-engraved crystal lamp with LED base',
    price: 2199,
    comparePrice: 2699,
    sku: 'CL-001',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=600&h=600&fit=crop',
    ],
    categorySlug: 'lamps-lights',
    tags: ['crystal', '3D', 'lamp', 'luxury', 'decor'],
    isFeatured: true,
    isCustomizable: true,
    customizationOptions: {
      allowText: false,
      allowImage: true,
      maxImages: 1
    },
    variants: [
      {
        name: 'Size',
        options: [
          { value: 'Small (6cm)', priceModifier: 0 },
          { value: 'Medium (8cm)', priceModifier: 500 },
          { value: 'Large (10cm)', priceModifier: 1000 },
        ]
      },
      {
        name: 'Shape',
        options: [
          { value: 'Rectangle', priceModifier: 0 },
          { value: 'Heart', priceModifier: 0 },
          { value: 'Diamond', priceModifier: 0 },
        ]
      }
    ]
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

    // Create products with category references and transform data format
    const productsWithCategory = products.map(product => {
      // Transform images from strings to objects
      const transformedImages = (product.images || []).map((img: string, index: number) => ({
        url: img,
        alt: product.name,
        isPrimary: index === 0
      }))

      // Transform variants from { value, priceModifier } to { options: [string], prices: [{ option, price }] }
      const transformedVariants = (product.variants || []).map((variant: { name: string; options: { value: string; priceModifier: number }[] }) => ({
        name: variant.name,
        options: variant.options.map((opt: { value: string }) => opt.value),
        prices: variant.options.map((opt: { value: string; priceModifier: number }) => ({
          option: opt.value,
          price: product.price + (opt.priceModifier || 0)
        }))
      }))

      return {
        ...product,
        images: transformedImages,
        variants: transformedVariants,
        customizable: product.isCustomizable,
        category: categoryMap.get(product.categorySlug),
        categorySlug: undefined // Remove temporary field
      }
    })

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
