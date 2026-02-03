// popup.js - Updated to match the user's vision with animated backgrounds and faces

document.addEventListener('DOMContentLoaded', () => {
  // Set up the check score button
  const checkScoreBtn = document.getElementById('checkScoreBtn');
  if (checkScoreBtn) {
    checkScoreBtn.addEventListener('click', analyzeSustainability);
  }
});

async function analyzeSustainability() {
  // Show loading state
  showLoading();

  try {
    // Query the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.includes('amazon.')) {
      showError('Please open an Amazon product page');
      return;
    }

    // Scrape product data from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeProductData,
    });

    if (!results || !results[0] || !results[0].result) {
      showError('Failed to scrape product data');
      return;
    }

    const productData = results[0].result;
    console.log('Scraped product data:', productData);

    // Fetch sustainability scores from backend
    const response = await fetch('http://localhost:3000/get_score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received sustainability scores:', data);

    renderSustainabilityDashboard(data);
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to fetch sustainability data');
  }
}

// Function to scrape product data from Amazon page
function scrapeProductData() {
  const productData = {
    productTitle: '',
    companyName: '',
    userLocation: '',
    countryOfOrigin: 'N/A',
    productDimensions: 'N/A',
    productWeight: 'N/A',
    ingredients: 'N/A',
    category: '',
    price: ''
  };

  // Get product title
  const titleSelectors = [
    '#productTitle',
    '#title',
    'h1[id*="title"]',
    '.product-title'
  ];
  
  for (const selector of titleSelectors) {
    const titleEl = document.querySelector(selector);
    if (titleEl && titleEl.textContent.trim()) {
      productData.productTitle = titleEl.textContent.trim();
      break;
    }
  }

  // Get brand/company name
  const brandSelectors = [
    '#bylineInfo',
    '.po-brand .po-break-word',
    'a#brand',
    'tr.po-brand td.a-span9 span'
  ];

  for (const selector of brandSelectors) {
    const brandEl = document.querySelector(selector);
    if (brandEl && brandEl.textContent.trim()) {
      let brandText = brandEl.textContent.trim();
      brandText = brandText.replace(/^(Brand:|Visit the|Store:)\s*/i, '').trim();
      if (brandText) {
        productData.companyName = brandText;
        break;
      }
    }
  }

  // Get user location from the delivery section
  const locationSelectors = [
    '#glow-ingress-line2',
    '#nav-global-location-data-modal-action',
    '#GLUXZipUpdateInput'
  ];

  for (const selector of locationSelectors) {
    const locationEl = document.querySelector(selector);
    if (locationEl && locationEl.textContent.trim()) {
      productData.userLocation = locationEl.textContent.trim();
      break;
    }
  }

  // Get product details from table
  const detailRows = document.querySelectorAll('#productDetails_detailBullets_sections1 tr, .prodDetTable tr, #detailBullets_feature_div li');
  
  detailRows.forEach(row => {
    const text = row.textContent || '';
    
    if (text.match(/country of origin/i)) {
      const value = row.querySelector('td:last-child, span:last-child');
      if (value) productData.countryOfOrigin = value.textContent.trim();
    }
    
    if (text.match(/product dimensions|package dimensions/i)) {
      const value = row.querySelector('td:last-child, span:last-child');
      if (value) productData.productDimensions = value.textContent.trim();
    }
    
    if (text.match(/item weight|package weight/i)) {
      const value = row.querySelector('td:last-child, span:last-child');
      if (value) productData.productWeight = value.textContent.trim();
    }
  });

  // Get category from breadcrumb
  const categoryEl = document.querySelector('#wayfinding-breadcrumbs_container a:last-child');
  if (categoryEl) {
    productData.category = categoryEl.textContent.trim();
  }

  // Get price
  const priceSelectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole'
  ];

  for (const selector of priceSelectors) {
    const priceEl = document.querySelector(selector);
    if (priceEl && priceEl.textContent.trim()) {
      productData.price = priceEl.textContent.trim();
      break;
    }
  }

  return productData;
}

// Get Silly face image based on score
function getSillyFace(score) {
  if (score >= 80) return 'images/happy.jpg';         // Very happy - 80-100
  if (score >= 60) return 'images/content.jpg';       // Content - 60-79
  if (score >= 40) return 'images/suspicious.jpg';    // Suspicious - 40-59
  return 'images/angry.jpg';                          // Angry - 0-39
}

