import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { getAuthUser } from '@/lib/auth/middleware'

// Update single product stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params
    const { stock, lowStockThreshold, adjustment, reason } = await request.json()

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // If adjustment is provided, add/subtract from current stock
    let newStock = stock
    if (adjustment !== undefined) {
      newStock = Math.max(0, product.stock + adjustment)
    }

    const updateData: any = { stock: newStock }
    if (lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = lowStockThreshold
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('name stock lowStockThreshold')

    // Log the inventory change (you can extend this to a separate collection)
    console.log(`📦 Inventory updated: ${product.name} | ${product.stock} → ${newStock} | Reason: ${reason || 'Manual adjustment'}`)

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      previousStock: product.stock,
      newStock: newStock
    })
  } catch (error: any) {
    console.error('Stock update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
