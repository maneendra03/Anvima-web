import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Newsletter from '@/models/Newsletter'

// POST - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, name, source = 'website' } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() })
    
    if (existing) {
      if (existing.isSubscribed) {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' }
        )
      } else {
        // Re-subscribe
        existing.isSubscribed = true
        existing.subscribedAt = new Date()
        existing.unsubscribedAt = undefined
        await existing.save()
        
        return NextResponse.json(
          { success: true, message: 'Welcome back! You have been re-subscribed.' }
        )
      }
    }

    // Create new subscription
    await Newsletter.create({
      email: email.toLowerCase(),
      name,
      source,
      isSubscribed: true,
      subscribedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! You\'ll receive updates about new products and offers.',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const subscription = await Newsletter.findOne({ email: email.toLowerCase() })
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      )
    }

    subscription.isSubscribed = false
    subscription.unsubscribedAt = new Date()
    await subscription.save()

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed successfully.',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to unsubscribe. Please try again.' },
      { status: 500 }
    )
  }
}
