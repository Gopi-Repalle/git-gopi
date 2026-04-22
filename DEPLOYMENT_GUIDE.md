# 🌶️ FarmSpice — Full Deployment Guide

## What You're Deploying
- **Frontend**: React + Tailwind CSS → Vercel (free)
- **Backend**: Node.js + Express → Render (free)
- **Database**: MongoDB Atlas (free tier)
- **Images**: Cloudinary (free tier)
- **Payments**: Razorpay

---

## STEP 1 — Set Up MongoDB Atlas (5 minutes)

1. Go to **https://mongodb.com/atlas** → Sign Up (free)
2. Create a new project → Click **"Build a Database"**
3. Choose **Free tier (M0)** → Select region nearest to India → Create
4. **Database Access** → Add User:
   - Username: `farmspice`
   - Password: (generate a strong one, SAVE IT)
   - Role: `Atlas Admin`
5. **Network Access** → Add IP Address → **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **Connect** → **"Connect your application"** → Copy the connection string

   It looks like:
   ```
   mongodb+srv://farmspice:PASSWORD@cluster0.xxxxx.mongodb.net/
   ```

   Change it to:
   ```
   mongodb+srv://farmspice:PASSWORD@cluster0.xxxxx.mongodb.net/farmspice?retryWrites=true&w=majority
   ```
   ✅ **Save this — it's your MONGODB_URI**

---

## STEP 2 — Set Up Cloudinary (3 minutes)

1. Go to **https://cloudinary.com** → Sign Up (free)
2. After login, go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

   ✅ **Save these 3 values**

---

## STEP 3 — Set Up Razorpay (5 minutes)

1. Go to **https://razorpay.com** → Sign Up
2. Go to **Settings → API Keys**
3. Click **Generate Test Key**
4. Copy:
   - Key ID (starts with `rzp_test_`)
   - Key Secret

   ✅ **Save these 2 values**

> For live payments later, generate **Live Keys** after completing KYC.

---

## STEP 4 — Push Code to GitHub (3 minutes)

1. Go to **https://github.com** → New Repository
2. Name it: `farmspice` → Public → Create

3. Open your terminal (or Git Bash on Windows):
   ```bash
   cd farmspice          # go into the project folder
   git init
   git add .
   git commit -m "Initial FarmSpice commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/farmspice.git
   git push -u origin main
   ```

   ✅ **Code is now on GitHub**

---

## STEP 5 — Deploy Backend on Render (5 minutes)

1. Go to **https://render.com** → Sign Up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo → Select `farmspice`
4. Configure:
   | Field | Value |
   |-------|-------|
   | Name | `farmspice-backend` |
   | Root Directory | `backend` |
   | Environment | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Plan | Free |

5. Scroll down to **Environment Variables** → Add these one by one:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas URI from Step 1 |
   | `JWT_SECRET` | Any long random string (e.g. `FarmSpice2024SuperSecret!XYZ#123`) |
   | `FRONTEND_URL` | `https://farmspice.vercel.app` (update after Step 6) |
   | `RAZORPAY_KEY_ID` | Your Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret |
   | `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Your Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
   | `NODE_ENV` | `production` |

6. Click **"Create Web Service"**
7. Wait 2–3 minutes for deploy

8. Copy your backend URL — it looks like:
   ```
   https://farmspice-backend.onrender.com
   ```
   ✅ **Your API is live!**

---

## STEP 6 — Deploy Frontend on Vercel (3 minutes)

1. Go to **https://vercel.com** → Sign Up with GitHub
2. Click **"New Project"** → Import your `farmspice` repo
3. Configure:
   | Field | Value |
   |-------|-------|
   | Root Directory | `frontend` |
   | Framework | Create React App |
   | Build Command | `npm run build` |
   | Output Directory | `build` |

4. Add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://farmspice-backend.onrender.com/api` |
   | `REACT_APP_RAZORPAY_KEY_ID` | Your Razorpay Key ID |

5. Click **"Deploy"**
6. Wait 1–2 minutes

   ✅ **Your website is live at:**
   ```
   https://farmspice.vercel.app
   ```

---

## STEP 7 — Go Back and Fix FRONTEND_URL on Render (1 minute)

1. Go to Render → Your backend service → **Environment**
2. Update `FRONTEND_URL` to your actual Vercel URL:
   ```
   https://farmspice.vercel.app
   ```
3. Click **Save** — Render will redeploy automatically

---

## STEP 8 — Create Admin Account & Seed Products (5 minutes)

### Create Admin User

1. First, **register a normal account** on your live site at:
   ```
   https://farmspice.vercel.app/register
   ```
   Use your email, e.g. `admin@farmspice.in`

2. Open your terminal, go to the project folder:
   ```bash
   cd farmspice
   ```

