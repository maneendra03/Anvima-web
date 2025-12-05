<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Anvima - Customized Gifts E-commerce

This is a Next.js 14+ e-commerce website for Anvima Creations, a customized gifts business.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **Animations**: Framer Motion
- **State Management**: Zustand (for cart)
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   ├── shop/              # Shop page
│   ├── product/[slug]/    # Product detail page
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout page
│   ├── custom-orders/     # Custom orders form
│   ├── about/             # About page
│   ├── faq/               # FAQ & Policies
│   └── contact/           # Contact page
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Homepage sections
│   └── ui/                # Reusable UI components
├── data/                  # Mock data and products
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Design System

### Colors
- **Peach/Blush**: Primary accent colors (#FFAA8A, #FF8FA6)
- **Cream**: Background colors (#FAF7F2, #FDFCFA)
- **Forest**: CTA and branding (#2D5A47)
- **Charcoal**: Text colors (#3D3D3D)

### Typography
- Headlines: Playfair Display (serif)
- Body: Inter (sans-serif)

## Key Features

1. Product customization with live preview
2. Image upload for personalization
3. Cart with persistent storage
4. Multi-step checkout
5. Custom order request form
6. WhatsApp integration
7. Instagram feed section

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
