import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    // Verify connection
    await transporter.verify()
    
    // Send test email
    await transporter.sendMail({
      from: `"Anvima Creations" <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.EMAIL_SERVER_USER, // Send to self for testing
      subject: '✅ Anvima Email Test - Success!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #FAF7F2;">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
            <h1 style="color: #2D5A47; margin-bottom: 20px;">🎉 Email Service Working!</h1>
            <p style="color: #3D3D3D;">Your Anvima email configuration is successful.</p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully! Check your inbox.' 
    })
  } catch (error: any) {
    console.error('Email test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Make sure you have enabled 2FA and created an App Password in your Google Account'
    }, { status: 500 })
  }
}
