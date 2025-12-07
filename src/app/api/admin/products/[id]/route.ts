import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/products/[id] - Get single product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()
    const { id } = await params

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .lean()

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    return successResponse(product, 'Product fetched successfully')
  } catch (error) {
    console.error('Get product error:', error)
    return errorResponse('Failed to fetch product')
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const body = await request.json()
    const { id } = await params

    await dbConnect()

    // Build update data
    const updateData: Record<string, unknown> = { ...body }

    // If name changed, update slug
    if (body.name) {
      const newSlug = body.slug || body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      updateData.slug = newSlug

      // Check if new slug conflicts
      const existingProduct = await Product.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      })
      if (existingProduct) {
        return errorResponse('A product with this name already exists', 400)
      }
    }

    // Check for duplicate SKU if provided
    if (body.sku && body.sku.trim()) {
      const existingSku = await Product.findOne({ 
        sku: body.sku.trim(),
        _id: { $ne: id }
      })
      if (existingSku) {
        return errorResponse('A product with this SKU already exists', 400)
      }
    }

    // Transform images array - handle both formats
    if (body.images && Array.isArray(body.images)) {
      updateData.images = body.images.map((img: string | { url: string; alt?: string; isPrimary?: boolean }, index: number) => {
        if (typeof img === 'string') {
          return {
            url: img,
            alt: body.name || 'Product image',
            isPrimary: index === 0
          }
        }
        return {
          url: img.url,
          alt: img.alt || body.name || 'Product image',
          isPrimary: img.isPrimary || index === 0
        }
      })
    }

    // Map isCustomizable to customizable (model field name)
    if ('isCustomizable' in body) {
      updateData.customizable = body.isCustomizable
      delete updateData.isCustomizable
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category', 'name slug')

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    return successResponse(product, 'Product updated successfully')
  } catch (error) {
    console.error('Update product error:', error)
    
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
    
    return errorResponse('Failed to update product')
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()
    const { id } = await params

    const product = await Product.findByIdAndDelete(id)

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    return successResponse(null, 'Product deleted successfully')
  } catch (error) {
    console.error('Delete product error:', error)
    return errorResponse('Failed to delete product')
  }
}
