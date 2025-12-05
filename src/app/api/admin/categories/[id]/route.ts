import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// PUT /api/admin/categories/[id] - Update category
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
      const existingCategory = await Category.findOne({ 
        slug: body.slug, 
        _id: { $ne: id } 
      })
      if (existingCategory) {
        return errorResponse('A category with this name already exists', 400)
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!category) {
      return errorResponse('Category not found', 404)
    }

    return successResponse(category, 'Category updated successfully')
  } catch (error) {
    console.error('Update category error:', error)
    return errorResponse('Failed to update category')
  }
}

// DELETE /api/admin/categories/[id] - Delete category
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

    const category = await Category.findByIdAndDelete(id)

    if (!category) {
      return errorResponse('Category not found', 404)
    }

    return successResponse(null, 'Category deleted successfully')
  } catch (error) {
    console.error('Delete category error:', error)
    return errorResponse('Failed to delete category')
  }
}
