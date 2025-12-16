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
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 sm:mb-3 lg:mb-4">
                Anvima
              </h2>
            </Link>
            <p className="text-sm text-gray-400 mb-4 sm:mb-5 lg:mb-6 max-w-sm">
              Creating personalized gifts that capture your precious moments.
              Handcrafted with love, delivered with care.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="https://instagram.com/anvima.creations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="mailto:anvima.creations@gmail.com"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Shop</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Help</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>+91 6304742807</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>anvima.creations@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-500 text-xs sm:text-sm">
            © {new Date().getFullYear()} Anvima Creations. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
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
