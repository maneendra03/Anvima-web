import { Toaster } from 'react-hot-toast'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
      {children}
    </>
  )
}
