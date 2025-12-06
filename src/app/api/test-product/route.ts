import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'memory-frame-classic'
    
    console.log('Test endpoint - connecting to DB...')
    await dbConnect()
    console.log('Test endpoint - DB connected')
    
    // Try to find by slug
    console.log('Test endpoint - searching for slug:', slug)
    const product = await Product.findOne({ slug })
    console.log('Test endpoint - product found:', !!product)
    
    if (product) {
      return NextResponse.json({
        success: true,
        message: 'Product found',
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
        }
      })
    }
    
    // List all products
    const allProducts = await Product.find({}).select('slug name')
    console.log('Test endpoint - all products:', allProducts.length)
    
    return NextResponse.json({
      success: false,
      message: 'Product not found',
      searchedSlug: slug,
      allSlugs: allProducts.map(p => p.slug),
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 })
  }
}
