import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'
import Product from '@/models/Product'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const withCount = searchParams.get('withCount') === 'true'
    const parentOnly = searchParams.get('parentOnly') === 'true'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true }
    
    if (parentOnly) {
      query.parent = null
    }

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort({ order: 1, name: 1 })
      .lean()

    // Get product count for each category if requested
    if (withCount) {
      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const productCount = await Product.countDocuments({ 
            category: cat._id, 
            isActive: true 
          })
          return { ...cat, productCount }
        })
      )
      return successResponse(categoriesWithCount, 'Categories fetched successfully')
    }

    return successResponse(categories, 'Categories fetched successfully')
  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Failed to fetch categories')
  }
}
