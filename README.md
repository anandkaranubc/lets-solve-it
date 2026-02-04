# Silly 🌱

Chrome extension that analyzes the environmental impact of Amazon products using AI.

## Features

- 🌍 **Shipping Emissions** - Calculate transportation carbon footprint
- ♻️ **Material Sustainability** - Analyze eco-friendliness of materials
- ⏱️ **Product Lifecycle** - Evaluate durability and end-of-life impact
- 🏢 **Company Practices** - Check corporate sustainability commitment

## Installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome → `chrome://extensions`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the extension folder
6. Visit any Amazon product page
7. Click the Silly icon to analyze!

**Note:** This extension is not yet published on the Chrome Web Store. For now, it must be installed manually in developer mode.

## How It Works

The extension uses AI (GPT-4 Turbo) to analyze:

- Product materials and manufacturing
- Shipping distance and carbon emissions
- Company sustainability practices
- Product durability and lifecycle

Get instant, detailed sustainability scores to make informed purchasing decisions.

## Tech Stack

- Chrome Extension Manifest V3
- OpenAI GPT-4 Turbo API
- Node.js + Express backend
- Vanilla JavaScript frontend

## License

MIT
