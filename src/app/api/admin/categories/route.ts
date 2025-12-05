import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    await dbConnect()

    const categories = await Category.find()
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 })
      .lean()

    return successResponse(categories, 'Categories fetched successfully')
  } catch (error) {
    console.error('Admin get categories error:', error)
    return errorResponse('Failed to fetch categories')
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const body = await request.json()

    await dbConnect()

    // Generate slug
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingCategory = await Category.findOne({ slug })
    if (existingCategory) {
      return errorResponse('A category with this name already exists', 400)
    }

    const category = new Category({
      ...body,
      slug
    })

    await category.save()

    return successResponse(category, 'Category created successfully', 201)
  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse('Failed to create category')
  }
}
