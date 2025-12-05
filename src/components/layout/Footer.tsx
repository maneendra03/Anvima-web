import Link from 'next/link'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'All Products', href: '/shop' },
    { name: 'Frames', href: '/shop?category=frames' },
    { name: 'Polaroids', href: '/shop?category=polaroids' },
    { name: 'Hampers', href: '/shop?category=hampers' },
    { name: 'Custom Orders', href: '/custom-orders' },
  ],
  help: [
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping & Delivery', href: '/faq#shipping' },
    { name: 'Returns & Refunds', href: '/faq#returns' },
    { name: 'Privacy Policy', href: '/faq#privacy' },
    { name: 'Terms of Service', href: '/faq#terms' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/about#story' },
    { name: 'Contact', href: '/contact' },
    { name: 'Instagram', href: 'https://instagram.com/anvima.creations' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-charcoal-700 text-cream-100">
      {/* Newsletter Section */}
      <div className="bg-forest-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-serif font-semibold text-white mb-2">
                Stay in the Loop
              </h3>
              <p className="text-cream-200">
                Get exclusive offers, gift ideas, and updates on new collections.
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-cream-300 focus:outline-none focus:border-white/50 w-full md:w-72"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-peach-400 text-charcoal-700 rounded-full font-medium hover:bg-peach-500 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl font-serif font-bold text-white mb-4">
                Anvima
              </h2>
            </Link>
            <p className="text-cream-300 mb-6 max-w-sm">
              Creating personalized gifts that capture your precious moments.
              Handcrafted with love, delivered with care.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/anvima.creations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@anvima.com"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Help</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-cream-300">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Your City, State, Country</span>
              </li>
              <li className="flex items-center gap-3 text-cream-300">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-3 text-cream-300">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>hello@anvima.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream-400 text-sm">
            © {new Date().getFullYear()} Anvima Creations. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-cream-400">
            <Link href="/faq#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faq#terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
