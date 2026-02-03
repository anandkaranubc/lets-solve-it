# Silly 🌱

Chrome extension for Amazon product sustainability scoring.

## Features

- Shipping emissions analysis
- Material sustainability scoring
- Product lifecycle assessment
- Company sustainability practices
- AI-powered scoring via OpenAI

## Setup

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
node server.js
```

### Extension

1. Open Chrome → Extensions → Enable Developer Mode
2. Load unpacked → Select this folder
3. Visit an Amazon product page
4. Click Silly icon

## Tech

- Chrome Extension Manifest V3
- Node.js + Express backend
- OpenAI GPT-4 Turbo
- Vanilla JavaScript frontend
