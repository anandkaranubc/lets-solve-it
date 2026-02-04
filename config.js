// API Configuration
// Update this URL after deploying backend to production

const CONFIG = {
  // Development (local)
  // API_URL: 'http://localhost:3000',
  
  // Production (update with your deployed URL)
  // After deploying to Render/Railway/Vercel, replace with your actual URL:
  API_URL: 'http://localhost:3000',
  
  // Example production URLs:
  // API_URL: 'https://silly-sustainability-api.onrender.com',
  // API_URL: 'https://silly-api.up.railway.app',
  // API_URL: 'https://silly-api.vercel.app',
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
