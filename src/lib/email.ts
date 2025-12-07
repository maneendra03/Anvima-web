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

// Shared professional email wrapper for order emails
function buildOrderEmailHTML({
  title,
  subtitle,
  bodyHtml,
  ctaUrl,
  ctaText,
  note
}: {
  title: string
  subtitle?: string
  bodyHtml: string
  ctaUrl?: string
  ctaText?: string
  note?: string
}) {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      /* Reset */
      body { margin:0; padding:0; background:#FAF7F2; font-family: Inter, Arial, sans-serif; }
      a { color: #2D5A47; text-decoration: none; }
      .container { max-width:680px; margin:24px auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(15,23,42,0.06); }
      .header { background: linear-gradient(90deg,#FFAA8A 0%,#FF8FA6 100%); padding:24px 28px; text-align:left; color:#fff }
      .logo { font-family: 'Playfair Display', Georgia, serif; font-size:20px; font-weight:700 }
      .preheader { font-size:13px; color:#f7efe9; opacity:0.95; margin-top:6px }
      .body { padding:28px; color:#334155 }
      .title { font-size:20px; color:#0f172a; margin:0 0 10px; }
      .subtitle { font-size:14px; color:#475569; margin:0 0 18px }
      .card { background:#F5F0E8; border-left:4px solid #2D5A47; padding:16px; border-radius:8px; margin:16px 0 }
      .cta { display:inline-block; background:#2D5A47; color:#fff; padding:12px 20px; border-radius:8px; font-weight:600 }
      .muted { color:#64748b; font-size:13px }
      .footer { background:#F7F5F2; padding:18px 28px; font-size:13px; color:#64748b }
      .small { font-size:12px; color:#94a3b8 }
      .meta { font-size:13px; color:#0f172a; margin:8px 0 0; }
      .table { width:100%; border-collapse:collapse; margin-top:12px }
      .table th { text-align:left; font-size:13px; color:#475569; padding:8px 0 }
      .table td { padding:8px 0; font-size:14px; color:#0f172a }
      @media (max-width:520px){ .container{ margin:12px; } .body{ padding:18px } }
    </style>
  </head>
  <body>
    <div class="container" role="article" aria-roledescription="email">
      <div class="header">
        <div class="logo">Anvima Creations</div>
        <div class="preheader">${subtitle || 'A quick update about your order'}</div>
      </div>

      <div class="body">
        <h1 class="title">${title}</h1>
        ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}

        ${bodyHtml}

        ${ctaUrl ? `<p style="text-align:center; margin-top:20px"><a href="${ctaUrl}" class="cta">${ctaText || 'View Order'}</a></p>` : ''}

        ${note ? `<p class="muted small" style="margin-top:18px">${note}</p>` : ''}

        <div style="margin-top:22px" class="small">
          <p style="margin:0"><strong>Need help?</strong> Reply to this email or contact <a href="mailto:anvima.creations@gmail.com">anvima.creations@gmail.com</a></p>
        </div>
      </div>

      <div class="footer">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-weight:600;color:#0f172a">Anvima Creations</div>
            <div class="small">Handmade & personalized gifts — crafted with care</div>
          </div>
          <div class="small">© ${new Date().getFullYear()} Anvima Creations</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `
}

// Reworked: Order email functions using the professional wrapper
export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderNumber: string,
  trackingDetails: { carrier?: string; trackingNumber?: string; trackingUrl?: string; estimatedDelivery?: string }
): Promise<void> {
  const bodyHtml = `
    <p style="margin:0 0 12px">Good news, ${name}! Your order <strong>#${orderNumber}</strong> has left our facility and is on its way to you.</p>

    <div class="card">
      <div style="font-weight:600; margin-bottom:8px">Shipping Information</div>
      <div class="meta">${trackingDetails.carrier ? `Carrier: ${trackingDetails.carrier}` : 'Carrier: —'}</div>
      <div class="meta">${trackingDetails.trackingNumber ? `Tracking #${trackingDetails.trackingNumber}` : 'Tracking #: —'}</div>
      ${trackingDetails.estimatedDelivery ? `<div class="meta">Estimated delivery: ${new Date(trackingDetails.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>` : ''}
    </div>

    ${trackingDetails.trackingUrl ? `<p style="margin:0">Track your package: <a href="${trackingDetails.trackingUrl}">${trackingDetails.trackingUrl}</a></p>` : ''}
  `

  const html = buildOrderEmailHTML({
    title: 'Your order is on the way',
    subtitle: `Order #${orderNumber} — Shipped`,
    bodyHtml,
    ctaUrl: `${APP_URL}/account/orders/${orderNumber}`,
    ctaText: 'Track Order',
  })

  await sendEmail({ to: email, subject: `Your order has shipped — #${orderNumber}`, html })
}

export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderNumber: string
): Promise<void> {
  const bodyHtml = `
    <p style="margin:0 0 12px">Hi ${name}, we wanted to let you know that your order <strong>#${orderNumber}</strong> has been delivered. We hope it brings a smile!</p>
    <div class="card">
      <div style="font-weight:600">Delivery details</div>
      <div class="meta">If you did not receive the package or have concerns, please contact our support team.</div>
    </div>
    <p style="margin:0">We would love your feedback — consider leaving a review for your purchase.</p>
  `

  const html = buildOrderEmailHTML({
    title: 'Delivered — we hope you love it',
    subtitle: `Order #${orderNumber} — Delivered`,
    bodyHtml,
    ctaUrl: `${APP_URL}/account/orders/${orderNumber}`,
    ctaText: 'View Order & Review',
  })

  await sendEmail({ to: email, subject: `Order delivered — #${orderNumber}`, html })
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  message: string
): Promise<void> {
  const bodyHtml = `
    <p style="margin:0 0 12px">Hello ${name}, here’s the latest update on your order <strong>#${orderNumber}</strong>.</p>
    <div class="card">
      <div style="font-weight:600">Status update</div>
      <div class="meta" style="margin-top:8px;">${message}</div>
    </div>
  `

  const html = buildOrderEmailHTML({
    title: 'Order status updated',
    subtitle: `Order #${orderNumber} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    bodyHtml,
    ctaUrl: `${APP_URL}/account/orders/${orderNumber}`,
    ctaText: 'View Order Details',
  })

  await sendEmail({ to: email, subject: `Order update — #${orderNumber} — ${status}`, html })
}

export async function sendOrderCancelledEmail(
  email: string,
  name: string,
  orderNumber: string,
  reason?: string
): Promise<void> {
  const bodyHtml = `
    <p style="margin:0 0 12px">Hi ${name}, your order <strong>#${orderNumber}</strong> has been cancelled.</p>
    ${reason ? `<div class="card"><div style="font-weight:600">Reason</div><div class="meta" style="margin-top:8px">${reason}</div></div>` : ''}
    <p style="margin:0 0 8px">If a payment was captured, a refund will be processed as per our policy. Reach out if you need assistance.</p>
  `

  const html = buildOrderEmailHTML({
    title: 'Order cancelled',
    subtitle: `Order #${orderNumber} — Cancelled`,
    bodyHtml,
    ctaUrl: `${APP_URL}/shop`,
    ctaText: 'Browse more gifts',
  })

  await sendEmail({ to: email, subject: `Order cancelled — #${orderNumber}`, html })
}
