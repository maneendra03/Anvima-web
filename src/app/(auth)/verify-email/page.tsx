'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [email, setEmail] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()
        
        if (data.success) {
          setStatus('success')
          if (data.data?.email) {
            setEmail(data.data.email)
          }
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }

    verifyEmail()
  }, [token])

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resendEmail || !/^\S+@\S+\.\S+$/.test(resendEmail)) {
      toast.error('Please enter a valid email')
      return
    }

    setIsResending(true)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Verification email sent!')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-forest-600 animate-spin" />
        </div>
        <h2 className="font-playfair text-xl text-charcoal-800">
          Verifying your email...
        </h2>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="font-playfair text-2xl text-charcoal-800 mb-2">
          Email Verified! 🎉
        </h2>
        <p className="text-charcoal-500 mb-6">
          {email ? (
            <>Your email <strong>{email}</strong> has been verified successfully.</>
          ) : (
            'Your email has been verified successfully.'
          )}
          <br />
          You can now access all features of your account.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-forest-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-forest-700 transition-colors"
        >
          Continue to Login
          <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="font-playfair text-2xl text-charcoal-800 mb-2">
        {status === 'no-token' ? 'Missing Verification Link' : 'Verification Failed'}
      </h2>
      <p className="text-charcoal-500 mb-6">
        {status === 'no-token' 
          ? 'No verification token found. Please check your email for the correct link.'
          : 'This verification link is invalid or has expired. Please request a new one below.'}
      </p>

      <div className="bg-cream-100 rounded-lg p-6 text-left">
        <h3 className="font-medium text-charcoal-800 mb-3">
          Resend Verification Email
        </h3>
        <form onSubmit={handleResend} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-forest-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            disabled={isResending}
            className="w-full bg-forest-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-forest-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Resend Verification
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm text-charcoal-500">
        Already verified?{' '}
        <Link href="/login" className="text-forest-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-forest-500/30 border-t-forest-500 rounded-full animate-spin" />
      </div>
    }>
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <VerifyEmailContent />
          </div>
        </motion.div>
      </div>
    </Suspense>
  )
}
