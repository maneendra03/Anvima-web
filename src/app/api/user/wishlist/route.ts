import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/user/wishlist - Get user's wishlist
export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    await dbConnect()

    const userDoc = await User.findById(user.userId)
      .populate({
        path: 'wishlist',
        model: Product,
        select: 'name slug price comparePrice images category stock'
      })

    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    return successResponse(userDoc.wishlist || [], 'Wishlist fetched successfully')
  } catch (error) {
    console.error('Get wishlist error:', error)
    return errorResponse('Failed to fetch wishlist')
  }
}

// POST /api/user/wishlist - Add product to wishlist
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { productId } = await request.json()

    if (!productId) {
      return errorResponse('Product ID is required', 400)
    }

    await dbConnect()

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return errorResponse('Product not found', 404)
    }

    const userDoc = await User.findById(authUser.userId)
    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    // Check if already in wishlist
    if (userDoc.wishlist.includes(productId)) {
      return errorResponse('Product already in wishlist', 400)
    }

    userDoc.wishlist.push(productId)
    await userDoc.save()

    return successResponse({ wishlist: userDoc.wishlist }, 'Product added to wishlist')
  } catch (error) {
    console.error('Add to wishlist error:', error)
    return errorResponse('Failed to add to wishlist')
  }
}

// DELETE /api/user/wishlist - Remove product from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return errorResponse('Product ID is required', 400)
    }

    await dbConnect()

    const userDoc = await User.findById(authUser.userId)
    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    userDoc.wishlist = userDoc.wishlist.filter(
      (id: { toString: () => string }) => id.toString() !== productId
    )
    await userDoc.save()

    return successResponse({ wishlist: userDoc.wishlist }, 'Product removed from wishlist')
  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return errorResponse('Failed to remove from wishlist')
  }
}
