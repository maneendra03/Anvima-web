/**
 * WhatsApp & Push Notification Utility
 * 
 * This module provides functions to send notifications when orders are placed:
 * 1. Push notification via ntfy.sh (free, instant)
 * 2. WhatsApp link generation for manual messaging
 * 3. Email notification (via existing email system)
 */

const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || '916304742807'
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'anvima-orders' // Free push notification service

interface OrderDetails {
  orderNumber: string
  customerName: string
  customerPhone: string
  total: number
  itemsCount: number
  shippingAddress?: string
}

interface CustomOrderDetails {
  requestNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string
  budget: string
  description: string
  deadline: string
}

/**
 * Send instant push notification via ntfy.sh (FREE)
 * Install ntfy app on your phone and subscribe to your topic
 */
async function sendPushNotification(title: string, message: string, priority: 'low' | 'default' | 'high' | 'urgent' = 'high'): Promise<void> {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        'Title': title,
        'Priority': priority,
        'Tags': 'shopping_cart,rupee',
      },
      body: message
    })
    console.log('✅ Push notification sent via ntfy.sh')
  } catch (error) {
    console.error('Failed to send push notification:', error)
  }
}

/**
 * Generate WhatsApp message link for new order notification
 */
export function generateOrderWhatsAppLink(order: OrderDetails): string {
  const message = `🎁 *New Order Received!*

📋 *Order #${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📦 *Items:* ${order.itemsCount} item(s)
💰 *Total:* ₹${order.total.toLocaleString('en-IN')}

${order.shippingAddress ? `📍 *Shipping:*\n${order.shippingAddress}` : ''}

---
Check admin panel for full details.`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`
}

/**
 * Generate WhatsApp message link for custom order notification
 */
export function generateCustomOrderWhatsAppLink(order: CustomOrderDetails): string {
  const message = `✨ *New Custom Order Request!*

📋 *Request #${order.requestNumber}*

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📧 *Email:* ${order.customerEmail}

💰 *Budget:* ${order.budget}
📅 *Deadline:* ${order.deadline}

📝 *Description:*
${order.description.substring(0, 200)}${order.description.length > 200 ? '...' : ''}

---
Check admin panel for full details and reference images.`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodedMessage}`
}

/**
 * Send order notification - Push + WhatsApp link
 */
export async function sendOrderNotification(order: OrderDetails): Promise<void> {
  // 1. Send instant push notification to your phone
  const pushMessage = `Order #${order.orderNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Total: ₹${order.total.toLocaleString('en-IN')}
Items: ${order.itemsCount}`

  await sendPushNotification('🎁 New Order!', pushMessage, 'urgent')
  
  // 2. Log WhatsApp link for reference
  const whatsappLink = generateOrderWhatsAppLink(order)
  console.log('📱 WhatsApp Link:', whatsappLink)
}

/**
 * Send custom order notification
 */
export async function sendCustomOrderNotification(order: CustomOrderDetails): Promise<void> {
  // 1. Send instant push notification
  const pushMessage = `Request #${order.requestNumber}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Budget: ${order.budget}
${order.description.substring(0, 100)}...`

  await sendPushNotification('✨ Custom Order Request!', pushMessage, 'high')
  
  // 2. Log WhatsApp link
  const whatsappLink = generateCustomOrderWhatsAppLink(order)
  console.log('📱 WhatsApp Link:', whatsappLink)
}

/**
 * Format phone number for WhatsApp
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If starts with 0, replace with 91 (India)
  if (digits.startsWith('0')) {
    return '91' + digits.substring(1)
  }
  
  // If doesn't have country code, add 91
  if (digits.length === 10) {
    return '91' + digits
  }
  
  return digits
}