3. Create a `.env` file in the root with your MongoDB URI:
   ```
   MONGODB_URI=mongodb+srv://farmspice:PASSWORD@cluster0.xxxxx.mongodb.net/farmspice?retryWrites=true&w=majority
   ```

4. Run:
   ```bash
   npm install mongoose bcryptjs dotenv
   node createAdmin.js
   ```
   You'll see: `✅ Existing user promoted to admin`

5. Log into your site — you'll see **"Admin Panel"** in the navbar!

### Seed Sample Products

After logging in as admin:

1. Open browser DevTools → Console, or use any API tool (Postman / Thunder Client)
2. First login to get your token:
   ```
   POST https://farmspice-backend.onrender.com/api/auth/login
   Body: { "email": "admin@farmspice.in", "password": "YourPassword" }
   ```
3. Copy the token from the response
4. Call the seed endpoint:
   ```
   POST https://farmspice-backend.onrender.com/api/admin/seed
   Headers: Authorization: Bearer YOUR_TOKEN
   ```
5. 4 sample chilli powder products will appear on your site!

---

## Your Live URLs

| Service | URL |
|---------|-----|
| 🌐 Website | `https://farmspice.vercel.app` |
| 🔧 API | `https://farmspice-backend.onrender.com/api` |
| 👑 Admin | `https://farmspice.vercel.app/admin` |
| 📦 Track Order | `https://farmspice.vercel.app/track` |

---

## Local Development (Run on your computer)

### Backend
```bash
cd farmspice/backend
cp .env.example .env     # copy env file
# Fill in your values in .env
npm install
npm run dev              # runs on http://localhost:5000
```

### Frontend
```bash
cd farmspice/frontend
cp .env.example .env     # copy env file
# Set REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                # runs on http://localhost:3000
```

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/profile` | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:id` | Product detail |
| POST | `/api/products` | Admin: add product |
| PUT | `/api/products/:id` | Admin: edit product |
| DELETE | `/api/products/:id` | Admin: delete product |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place order |
| GET | `/api/orders/my` | My orders |
| GET | `/api/orders/track/:orderId` | Track by order ID |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders` | Admin: all orders |
| PUT | `/api/orders/:id/status` | Admin: update status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/product/:id` | Get reviews |
| POST | `/api/reviews` | Add review |

### Returns
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/returns` | Request return |
| GET | `/api/returns/my` | My returns |
| GET | `/api/returns` | Admin: all returns |
| PUT | `/api/returns/:id` | Admin: approve/reject |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/razorpay/create-order` | Init Razorpay payment |
| POST | `/api/payment/razorpay/verify` | Verify payment |

---

## Database Schema (MongoDB)

### Users
```
name, email, password (hashed), phone, role (customer/admin),
addresses[], isActive, avatar, timestamps
```

### Products
```
name, description, shortDescription, price, originalPrice, discount,
images[], category, farmer {name, location, verified},
specs {weight, heatLevel, origin, process, shelfLife, certifications[]},
stock, isActive, isFeatured, badge, ratings {average, count}, timestamps
```

### Orders
```
orderId (FS-2024-00001), user, items[], shippingAddress,
pricing {subtotal, discount, shipping, total},
payment {method, status, transactionId, paidAt},
status (placed→confirmed→packed→shipped→out_for_delivery→delivered),
tracking[], estimatedDelivery, deliveredAt, timestamps
```

### Reviews
```
product, user, order, rating (1-5), title, comment,
isVerifiedPurchase, helpful, timestamps
```

### Returns
```
order, user, reason, description, resolution, status,
adminNote, images[], timestamps
```

---

## Troubleshooting

**Backend not starting on Render?**
- Check environment variables are all set
- Check Render logs (Dashboard → Logs tab)
- Make sure MongoDB Atlas allows all IPs (0.0.0.0/0)

**Frontend shows blank page on Vercel?**
- Check REACT_APP_API_URL has no trailing slash
- Make sure it points to your actual Render URL
- Check Vercel deployment logs

**CORS error in browser?**
- Go to Render → Update FRONTEND_URL to your exact Vercel URL
- Redeploy backend

**Razorpay not working?**
- Make sure `<script src="https://checkout.razorpay.com/v1/checkout.js">` loads
- For test mode, use test card: 4111 1111 1111 1111

**Images not uploading?**
- Verify all 3 Cloudinary environment variables are set on Render
- Check Cloudinary dashboard for upload errors

---

## Go Live Checklist

- [ ] MongoDB Atlas set up with connection string
- [ ] Cloudinary account created, keys saved
- [ ] Razorpay account created (test keys for now)
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render with all env vars
- [ ] Frontend deployed on Vercel with env vars
- [ ] FRONTEND_URL updated on Render
- [ ] Admin account created
- [ ] Sample products seeded
- [ ] Test order placed end-to-end
- [ ] Razorpay Live keys added before launch

---

*Built with ❤️ for FarmSpice — Pure Chilli Powder, Direct from Our Farm 🌶️*
