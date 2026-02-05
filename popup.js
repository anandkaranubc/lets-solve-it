document.addEventListener('DOMContentLoaded', async () => {
  // Check if we have cached results for the current page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab?.url?.includes('amazon.')) {
    // Get cached data
    const cached = await chrome.storage.local.get(['cachedUrl', 'cachedData']);
    
    if (cached.cachedUrl === tab.url && cached.cachedData) {
      // Same page with cached results - show them
      showScores(cached.cachedData);
      return;
    }
  }
  
  // Different page or no cache - show start screen
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', handleAnalyze);
  }
});

async function handleAnalyze() {
  showLoading();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab?.url?.includes('amazon.')) {
      showError('Please open an Amazon product page');
      return;
    }

    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: scrapeProduct,
    });

    if (!result?.result) {
      showError('Failed to scrape product data');
      return;
    }

    const response = await fetch(`${CONFIG.API_URL}/get_score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.result),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    
    // Cache the results with the current URL
    await chrome.storage.local.set({
      cachedUrl: tab.url,
      cachedData: data
    });
    
    showScores(data);
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to analyze product');
  }
}

function scrapeProduct() {
  const data = {
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

  const title = document.querySelector('#productTitle');
  if (title) data.productTitle = title.textContent.trim();

  const brand = document.querySelector('#bylineInfo');
  if (brand) {
    data.companyName = brand.textContent
      .replace(/^(Brand:|Visit the|Store:)\s*/i, '')
      .trim();
  }

  const location = document.querySelector('#glow-ingress-line2');
  if (location) data.userLocation = location.textContent.trim();

  const details = document.querySelectorAll('#productDetails_detailBullets_sections1 tr, .prodDetTable tr');
  details.forEach(row => {
    const text = row.textContent;
    if (/country of origin/i.test(text)) {
      const value = row.querySelector('td:last-child');
      if (value) data.countryOfOrigin = value.textContent.trim();
    }
    if (/product dimensions|package dimensions/i.test(text)) {
      const value = row.querySelector('td:last-child');
      if (value) data.productDimensions = value.textContent.trim();
    }
    if (/item weight|package weight/i.test(text)) {
      const value = row.querySelector('td:last-child');
      if (value) data.productWeight = value.textContent.trim();
    }
  });

  const category = document.querySelector('#wayfinding-breadcrumbs_container a:last-child');
  if (category) data.category = category.textContent.trim();

  const price = document.querySelector('.a-price .a-offscreen');
  if (price) data.price = price.textContent.trim();

  return data;
}

function showLoading() {
  document.getElementById('app').innerHTML = `
    <div class="loading-view">
      <div class="spinner"></div>
      <div class="loading-text">Analyzing product...</div>
    </div>
  `;
}

function showError(message) {
  document.getElementById('app').innerHTML = `
    <div class="error-view">
      <div class="error-icon">⚠️</div>
      <div class="error-text">${message}</div>
    </div>
  `;
}

function showScores(data) {
  const scores = Object.values(data);
  const overall = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);
  
  const scoreClass = getScoreClass(overall);
  const faceImage = getFaceImage(overall);
  const tagline = getTagline(overall);
  
  // Apply background image to body
  document.body.style.backgroundImage = `url('${faceImage}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.className = '';
  
  const categories = {
    'Shipping Emissions': { icon: '🚚' },
    'Material Sustainability': { icon: '🌿' },
    'Product Lifecycle & Durability': { icon: '♻️' },
    'Company Sustainability Practices': { icon: '🏢' }
  };

  const categoriesHTML = Object.entries(categories).map(([key, { icon }]) => {
    const item = data[key];
    if (!item) return '';
    
    const scoreClass = getScoreClass(item.score);
    
    return `
      <div class="category">
        <div class="category-top">
          <div class="category-title">
            <span class="category-icon">${icon}</span>
            ${formatCategoryName(key)}
          </div>
          <span class="category-badge badge-${scoreClass}">${item.score}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill bg-${scoreClass}" style="width: ${item.score}%"></div>
        </div>
        <div class="category-details">${item.reason}</div>
      </div>
    `;
  }).join('');

  // Show initial reveal screen with tagline
  document.getElementById('app').innerHTML = `
    <button class="back-btn" id="backBtn">← Back</button>
    <div class="flip-container">
      <div class="flipper">
        <div class="flip-front">
          <div class="reveal-content">
            <div class="tagline">${tagline}</div>
            <button class="reveal-btn" id="revealBtn">Why?</button>
          </div>
        </div>
        <div class="flip-back">
          <div class="score-view">
            <div class="score-summary">
              <div class="score-number ${scoreClass}">${overall}%</div>
              <div class="score-subtitle">Overall Score</div>
            </div>
            <div class="categories">
              ${categoriesHTML}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add flip functionality
  document.getElementById('revealBtn').addEventListener('click', () => {
    document.querySelector('.flipper').classList.add('flipped');
    document.getElementById('backBtn').classList.add('show');
  });

  // Add back button functionality
  document.getElementById('backBtn').addEventListener('click', () => {
    document.querySelector('.flipper').classList.remove('flipped');
    document.getElementById('backBtn').classList.remove('show');
  });

  document.querySelectorAll('.category').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
}

function getFaceImage(score) {
  if (score >= 80) return 'images/happy_green.jpg';
  if (score >= 60) return 'images/content_green.jpg';
  if (score >= 40) return 'images/suspicious_green.jpg';
  return 'images/angry_green.png';
}

function getTagline(score) {
  if (score >= 85) return "This product is absolutely unsilly! 🌟";
  if (score >= 70) return "This product is pretty unsilly 👍";
  if (score >= 55) return "This product is kind of silly 🤔";
  if (score >= 35) return "This product is quite silly 😬";
  return "This product is not silly at all 😠";
}

function formatCategoryName(name) {
  if (name === 'Shipping Emissions') return 'Shipping';
  if (name === 'Material Sustainability') return 'Materials';
  if (name === 'Product Lifecycle & Durability') return 'Lifecycle';
  if (name === 'Company Sustainability Practices') return 'Company';
  return name;
}

function getScoreClass(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
