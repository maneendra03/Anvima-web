'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Instagram, ArrowUpRight } from 'lucide-react'

// Add your Instagram reel/post URLs here
// To get the URL: Open the reel on Instagram → Click ••• → Copy Link
const instagramPosts = [
  // Example: 'https://www.instagram.com/reel/ABC123xyz/'
  // Add your reel URLs below:
  'https://www.instagram.com/reel/DQmN3oDD534/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',  // Reel 1
  'https://www.instagram.com/reel/DQmN3oDD534/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',  // Reel 2
  'https://www.instagram.com/reel/DQmN3oDD534/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',  // Reel 3
  '',  // Reel 4
  '',  // Reel 5
  '',  // Reel 6
]

// Extract the shortcode from Instagram URL - captioned=false hides header, autoplay for reels
const getEmbedUrl = (url: string) => {
  if (!url) return null
  // Handle both /reel/ and /p/ URLs
  const match = url.match(/instagram\.com\/(reel|p)\/([A-Za-z0-9_-]+)/)
  if (match) {
    // captioned=false removes the caption, hidecaption=1 hides profile header area
    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/?cr=1&v=14&wp=540&rd=https%3A%2F%2Fwww.anvima.com&rp=%2F#%7B%22ci%22%3A0%2C%22os%22%3A0%7D`
  }
  return null
}

export default function InstagramFeed() {
  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.instagram.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    
    // Reprocess embeds when script loads
    script.onload = () => {
      if ((window as unknown as { instgrm?: { Embeds?: { process: () => void } } }).instgrm?.Embeds?.process) {
        (window as unknown as { instgrm: { Embeds: { process: () => void } } }).instgrm.Embeds.process()
      }
    }
    
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const validPosts = instagramPosts.filter(url => url && getEmbedUrl(url))
  const hasRealPosts = validPosts.length > 0

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-charcoal-400 mb-4">
            @anvima.creations
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal-900 mb-4">
            Follow Our Journey
          </h2>
          <p className="text-charcoal-500 max-w-xl mx-auto">
            Get inspired by our latest creations and customer stories
          </p>
        </motion.div>

        {hasRealPosts ? (
          // Show real Instagram embeds - evenly spread across the container
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-5 max-w-5xl mx-auto">
            {validPosts.slice(0, 6).map((url, index) => {
              const embedUrl = getEmbedUrl(url)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-cream-50 rounded-lg overflow-hidden aspect-[9/16]"
                  style={{ maxHeight: '450px' }}
                >
                  {/* Hide Instagram header with CSS overlay */}
                  <div className="absolute top-0 left-0 right-0 h-[54px] bg-white z-10" />
                  <iframe
                    src={embedUrl!}
                    className="w-full h-full border-0 scale-[1.02]"
                    style={{ marginTop: '-54px', height: 'calc(100% + 54px)' }}
                    allowFullScreen
                    scrolling="no"
                    loading="lazy"
                    allow="autoplay; encrypted-media"
                  />
                </motion.div>
              )
            })}
          </div>
        ) : (
          // Show placeholder when no real posts are configured
          <div className="text-center py-12 bg-cream-50 rounded-xl">
            <Instagram className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500 mb-10">Instagram feed coming soon!</p>
            <p className="text-sm text-charcoal-400">
              Follow us on Instagram to see our latest creations
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="https://instagram.com/anvima.creations"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-wider text-charcoal-700 hover:text-charcoal-900 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Follow on Instagram
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
