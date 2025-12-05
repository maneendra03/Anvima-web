import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import Review from '@/models/Review'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/products/[slug] - Get single product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect()

    const { slug } = await params

    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .lean()

    if (!product) {
      return errorResponse('Product not found', 404)
    }

    // Get reviews for this product
    const reviews = await Review.find({ 
      product: product._id, 
      isApproved: true 
    })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .select('name slug price comparePrice images')
      .limit(4)
      .lean()

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } })

    return successResponse({
      product,
      reviews,
      relatedProducts
    }, 'Product fetched successfully')
  } catch (error) {
    console.error('Get product error:', error)
    return errorResponse('Failed to fetch product')
  }
}
