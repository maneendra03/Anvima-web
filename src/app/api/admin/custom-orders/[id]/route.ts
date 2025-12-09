import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CustomOrder from '@/models/CustomOrder'
import { getAuthUser } from '@/lib/auth/middleware'

// GET - Fetch single custom order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const order = await CustomOrder.findById(id)
      .populate('user', 'name email phone')
      .lean()

    if (!order) {
      return NextResponse.json({ error: 'Custom order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch custom order'
    console.error('Admin custom order fetch error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PATCH - Update custom order status/notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes, quotedPrice } = body

    await dbConnect()

    const updateData: Record<string, unknown> = {}
    
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (quotedPrice !== undefined) updateData.quotedPrice = quotedPrice

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!order) {
      return NextResponse.json({ error: 'Custom order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Custom order updated successfully',
      data: order
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update custom order'
    console.error('Admin custom order update error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Delete custom order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()

    const order = await CustomOrder.findByIdAndDelete(id)

    if (!order) {
      return NextResponse.json({ error: 'Custom order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Custom order deleted successfully'
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete custom order'
    console.error('Admin custom order delete error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
