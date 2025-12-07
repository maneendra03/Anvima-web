import { NextRequest } from 'next/server'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'
import { successResponse, errorResponse } from '@/lib/api-response'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

// POST /api/admin/upload - Upload image to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const body = await request.json()
    const { image, folder = 'products' } = body

    if (!image) {
      return errorResponse('No image provided', 400)
    }

    // Validate base64 image format
    if (typeof image === 'string' && !image.startsWith('data:image/') && !image.startsWith('http')) {
      return errorResponse('Invalid image format. Must be base64 or URL', 400)
    }

    const uploadResult = await uploadToCloudinary(image, folder)

    return successResponse(uploadResult, 'Image uploaded successfully')
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload image'
    return errorResponse(message)
  }
}

// DELETE /api/admin/upload - Delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const result = await requireAdmin()
    if (!isAuthenticated(result)) {
      return result
    }

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return errorResponse('No publicId provided', 400)
    }

    await deleteFromCloudinary(publicId)

    return successResponse(null, 'Image deleted successfully')
  } catch (error) {
    console.error('Delete error:', error)
    return errorResponse('Failed to delete image')
  }
}
