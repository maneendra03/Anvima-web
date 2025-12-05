import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Settings from '@/models/Settings'
import { requireAdmin, isAuthenticated } from '@/lib/auth/middleware'

// GET - Fetch settings
export async function GET() {
  try {
    // Verify admin authentication
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    
    // Get or create settings (singleton pattern)
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({})
    }

    // Remove sensitive fields from response for non-essential display
    // But include them since admin needs them for configuration
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await requireAdmin()
    if (!isAuthenticated(authResult)) {
      return authResult
    }

    await dbConnect()
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.store || !body.contact || !body.payment || !body.shipping || !body.email || !body.notifications) {
      return NextResponse.json(
        { error: 'All settings sections are required' },
        { status: 400 }
      )
    }

    // Validate numeric fields
    const numericValidations = [
      { value: body.payment.codMinOrder, name: 'COD Min Order', min: 0 },
      { value: body.payment.codMaxOrder, name: 'COD Max Order', min: 0 },
      { value: body.shipping.freeShippingThreshold, name: 'Free Shipping Threshold', min: 0 },
      { value: body.shipping.flatRateAmount, name: 'Flat Rate Amount', min: 0 },
      { value: body.notifications.lowStockThreshold, name: 'Low Stock Threshold', min: 1 },
    ]

    for (const validation of numericValidations) {
      const num = Number(validation.value)
      if (isNaN(num) || num < validation.min) {
        return NextResponse.json(
          { error: `${validation.name} must be a valid number >= ${validation.min}` },
          { status: 400 }
        )
      }
    }

    // Validate COD order limits
    if (Number(body.payment.codMinOrder) > Number(body.payment.codMaxOrder)) {
      return NextResponse.json(
        { error: 'COD minimum order cannot be greater than maximum order' },
        { status: 400 }
      )
    }

    // Find existing settings or create new
    let settings = await Settings.findOne()
    
    if (settings) {
      // Update existing settings
      settings.store = body.store
      settings.contact = body.contact
      settings.payment = {
        ...body.payment,
        codMinOrder: Number(body.payment.codMinOrder),
        codMaxOrder: Number(body.payment.codMaxOrder)
      }
      settings.shipping = {
        ...body.shipping,
        freeShippingThreshold: Number(body.shipping.freeShippingThreshold),
        flatRateAmount: Number(body.shipping.flatRateAmount)
      }
      settings.email = body.email
      settings.notifications = {
        ...body.notifications,
        lowStockThreshold: Number(body.notifications.lowStockThreshold)
      }
      
      await settings.save()
    } else {
      // Create new settings
      settings = await Settings.create({
        store: body.store,
        contact: body.contact,
        payment: {
          ...body.payment,
          codMinOrder: Number(body.payment.codMinOrder),
          codMaxOrder: Number(body.payment.codMaxOrder)
        },
        shipping: {
          ...body.shipping,
          freeShippingThreshold: Number(body.shipping.freeShippingThreshold),
          flatRateAmount: Number(body.shipping.flatRateAmount)
        },
        email: body.email,
        notifications: {
          ...body.notifications,
          lowStockThreshold: Number(body.notifications.lowStockThreshold)
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
