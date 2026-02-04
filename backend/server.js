import express from 'express';
import { OpenAI } from 'openai';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
});

/**
 * Get sustainability scores from OpenAI
 * Returns scores for:
 * 1. Shipping Emissions
 * 2. Material Sustainability
 * 3. Product Lifecycle & Durability
 * 4. Company Sustainability Practices
 */
async function getSustainabilityScore(productData) {
  const {
    productTitle,
    companyName,
    userLocation,
    countryOfOrigin,
    productDimensions,
    productWeight,
    ingredients,
    category,
    price
  } = productData;

  // Build comprehensive prompt for OpenAI
  const prompt = `You are an expert sustainability analyst. Analyze this product comprehensively and provide detailed, actionable insights.

PRODUCT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━
📦 Product: ${productTitle}
🏢 Company: ${companyName}
📂 Category: ${category}
🧪 Materials: ${ingredients}
🌍 Origin: ${countryOfOrigin}
📍 Destination: ${userLocation}
📏 Dimensions: ${productDimensions}
⚖️ Weight: ${productWeight}
💰 Price: ${price}

ANALYSIS REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━
Provide scores (1-100) and detailed 2-3 sentence justifications for each category:

1. **Shipping Emissions** (Transportation Carbon Footprint)
   - Calculate estimated shipping distance from ${countryOfOrigin} to ${userLocation}
   - Consider product weight, size, and typical packaging
   - Account for shipping mode (air vs sea vs ground)
   - Include carbon offset possibilities
   - Be specific about CO2 estimates if possible

2. **Material Sustainability** (Environmental Impact of Materials)
   - Analyze material composition: ${ingredients}
   - Evaluate renewability, recyclability, and biodegradability
   - Consider resource extraction impact and water usage
   - Identify toxic chemicals or harmful substances
   - Mention certifications (GOTS, OEKO-TEX, etc.) if applicable
   - Compare to sustainable alternatives

3. **Product Lifecycle & Durability** (Longevity & End-of-Life)
   - Estimate typical product lifespan for this category
   - Evaluate repairability and availability of spare parts
   - Assess end-of-life options (recyclable, compostable, landfill)
   - Consider planned obsolescence vs long-term value
   - Mention warranty and return policies if relevant
   - Calculate cost-per-use sustainability metric

4. **Company Sustainability Practices** (Corporate Responsibility)
   - Research ${companyName}'s environmental commitments
   - Check for certifications: B-Corp, Fair Trade, Carbon Neutral, etc.
   - Evaluate supply chain transparency
   - Review ESG ratings and sustainability reports
   - Consider labor practices and social responsibility
   - Note any greenwashing concerns or genuine initiatives
   - Compare to industry standards

SCORING GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━
• 90-100: Exceptional sustainability leader
• 75-89: Strong sustainable practices
• 60-74: Good effort with room for improvement
• 40-59: Average/moderate sustainability
• 20-39: Below average, significant concerns
• 1-19: Poor sustainability, major environmental impact

Return ONLY a JSON object (no markdown, no extra text):
{
  "Shipping Emissions": {
    "score": [number],
    "reason": "[Detailed 2-3 sentence analysis with specific facts]"
  },
  "Material Sustainability": {
    "score": [number],
    "reason": "[Detailed 2-3 sentence analysis with specific facts]"
  },
  "Product Lifecycle & Durability": {
    "score": [number],
    "reason": "[Detailed 2-3 sentence analysis with specific facts]"
  },
  "Company Sustainability Practices": {
    "score": [number],
    "reason": "[Detailed 2-3 sentence analysis with specific facts]"
  }
}`;

  try {
    console.log('Sending request to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a sustainability expert specializing in product environmental impact assessment. Provide accurate, well-reasoned sustainability scores based on available data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseContent = completion.choices[0].message.content;
    console.log('OpenAI response received');
    
    return JSON.parse(responseContent);
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Return mock data if API fails (useful for development/testing)
    return {
      "Shipping Emissions": {
        "score": 50,
        "reason": "Unable to calculate exact shipping emissions. Estimate based on typical international shipping."
      },
      "Material Sustainability": {
        "score": 60,
        "reason": "Material information incomplete. Score based on common materials in this product category."
      },
      "Product Lifecycle & Durability": {
        "score": 55,
        "reason": "Durability assessment unavailable. Score reflects average product lifecycle in this category."
      },
      "Company Sustainability Practices": {
        "score": 45,
        "reason": "Limited public information on company sustainability practices."
      }
    };
  }
}

// API endpoint to get sustainability score
app.post('/get_score', async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    
    const productData = req.body;
    
    // Validate required fields
    if (!productData.productTitle || productData.productTitle === 'N/A') {
      return res.status(400).json({
        error: 'Invalid product data. Product title is required.'
      });
    }
    
    // Get sustainability scores
    const scores = await getSustainabilityScore(productData);
    
    console.log('Returning scores:', scores);
    res.json(scores);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Failed to process sustainability analysis',
      message: error.message
    });
  }
});

// Root endpoint (for Render health checks)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Silly Sustainability API',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Silly backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🌱 Silly backend server running on port ${port}`);
  console.log(`📊 API endpoint: POST /get_score`);
  console.log(`❤️  Health check: GET /health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    console.warn('\n⚠️  WARNING: OpenAI API key not configured!');
    console.warn('   Set OPENAI_API_KEY in your .env file or the extension will use mock data.\n');
  }
});
