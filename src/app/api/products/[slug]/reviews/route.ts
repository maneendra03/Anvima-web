import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import Review from '@/models/Review'
import { getAuthUser } from '@/lib/auth/middleware'

// GET - Fetch reviews for a product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect()
    const { slug } = await params

    const product = await Product.findOne({ slug })
    if (!product) {
      // Return empty reviews instead of 404 for better UX
      return NextResponse.json({
        success: true,
        data: {
          reviews: [],
          averageRating: 0,
          distribution: [0, 0, 0, 0, 0],
          total: 0,
        },
      })
    }

    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })

    // Calculate average rating and distribution
    const totalReviews = reviews.length
    let averageRating = 0
    const distribution = [0, 0, 0, 0, 0] // 1-5 stars

    if (totalReviews > 0) {
      let totalRating = 0
      reviews.forEach((review) => {
        totalRating += review.rating
        distribution[review.rating - 1]++
      })
      averageRating = totalRating / totalReviews
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating,
        distribution,
        total: totalReviews,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST - Create a new review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please login to write a review' },
        { status: 401 }
      )
    }

    await dbConnect()
    const { slug } = await params

    const product = await Product.findOne({ slug })
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { rating, title, comment } = body

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Review must be at least 10 characters' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: product._id,
      user: user.userId,
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create the review
    const review = await Review.create({
      product: product._id,
      user: user.userId,
      rating,
      title: title?.trim() || '',
      comment: comment.trim(),
      isApproved: true, // Auto-approve for now, can add moderation later
      isVerifiedPurchase: false,
      helpfulCount: 0,
    })

    // Update product's average rating
    const allReviews = await Review.find({ product: product._id, isApproved: true })
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    await Product.findByIdAndUpdate(product._id, {
      rating: avgRating,
      reviewCount: allReviews.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
