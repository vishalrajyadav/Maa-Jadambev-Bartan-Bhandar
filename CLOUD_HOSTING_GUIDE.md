# 🌐 Complete Free Cloud Hosting Guide for Maa Jagdambe Bartan Bhandar

> **Account:** `VishalRaj.118919@marwadiuniverity.ac.in` (Use "Sign In with Google" for 1-click free access, no credit card required)

---

## ⚡ 1. Live Now: Immediate Share Links (Ready Right Now)

Your shop app is currently broadcast live on two links:

1. **Local Wi-Fi Network Link (Mobile / Tablet in shop):**
   - **URL:** [http://192.168.29.62:5173/](http://192.168.29.62:5173/)
   - Open this on any smartphone or tablet connected to your Wi-Fi router.

2. **Worldwide Public Live Link:**
   - **URL:** [https://cute-animals-kick.loca.lt](https://cute-animals-kick.loca.lt)
   - *Tunnel Password (first visit verification):* `49.47.133.180`
   - Anyone on any device across the internet can access this link directly.

---

## ☁️ 2. Permanent Free Cloud Setup (Step-by-Step)

To have your application hosted 24/7 on the cloud permanently with zero server running on your computer, follow these 3 simple free steps using your Google Account (`VishalRaj.118919@marwadiuniverity.ac.in`):

---

### Step A: Free Cloud Database (Render or Neon)

1. Open [dashboard.render.com](https://dashboard.render.com) or [neon.tech](https://neon.tech)
2. Click **"Continue with Google"** and select:
   👉 `VishalRaj.118919@marwadiuniverity.ac.in`
3. Click **"New +"** -> **"PostgreSQL"**
   - Name: `jagdambe-db`
   - Database: `SimpleInventoryDb`
   - Plan: **Free** ($0 / month)
4. Click **Create Database**.
5. Once created, copy the **Internal Database URL** (or **External Database URL**).
   *(Looks like: `postgres://user:password@dpg-...render.com/jagdambe_db`)*

---

### Step B: Free Backend API Hosting (Render.com)

1. In the same Render dashboard ([dashboard.render.com](https://dashboard.render.com)), click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository (or choose public git repo).
3. Root Directory: `backend`
4. Runtime: **Docker** *(Render will automatically use the included `backend/Dockerfile`)*
5. Plan: **Free** ($0 / month)
6. Under **Environment Variables**, add:
   - Key: `DATABASE_URL`
   - Value: *(Paste your database URL from Step A)*
7. Click **Create Web Service**.
8. Render will deploy your .NET 10 API in 2 minutes and give you your permanent live URL:
   👉 `https://maa-jagdambe-api.onrender.com`

---

### Step C: Free Frontend Hosting (Vercel)

1. Open [vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with Google"** and select:
   👉 `VishalRaj.118919@marwadiuniverity.ac.in`
3. Click **"Add New..."** -> **"Project"**.
4. Import your `frontend` directory.
5. Framework Preset: **Vite** (auto-detected).
6. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://maa-jagdambe-api.onrender.com` *(your backend URL from Step B)*
7. Click **Deploy**.
8. In 30 seconds, Vercel gives you your permanent live link:
   👉 `https://maa-jagdambe-bartan.vercel.app`

---

## 🔒 Summary of Free Services Used

| Component | Platform | Free Tier Benefits | Login Method |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | **Vercel** | 100% Free, Global CDN, SSL HTTPS | Google (`VishalRaj...`) |
| **Backend API** | **Render** | 100% Free Web Service, Docker | Google (`VishalRaj...`) |
| **Database** | **Render / Neon** | 100% Free Cloud Database | Google (`VishalRaj...`) |
