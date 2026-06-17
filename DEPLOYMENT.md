# Deployment Guide — Shree Renukamba Communication

## Architecture

```
Frontend (Vercel) ──► Backend (Render) ──► Database (Supabase)
   React + Vite          Express API           PostgreSQL
```

---

## 1. Database — Supabase (PostgreSQL)

### Step 1: Create a Supabase Project
1. Go to https://supabase.com and sign up
2. Click **New project**
3. Fill in:
   - **Name**: `shree-renukamba-db`
   - **Database Password**: Generate a strong password and **save it**
   - **Region**: Choose closest to your users (e.g., `Singapore` or `Mumbai`)
4. Wait ~2 minutes for provisioning

### Step 2: Get Connection Strings
After project is created:
1. Go to **Project Settings** → **Database**
2. Under **Connection string**, copy the **URI**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```
3. Go to **Project Settings** → **API**
4. Copy:
   - **Project URL** → for `VITE_SUPABASE_URL`
   - **anon/public key** → for `VITE_SUPABASE_ANON_KEY`

### Step 3: Initialize Schema
The backend auto-creates tables on startup (SQLite mode). For PostgreSQL, you need to run the schema manually:

1. Open Supabase **SQL Editor**
2. Paste the contents of `backend/config/schema.sql` (if it exists) or use a GUI tool like **pgAdmin** or **TablePlus** to connect and run: `npm run seed`

---

## 2. Backend — Render

### Prerequisites
- GitHub repo with your code pushed

### Step 1: Create a Web Service
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `shree-renukamba-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (or paid for better performance)

### Step 2: Set Environment Variables
In Render Dashboard → **Environment** tab, add ALL of these:

| Variable | Where to get it |
|----------|----------------|
| `NODE_ENV` | Set to `production` |
| `PORT` | Render auto-sets this; keep as `5000` |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DATABASE_URL` | From Supabase (Project Settings → Database → Connection string) |
| `VITE_SUPABASE_URL` | From Supabase (Project Settings → API → Project URL) |
| `VITE_SUPABASE_ANON_KEY` | From Supabase (Project Settings → API → anon key) |
| `RESEND_API_KEY` | From https://resend.com → API Keys |
| `SMTP_HOST` | Your SMTP provider (e.g., `smtp.gmail.com`) |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | Your email / SMTP username |
| `SMTP_PASS` | Your email app password / SMTP password |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Developer Dashboard → WhatsApp → Getting Started |
| `WHATSAPP_ACCESS_TOKEN` | Meta Developer Dashboard → WhatsApp → Generate token |
| `WHATSAPP_VERIFY_TOKEN` | Pick any random string (e.g., `myapp_webhook_123`) |
| `WHATSAPP_BUSINESS_PHONE` | Your WhatsApp Business number (e.g., `+919876543210`) |
| `OPENAI_API_KEY` | From https://platform.openai.com/api-keys |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → API Keys |

Do NOT upload a `.env` file to Render. Use the dashboard environment variables instead.

### Step 3: Deploy
1. Click **Create Web Service**
2. Render will build and deploy automatically
3. Once deployed, you get a URL like: `https://shree-renukamba-api.onrender.com`
4. Test: visit `https://shree-renukamba-api.onrender.com/` — should return JSON

### Important: Database Persistence
The app currently uses **SQLite** (file-based). On Render, the filesystem is ephemeral — data will be **lost on every restart**.

**To persist data, modify `backend/config/db.js` to use PostgreSQL in production:**
```js
const { Pool } = require('pg');
const SqliteAdapter = require('./sqlite-adapter');

let pool;
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
} else {
  pool = new SqliteAdapter();
}
```

---

## 3. Frontend — Vercel

### Step 1: Prepare Build
Make sure `frontend/.env.production` has the correct values:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables** (set in Vercel Dashboard → Project Settings):
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com/api` |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

6. Click **Deploy**
7. Your frontend will be live at: `https://your-app.vercel.app`

### Step 3: Update CORS
In `backend/index.js`, update the CORS origin to allow your Vercel domain:
```js
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-app.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
}));
```

---

## 4. GitHub Setup — Branch Protection (Optional)

1. Go to your repo → **Settings** → **Branches**
2. Add rule for `main`:
   - Require pull request reviews
   - Require status checks

---

## 5. Quick Checklist

- [ ] Supabase project created, keys copied
- [ ] Backend env vars set in Render Dashboard
- [ ] Frontend `.env.production` updated with Render URL
- [ ] CORS updated for Vercel domain
- [ ] Database persistence handled (SQLite → PostgreSQL migration)
- [ ] WhatsApp webhook URL configured: `https://your-backend.onrender.com/api/whatsapp/webhook`
- [ ] Test: Visit frontend URL, log in, create an invoice

---

## 6. All Service Links

| Service | Purpose | URL |
|---------|---------|-----|
| Supabase | PostgreSQL database + auth | https://supabase.com |
| Render | Backend hosting | https://render.com |
| Vercel | Frontend hosting | https://vercel.com |
| Cloudinary | Image/file storage | https://cloudinary.com |
| Razorpay | Payment gateway | https://razorpay.com |
| Resend | Email delivery | https://resend.com |
| OpenAI | AI assistant | https://platform.openai.com |
| Meta Dev | WhatsApp API | https://developers.facebook.com |
