# Jewellery v3 - Full Stack Deployment Guide

## Architecture
- **Frontend**: Vite + React (SPA)
- **Backend**: Express.js API
- **Database**: MongoDB (Atlas)
- **Uploads**: Local `server/uploads/` directory

## One-Click Deploy to Render

### Prerequisites
1. A [Render](https://render.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier)

### Steps

#### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/jewellery-v3.git
git push -u origin main
```

#### 2. Create Render Web Service
1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `jewellery-v3` |
| **Runtime** | `Node` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Root Directory** | `./` (repository root) |
| **Plan** | Free |

#### 3. Set Environment Variables
In Render Dashboard → Environment:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/jewellery?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
ADMIN_EMAIL=admin@jewels.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=Shop Owner
```

#### 4. Deploy
Click **Create Web Service**. Render will:
1. Install root dependencies
2. Install server dependencies
3. Install client dependencies
4. Build the React frontend → `client/dist/`
5. Start the Express server (which serves both API and frontend)

#### 5. Seed the Database
After first deploy, run in Render Shell:
```bash
npm run seed
```
This creates:
- Admin account (use above credentials to login)
- 4 categories (Gold, Silver, Diamond, Platinum)
- 8 sample products
- 3 banners
- 2 offers
- 3 testimonials
- Default site settings

### First Login
1. Visit `https://jewellery-v3.onrender.com/admin/login`
2. Login with: `admin@jewels.com` / `Admin@123`

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure environment
cp .env.example server/.env
# Edit server/.env with your MongoDB URI

# 3. Seed database
npm run seed

# 4. Start development servers
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:5000
- **Admin**: http://localhost:5173/admin/login

## Uploaded Images
On Render's free tier, uploaded files are stored on ephemeral disk and will be lost on restart. For production:

### Option 1: Use Cloudinary (Recommended)
1. Replace `server/src/controllers/uploadController.js` with Cloudinary upload
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars

### Option 2: Persistent Volume (Render Paid)
Add a Render Disk to persist uploads across restarts.

## Customization
To use this template for a different jewellery shop:
1. Change `shopName`, `logo`, `whatsappNumber` in Admin → Settings
2. Upload new banners and products
3. Toggle section visibility in Admin → Settings → Sections
4. Update theme colors, contact info, social links
