import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { getAuthUser } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/user/cart - Get user's cart
export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    await dbConnect()

    const userDoc = await User.findById(user.userId).select('cart')

    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    return successResponse(userDoc.cart || [], 'Cart fetched successfully')
  } catch (error) {
    console.error('Get cart error:', error)
    return errorResponse('Failed to fetch cart')
  }
}

// POST /api/user/cart - Sync cart (replace entire cart)
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { items } = await request.json()

    if (!Array.isArray(items)) {
      return errorResponse('Invalid cart data', 400)
    }

    await dbConnect()

    const userDoc = await User.findById(authUser.userId)
    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    // Transform items to match the schema (ensure productId is correct)
    const cartItems = items.map(item => ({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      customization: item.customization || undefined,
    }))

    userDoc.cart = cartItems
    await userDoc.save()

    return successResponse({ cart: userDoc.cart }, 'Cart synced successfully')
  } catch (error) {
    console.error('Sync cart error:', error)
    return errorResponse('Failed to sync cart')
  }
}

// PUT /api/user/cart - Add or update item in cart
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { item } = await request.json()

    if (!item || !item.productId) {
      return errorResponse('Product ID is required', 400)
    }

    await dbConnect()

    const userDoc = await User.findById(authUser.userId)
    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    // Find existing item with same productId and customization
    const existingIndex = userDoc.cart.findIndex(
      (i) =>
        i.productId.toString() === item.productId &&
        JSON.stringify(i.customization) === JSON.stringify(item.customization)
    )

    if (existingIndex > -1) {
      // Update quantity
      userDoc.cart[existingIndex].quantity += item.quantity || 1
    } else {
      // Add new item
      userDoc.cart.push({
        productId: item.productId,
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image,
        customization: item.customization || undefined,
      })
    }

    await userDoc.save()

    return successResponse({ cart: userDoc.cart }, 'Cart updated successfully')
  } catch (error) {
    console.error('Update cart error:', error)
    return errorResponse('Failed to update cart')
  }
}

// DELETE /api/user/cart - Remove item from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const clearAll = searchParams.get('clearAll')

    await dbConnect()

    const userDoc = await User.findById(authUser.userId)
    if (!userDoc) {
      return errorResponse('User not found', 404)
    }

    if (clearAll === 'true') {
      userDoc.cart = []
    } else if (itemId) {
      userDoc.cart = userDoc.cart.filter(
        (item) => item._id?.toString() !== itemId
      )
    } else {
      return errorResponse('Item ID or clearAll flag is required', 400)
    }

    await userDoc.save()

    return successResponse({ cart: userDoc.cart }, 'Cart updated successfully')
  } catch (error) {
    console.error('Delete cart error:', error)
    return errorResponse('Failed to update cart')
  }
}
