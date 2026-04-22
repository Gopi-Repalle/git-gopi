# 🌶️ FarmSpice — Farm-to-Door Chilli Powder E-Commerce

Pure chilli powder sourced directly from farmers. No additives, no middlemen.

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS → Vercel
- **Backend**: Node.js + Express → Render
- **Database**: MongoDB Atlas
- **Payments**: Razorpay
- **Images**: Cloudinary
- **Auth**: JWT

## Project Structure
```
farmspice/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/       # Auth middleware
│   ├── server.js        # Entry point
│   ├── .env.example     # Environment variables template
│   └── render.yaml      # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── pages/       # All pages including admin/
│   │   ├── components/  # Navbar, Footer, ProductCard
│   │   ├── context/     # Auth & Cart context
│   │   └── utils/       # API axios instance
│   ├── .env.example     # Frontend env template
│   └── vercel.json      # Vercel deployment config
├── createAdmin.js       # Script to create admin user
└── DEPLOYMENT_GUIDE.md  # Step-by-step deploy instructions
```

## Quick Start

👉 **See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full step-by-step instructions**

## Features

### Customer
- Browse & search chilli powder products
- Filter by heat level, price, rating
- Add to cart, checkout with Razorpay or COD
- Live order tracking
- Reviews & ratings
- Return / refund requests

### Admin Panel (`/admin`)
- Dashboard with revenue & order stats
- Add / edit / delete products with image upload
- Manage orders & update delivery status
- View customer database
- Approve / reject return requests

## Live URLs (after deployment)
- Website: `https://farmspice.vercel.app`
- API: `https://farmspice-backend.onrender.com/api`
- Admin: `https://farmspice.vercel.app/admin`
