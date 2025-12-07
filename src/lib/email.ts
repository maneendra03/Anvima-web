import nodemailer from 'nodemailer'

// Support both naming conventions for environment variables
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com'
const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT || '587')
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD
const smtpSecure = (process.env.SMTP_SECURE === 'true') || smtpPort === 465

// Log email configuration (without sensitive data) for debugging
console.log('📧 Email Configuration:', {
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  user: smtpUser ? `${smtpUser.substring(0, 5)}...` : 'NOT SET',
  passSet: !!smtpPass
})

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message)
  } else {
    console.log('✅ Email server is ready to send emails')
  }
})

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || smtpUser || 'noreply@anvimacreations.com'
const FROM_NAME = process.env.FROM_NAME || process.env.EMAIL_FROM?.match(/^([^<]+)/)?.[1]?.trim() || 'Anvima Creations'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent to ${to}`)
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #FFAA8A 0%, #FF8FA6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #3D3D3D; margin-bottom: 20px; font-size: 24px;">Welcome to Anvima, ${name}! 🎉</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for creating an account with us. To complete your registration and start exploring our beautiful collection of customized gifts, please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #2D5A47;">${verificationUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Verify your email - Anvima Creations',
    html,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #FFAA8A 0%, #FF8FA6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #3D3D3D; margin-bottom: 20px; font-size: 24px;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 14px; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #2D5A47;">${resetUrl}</a>
          </p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Reset your password - Anvima Creations',
    html,
  })
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #FFAA8A 0%, #FF8FA6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #3D3D3D; margin-bottom: 20px; font-size: 24px;">Welcome aboard, ${name}! 🎊</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your email has been verified and your account is now active. We're thrilled to have you join the Anvima family!
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            At Anvima Creations, we believe every gift tells a story. Browse our collection of beautifully crafted, personalized gifts perfect for any occasion.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/shop" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Start Shopping
            </a>
          </div>
          <div style="background-color: #F5F0E8; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <h3 style="color: #3D3D3D; margin-top: 0; font-size: 16px;">Here's what you can do:</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li>Browse our exclusive collection</li>
              <li>Customize products with your photos & text</li>
              <li>Track your orders in real-time</li>
              <li>Save favorites to your wishlist</li>
            </ul>
          </div>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to Anvima Creations! 🎉',
    html,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  orderDetails: {
    items: { name: string; quantity: number; price: number }[]
    subtotal: number
    shipping: number
    total: number
    address: string
  }
): Promise<void> {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #FFAA8A 0%, #FF8FA6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #3D3D3D; margin-bottom: 20px; font-size: 24px;">Order Confirmed! 🎁</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            Thank you for your order! We're excited to create something special for you.
          </p>
          <div style="background-color: #F5F0E8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; color: #3D3D3D;"><strong>Order Number:</strong> ${orderNumber}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #F5F0E8;">
                <th style="padding: 12px; text-align: left; color: #3D3D3D;">Item</th>
                <th style="padding: 12px; text-align: center; color: #3D3D3D;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #3D3D3D;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="border-top: 2px solid #F5F0E8; padding-top: 15px;">
            <p style="display: flex; justify-content: space-between; margin: 5px 0; color: #666;">
              <span>Subtotal:</span>
              <span>₹${orderDetails.subtotal.toLocaleString('en-IN')}</span>
            </p>
            <p style="display: flex; justify-content: space-between; margin: 5px 0; color: #666;">
              <span>Shipping:</span>
              <span>${orderDetails.shipping === 0 ? 'FREE' : `₹${orderDetails.shipping.toLocaleString('en-IN')}`}</span>
            </p>
            <p style="display: flex; justify-content: space-between; margin: 15px 0; color: #3D3D3D; font-size: 18px; font-weight: bold;">
              <span>Total:</span>
              <span>₹${orderDetails.total.toLocaleString('en-IN')}</span>
            </p>
          </div>
          <div style="background-color: #F5F0E8; border-radius: 8px; padding: 20px; margin-top: 20px;">
            <h3 style="color: #3D3D3D; margin-top: 0; font-size: 16px;">Shipping Address:</h3>
            <p style="color: #666; margin: 0; white-space: pre-line;">${orderDetails.address}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/account/orders" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Track Order
            </a>
          </div>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Order Confirmed - ${orderNumber} | Anvima Creations`,
    html,
  })
}

