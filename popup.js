document.addEventListener('DOMContentLoaded', () => {
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
  
  // Apply background color to body
  document.body.className = `bg-${scoreClass}-screen`;
  
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

  document.getElementById('app').innerHTML = `
    <div class="score-view">
      <div class="score-summary">
        <img src="${faceImage}" alt="Score indicator" class="silly-face">
        <div class="score-number ${scoreClass}">${overall}%</div>
        <div class="score-subtitle">Overall Score</div>
      </div>
      <div class="categories">
        ${categoriesHTML}
      </div>
    </div>
  `;

  document.querySelectorAll('.category').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });
}

function getFaceImage(score) {
  if (score >= 80) return 'images/happy.jpg';
  if (score >= 60) return 'images/content.jpg';
  if (score >= 40) return 'images/suspicious.jpg';
  return 'images/angry.jpg';
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
