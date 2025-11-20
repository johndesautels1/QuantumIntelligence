# 🤖 LLM Scraper Documentation - CLUES Quantum App

## Overview

The **UnifiedLLMScraper** is an AI-powered real estate data extraction system that uses multiple Large Language Models (Claude Max, GPT Pro, Grok Pro, Gemini Pro) to intelligently scrape property listings from various sources.

### Key Features

- ✅ **Multi-LLM Orchestration** - Automatically selects the best LLM for each task
- ✅ **Hybrid Consensus Mode** - Cross-validates data using all 4 LLMs
- ✅ **Walk Score Extraction** - No API key needed, LLM scrapes walkscore.com
- ✅ **Crime Data Extraction** - Scrapes NeighborhoodScout, SpotCrime, etc.
- ✅ **School Data Extraction** - Pulls ratings from GreatSchools.org
- ✅ **Self-Healing** - Adapts to website changes automatically
- ✅ **Cost Tracking** - Real-time monitoring of API costs
- ✅ **Rate Limiting** - Batch processing with configurable delays
- ✅ **Universal Scraper** - Works on any real estate website

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UnifiedLLMScraper                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Claude  │  │   GPT    │  │   Grok   │  │  Gemini  │  │
│  │   Max    │  │   Pro    │  │   Pro    │  │   Pro    │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │             │             │             │          │
│       └─────────────┴─────────────┴─────────────┘          │
│                         │                                   │
│                    Auto Router                              │
│              (Selects Best LLM)                             │
│                         │                                   │
├─────────────────────────┴───────────────────────────────────┤
│                 Extraction Tasks                            │
├─────────────────────────────────────────────────────────────┤
│  Property Data  │  Walk Score  │  Crime Data  │  Schools   │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### 1. Install Dependencies

```bash
cd C:\Users\broke\CLUES_Quantum_App
npm install
```

This installs:
- `@anthropic-ai/sdk` - Claude Max API
- `openai` - GPT Pro & Grok API (OpenAI-compatible)
- `@google/generative-ai` - Gemini Pro API
- `axios` - HTTP requests
- `dotenv` - Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Claude Max API Key
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE

# GPT Pro API Key
OPENAI_API_KEY=sk-YOUR_KEY_HERE

# Grok API Key
GROK_API_KEY=xai-YOUR_KEY_HERE

# Gemini Pro API Key
GEMINI_API_KEY=YOUR_KEY_HERE

# Optional Configuration
DEFAULT_LLM=auto
ENABLE_CLAUDE=true
ENABLE_GPT=true
ENABLE_GROK=true
ENABLE_GEMINI=true
MAX_REQUESTS_PER_MINUTE=60
BATCH_SIZE=5
DELAY_BETWEEN_BATCHES_MS=1000
```

---

## API Keys Setup

### Claude Max API

1. Go to https://console.anthropic.com/
2. Sign in with your account
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key starting with `sk-ant-api03-`

**Cost:** $3/MTok input, $15/MTok output (Sonnet 4)

### OpenAI GPT Pro API

1. Go to https://platform.openai.com/api-keys
2. Sign in with your account
3. Click **Create new secret key**
4. Copy the key starting with `sk-`

**Cost:** $10/MTok input, $30/MTok output (GPT-4 Turbo)

### Grok API

1. Go to https://console.x.ai/
2. Sign in with your X/Twitter account
3. Navigate to **API Keys**
4. Create new key
5. Copy the key starting with `xai-`

**Cost:** ~$5/MTok (estimated)

### Google Gemini Pro API

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the generated key

**Cost:** $0.35/MTok input, $1.05/MTok output (cheapest!)

---

## Usage Examples

### Example 1: Scrape Single Property

```javascript
import { UnifiedLLMScraper } from './src/scrapers/llm-unified-scraper.js';

const scraper = new UnifiedLLMScraper();

// Scrape with auto LLM selection
const property = await scraper.scrapeProperty(
    'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/',
    {
        preferredLLM: 'auto',  // or 'claude', 'gpt', 'grok', 'gemini'
        enrichData: true       // Add Walk Score, Crime, Schools
    }
);

console.log(property);
```

**Command Line:**
```bash
npm run scrape:single -- "https://www.zillow.com/..."
```

### Example 2: Batch Scraping

```javascript
const urls = [
    'https://www.zillow.com/homedetails/.../12345678_zpid/',
    'https://www.redfin.com/FL/Miami/.../home/23456789',
    'https://www.trulia.com/p/fl/orlando/.../1234567890'
];

const results = await scraper.scrapeMultipleProperties(urls, {
    batchSize: 5,
    delayMs: 1000,
    llm: 'auto'
});

console.log(`Scraped ${results.length} properties`);
scraper.printCostBreakdown();
```

**Command Line:**
```bash
# Create urls.txt with one URL per line
npm run scrape:batch -- urls.txt
```

### Example 3: City-Wide Scraping

```javascript
const properties = await scraper.scrapeCity('Miami', 'FL', {
    maxProperties: 100,
    sites: ['zillow', 'redfin', 'trulia', 'homes.com'],
    llm: 'auto'
});

