export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subcategory?: string
  tags: string[]
  inStock: boolean
  stockCount?: number
  rating: number
  reviewCount: number
  customizable: boolean
  customizationOptions?: {
    hasText?: boolean
    textMaxLength?: number
    hasImageUpload?: boolean
    sizes?: { name: string; price: number }[]
    colors?: { name: string; hex: string; price?: number }[]
    hasEngraving?: boolean
    engravingPrice?: number
  }
  deliveryTime: string
  featured?: boolean
  bestSeller?: boolean
  newArrival?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  image?: string
  productBought?: string
}

export interface FAQItem {
  question: string
  answer: string
  category: string
}
