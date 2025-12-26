import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@anvimacreations.com'

interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const body: ContactForm = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Send email notification to admin
    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[Contact Form] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Contact Form Submission</h2>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
              <p><strong>Subject:</strong> ${subject}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This message was sent from the Anvima website contact form.
            </p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send contact email:', emailError)
      // Continue even if email fails - we'll log it
    }

    // Send confirmation email to user
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message - Anvima Creations',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will get back to you within 24-48 hours.</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p>In the meantime, feel free to browse our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://anvimacreations.com'}/shop" style="color: #2D5A47;">latest collections</a>.</p>
            <p>Best regards,<br>The Anvima Team</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24-48 hours.',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
