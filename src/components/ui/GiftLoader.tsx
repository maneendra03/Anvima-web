'use client'

import { motion } from 'framer-motion'

interface GiftLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function GiftLoader({ size = 'md', text, fullScreen = false }: GiftLoaderProps) {
  const sizes = {
    sm: { box: 40, ribbon: 8, bow: 16 },
    md: { box: 64, ribbon: 12, bow: 24 },
    lg: { box: 96, ribbon: 16, bow: 32 },
  }

  const s = sizes[size]

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-cream-50/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-8'

  return (
    <div className={containerClass}>
      <div className="relative" style={{ width: s.box, height: s.box }}>
        {/* Gift Box Base */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-br from-peach-400 to-blush-400 shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Gift Box Lid */}
        <motion.div
          className="absolute rounded-t-lg bg-gradient-to-br from-peach-500 to-blush-500"
          style={{
            width: s.box + 8,
            height: s.box * 0.25,
            left: -4,
            top: 0,
            transformOrigin: 'left center',
          }}
          animate={{
            rotateX: [0, -30, 0],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Vertical Ribbon */}
        <motion.div
          className="absolute bg-forest-500"
          style={{
            width: s.ribbon,
            height: s.box,
            left: '50%',
            marginLeft: -s.ribbon / 2,
            top: 0,
          }}
          animate={{
            scaleY: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Horizontal Ribbon */}
        <motion.div
          className="absolute bg-forest-500"
          style={{
            width: s.box,
            height: s.ribbon,
            left: 0,
            top: '50%',
            marginTop: -s.ribbon / 2,
          }}
        />

        {/* Bow - Left Loop */}
        <motion.div
          className="absolute bg-forest-600 rounded-full"
          style={{
            width: s.bow,
            height: s.bow * 0.6,
            left: '50%',
            marginLeft: -s.bow - 2,
            top: -s.bow * 0.3,
            transformOrigin: 'right center',
          }}
          animate={{
            rotate: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bow - Right Loop */}
        <motion.div
          className="absolute bg-forest-600 rounded-full"
          style={{
            width: s.bow,
            height: s.bow * 0.6,
            left: '50%',
            marginLeft: 2,
            top: -s.bow * 0.3,
            transformOrigin: 'left center',
          }}
          animate={{
            rotate: [10, -10, 10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Bow - Center Knot */}
        <motion.div
          className="absolute bg-forest-700 rounded-full"
          style={{
            width: s.ribbon + 4,
            height: s.ribbon + 4,
            left: '50%',
            marginLeft: -(s.ribbon + 4) / 2,
            top: -s.ribbon / 2,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full"
            style={{
              left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 60}%`,
              top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 60}%`,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.25,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      {text && (
        <motion.p
          className="mt-6 text-charcoal-600 font-medium text-center"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {text}
        </motion.p>
      )}

      {/* Animated Dots */}
      <div className="flex gap-1.5 mt-3">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-forest-500"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Inline loader for buttons
export function GiftSpinner({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: 20, height: 20 }}
    >
      {/* Mini Gift Box */}
      <motion.div
        className="absolute inset-0 rounded bg-current"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Ribbon Cross */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-0.5 h-full bg-white/50" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-0.5 w-full bg-white/50" />
      </div>
    </motion.div>
  )
}

// Page loading component
export function PageLoader({ message = 'Preparing your gift...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex flex-col items-center justify-center">
      <GiftLoader size="lg" text={message} />
    </div>
  )
}

// Skeleton loader for cards
export function GiftCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      <motion.div
        className="aspect-square bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ backgroundSize: '200% 100%' }}
      />
      <div className="p-4 space-y-3">
        <motion.div
          className="h-4 rounded bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ backgroundSize: '200% 100%' }}
        />
        <motion.div
          className="h-4 w-2/3 rounded bg-gradient-to-r from-cream-100 via-cream-200 to-cream-100"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
            delay: 0.2,
          }}
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </div>
  )
}
