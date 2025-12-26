'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Package } from 'lucide-react'

interface ProductImageProps {
  src?: string | null
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
}

// Pastel gradient backgrounds for product placeholders
const gradients = [
  'bg-gradient-to-br from-rose-100 to-pink-50',
  'bg-gradient-to-br from-amber-100 to-orange-50',
  'bg-gradient-to-br from-emerald-100 to-teal-50',
  'bg-gradient-to-br from-violet-100 to-purple-50',
  'bg-gradient-to-br from-sky-100 to-blue-50',
  'bg-gradient-to-br from-lime-100 to-green-50',
]

export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Generate consistent gradient based on alt text
  const gradientIndex = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length
  const gradient = gradients[gradientIndex]

  // If no src or error, show placeholder
  if (!src || hasError) {
    return (
      <div className={`${gradient} flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <Package className="w-10 h-10 mx-auto text-charcoal-300 mb-2" strokeWidth={1.5} />
          <span className="text-xs text-charcoal-400 line-clamp-2">{alt}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {isLoading && (
        <div className={`${gradient} animate-pulse absolute inset-0`} />
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          sizes={sizes}
          unoptimized
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 400}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          unoptimized
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </>
  )
}
