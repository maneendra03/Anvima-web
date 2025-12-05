# Anvima - Customized Gifts E-commerce Website

A modern, full-stack e-commerce website for Anvima Creations — a business specializing in customized frames, printed Polaroids, curated hampers, photo gifts, and bespoke items.

![Anvima](https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=400&fit=crop)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Project Structure](#-project-structure)
- [User Workflows](#-user-workflows)
- [Admin Dashboard](#-admin-dashboard)
- [API Documentation](#-api-documentation)
- [Authentication Flow](#-authentication-flow)
- [Payment Integration](#-payment-integration)
- [Email Configuration](#-email-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### For Customers
- **Browse Products**: View all products with filtering by category, price, and tags
- **Product Customization**: Text input, image upload with preview, size/color selection
- **Real-time Price Updates**: Prices update dynamically as options are selected
- **User Authentication**: Register, login, password reset
- **Shopping Cart**: Persistent cart with customization details preserved
- **Wishlist**: Save favorite products for later
- **Order Tracking**: View order history and status updates
- **Multiple Payment Options**: Razorpay integration (Cards, UPI, Net Banking)
- **Custom Orders**: Form for bespoke requests with image uploads
- **WhatsApp Integration**: Floating button for instant customer support
- **Mobile-First Design**: Fully responsive across all devices

### For Admin
- **Dashboard**: Overview of sales, orders, revenue, and key metrics
- **Product Management**: Full CRUD operations for products
- **Category Management**: Organize products into categories
- **Order Management**: View, update status, and manage all orders
- **User Management**: View and manage customer accounts
- **Analytics**: Sales trends, popular products, customer insights

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animations and transitions |
| **Zustand** | Lightweight state management |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email sending |

### External Services
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database (production) |
| **Cloudinary** | Image storage and optimization |
| **Razorpay** | Payment processing |
| **Gmail SMTP** | Transactional emails |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Next.js   │  │   Zustand   │  │   Framer    │              │
│  │    Pages    │  │    Store    │  │   Motion    │              │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘              │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Routes (/api)                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │
│  │  │   Auth   │ │ Products │ │  Orders  │ │  Admin   │   │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │    │
│  └───────┼────────────┼────────────┼────────────┼──────────┘    │
│          │            │            │            │                │
│  ┌───────┴────────────┴────────────┴────────────┴──────────┐    │
│  │                 Mongoose Models                          │    │
│  │  User │ Product │ Category │ Order │ Cart │ Wishlist    │    │
│  └──────────────────────────┬───────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  users   │ │ products │ │  orders  │ │categories│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **MongoDB** (local or Atlas)
- **Git**

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/anvima-web.git
cd anvima-web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start MongoDB (if using local)
brew services start mongodb-community@6.0  # macOS
# or
mongod --dbpath /path/to/data              # manual

# 5. Seed the database
npm run seed

# 6. Start development server
npm run dev

# 7. Open browser
open http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with initial data |

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# ===========================================
# DATABASE
# ===========================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/anvima

# MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/anvima

# ===========================================
# AUTHENTICATION
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters

# JWT Secret for API authentication
JWT_SECRET=your-jwt-secret-key-min-32-characters

# ===========================================
# EMAIL (Nodemailer with Gmail)
# ===========================================
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password    # Use Gmail App Password
EMAIL_FROM=Anvima <noreply@anvima.com>

# ===========================================
# CLOUDINARY (Image Uploads)
# ===========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ===========================================
# RAZORPAY (Payments)
# ===========================================
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# ===========================================
# ADMIN (Initial Setup)
# ===========================================
ADMIN_EMAIL=admin@anvima.com
ADMIN_PASSWORD=admin123456
```

### Environment Variables Explained

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `NEXTAUTH_SECRET` | ✅ | Secret for NextAuth.js sessions |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |
| `EMAIL_SERVER_*` | ⚠️ | Required for email functionality |
| `CLOUDINARY_*` | ⚠️ | Required for image uploads |
| `RAZORPAY_*` | ⚠️ | Required for payments |

---

## 🗄 Database Setup

### MongoDB Models

```
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE SCHEMA                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐       ┌──────────────┐       ┌──────────┐     
│  │   User   │       │   Product    │       │ Category │    │
│  ├──────────┤       ├──────────────┤       ├──────────┤    │
│  │ _id      │       │ _id          │       │ _id      │    │
│  │ name     │       │ name         │◄──────│ name     │    │
│  │ email    │       │ slug         │       │ slug     │    │
│  │ password │       │ description  │       │ image    │    │
│  │ role     │       │ price        │       │ isActive │    │
│  │ wishlist │──┐    │ images[]     │       └──────────┘    │
│  └──────────┘  │    │ category ────┼───────────────┘       │
│                │    │ variants[]   │                        │
│                │    │ isActive     │                        │
│                └───►│ isFeatured   │                        │
│                     └──────────────┘                        │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                       Order                          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ _id, orderNumber, user, items[], shippingAddress,   │   │
│  │ paymentMethod, paymentStatus, orderStatus,          │   │
│  │ subtotal, shipping, discount, total, timestamps     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Seeding Initial Data

The seed script creates:
- **Admin user**: `admin@anvima.com` / `admin123456`
- **Test customer**: `customer@example.com` / `customer123`
- **8 categories**: Photo Frames, Mugs, Cushions, Keychains, etc.
- **10 sample products**: With images, variants, and customization options

```bash
# Run the seed script
npm run seed
```

### MongoDB Commands (Useful)

```bash
# Connect to MongoDB shell
mongosh

# Select database
use anvima

# View collections
show collections

# Count documents
db.products.countDocuments()
db.users.countDocuments()
db.orders.countDocuments()

# Find all products
db.products.find().pretty()

# Find admin user
db.users.findOne({ role: 'admin' })
```

---

## 📁 Project Structure

```
anvima-web/
├── .env.local                 # Environment variables
├── .env.example               # Example env file
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
│
├── scripts/
│   └── seed.ts                # Database seeding script
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   │
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── shop/              # Shop listing
│   │   ├── product/[slug]/    # Product detail
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── orders/            # Order history
│   │   ├── wishlist/          # User wishlist
│   │   ├── profile/           # User profile
│   │   ├── custom-orders/     # Custom order form
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── faq/               # FAQ & policies
│   │   │
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── layout.tsx     # Admin layout with sidebar
│   │   │   ├── page.tsx       # Dashboard overview
│   │   │   ├── products/      # Product management
│   │   │   ├── orders/        # Order management
│   │   │   ├── categories/    # Category management
│   │   │   └── users/         # User management
│   │   │
│   │   └── api/               # API Routes
│   │       ├── auth/          # Authentication endpoints
│   │       ├── products/      # Product endpoints
│   │       ├── categories/    # Category endpoints
│   │       ├── orders/        # Order endpoints
│   │       ├── user/          # User endpoints
│   │       └── admin/         # Admin endpoints
│   │
│   ├── components/
│   │   ├── layout/            # Header, Footer, Sidebar
│   │   ├── home/              # Homepage sections
│   │   ├── shop/              # Shop components
│   │   ├── product/           # Product components
│   │   ├── cart/              # Cart components
│   │   ├── checkout/          # Checkout components
│   │   ├── admin/             # Admin components
│   │   └── ui/                # Reusable UI components
│   │
│   ├── lib/
│   │   ├── mongodb.ts         # MongoDB connection
│   │   ├── auth.ts            # Auth utilities
│   │   └── utils.ts           # Helper functions
│   │
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Order.ts
│   │   └── index.ts
│   │
│   ├── store/                 # Zustand stores
│   │   ├── cart.ts            # Cart state
│   │   ├── auth.ts            # Auth state
│   │   └── wishlist.ts        # Wishlist state
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
└── public/                    # Static assets
    ├── images/
    └── favicon.ico
```

---

## 👤 User Workflows

### 1. Customer Registration & Login

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Register   │────►│   Verify    │────►│    Login    │
│    Form     │     │   Email     │     │    Form     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Dashboard  │
                                        │  (Profile)  │
                                        └─────────────┘
```

**Steps:**
1. User clicks "Register" → fills form (name, email, password)
2. API creates user in MongoDB with hashed password
3. JWT token generated and stored in cookies
4. User redirected to homepage or previous page

### 2. Shopping Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Browse  │───►│  Select  │───►│ Customize│───►│   Add    │───►│ Checkout │
│   Shop   │    │ Product  │    │  Options │    │ to Cart  │    │  & Pay   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                                     │
     ┌───────────────────────────────────────────────────────────────┘
     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Order   │───►│  Track   │───►│ Receive  │
│ Confirm  │    │  Status  │    │ Product  │
└──────────┘    └──────────┘    └──────────┘
```

**Detailed Steps:**

1. **Browse Shop** (`/shop`)
   - View all products with filters (category, price, tags)
   - Pagination support
   - Sort by price, popularity, newest

2. **Select Product** (`/product/[slug]`)
   - View product images (gallery)
   - Read description and reviews
   - Check availability

3. **Customize Product**
   - Add custom text (name, message)
   - Upload images for personalization
   - Select size/color variants
   - See real-time price updates

4. **Add to Cart** (`/cart`)
   - Cart persists in Zustand + localStorage
   - Modify quantities
   - Remove items
   - View customization details

5. **Checkout** (`/checkout`)
   - Enter shipping address
   - Select payment method
   - Apply coupon codes
   - Review order summary

6. **Payment**
   - Razorpay payment modal
   - Support for Cards, UPI, Net Banking
   - Payment verification via webhook

7. **Order Confirmation**
   - Order created in database
   - Confirmation email sent
   - Order number generated

8. **Track Order** (`/orders`)
   - View order history
   - Track order status
   - Download invoice

### 3. Order Status Flow

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌───────────┐    ┌───────────┐
│ Pending  │───►│ Confirmed │───►│Processing│───►│  Shipped  │───►│ Delivered │
└──────────┘    └───────────┘    └──────────┘    └───────────┘    └───────────┘
     │                                                                   │
     └──────────────────────► Cancelled ◄────────────────────────────────┘
```

---

## 🔐 Admin Dashboard

### Accessing Admin

1. Navigate to `/admin`
2. Login with admin credentials
3. Access dashboard features

**Default Admin:**
- Email: `admin@anvima.com`
- Password: `admin123456`

### Admin Features

#### Dashboard (`/admin`)
```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Orders  │  │ Revenue  │  │ Products │  │  Users   │    │
│  │    45    │  │ ₹89,450  │  │    24    │  │   156    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Recent Orders                          │     │
│  │  #ORD-001  │  John Doe  │  ₹1,299  │  Processing  │     │
│  │  #ORD-002  │  Jane Doe  │  ₹2,499  │  Shipped     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Product Management (`/admin/products`)
- View all products with search & filters
- Add new products with images
- Edit product details, prices, variants
- Toggle active/featured status
- Delete products

#### Order Management (`/admin/orders`)
- View all orders with filters (status, date)
- Update order status
- View order details and items
- Customer information
- Payment status

#### Category Management (`/admin/categories`)
- Add/edit/delete categories
- Set category images
- Reorder categories
- Toggle active status

#### User Management (`/admin/users`)
- View all registered users
- User details and order history
- Toggle user status

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/[slug]` | Get single product |
| GET | `/api/products/featured` | Get featured products |

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/[slug]` | Get category with products |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/[id]` | Get order details |
| POST | `/api/orders` | Create new order |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/wishlist` | Get wishlist |
| POST | `/api/user/wishlist` | Add to wishlist |
| DELETE | `/api/user/wishlist` | Remove from wishlist |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET/POST | `/api/admin/products` | List/Create products |
| GET/PUT/DELETE | `/api/admin/products/[id]` | Product CRUD |
| GET/POST | `/api/admin/categories` | List/Create categories |
| GET/PUT/DELETE | `/api/admin/categories/[id]` | Category CRUD |
| GET | `/api/admin/orders` | List all orders |
| GET/PUT | `/api/admin/orders/[id]` | Order details/update |
| GET | `/api/admin/users` | List all users |
| GET/PUT | `/api/admin/users/[id]` | User details/update |

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}

// Paginated Response
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🔒 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN REQUEST
   ┌────────┐         ┌────────┐         ┌────────┐
   │ Client │────────►│  API   │────────►│MongoDB │
   │        │ POST    │/login  │  Find   │        │
   │        │email,pwd│        │  User   │        │
   └────────┘         └───┬────┘         └────────┘
                          │
2. VERIFY PASSWORD        │
   ┌──────────────────────┴──────────────────────┐
   │  bcrypt.compare(password, hashedPassword)   │
   └──────────────────────┬──────────────────────┘
                          │
3. GENERATE JWT           │
   ┌──────────────────────┴──────────────────────┐
   │  jwt.sign({ userId, role }, JWT_SECRET)     │
   └──────────────────────┬──────────────────────┘
                          │
4. SET COOKIE             │
   ┌──────────────────────┴──────────────────────┐
   │  Set-Cookie: token=xxx; HttpOnly; Secure    │
   └──────────────────────┬──────────────────────┘
                          │
5. SUBSEQUENT REQUESTS    ▼
   ┌────────┐         ┌────────┐
   │ Client │────────►│  API   │
   │        │ Cookie  │Verify  │
   │        │ token   │  JWT   │
   └────────┘         └────────┘
```

### Protected Routes

```typescript
// Middleware checks for these routes:
- /admin/*     → Requires admin role
- /orders/*    → Requires authentication
- /profile/*   → Requires authentication
- /wishlist/*  → Requires authentication
- /checkout/*  → Requires authentication
```

---

## 💳 Payment Integration (Razorpay)

### Setup Razorpay

1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get API keys (Test mode for development)
3. Add to `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your-secret-key
   ```

### Payment Flow

```
┌────────┐    ┌────────┐    ┌──────────┐    ┌──────────┐
│Checkout│───►│ Create │───►│ Razorpay │───►│  Verify  │
│  Page  │    │ Order  │    │  Modal   │    │ Payment  │
└────────┘    └───┬────┘    └────┬─────┘    └────┬─────┘
                  │              │               │
                  ▼              ▼               ▼
            ┌──────────┐   ┌──────────┐    ┌──────────┐
            │ Order ID │   │ Payment  │    │  Update  │
            │ Created  │   │ Success  │    │  Order   │
            └──────────┘   └──────────┘    └──────────┘
```

---

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on Google Account
2. Generate App Password:
   - Go to Google Account → Security
   - App passwords → Generate new
   - Copy 16-character password

3. Update `.env.local`:
   ```
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=xxxx-xxxx-xxxx-xxxx
   EMAIL_FROM=Anvima <your-email@gmail.com>
   ```

### Email Templates

| Email Type | Trigger | Content |
|------------|---------|---------|
| Welcome | Registration | Welcome message, getting started |
| Order Confirmation | Order placed | Order details, items, total |
| Order Shipped | Status update | Tracking info, delivery date |
| Password Reset | Forgot password | Reset link (expires in 1 hour) |

---

## 🎨 Design System

### Color Palette

| Color | Hex | CSS Variable | Usage |
|-------|-----|--------------|-------|
| Peach | `#FFAA8A` | `--color-peach` | Primary accent |
| Blush | `#FF8FA6` | `--color-blush` | Secondary accent |
| Cream | `#FAF7F2` | `--color-cream` | Background |
| Forest | `#2D5A47` | `--color-forest` | CTAs, branding |
| Charcoal | `#3D3D3D` | `--color-charcoal` | Text |

### Typography

| Type | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Playfair Display | 600, 700 | h1, h2, h3 |
| Body | Inter | 400, 500, 600 | Paragraphs, buttons |

### Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... add all variables
```

### Environment Variables for Production

```bash
# Required for production
MONGODB_URI=mongodb+srv://...        # MongoDB Atlas
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<random-32-char>
JWT_SECRET=<random-32-char>

# Generate secure secrets:
openssl rand -base64 32
```

### Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Razorpay live keys configured
- [ ] Email service verified
- [ ] Cloudinary configured
- [ ] Error monitoring (Sentry)
- [ ] Analytics (Google Analytics)

---

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: MongoServerSelectionError
```
**Solution:** 
- Check if MongoDB is running: `brew services list`
- Verify `MONGODB_URI` in `.env.local`
- For Atlas: Check IP whitelist

#### JWT Token Invalid
```
Error: JsonWebTokenError
```
**Solution:**
- Clear browser cookies
- Check `JWT_SECRET` matches
- Re-login

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Image Upload Fails
**Solution:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure correct file types (jpg, png, webp)

### Logs & Debugging

```bash
# Development with detailed logs
DEBUG=* npm run dev

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

---

## 📞 Support

For technical support or customizations:
- **Email**: developer@anvima.com
- **GitHub Issues**: [Create Issue](https://github.com/your-repo/issues)

---

## 📄 License

MIT License - feel free to use for your own projects.

---

Built with ❤️ for Anvima Creations

**Instagram**: [@anvima.creations](https://instagram.com/anvima.creations)
**Website**: [anvima.com](https://anvima.com)