export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderNumber: string,
  trackingDetails: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    estimatedDelivery?: string
  }
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #E0E7FF; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🚚</span>
            </div>
            <h2 style="color: #3D3D3D; margin-bottom: 10px; font-size: 24px;">Your Order is On Its Way!</h2>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to you.
          </p>
          ${trackingDetails.carrier || trackingDetails.trackingNumber ? `
          <div style="background-color: #F5F0E8; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #3D3D3D; margin-top: 0; font-size: 16px;">📦 Tracking Information</h3>
            ${trackingDetails.carrier ? `<p style="margin: 5px 0; color: #666;"><strong>Carrier:</strong> ${trackingDetails.carrier}</p>` : ''}
            ${trackingDetails.trackingNumber ? `<p style="margin: 5px 0; color: #666;"><strong>Tracking Number:</strong> <span style="font-family: monospace;">${trackingDetails.trackingNumber}</span></p>` : ''}
            ${trackingDetails.estimatedDelivery ? `<p style="margin: 5px 0; color: #666;"><strong>Estimated Delivery:</strong> ${new Date(trackingDetails.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>` : ''}
          </div>
          ` : ''}
          <div style="text-align: center; margin: 30px 0;">
            ${trackingDetails.trackingUrl ? `
            <a href="${trackingDetails.trackingUrl}" 
               style="display: inline-block; background-color: #4F46E5; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
              Track Package
            </a>
            ` : ''}
            <a href="${APP_URL}/account/orders/${orderNumber}" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Order
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
            We'll notify you once your package has been delivered.
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Your Order Has Shipped! - ${orderNumber} | Anvima Creations`,
    html,
  })
}

export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderNumber: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: #D1FAE5; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🎉</span>
            </div>
            <h2 style="color: #3D3D3D; margin-bottom: 10px; font-size: 24px;">Your Order Has Been Delivered!</h2>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            Your order <strong>#${orderNumber}</strong> has been delivered! We hope you love your purchase.
          </p>
          <div style="background-color: #ECFDF5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="color: #065F46; margin: 0; font-size: 16px;">
              <strong>We'd love to hear from you!</strong><br>
              <span style="font-size: 14px;">Share your experience with others</span>
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/account/orders/${orderNumber}" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Write a Review
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Order Delivered! - ${orderNumber} | Anvima Creations`,
    html,
  })
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  message: string
): Promise<void> {
  const statusConfig: Record<string, { bg: string; text: string; emoji: string; headerBg: string; title: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E', emoji: '⏳', headerBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', title: 'Order Pending' },
    confirmed: { bg: '#DBEAFE', text: '#1E40AF', emoji: '✅', headerBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', title: 'Order Confirmed!' },
    processing: { bg: '#EDE9FE', text: '#5B21B6', emoji: '⚙️', headerBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', title: 'Order Processing' },
    shipped: { bg: '#E0E7FF', text: '#3730A3', emoji: '🚚', headerBg: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)', title: 'Order Shipped!' },
    delivered: { bg: '#D1FAE5', text: '#065F46', emoji: '🎉', headerBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', title: 'Order Delivered!' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B', emoji: '❌', headerBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', title: 'Order Cancelled' },
    refunded: { bg: '#FEF3C7', text: '#92400E', emoji: '💰', headerBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', title: 'Order Refunded' },
  }

  const config = statusConfig[status] || { 
    bg: '#F3F4F6', 
    text: '#374151', 
    emoji: '📦', 
    headerBg: 'linear-gradient(135deg, #FFAA8A 0%, #FF8FA6 100%)',
    title: 'Order Update'
  }

  const statusDisplayName = status.charAt(0).toUpperCase() + status.slice(1)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: ${config.headerBg}; padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background-color: ${config.bg}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">${config.emoji}</span>
            </div>
            <h2 style="color: #3D3D3D; margin-bottom: 10px; font-size: 24px;">${config.title}</h2>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            We have an update on your order <strong>#${orderNumber}</strong>.
          </p>
          <div style="background-color: ${config.bg}; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid ${config.text};">
            <p style="color: ${config.text}; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Current Status
            </p>
            <p style="color: ${config.text}; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">
              ${config.emoji} ${statusDisplayName}
            </p>
            <p style="color: ${config.text}; margin: 0; font-size: 15px; line-height: 1.5;">
              ${message}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/account/orders" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Order Details
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
            Have questions? Reply to this email or contact us at<br>
            <a href="mailto:anvima.creations@gmail.com" style="color: #2D5A47;">anvima.creations@gmail.com</a>
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #666; font-size: 13px; margin: 0 0 8px 0;">
            Thank you for shopping with Anvima Creations! 💝
          </p>
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `${config.title} - Order #${orderNumber} | Anvima Creations`,
    html,
  })
}

export async function sendOrderCancelledEmail(
  email: string,
  name: string,
  orderNumber: string,
  reason?: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; background-color: #FAF7F2; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FDFCFA; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #FDFCFA; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px;">Anvima Creations</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #3D3D3D; margin-bottom: 20px; font-size: 24px;">Order Cancelled</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi ${name},<br><br>
            Your order <strong>#${orderNumber}</strong> has been cancelled.
          </p>
          ${reason ? `
          <div style="background-color: #FEE2E2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #991B1B; margin: 0; font-size: 14px;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6;">
            If you paid for this order, a refund will be processed within 5-7 business days to your original payment method.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${APP_URL}/shop" 
               style="display: inline-block; background-color: #2D5A47; color: #FDFCFA; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Continue Shopping
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Have questions? Contact our support team and we'll be happy to help.
          </p>
        </div>
        <div style="background-color: #F5F0E8; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Anvima Creations. Made with ❤️ in India
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: `Order Cancelled - ${orderNumber} | Anvima Creations`,
    html,
  })
}
