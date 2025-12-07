import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/products - Get all products (admin)
export async function GET(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const stock = searchParams.get('stock')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ]
    }

    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false

    // Handle low stock filter
    if (stock === 'low') {
      query.stock = { $lte: 10 }
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    return successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Products fetched successfully')
  } catch (error) {
    console.error('Admin get products error:', error)
    return errorResponse('Failed to fetch products')
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return errorResponse('Product name is required', 400)
    }

    if (!body.price || isNaN(parseFloat(body.price))) {
      return errorResponse('Valid product price is required', 400)
    }

    if (!body.category) {
      return errorResponse('Product category is required', 400)
    }

    if (!body.description || !body.description.trim()) {
      return errorResponse('Product description is required', 400)
    }

    await dbConnect()

    // Generate slug from name
    const slug = body.slug || body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingProduct = await Product.findOne({ slug })
    if (existingProduct) {
      return errorResponse('A product with this name already exists. Please use a different name.', 400)
    }

    // Check for duplicate SKU if provided
    if (body.sku && body.sku.trim()) {
      const existingSku = await Product.findOne({ sku: body.sku.trim() })
      if (existingSku) {
        return errorResponse('A product with this SKU already exists', 400)
      }
    }

    // Transform images array - handle both formats
    let images = []
    if (body.images && Array.isArray(body.images)) {
      images = body.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }, index: number) => {
        if (typeof img === 'string') {
          return {
            url: img,
            alt: body.name,
            isPrimary: index === 0
          }
        }
        return {
          url: img.url,
          alt: img.alt || body.name,
          isPrimary: img.isPrimary || index === 0
        }
      })
    }

    if (images.length === 0) {
      return errorResponse('At least one product image is required', 400)
    }

    // Build product data with proper field mapping
    const productData = {
      name: body.name.trim(),
      slug,
      description: body.description.trim(),
      shortDescription: body.shortDescription?.trim() || '',
      price: parseFloat(body.price),
      comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : undefined,
      sku: body.sku?.trim() || undefined,
      stock: parseInt(body.stock) || 0,
      images,
      category: body.category,
      tags: Array.isArray(body.tags) ? body.tags : [],
      isActive: body.isActive !== false,
      isFeatured: body.isFeatured || false,
      // Map isCustomizable to customizable (model field name)
      customizable: body.isCustomizable || body.customizable || false,
      customizationOptions: body.customizationOptions || undefined,
      variants: body.variants || []
    }

    const product = new Product(productData)

    await product.save()

    return successResponse(product, 'Product created successfully', 201)
  } catch (error) {
    console.error('Create product error:', error)
    
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const mongooseError = error as { errors?: Record<string, { message: string }> }
      const messages = Object.values(mongooseError.errors || {}).map(e => e.message).join(', ')
      return errorResponse(`Validation error: ${messages}`, 400)
    }
    
    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      return errorResponse('A product with this name or SKU already exists', 400)
    }
    
    return errorResponse('Failed to create product. Please try again.')
  }
}
