import GiftLoader from '@/components/ui/GiftLoader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex flex-col items-center justify-center">
      <GiftLoader size="lg" text="Preparing checkout..." />
    </div>
  )
}
