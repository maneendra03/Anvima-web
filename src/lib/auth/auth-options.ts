import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from './jwt'

// Type augmentation is in src/types/next-auth.d.ts

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email }).select('+password')

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await user.comparePassword(credentials.password)

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect()

          // Check if user exists
          let existingUser = await User.findOne({ email: user.email })

          if (!existingUser) {
            // Create new user for Google sign-in
            existingUser = new User({
              name: user.name || 'User',
              email: user.email!,
              avatar: user.image || '',
              isVerified: true, // Google accounts are pre-verified
              role: 'user',
            })
            await existingUser.save()
            console.log('✅ New user created from Google sign-in:', existingUser.email)
          } else {
            // Update avatar if not set
            if (!existingUser.avatar && user.image) {
              existingUser.avatar = user.image
              await existingUser.save()
            }
          }

          // Attach the MongoDB user ID and role to the user object for the JWT callback
          ;(user as unknown as { id: string; role: string }).id = existingUser._id.toString()
          ;(user as unknown as { id: string; role: string }).role = existingUser.role

          return true
        } catch (error) {
          console.error('Error during Google sign-in:', error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = ((user as { role?: string }).role || 'user') as 'user' | 'admin'
      }

      // On initial sign in with Google, fetch the user from DB and generate custom auth token
      if (account?.provider === 'google' && user?.email) {
        await dbConnect()
        const dbUser = await User.findOne({ email: user.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role
          
          // Generate our custom auth token
          const authToken = generateToken({
            userId: dbUser._id.toString(),
            email: dbUser.email,
            role: dbUser.role,
          })
          
          // Store the auth token in the NextAuth token for use in redirect callback
          token.customAuthToken = authToken
          console.log('✅ Generated custom auth token for Google user:', dbUser.email)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'user' | 'admin'
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle the redirect after OAuth - we'll set the cookie in a separate API call
      // Redirect to a special endpoint that will set our custom auth cookie
      if (url.includes('/api/auth/google-callback')) {
        return url
      }
      
      // For google sign-in redirects, go through our callback handler
      if (url.startsWith(baseUrl) || url.startsWith('/')) {
        // Check if this is coming from Google OAuth
        const targetUrl = url.startsWith('/') ? `${baseUrl}${url}` : url
        return targetUrl
      }
      
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
}
