import HeroBanner from '@/components/home/HeroBanner'
import CategoryStrip from '@/components/home/CategoryStrip'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import PromoBanner from '@/components/home/PromoBanner'
import NewArrivals from '@/components/home/NewArrivals'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import ShopTheLook from '@/components/home/ShopTheLook'

export default function Home() {
  return (
    <>
      <HeroBanner />
      <CategoryStrip />
      <FeaturedProducts />
      <PromoBanner />
      <NewArrivals />
      <ShopTheLook />
      <HowItWorks />
      <Testimonials />
    </>
  )
}
