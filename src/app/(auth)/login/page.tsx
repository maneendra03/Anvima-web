'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Gift } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const { login, isLoading } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await login(formData.email, formData.password)
    
    if (result.success) {
      toast.success('Welcome back!')
      // Force refresh to update the auth state across the app
      router.refresh()
      // Check for redirect URL first (e.g., from checkout)
      if (redirectUrl) {
        router.replace(redirectUrl)
      } else if (result.user?.role === 'admin') {
        // Redirect admin users to admin portal
        router.replace('/admin')
      } else {
        // Redirect regular users to home page
        router.replace('/')
      }
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-peach-400 to-blush-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-40 right-20 w-60 h-60 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Gift className="w-20 h-20 text-white mb-6" />
            <h1 className="font-playfair text-4xl text-white mb-4">
              Welcome Back to Anvima
            </h1>
            <p className="text-white/90 text-lg max-w-md">
              Continue your journey of creating meaningful, personalized gifts for your loved ones.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm">Products</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm">Happy Customers</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-2xl font-bold">4.9★</p>
              <p className="text-sm">Rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="font-playfair text-3xl text-forest-600">Anvima</span>
            </Link>
            <h2 className="text-2xl font-semibold text-charcoal-800 mb-2">
              Sign in to your account
            </h2>
            <p className="text-charcoal-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-forest-600 hover:text-forest-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-charcoal-200'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-charcoal-200'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-forest-600 border-charcoal-300 rounded focus:ring-forest-500"
                />
                <span className="ml-2 text-sm text-charcoal-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-forest-600 hover:text-forest-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-forest-700 focus:ring-4 focus:ring-forest-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-charcoal-200" />
            <span className="px-4 text-sm text-charcoal-400">or continue with</span>
            <div className="flex-1 h-px bg-charcoal-200" />
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-200 rounded-lg hover:bg-charcoal-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-charcoal-700">Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-charcoal-200 rounded-lg hover:bg-charcoal-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-charcoal-700">Facebook</span>
            </button>
          </div>

          {/* Terms */}
          <p className="mt-8 text-center text-sm text-charcoal-500">
            By signing in, you agree to our{' '}
            <Link href="/faq" className="text-forest-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/faq" className="text-forest-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function LoginLoading() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-forest"></div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
