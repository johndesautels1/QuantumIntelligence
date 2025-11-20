# 🤖 UnifiedLLMScraper - CLUES Quantum App

**AI-Powered Real Estate Data Extraction System**

Intelligently scrapes property listings using Claude Max, GPT Pro, Grok Pro, and Gemini Pro.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and add your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_CLAUDE_KEY
OPENAI_API_KEY=sk-YOUR_GPT_KEY
GROK_API_KEY=xai-YOUR_GROK_KEY
GEMINI_API_KEY=YOUR_GEMINI_KEY
```

### 3. Test Installation

```bash
npm run scrape:test
```

### 4. Scrape Your First Property

```bash
npm run scrape:single -- "https://www.zillow.com/homedetails/..."
```

---

## 📂 File Structure

```
src/scrapers/
├── llm-unified-scraper.js      # Main scraper class
├── scraper-integration.js      # DataManager integration
├── config.js                   # Configuration
├── examples/
│   ├── test-llm-scraper.js    # Test suite
│   ├── scrape-single-property.js
│   ├── scrape-batch.js
│   └── scrape-city.js
└── README.md                   # This file
```

---

## 🎯 Usage Examples

### Single Property

```javascript
import { UnifiedLLMScraper } from './llm-unified-scraper.js';

const scraper = new UnifiedLLMScraper();

const property = await scraper.scrapeProperty(
    'https://www.zillow.com/homedetails/...',
    {
        preferredLLM: 'auto',  // or 'claude', 'gpt', 'grok', 'gemini'
        enrichData: true       // Add Walk Score, Crime, Schools
    }
);

console.log(property);
scraper.printCostBreakdown();
```

### Batch Properties

```bash
# Create urls.txt with one URL per line
npm run scrape:batch -- urls.txt
```

### Entire City

```bash
npm run scrape:city -- Miami FL 100
```

### With DataManager Integration

```javascript
import { ScraperIntegration } from './scraper-integration.js';
import { DataManager } from '../core/data-manager.js';

const dataManager = new DataManager();
await dataManager.init();

const integration = new ScraperIntegration(dataManager);

// Scrapes and saves to IndexedDB automatically
await integration.scrapeAndStore('https://www.zillow.com/...');
```

---

## 🤖 LLM Selection

The scraper auto-selects the best LLM based on the task:

| Source | Best LLM | Reason |
|--------|----------|--------|
| Zillow | Claude | Structured data extraction |
| Redfin | Claude | Complex nested data |
| Trulia | GPT | Modern site layouts |
| Homes.com | Gemini | Speed + low cost |
| Compass | Grok | Real-time web search |
| Walk Score | GPT | Web browsing capability |
| Crime Data | Claude | Data aggregation |
| Schools | Gemini | Fast and cheap |

Override with `preferredLLM`:

```javascript
// Force cheapest (Gemini)
await scraper.scrapeProperty(url, { preferredLLM: 'gemini' });

// Force most accurate (Claude)
await scraper.scrapeProperty(url, { preferredLLM: 'claude' });

// Use all 4 LLMs with consensus (expensive but accurate!)
await scraper.scrapeProperty(url, { useHybrid: true });
```

---

## 💰 Cost Estimates

| LLM | Cost Per Property |
|-----|-------------------|
| **Gemini** | $0.002 (cheapest) |
| **Grok** | $0.02 |
| **Claude** | $0.03 |
| **GPT** | $0.07 |
| **Hybrid** (all 4) | $0.12 |

### Monthly Estimates (Auto Mode)

- 100 properties: $2-5
- 500 properties: $10-25
- 1,000 properties: $20-50
- 10,000 properties: $200-500

---

## 🔧 Configuration

Edit `config.js` or `.env`:

```env
# Default LLM selection
DEFAULT_LLM=auto

# Enable/disable specific LLMs
ENABLE_CLAUDE=true
ENABLE_GPT=true
ENABLE_GROK=true
ENABLE_GEMINI=true

