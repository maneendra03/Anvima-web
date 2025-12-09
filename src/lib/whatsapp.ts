/**
 * WhatsApp Notification Utility
 * 
 * This module provides functions to send WhatsApp notifications
 * when orders are placed. Since WhatsApp Business API requires
 * a paid subscription, we use the web.whatsapp.com API for now.
 */

const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || '916304742807'

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
 * Send order notification - logs the WhatsApp link
 * In production, you would integrate with WhatsApp Business API
 */
export async function sendOrderNotification(order: OrderDetails): Promise<void> {
  const whatsappLink = generateOrderWhatsAppLink(order)
  console.log('📱 WhatsApp Order Notification Link:', whatsappLink)
  
  // TODO: Integrate with WhatsApp Business API for automatic messages
  // For now, the admin can click the link in logs or we can send via email
}

/**
 * Send custom order notification
 */
export async function sendCustomOrderNotification(order: CustomOrderDetails): Promise<void> {
  const whatsappLink = generateCustomOrderWhatsAppLink(order)
  console.log('📱 WhatsApp Custom Order Notification Link:', whatsappLink)
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