console.log(`Found ${properties.length} properties in Miami`);
```

**Command Line:**
```bash
npm run scrape:city -- Miami FL 100
```

### Example 4: Hybrid Mode (All LLMs)

```javascript
// Use all 4 LLMs and merge results with consensus
const property = await scraper.scrapeProperty(url, {
    useHybrid: true  // Runs all LLMs in parallel
});

// Most accurate but 4x more expensive!
```

### Example 5: Walk Score Only

```javascript
const walkScore = await scraper.getWalkScoreViaLLM(
    '808 Redwood Dr, Miami, FL 33101'
);

console.log(`Walk Score: ${walkScore.walk_score}/100`);
console.log(`Transit Score: ${walkScore.transit_score}/100`);
console.log(`Bike Score: ${walkScore.bike_score}/100`);
```

### Example 6: Crime Data Only

```javascript
const crimeData = await scraper.getCrimeDataViaLLM(
    '808 Redwood Dr, Miami, FL 33101'
);

console.log(`Crime Index: ${crimeData.crime_index}/100`);
console.log(`Safety Score: ${crimeData.safety_score}/100`);
console.log(`Grade: ${crimeData.grade}`);
```

### Example 7: Integration with DataManager

```javascript
import { ScraperIntegration } from './src/scrapers/scraper-integration.js';
import { DataManager } from './src/core/data-manager.js';

const dataManager = new DataManager();
await dataManager.init();

const integration = new ScraperIntegration(dataManager);

// Scrape and auto-save to IndexedDB
await integration.scrapeAndStore(
    'https://www.zillow.com/homedetails/.../12345678_zpid/'
);

console.log('Property scraped and saved to database!');
```

---

## Cost Analysis

### Cost Per Property

| LLM | Input Tokens | Output Tokens | Cost Per Property |
|-----|--------------|---------------|-------------------|
| **Claude Max** | ~2,000 | ~1,500 | ~$0.03 |
| **GPT Pro** | ~2,000 | ~1,500 | ~$0.07 |
| **Grok Pro** | ~3,500 | - | ~$0.02 |
| **Gemini Pro** | ~2,000 | ~1,500 | ~$0.002 |

### Monthly Cost Estimates

| Properties/Month | Auto Mode | Hybrid Mode |
|------------------|-----------|-------------|
| **100** | $2-5 | $8-20 |
| **500** | $10-25 | $40-100 |
| **1,000** | $20-50 | $80-200 |
| **10,000** | $200-500 | $800-2,000 |

**Recommendation:** Use **Auto Mode** for production, **Hybrid Mode** only for critical properties.

---

## LLM Selection Strategy

The scraper auto-selects the best LLM based on the task:

| Site/Task | Preferred LLM | Reason |
|-----------|---------------|--------|
| **Zillow** | Claude | Best structured extraction |
| **Redfin** | Claude | Complex nested data |
| **Trulia** | GPT | Good with modern layouts |
| **Homes.com** | Gemini | Fast and cheap |
| **Compass** | Grok | Native web search |
| **Keller Williams** | Grok | Real-time data |
| **Walk Score** | GPT | Web browsing capability |
| **Crime Data** | Claude | Data aggregation |
| **Schools** | Gemini | Speed + cost efficiency |

You can override with `preferredLLM` parameter:

```javascript
// Force use of Gemini (cheapest)
await scraper.scrapeProperty(url, { preferredLLM: 'gemini' });

// Force use of Claude (most accurate)
await scraper.scrapeProperty(url, { preferredLLM: 'claude' });
```

---

## Data Schema

### Scraped Property Object

```javascript
{
    "address": {
        "full_address": "808 Redwood Dr, Miami, FL 33101",
        "street": "808 Redwood Dr",
        "city": "Miami",
        "state": "FL",
        "zip": "33101",
        "county": "Miami-Dade",
        "latitude": 25.7617,
        "longitude": -80.1918
    },
    "price": {
        "current": 2500000,
        "original": 2650000,
        "per_sqft": 625,
        "tax_assessed": 2400000
    },
    "property": {
        "bedrooms": 4,
        "bathrooms": 3.5,
        "sqft": 4000,
        "lot_size": 8000,
        "year_built": 2018,
        "property_type": "Single Family",
        "stories": 2,
        "garage": 2,
        "pool": true,
        "hoa": 250
    },
    "listing": {
        "status": "Active",
        "days_on_market": 15,
        "mls_number": "A12345678",
        "listing_agent": "Jane Smith",
        "listing_brokerage": "Premium Realty"
    },
    "description": "Stunning modern home in prime location...",
    "features": ["Pool", "Updated Kitchen", "Smart Home"],
    "images": ["url1", "url2", "url3"],
    "virtual_tour_url": "https://...",
    "school_district": "Miami-Dade County",

    // Enrichment Data
    "walkability": {
        "walk_score": 85,
        "walk_description": "Very Walkable",
        "transit_score": 70,
        "transit_description": "Excellent Transit",
        "bike_score": 75,
        "bike_description": "Very Bikeable"
    },
    "crime": {
        "crime_index": 78,
        "crime_rate": "low",
        "violent_crime": 2.1,
        "property_crime": 15.3,
        "safety_score": 88,
        "grade": "A-",
        "compared_to_national": "safer"
    },
    "schools": {
        "district": "Miami-Dade County Public Schools",
        "elementary": {
            "name": "Coral Gables Elementary",
            "rating": 9,
            "distance": 0.5
        },
        "middle": {
            "name": "Ponce de Leon Middle",
            "rating": 8,
            "distance": 0.8
        },
        "high": {
            "name": "Coral Gables Senior High",
            "rating": 9,
            "distance": 1.2
        },
        "average_rating": 8.7,
        "summary_rating": "Excellent"
    }
}
```

---

## Testing

### Run Test Suite

```bash
npm run scrape:test
```

This tests:
1. Auto LLM selection
2. Claude-specific scraping
3. Walk Score extraction
4. Crime data extraction
5. School data extraction

### Manual Testing

```bash
# Test single property
npm run scrape:single -- "https://www.zillow.com/..."

