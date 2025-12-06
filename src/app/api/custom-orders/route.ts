import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CustomOrder from '@/models/CustomOrder'
import { getAuthUser } from '@/lib/auth/middleware'

// Generate unique request number
function generateRequestNumber(): string {
  const prefix = 'CUS'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// POST - Create new custom order request
export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { name, email, phone, description, budget, targetDate, images } = body

    // Validate required fields
    if (!name || !email || !phone || !description) {
      return NextResponse.json(
        { error: 'Name, email, phone, and description are required' },
        { status: 400 }
      )
    }

    // Check if user is logged in
    const user = await getAuthUser()

    // Create custom order
    const customOrder = await CustomOrder.create({
      requestNumber: generateRequestNumber(),
      user: user?.userId,
      name,
      email,
      phone,
      occasion: 'Custom Request', // Default since form doesn't have this field
      budget: budget || 'Not specified',
      deadline: targetDate ? new Date(targetDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 2 weeks
      description,
      images: images?.map((img: { url: string }) => img.url) || [],
      status: 'pending'
    })

    return NextResponse.json({
      success: true,
      message: 'Custom order request submitted successfully',
      requestNumber: customOrder.requestNumber
    })
  } catch (error: any) {
    console.error('Custom order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Fetch custom orders (for logged in users to see their requests)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const requestNumber = searchParams.get('requestNumber')

    if (requestNumber) {
      // Fetch single order by request number
      const order = await CustomOrder.findOne({ 
        requestNumber,
        $or: [
          { user: user.userId },
          { email: user.email }
        ]
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, order })
    }

    // Fetch all orders for the user
    const orders = await CustomOrder.find({
      $or: [
        { user: user.userId },
        { email: user.email }
      ]
    }).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, orders })
  } catch (error: any) {
    console.error('Custom order fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
