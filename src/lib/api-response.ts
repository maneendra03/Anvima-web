import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  )
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  )
}

export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const errors: Record<string, string[]> = {}
  
  error.issues.forEach((issue) => {
    const field = issue.path.join('.')
    if (!errors[field]) {
      errors[field] = []
    }
    errors[field].push(issue.message)
  })

  return errorResponse('Validation failed', 400, errors)
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred'
    return errorResponse(message, 500)
  }

  return errorResponse('An unexpected error occurred', 500)
}
