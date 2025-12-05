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

    // If name changed, update slug
    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug conflicts
      const existingProduct = await Product.findOne({ 
        slug: body.slug, 
        _id: { $ne: id } 
      })
      if (existingProduct) {
        return errorResponse('A product with this name already exists', 400)
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('category', 'name slug')

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    return successResponse(product, 'Product updated successfully')
  } catch (error) {
    console.error('Update product error:', error)
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