// Get background gradient based on score
function getBackgroundGradient(score) {
  if (score >= 90) return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';  // Green
  if (score >= 80) return 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)';  // Light green
  if (score >= 70) return 'linear-gradient(135deg, #FFD700 0%, #F4A460 100%)';  // Yellow/Gold
  if (score >= 60) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';  // Pink
  if (score >= 40) return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';  // Orange/Pink
  if (score >= 20) return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';  // Red/Orange
  return 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)';                   // Dark red/purple
}

// Get progress bar color based on score
function getProgressColor(score) {
  if (score >= 80) return '#10b981';  // Green
  if (score >= 60) return '#a8e063';  // Light green
  if (score >= 40) return '#f59e0b';  // Orange
  return '#ef4444';                    // Red
}

// Get score message
function getScoreMessage(score) {
  if (score >= 90) return 'This product is kind of Silly 😊';
  if (score >= 80) return 'This product is kind of Silly 🙂';
  if (score >= 70) return 'This product is kind of Silly 😐';
  if (score >= 60) return 'This product is kind of Silly 😕';
  if (score >= 40) return 'This product is kind of Silly 😟';
  if (score >= 20) return 'This product is kind of Silly 😨';
  return 'This product is kind of Silly 😱';
}

// Render the sustainability dashboard
function renderSustainabilityDashboard(scoreData) {
  // Calculate overall score
  const scores = Object.values(scoreData);
  const overallScore = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);

  // Update background
  document.body.style.background = getBackgroundGradient(overallScore);

  // Build HTML
  const html = `
    <div class="silly-face-container">
      <img src="${getSillyFace(overallScore)}" alt="Silly Face" class="silly-face-img">
    </div>

    <div class="score-circle-container">
      ${createCircularProgress(overallScore)}
      <div class="score-message">${getScoreMessage(overallScore)}</div>
    </div>

    <div class="categories-container">
      ${createCategoryCards(scoreData)}
    </div>
  `;

  document.getElementById('content').innerHTML = html;
  
  // Add click handlers for expandable cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
}

// Create circular progress indicator
function createCircularProgress(score) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getProgressColor(score);

  return `
    <div class="circular-progress">
      <svg width="200" height="200">
        <circle class="circular-progress-bg" cx="100" cy="100" r="${radius}"></circle>
        <circle 
          class="circular-progress-bar" 
          cx="100" 
          cy="100" 
          r="${radius}"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}">
        </circle>
      </svg>
      <div class="score-text">
        <div class="score-value">${score.toFixed(score >= 10 ? 0 : 1)}%</div>
      </div>
    </div>
  `;
}

// Create category cards with horizontal progress bars
function createCategoryCards(scoreData) {
  const categories = {
    'Supply Emissions': { icon: '🚚', key: 'Shipping Emissions' },
    'Material Sustainability': { icon: '🌿', key: 'Material Sustainability' },
    'Durability/Lifecycle': { icon: '♻️', key: 'Product Lifecycle & Durability' },
    'Company Sustainability': { icon: '🏢', key: 'Company Sustainability Practices' }
  };

  return Object.entries(categories)
    .map(([displayName, { icon, key }]) => {
      const data = scoreData[key];
      if (!data) return '';

      const color = getProgressColor(data.score);

      return `
        <div class="category-card">
          <div class="category-header">
            <div class="category-name">
              <span class="category-icon">${icon}</span>
              ${displayName}
            </div>
          </div>
          <div class="category-score-bar">
            <div class="score-bar-bg">
              <div class="score-bar-fill" style="width: ${data.score}%; background: ${color};">
                <span class="category-score">${data.score}%</span>
              </div>
            </div>
          </div>
          <div class="category-reason">${data.reason}</div>
        </div>
      `;
    })
    .join('');
}

// Show error message
function showError(message) {
  document.getElementById('content').innerHTML = `
    <div class="error">
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
    </div>
  `;
}

// Show loading state
function showLoading() {
  document.getElementById('content').innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing sustainability...</p>
    </div>
  `;
}
