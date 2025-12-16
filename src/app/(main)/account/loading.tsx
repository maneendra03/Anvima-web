import GiftLoader from '@/components/ui/GiftLoader'

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <GiftLoader size="md" text="Loading your account..." />
    </div>
  )
}