# Rate limiting
MAX_REQUESTS_PER_MINUTE=60
BATCH_SIZE=5
DELAY_BETWEEN_BATCHES_MS=1000

# Cost management
WARN_COST_THRESHOLD=10.00
MAX_DAILY_COST=100.00
```

---

## 📊 Data Output

Each scraped property includes:

```javascript
{
    address: { full_address, street, city, state, zip, lat, lng },
    price: { current, original, per_sqft, tax_assessed },
    property: { bedrooms, bathrooms, sqft, lot_size, year_built, pool, garage },
    listing: { status, days_on_market, mls_number, agent },
    walkability: { walk_score, transit_score, bike_score },
    crime: { crime_index, safety_score, grade },
    schools: { district, average_rating, elementary, middle, high }
}
```

---

## 🧪 Testing

### Run All Tests

```bash
npm run scrape:test
```

Tests include:
1. Auto LLM selection
2. Claude-specific scraping
3. Walk Score extraction
4. Crime data extraction
5. School data extraction

### Manual Tests

```bash
# Single property
npm run scrape:single -- "https://www.zillow.com/..."

# Batch (create urls.txt first)
npm run scrape:batch -- urls.txt

# City
npm run scrape:city -- Tampa FL 25
```

---

## 🚀 Deployment

### Vercel

See [VERCEL_DEPLOYMENT_GUIDE.md](../../docs/VERCEL_DEPLOYMENT_GUIDE.md)

**Environment Variables Required:**
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `GROK_API_KEY`
- `GEMINI_API_KEY`

### Serverless Function Example

```javascript
// api/scrape-property.js
import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

export default async function handler(req, res) {
    const scraper = new UnifiedLLMScraper({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        openaiApiKey: process.env.OPENAI_API_KEY,
        grokApiKey: process.env.GROK_API_KEY,
        geminiApiKey: process.env.GEMINI_API_KEY
    });

    const property = await scraper.scrapeProperty(req.body.url);
    res.json(property);
}
```

---

## 🛠️ Troubleshooting

### API Key Errors

```
Error: API key invalid
```

**Solution:** Check `.env` file, ensure keys are correct.

### Rate Limit Errors

```
Error: Rate limit exceeded
```

**Solution:** Reduce `BATCH_SIZE` or increase `DELAY_BETWEEN_BATCHES_MS`.

### Scraping Failures

```
Error: No JSON found in response
```

**Solution:** Try different LLM or enable hybrid mode.

### Enable Debug Mode

```javascript
const scraper = new UnifiedLLMScraper();
scraper.debug = true;  // Logs all API calls
```

---

## 📚 Documentation

- **Full Documentation:** [docs/LLM_SCRAPER_DOCUMENTATION.md](../../docs/LLM_SCRAPER_DOCUMENTATION.md)
- **Vercel Deployment:** [docs/VERCEL_DEPLOYMENT_GUIDE.md](../../docs/VERCEL_DEPLOYMENT_GUIDE.md)
- **Data Strategy:** [LLM_FIRST_DATA_STRATEGY.md](../../LLM_FIRST_DATA_STRATEGY.md)

---

## 🎯 Best Practices

1. ✅ Use **auto mode** for production (smart LLM selection)
2. ✅ Use **Gemini** for bulk scraping (cheapest)
3. ✅ Use **hybrid mode** only for critical properties
4. ✅ Monitor costs with `scraper.printCostBreakdown()`
5. ✅ Respect rate limits (1-2 sec between requests)
6. ✅ Enable enrichment for complete data
7. ✅ Log failed URLs for retry later

---

## 📝 License

ISC License - CLUES Quantum App © 2025

---

## 📧 Support

- Email: cluesnomads@gmail.com
- Documentation: `/docs/LLM_SCRAPER_DOCUMENTATION.md`

---

**Status:** ✅ Production Ready

The LLM scraper is fully functional and ready for deployment with Claude Max, GPT Pro, Grok Pro, and Gemini Pro!
