# Silly 🌱

Chrome extension for Amazon product sustainability scoring.

## 🚀 Deployment Guide

**Want to use this without running a local server?**
See [DEPLOYMENT.md](DEPLOYMENT.md) for deploying the backend to the cloud (free tier available).

**Want to publish to Chrome Web Store?**
See [CHROME_WEB_STORE.md](CHROME_WEB_STORE.md) for publishing instructions.

## Features

- Shipping emissions analysis
- Material sustainability scoring
- Product lifecycle assessment
- Company sustainability practices
- AI-powered scoring via OpenAI

## Quick Start (Local Development)

### Backend

```bash
cd backend
npm install
```

Create `.env` file:

```
OPENAI_API_KEY=your-key-here
```

Start server:

```bash
npm start
```

### Extension

1. Open Chrome → Extensions → Enable Developer Mode
2. Load unpacked → Select this folder
3. Visit an Amazon product page
4. Click Silly icon

## Production Deployment

### 1. Deploy Backend (Render - Free)

1. Sign up at [render.com](https://render.com)
2. Create new Web Service from your GitHub repo
3. Set `backend` as root directory
4. Add `OPENAI_API_KEY` environment variable
5. Deploy and get your URL

### 2. Update Extension

Edit `config.js`:
```javascript
const CONFIG = {
  API_URL: 'https://your-app.onrender.com'
};
```

### 3. Reload Extension

Your extension now works without a local server!

## Tech

- Chrome Extension Manifest V3
- Node.js + Express backend
- OpenAI GPT-4 Turbo
- Vanilla JavaScript frontend
