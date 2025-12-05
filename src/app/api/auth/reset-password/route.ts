import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { hashToken } from '@/lib/auth/jwt'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Hash the token to compare with stored hash
    const hashedToken = hashToken(validatedData.token)

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400)
    }

    // Update password
    user.password = validatedData.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return successResponse(
      null,
      'Password reset successful! You can now log in with your new password.'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
