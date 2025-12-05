import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { addressSchema } from '@/lib/validations/auth'
import { requireAuth, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

// GET /api/user/addresses - Get all addresses
export async function GET() {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const user = await User.findById(authResult.userId)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      addresses: user.addresses,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/user/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!isAuthenticated(authResult)) return authResult

    await dbConnect()

    const body = await request.json()
    const validatedData = addressSchema.parse(body)

    const user = await User.findById(authResult.userId)
    if (!user) {
      return errorResponse('User not found', 404)
    }

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || validatedData.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach((addr) => {
        addr.isDefault = false
      })
    }

    // Use addToSet or push with type assertion
    const newAddress = {
      ...validatedData,
      isDefault: user.addresses.length === 0 || validatedData.isDefault || false,
    }
    
    user.addresses.push(newAddress as typeof user.addresses[number])

    await user.save()

    return successResponse({
      addresses: user.addresses,
    }, 'Address added successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