# Test batch (create urls.txt first)
npm run scrape:batch -- urls.txt

# Test city scraping
npm run scrape:city -- Tampa FL 25
```

---

## Production Deployment

### Vercel Environment Variables

When deploying to Vercel, configure these environment variables in the Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables:

```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_KEY_HERE
OPENAI_API_KEY=sk-YOUR_KEY_HERE
GROK_API_KEY=xai-YOUR_KEY_HERE
GEMINI_API_KEY=YOUR_KEY_HERE
DEFAULT_LLM=auto
ENABLE_CLAUDE=true
ENABLE_GPT=true
ENABLE_GROK=true
ENABLE_GEMINI=true
MAX_REQUESTS_PER_MINUTE=60
BATCH_SIZE=5
WARN_COST_THRESHOLD=10.00
MAX_DAILY_COST=100.00
```

3. Select **All Environments** (Production, Preview, Development)
4. Click **Save**

### Vercel Serverless Functions

Create API endpoints for scraping:

**File:** `api/scrape-property.js`

```javascript
import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

export default async function handler(req, res) {
    const { url } = req.body;

    const scraper = new UnifiedLLMScraper({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
        grokApiKey: process.env.GROK_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY
    });

    const property = await scraper.scrapeProperty(url, {
        preferredLLM: 'auto',
        enrichData: true
    });

    res.status(200).json(property);
}
```

**Usage:**
```bash
curl -X POST https://your-app.vercel.app/api/scrape-property \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.zillow.com/..."}'
```

---

## Error Handling

### Common Errors

**1. API Key Invalid**
```
Error: API key invalid
Solution: Check your .env file, ensure keys are correct
```

**2. Rate Limit Exceeded**
```
Error: Rate limit exceeded
Solution: Reduce BATCH_SIZE or increase DELAY_BETWEEN_BATCHES_MS
```

**3. Scraping Failed**
```
Error: No JSON found in response
Solution: LLM may not have found the data. Try different LLM or hybrid mode.
```

**4. Cost Limit Exceeded**
```
Error: Cost exceeded max daily limit
Solution: Increase MAX_DAILY_COST in .env or wait until next day
```

### Debugging

Enable debug logging:

```javascript
const scraper = new UnifiedLLMScraper();
scraper.debug = true;  // Logs all API requests/responses
```

---

## Best Practices

### 1. Cost Optimization

- ✅ Use **Gemini** for bulk scraping (cheapest)
- ✅ Use **Auto mode** for production (smart selection)
- ✅ Use **Hybrid mode** only for critical properties
- ✅ Monitor costs with `scraper.printCostBreakdown()`

### 2. Rate Limiting

- ✅ Respect website rate limits (1-2 sec between requests)
- ✅ Use batch processing for large datasets
- ✅ Set `BATCH_SIZE=5` and `DELAY_BETWEEN_BATCHES_MS=1000`

### 3. Data Quality

- ✅ Enable enrichment (`enrichData: true`) for complete data
- ✅ Use hybrid mode for critical properties (accuracy)
- ✅ Validate required fields after scraping
- ✅ Re-scrape if data seems incomplete

### 4. Error Recovery

- ✅ Use `try/catch` for all scraping operations
- ✅ Log failed URLs for retry later
- ✅ Implement exponential backoff for retries

---

## Roadmap

### Coming Soon

- [ ] **Real-time monitoring dashboard** - Track scraping jobs
- [ ] **Scheduled scraping** - Cron jobs for automatic updates
- [ ] **Property change detection** - Alert when prices/status change
- [ ] **Image analysis** - Use LLM vision to analyze property photos
- [ ] **Comparative market analysis** - Auto-generate CMA reports
- [ ] **Neighborhood insights** - Aggregate data for area analysis

---

## Support

For issues or questions:

1. Check this documentation
2. Review example scripts in `src/scrapers/examples/`
3. Check API provider docs (Claude, GPT, Grok, Gemini)
4. Contact: cluesnomads@gmail.com

---

## License

ISC License - CLUES Quantum App © 2025
