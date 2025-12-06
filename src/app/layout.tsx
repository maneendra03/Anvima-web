import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Anvima | Customized Gifts & Personalized Creations',
  description: 'Create beautiful customized frames, printed Polaroids, curated hampers, and bespoke gifts. Handcrafted with love for your special moments. Shop now at Anvima Creations.',
  keywords: 'customized gifts, personalized frames, photo gifts, Polaroid prints, hampers, custom orders, gift shop, handmade gifts',
  authors: [{ name: 'Anvima Creations' }],
  icons: {
    icon: '/anvimaa.jpg',
    apple: '/anvimaa.jpg',
  },
  openGraph: {
    title: 'Anvima | Customized Gifts & Personalized Creations',
    description: 'Create beautiful customized frames, printed Polaroids, curated hampers, and bespoke gifts.',
    url: 'https://anvima.com',
    siteName: 'Anvima',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvima | Customized Gifts',
    description: 'Create beautiful customized frames, printed Polaroids, curated hampers, and bespoke gifts.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#3D3D3D',
              color: '#FDFCFA',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#2D5A47',
                secondary: '#FDFCFA',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FDFCFA',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
