# Jewellery v3 — Full-Stack Jewellery Shop Template

A premium, fully-customizable full-stack jewellery shop website with admin dashboard, WhatsApp order integration, and responsive luxury UI.

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt (multi-admin support)
- **Storage**: Local image uploads (upgradeable to Cloudinary)
- **Deployment**: Render (single web service)

## Features

### Client Website
- Hero banner slider with auto-rotation
- Product catalog with category/purity/price filtering
- Product detail page with image gallery and specs
- Responsive product grid (1/2/3/4 columns)
- WhatsApp enquiry and order integration
- Cart system with order form → WhatsApp redirect
- About, Contact pages with enquiry form
- Dark/light mode toggle
- SEO meta tags
- Gold rate ticker
- Framer Motion animations

### Admin Dashboard
- Secure JWT login (multi-admin)
- Dashboard overview with stats
- Product CRUD with image upload
- Category management with visibility toggle
- Banner, Offer, Testimonial CRUD
- Order management with status updates
- Enquiry management with WhatsApp quick reply
- Settings: branding, contact, theme colors, metal rates
- **Section Visibility**: Hide/show entire categories from the website

### WhatsApp Order Flow
1. Customer adds products to cart
2. Fills order form
3. Order saved to database
4. Pre-formatted WhatsApp message opens automatically
5. Admin can also reply via WhatsApp from dashboard

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure environment
cp .env.example server/.env
# Edit MONGODB_URI in server/.env

# 3. Seed database
npm run seed

# 4. Start development
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000
- Admin: http://localhost:5173/admin/login
- Login: `admin@jewels.com` / `Admin@123`

## Customization

This template is designed to work for any jewellery shop by changing:
1. **Shop Name, Logo** → Admin → Settings → Branding
2. **Banners** → Admin → Banners
3. **Categories** → Admin → Categories
4. **Products** → Admin → Products
5. **Theme Colors** → Admin → Settings → Branding
6. **WhatsApp Number** → Admin → Settings → Contact
7. **Section Visibility** → Admin → Settings → Sections

## Project Structure

```
jewellery-v3/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # Button, Input, Modal, Card, etc.
│   │   │   ├── layout/        # Navbar, Footer, AdminLayout
│   │   │   ├── home/          # HeroSlider, CategoryGrid, etc.
│   │   │   ├── products/      # ProductCard, ImageGallery, Filters
│   │   │   └── shared/        # WhatsAppButton, ThemeToggle, etc.
│   │   ├── context/           # Auth, Theme, Cart, Settings
│   │   ├── hooks/             # useProducts, useCategories, etc.
│   │   ├── pages/             # All page components
│   │   │   └── admin/         # Admin dashboard pages
│   │   └── lib/               # API client, utils, constants
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── models/            # Mongoose schemas (9 models)
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Auth, upload
│   │   └── utils/             # Response helpers, WhatsApp formatter
│   ├── uploads/               # Uploaded images
│   └── seed.js                # Database seeder
│
├── package.json               # Root scripts
├── .env.example
└── DEPLOYMENT.md
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | - | List products with filters |
| GET | /api/products/:slug | - | Product detail |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/:id | Admin | Update product |
| DELETE | /api/products/:id | Admin | Delete product |
| GET | /api/categories | - | List categories |
| POST | /api/categories | Admin | Create category |
| PUT | /api/categories/:id | Admin | Update category |
| DELETE | /api/categories/:id | Admin | Delete category |
| GET | /api/banners | - | Active banners |
| GET | /api/offers | - | Active offers |
| GET | /api/testimonials | - | All testimonials |
| POST | /api/orders | - | Place order |
| PUT | /api/orders/:id/status | Admin | Update order |
| POST | /api/enquiries | - | Submit enquiry |
| POST | /api/auth/login | - | Admin login |
| POST | /api/auth/register | Admin | Create admin |
| PUT | /api/settings | Admin | Update settings |
| POST | /api/upload | Admin | Upload images |

## License

MIT
