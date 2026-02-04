# Silly Sustainability API - Deployment Guide

## Deploy to Render (Free Tier)

### Step 1: Prepare Repository
1. Your backend code is in the `backend/` folder
2. Make sure you commit and push all changes to GitHub

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account (anandkaranubc)

### Step 3: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `anandkaranubc/lets-solve-it`
3. Configure the service:
   - **Name**: `silly-sustainability-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Add Environment Variable:
   - Click **"Advanced"** → **"Add Environment Variable"**
   - Key: `OPENAI_API_KEY`
   - Value: `[YOUR_OPENAI_API_KEY]` (paste your actual key)

5. Click **"Create Web Service"**

6. Wait 2-3 minutes for deployment. You'll get a URL like:
   ```
   https://silly-sustainability-api.onrender.com
   ```

### Step 4: Test Your API
```bash
curl https://silly-sustainability-api.onrender.com/health
```

### Step 5: Update Chrome Extension
Replace the API URL in `popup.js`:
- Old: `http://localhost:3000/get_score`
- New: `https://silly-sustainability-api.onrender.com/get_score`

---

## Alternative: Deploy to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub

### Step 2: Deploy
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select `lets-solve-it`
3. Click **"Deploy Now"**
4. Go to **Variables** tab and add:
   - `OPENAI_API_KEY`: your key

5. Go to **Settings** → **Networking** → **Generate Domain**

6. Your API will be at: `https://[your-app].up.railway.app`

---

## Alternative: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from backend folder
cd backend
vercel --prod

# Add environment variable
vercel env add OPENAI_API_KEY production
```

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Render: Spins down after 15 min of inactivity (first request may be slow)
- Railway: 500 hours/month free
- Vercel: Serverless (always on, but has function timeout limits)

💡 **Recommendation**: Start with Render for simplicity, upgrade if needed.

🔐 **Security**: Never commit `.env` files. Always use platform environment variables.
