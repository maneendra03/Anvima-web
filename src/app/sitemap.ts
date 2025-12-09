import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvima.com'
  
  // Static pages
  const staticPages = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/faq',
    '/custom-orders',
    '/cart',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Add dynamic product pages from database
  // const products = await getProducts()
  // const productPages = products.map((product) => ({
  //   url: `${baseUrl}/product/${product.slug}`,
  //   lastModified: product.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }))

  return [...staticPages]
}
