'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import AuthProvider from '@/components/providers/AuthProvider'

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't show main header/footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin')
  
  if (isAdminPage) {
    return <AuthProvider>{children}</AuthProvider>
  }

  return (
    <AuthProvider>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </AuthProvider>
  )
}
