// MainLayout - Header/Footer are already rendered by LayoutWrapper in root layout
// This layout is just a pass-through to avoid duplicate components

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
