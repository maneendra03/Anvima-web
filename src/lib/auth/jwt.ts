import jwt, { Secret, SignOptions } from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET: Secret = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable')
}

export interface TokenPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: '7d',
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
