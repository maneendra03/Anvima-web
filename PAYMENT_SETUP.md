# Anvima Payment Integration Guide (Razorpay)

## Overview

The Anvima e-commerce website uses **Razorpay** for secure payment processing. The integration supports:
- UPI (GPay, PhonePe, Paytm, etc.)
- Credit/Debit Cards
- Net Banking
- Wallets (Paytm, PhonePe, etc.)
- EMI options

## Setup Instructions

### 1. Razorpay Account Setup

1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get your API keys from Dashboard → Settings → API Keys

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Keys (Get from Razorpay Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_xxxxx          # Use rzp_live_xxxxx for production
RAZORPAY_KEY_SECRET=xxxxx               # Your secret key

# Razorpay Webhook Secret (Get after setting up webhook endpoint)
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### 3. Webhook Configuration

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Click "Add New Webhook"
3. Enter your webhook URL:
   - **Development**: Use ngrok to expose localhost
   - **Production**: `https://yourdomain.com/api/payment/webhook`
4. Select events to listen for:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
   - `refund.created`
5. Set a webhook secret and add it to `RAZORPAY_WEBHOOK_SECRET`

### 4. Test the Integration Locally

#### Using ngrok for Webhook Testing

```bash
# Install ngrok
brew install ngrok

# Start your Next.js server
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Use the ngrok URL for webhook: https://xxxx.ngrok.io/api/payment/webhook
```

#### Test Card Numbers

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Mastercard (Success) | 5267 3181 8797 5449 | Any 3 digits | Any future date |
| Visa (Success) | 4111 1111 1111 1111 | Any 3 digits | Any future date |

#### Test UPI IDs
- `success@razorpay` - Payment succeeds
- `failure@razorpay` - Payment fails

#### Test Net Banking
- Select any bank in test mode - all will succeed

## Payment Flow

### Checkout Process

1. **Cart Review**: User reviews items in cart
2. **Shipping Address**: User enters/selects shipping address
3. **Payment Selection**: User selects payment method (Online/COD)
4. **Razorpay Checkout**: Razorpay popup opens for online payment
5. **Verification**: Payment signature verified on server
6. **Confirmation**: Order confirmed, success page shown

### Technical Flow

```
User clicks "Pay Now"
       ↓
Frontend: POST /api/payment/create-order
       ↓
Backend: Creates Razorpay Order
       ↓
Razorpay: Returns order_id
       ↓
Frontend: Opens Razorpay Checkout popup
       ↓
User: Completes payment (UPI/Card/etc.)
       ↓
Razorpay: Returns payment response
       ↓
Frontend: POST /api/payment/verify
       ↓
Backend: Verifies signature, updates order
       ↓
User redirected to success page
```

## API Endpoints

### Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Creates Razorpay Order |
| POST | `/api/payment/verify` | Verifies payment signature |
| POST | `/api/payment/webhook` | Handles Razorpay webhook events |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/[id]` | Get order details |
| PUT | `/api/orders/[id]` | Update/Cancel order |
| GET | `/api/user/orders` | Get user's orders |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/[id]` | Get order details |
| PUT | `/api/admin/orders/[id]` | Update order status |

## Order Statuses

### Order Status
- `pending` - Order created, awaiting payment
- `confirmed` - Payment confirmed
- `processing` - Order being prepared
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

### Payment Status
- `pending` - Payment not yet processed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

## Testing Checklist

- [ ] Test successful card payment
- [ ] Test successful UPI payment
- [ ] Test net banking payment
- [ ] Test payment failure scenario
- [ ] Verify order appears in user dashboard
- [ ] Verify order appears in admin dashboard
- [ ] Test order cancellation
- [ ] Test webhook events
- [ ] Test COD order flow
- [ ] Test mobile responsiveness

## Production Checklist

- [ ] Switch to live Razorpay keys (`rzp_live_`)
- [ ] Update webhook URL in Razorpay dashboard
- [ ] Update RAZORPAY_WEBHOOK_SECRET
- [ ] Enable required payment methods in dashboard
- [ ] Test a real payment (can refund immediately)
- [ ] Set up Razorpay notifications/alerts
- [ ] Configure auto-capture in Razorpay dashboard

## Razorpay Dashboard Settings

### Recommended Settings

1. **Payment Capture**: Set to "Automatic" for instant capture
2. **Payment Methods**: Enable UPI, Cards, Net Banking, Wallets
3. **Refunds**: Enable instant refunds for better UX
4. **Notifications**: Set up email/SMS notifications

## Troubleshooting

### Common Issues

1. **"Invalid Key" Error**
   - Check RAZORPAY_KEY_ID is correct
   - Verify you're using test keys in development

2. **"Signature Verification Failed"**
   - Check RAZORPAY_KEY_SECRET is correct
   - Ensure order_id and payment_id match

3. **Webhook not receiving events**
   - Check webhook URL is accessible (use ngrok locally)
   - Verify RAZORPAY_WEBHOOK_SECRET matches
   - Check Razorpay dashboard for webhook logs

4. **Payment popup not opening**
   - Ensure Razorpay script is loaded
   - Check browser console for errors
   - Verify RAZORPAY_KEY_ID is exposed to frontend

5. **Order not updating after payment**
   - Check webhook logs in Razorpay dashboard
   - Verify /api/payment/verify is being called
   - Check server logs for errors

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages.

## Refunds

To process refunds via Razorpay:

```javascript
// Server-side refund
const refund = await razorpay.payments.refund(paymentId, {
  amount: amountInPaise, // Optional, full refund if not specified
  speed: 'optimum', // or 'normal'
  notes: {
    reason: 'Customer request'
  }
})
```

## Support

For Razorpay-specific issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [API Reference](https://razorpay.com/docs/api/)
