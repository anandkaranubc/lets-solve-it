function scrapeProductData() {
  console.log('Starting Amazon product data scrape...');
  
  // Get product title
  const productTitle = document.querySelector('#productTitle')?.innerText?.trim() || 
                       document.querySelector('h1.product-title')?.innerText?.trim() || 
                       'N/A';
  
  // Get brand/company name
  let companyName = 'N/A';
  const bylineElement = document.querySelector('#bylineInfo');
  if (bylineElement) {
    const fullText = bylineElement.textContent.trim();
    companyName = fullText.replace(/Visit the |Brand: | Store/g, "").trim();
  }
  
  // Alternative brand selector
  if (companyName === 'N/A') {
    const brandElement = document.querySelector('a#bylineInfo') || 
                        document.querySelector('.po-brand .po-break-word');
    if (brandElement) {
      companyName = brandElement.textContent.trim();
    }
  }
  
  // Get product details from the table
  let countryOfOrigin = 'N/A';
  let productDimensions = 'N/A';
  let productWeight = 'N/A';
  let materials = 'N/A';
  
  // Try detail bullets first
  const detailBullets = document.querySelectorAll('#detailBullets_feature_div li');
  detailBullets.forEach((item) => {
    const text = item.textContent;
    if (text.includes('Country of Origin') || text.includes('Country of origin')) {
      countryOfOrigin = text.split(':')[1]?.trim() || 'N/A';
    }
    if (text.includes('Product Dimensions')) {
      productDimensions = text.split(':')[1]?.trim() || 'N/A';
    }
    if (text.includes('Item Weight')) {
      productWeight = text.split(':')[1]?.trim() || 'N/A';
    }
  });
  
  // Try product overview table
  const productDetailRows = document.querySelectorAll('#productDetails_detailBullets_sections1 tr, #prodDetails tr');
  productDetailRows.forEach((row) => {
    const header = row.querySelector('th')?.textContent?.trim() || '';
    const value = row.querySelector('td')?.textContent?.trim() || '';
    
    if (header.toLowerCase().includes('country of origin')) {
      countryOfOrigin = value;
    }
    if (header.toLowerCase().includes('product dimensions')) {
      productDimensions = value;
    }
    if (header.toLowerCase().includes('item weight')) {
      productWeight = value;
    }
    if (header.toLowerCase().includes('material')) {
      materials = value;
    }
  });
  
  // Try the bold text elements (original approach)
  const boldElements = document.querySelectorAll('.a-text-bold');
  boldElements.forEach((boldElement) => {
    const text = boldElement.innerText;
    if (text.includes('Country of origin')) {
      const valueElement = boldElement.nextElementSibling;
      if (valueElement && countryOfOrigin === 'N/A') {
        countryOfOrigin = valueElement.innerText.trim();
      }
    }
    if (text.includes('Product Dimensions')) {
      const valueElement = boldElement.nextElementSibling;
      if (valueElement && productDimensions === 'N/A') {
        productDimensions = valueElement.innerText.trim();
      }
    }
  });
  
  // Get ingredients/materials
  let ingredients = 'N/A';
  const ingredientsContainer = document.querySelector('#important-information .a-section.content > p:nth-child(3)') ||
                               document.querySelector('#ingredientList') ||
                               document.querySelector('.ingredients-list');
  
  if (ingredientsContainer) {
    ingredients = ingredientsContainer.innerText.trim();
  }
  
  // If materials found but no ingredients, use materials as ingredients
  if (ingredients === 'N/A' && materials !== 'N/A') {
    ingredients = materials;
  }
  
  // Get category for better context
  let category = 'N/A';
  const categoryElement = document.querySelector('#wayfinding-breadcrumbs_feature_div ul li:last-child a') ||
                         document.querySelector('.a-breadcrumb li:last-child a');
  if (categoryElement) {
    category = categoryElement.textContent.trim();
  }
  
  // Get price for context
  let price = 'N/A';
  const priceElement = document.querySelector('.a-price .a-offscreen') ||
                      document.querySelector('#priceblock_ourprice') ||
                      document.querySelector('#priceblock_dealprice');
  if (priceElement) {
    price = priceElement.textContent.trim();
  }
  
  // Get user's estimated location from Amazon's delivery info
  let userLocation = 'N/A';
  const locationElement = document.querySelector('#glow-ingress-line2');
  if (locationElement) {
    userLocation = locationElement.textContent.trim();
  }
  
  // Fallback to default location
  if (userLocation === 'N/A' || userLocation === '') {
    userLocation = 'United States';
  }
  
  const scrapedData = {
    productTitle,
    companyName,
    userLocation,
    countryOfOrigin,
    productDimensions,
    productWeight,
    ingredients,
    category,
    price,
  };
  
  console.log('Scraped product data:', scrapedData);
  return scrapedData;
}