import Hero from '@/components/home/Hero'
import Categories from '@/components/home/Categories'
import Bestsellers from '@/components/home/Bestsellers'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import InstagramFeed from '@/components/home/InstagramFeed'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Bestsellers />
      <HowItWorks />
      <Testimonials />
      <InstagramFeed />
      <Newsletter />
    </>
  )
}
