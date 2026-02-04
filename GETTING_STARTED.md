# 🚀 Quick Start - Deploy Your Extension

## Option 1: Automated Script (Easiest)

```bash
./deploy.sh
```

This will guide you through deployment step by step.

---

## Option 2: Manual Deployment

### Step 1: Deploy Backend to Render

1. **Sign up**: Go to [render.com](https://render.com)
2. **Create Service**: Click "New +" → "Web Service"
3. **Connect GitHub**: Select `anandkaranubc/lets-solve-it`
4. **Configure**:
   - Name: `silly-sustainability-api`
   - Region: `Oregon (US West)` (or closest to you)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Key: `OPENAI_API_KEY`
   - Value: [Your OpenAI API Key]

6. **Deploy**: Click "Create Web Service"

7. **Get URL**: Copy your URL (e.g., `https://silly-sustainability-api.onrender.com`)

### Step 2: Update Extension

Edit `config.js`:
```javascript
const CONFIG = {
  API_URL: 'https://silly-sustainability-api.onrender.com',
};
```

### Step 3: Reload Extension

1. Open Chrome → `chrome://extensions`
2. Find "Silly" extension
3. Click reload icon 🔄
4. Done! Test on Amazon

---

## Option 3: Share Without Publishing

Want to share with friends immediately?

1. **Create Package**:
   ```bash
   zip -r silly-extension.zip . -x "backend/*" "*.md" ".git/*"
   ```

2. **Share** `silly-extension.zip` with anyone

3. **They Install**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Drag & drop `silly-extension.zip`

⚠️ **Note**: They'll need YOUR deployed backend URL in config.js

---

## Option 4: Publish to Chrome Web Store

For public distribution to anyone:

1. **Register**: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - One-time $5 fee
   
2. **Upload**: Upload `silly-extension.zip`

3. **Complete Listing**:
   - Name: "Silly - Sustainability Score for Amazon"
   - Description: (see CHROME_WEB_STORE.md)
   - Screenshots: 2-5 images
   
4. **Submit**: Review takes 1-3 days

5. **Public**: Anyone can install from Chrome Web Store!

See [CHROME_WEB_STORE.md](CHROME_WEB_STORE.md) for full details.

---

## Testing Your Deployment

### Test Backend:
```bash
curl https://your-url.onrender.com/health
```

Should return: `{"status":"ok",...}`

### Test Extension:
1. Open Amazon product page
2. Click Silly icon
3. Click "Check Score"
4. Should see AI analysis!

---

## Troubleshooting

**Extension shows error?**
- Check `config.js` has correct URL
- Make sure URL ends without `/` (e.g., `.com` not `.com/`)
- Reload extension in Chrome

**Backend not responding?**
- Render free tier sleeps after 15 min inactivity
- First request may take 30-60 seconds to wake up
- Subsequent requests will be fast

**OpenAI errors?**
- Check API key in Render environment variables
- Make sure you have credits in OpenAI account
- Check backend logs in Render dashboard

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Render (Backend) | Free tier |
| OpenAI API | ~$0.01-0.05 per product analysis |
| Chrome Web Store | $5 one-time (optional) |

**Estimated**: ~$5-10 for first month of light usage

---

## Next Steps

1. ✅ Deploy backend (5 minutes)
2. ✅ Update config.js (30 seconds)
3. ✅ Test extension (1 minute)
4. ✅ Share with friends OR publish to store

**You're ready to go!** 🎉
