#!/bin/bash

# Silly Extension - Quick Deployment Script

echo "🚀 Silly Extension Deployment Helper"
echo "======================================"
echo ""

# Step 1: Check if backend changes exist
echo "📦 Step 1: Checking backend setup..."
if [ ! -f "backend/package.json" ]; then
  echo "❌ Backend not found! Make sure you're in the right directory."
  exit 1
fi
echo "✅ Backend found"
echo ""

# Step 2: Deployment Options
echo "🌐 Step 2: Choose deployment platform:"
echo "   1. Render (Recommended - Free tier, easy setup)"
echo "   2. Railway (Free tier, simple)"
echo "   3. Vercel (Serverless)"
echo "   4. Skip - Already deployed"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "📋 Render Deployment Steps:"
    echo "   1. Go to: https://render.com"
    echo "   2. Sign up with GitHub"
    echo "   3. New + → Web Service"
    echo "   4. Connect repo: anandkaranubc/lets-solve-it"
    echo "   5. Configure:"
    echo "      - Name: silly-sustainability-api"
    echo "      - Root Directory: backend"
    echo "      - Build: npm install"
    echo "      - Start: npm start"
    echo "   6. Add env var: OPENAI_API_KEY"
    echo "   7. Deploy!"
    echo ""
    read -p "Enter your deployed URL (e.g., https://silly-api.onrender.com): " API_URL
    ;;
  2)
    echo ""
    echo "📋 Railway Deployment Steps:"
    echo "   1. Go to: https://railway.app"
    echo "   2. Sign in with GitHub"
    echo "   3. New Project → Deploy from GitHub"
    echo "   4. Select: lets-solve-it"
    echo "   5. Variables → Add: OPENAI_API_KEY"
    echo "   6. Settings → Generate Domain"
    echo ""
    read -p "Enter your deployed URL (e.g., https://silly-api.railway.app): " API_URL
    ;;
  3)
    echo ""
    echo "📋 Vercel Deployment Steps:"
    echo "   1. Install: npm i -g vercel"
    echo "   2. Run: cd backend && vercel --prod"
    echo "   3. Add env: vercel env add OPENAI_API_KEY production"
    echo ""
    read -p "Enter your deployed URL: " API_URL
    ;;
  4)
    echo ""
    read -p "Enter your deployed URL: " API_URL
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

# Step 3: Update config.js
echo ""
echo "📝 Step 3: Updating config.js with your API URL..."
cat > config.js << EOF
// API Configuration
// Production URL updated by deployment script

const CONFIG = {
  API_URL: '$API_URL',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
EOF

echo "✅ Updated config.js with: $API_URL"
echo ""

# Step 4: Test API
echo "🧪 Step 4: Testing API connection..."
HEALTH_URL="${API_URL}/health"
echo "   Testing: $HEALTH_URL"

if command -v curl &> /dev/null; then
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
  if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ API is responding!"
  else
    echo "   ⚠️  API not responding (HTTP $RESPONSE)"
    echo "   Make sure your backend is deployed and running"
  fi
else
  echo "   ⚠️  curl not found, skipping test"
fi
echo ""

# Step 5: Commit changes
echo "💾 Step 5: Committing changes..."
git add config.js
git commit -m "update api url to production"
git push
echo "✅ Changes committed and pushed"
echo ""

# Step 6: Create distribution package
echo "📦 Step 6: Creating distribution package..."
zip -r silly-extension.zip . \
  -x "backend/*" \
  -x "silly photos/*" \
  -x "*.py" \
  -x ".git/*" \
  -x "*.md" \
  -x ".DS_Store" \
  -x "deploy.sh" \
  -x "*.zip"

echo "✅ Created: silly-extension.zip"
echo ""

# Final instructions
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "   1. Reload Extension in Chrome:"
echo "      - Go to chrome://extensions"
echo "      - Click reload icon on Silly extension"
echo ""
echo "   2. Test on Amazon:"
echo "      - Visit any Amazon product page"
echo "      - Click Silly icon"
echo "      - Should work without local server!"
echo ""
echo "   3. Share Extension:"
echo "      - Share silly-extension.zip with others"
echo "      - Or publish to Chrome Web Store (see CHROME_WEB_STORE.md)"
echo ""
echo "   Your extension is now running in production! 🚀"
echo ""
