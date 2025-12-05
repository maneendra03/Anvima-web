import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TokenPayload } from './jwt'
import { cookies } from 'next/headers'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

export async function getAuthUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

export async function requireAuth(): Promise<TokenPayload | NextResponse> {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized - Please log in' },
      { status: 401 }
    )
  }

  return user
}

export async function requireAdmin(): Promise<TokenPayload | NextResponse> {
  const result = await requireAuth()

  if (result instanceof NextResponse) {
    return result
  }

  if (result.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Forbidden - Admin access required' },
      { status: 403 }
    )
  }

  return result
}

export function isAuthenticated(result: TokenPayload | NextResponse): result is TokenPayload {
  return !(result instanceof NextResponse)
}
