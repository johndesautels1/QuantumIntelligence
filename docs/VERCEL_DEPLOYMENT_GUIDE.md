# 🚀 Vercel Deployment Guide - CLUES Quantum App

## Overview

This guide explains how to deploy the CLUES Quantum App with LLM scraper functionality to Vercel, including proper configuration of environment variables for Claude Max, GPT Pro, Grok Pro, and Gemini Pro API keys.

---

## Prerequisites

1. ✅ Vercel account (free tier works)
2. ✅ GitHub repository with CLUES Quantum App
3. ✅ API keys for Claude, GPT, Grok, and Gemini
4. ✅ Local testing completed

---

## Step 1: Prepare Your Repository

### 1.1 Ensure `.env` is Gitignored

Check that `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# API keys (never commit these!)
*.key
*-key.txt
```

### 1.2 Commit Your Code

```bash
cd C:\Users\broke\CLUES_Quantum_App

git add .
git commit -m "feat: Add LLM scraper with multi-model support"
git push origin master
```

---

## Step 2: Connect to Vercel

### 2.1 Import Project

1. Go to https://vercel.com/
2. Click **Add New Project**
3. Select **Import Git Repository**
4. Choose your GitHub repository: `CLUES_Quantum_App`
5. Click **Import**

### 2.2 Configure Build Settings

**Framework Preset:** Other (or None)

**Build Command:**
```bash
npm install
```

**Output Directory:**
```
.
```

**Install Command:**
```bash
npm install
```

**Root Directory:** `.` (leave as root)

---

## Step 3: Configure Environment Variables

### 3.1 Add API Keys

In the Vercel project dashboard:

1. Click **Settings** (top navigation)
2. Click **Environment Variables** (left sidebar)
3. Add the following variables one by one:

#### Required API Keys

| Variable Name | Example Value | Environment |
|---------------|---------------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-UbtOWDon4LaXIQx...` | All |
| `OPENAI_API_KEY` | `sk-proj-...` | All |
| `GROK_API_KEY` | `xai-...` | All |
| `GEMINI_API_KEY` | `AIza...` | All |

**API Key Formats:**

✅ **Claude API Key:**
- Format: `sk-ant-api03-...`
- Get from: https://console.anthropic.com/

✅ **OpenAI GPT API Key:**
- Format: `sk-proj-...`
- Get from: https://platform.openai.com/api-keys

✅ **Grok API Key:**
- Format: `xai-...`
- Get from: https://console.x.ai/

✅ **Gemini API Key:**
- Format: `AIza...`
- Get from: https://makersuite.google.com/app/apikey

For each variable:
1. Click **Add New**
2. Enter the **Name** (e.g., `ANTHROPIC_API_KEY`)
3. Enter the **Value** (the API key)
4. Select **All** environments (Production, Preview, Development)
5. Click **Save**

#### Optional Configuration

Add these for better control:

| Variable Name | Default Value | Description |
|---------------|---------------|-------------|
| `DEFAULT_LLM` | `auto` | Auto-select best LLM |
| `ENABLE_CLAUDE` | `true` | Enable Claude scraping |
| `ENABLE_GPT` | `true` | Enable GPT scraping |
| `ENABLE_GROK` | `true` | Enable Grok scraping |
| `ENABLE_GEMINI` | `true` | Enable Gemini scraping |
| `MAX_REQUESTS_PER_MINUTE` | `60` | Rate limit |
| `BATCH_SIZE` | `5` | Properties per batch |
| `DELAY_BETWEEN_BATCHES_MS` | `1000` | Delay (ms) |
| `WARN_COST_THRESHOLD` | `10.00` | Cost warning ($) |
| `MAX_DAILY_COST` | `100.00` | Max daily spend ($) |

### 3.2 Verify Environment Variables

After adding all variables, you should see a list like this:

```
✓ ANTHROPIC_API_KEY (Production, Preview, Development)
✓ OPENAI_API_KEY (Production, Preview, Development)
✓ GROK_API_KEY (Production, Preview, Development)
✓ GEMINI_API_KEY (Production, Preview, Development)
✓ DEFAULT_LLM (Production, Preview, Development)
✓ ENABLE_CLAUDE (Production, Preview, Development)
✓ ENABLE_GPT (Production, Preview, Development)
✓ ENABLE_GROK (Production, Preview, Development)
✓ ENABLE_GEMINI (Production, Preview, Development)
```

---

## Step 4: Create Vercel Serverless Functions

Vercel serverless functions allow you to run scraping jobs on-demand via API endpoints.

### 4.1 Create API Directory

```bash
mkdir -p api
```

### 4.2 Create Scraping Endpoint

**File:** `api/scrape-property.js`

```javascript
import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url, llm = 'auto', enrich = true } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        const property = await scraper.scrapeProperty(url, {
            preferredLLM: llm,
            enrichData: enrich
        });

        const stats = scraper.getStats();

        res.status(200).json({
            success: true,
            property: property,
            cost: stats.costs.total,
            llm_used: llm
        });

    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

### 4.3 Create Batch Scraping Endpoint

**File:** `api/scrape-batch.js`

```javascript
import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { urls, batchSize = 5, llm = 'auto' } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'URLs array is required' });
    }

    try {
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        const properties = await scraper.scrapeMultipleProperties(urls, {
            batchSize: batchSize,
            delayMs: 1000,
            llm: llm
        });

        const stats = scraper.getStats();

        res.status(200).json({
            success: true,
            total: urls.length,
            scraped: properties.length,
            properties: properties,
            cost: stats.costs.total,
            breakdown: stats.costs
        });

    } catch (error) {
        console.error('Batch scraping error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
```

### 4.4 Create Health Check Endpoint

**File:** `api/health.js`

```javascript
export default async function handler(req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        llms: {
            claude: !!process.env.ANTHROPIC_API_KEY,
            gpt: !!process.env.OPENAI_API_KEY,
            grok: !!process.env.GROK_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY
        }
    });
}
```

---

## Step 5: Deploy

### 5.1 Push Changes

```bash
git add api/
git commit -m "feat: Add Vercel serverless functions for scraping"
git push origin master
```

### 5.2 Trigger Deployment

Vercel automatically deploys when you push to your connected branch.

1. Go to your Vercel dashboard
2. You should see a deployment in progress
3. Wait for deployment to complete (usually 1-2 minutes)
4. Click on the deployment URL

### 5.3 Verify Deployment

Once deployed, test your endpoints:

**Health Check:**
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
    "status": "healthy",
    "timestamp": "2025-11-20T...",
    "llms": {
        "claude": true,
        "gpt": true,
        "grok": true,
        "gemini": true
    }
}
```

---

## Step 6: Test Scraping Endpoints

### 6.1 Test Single Property Scraping

```bash
curl -X POST https://your-app.vercel.app/api/scrape-property \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/",
    "llm": "auto",
    "enrich": true
  }'
```

### 6.2 Test Batch Scraping

```bash
curl -X POST https://your-app.vercel.app/api/scrape-batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
        "https://www.zillow.com/homedetails/.../12345678_zpid/",
        "https://www.redfin.com/FL/Miami/.../home/23456789"
    ],
    "batchSize": 2,
    "llm": "auto"
  }'
```

### 6.3 Test from Browser

You can also test from your app's frontend:

```javascript
// Frontend code (src/enhancement_3_holographic_sphere.html)

async function scrapeProperty(url) {
    const response = await fetch('/api/scrape-property', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            llm: 'auto',
            enrich: true
        })
    });

    const data = await response.json();

    if (data.success) {
        console.log('Property scraped!', data.property);
        console.log('Cost:', data.cost);
        // Add to database or UI
    } else {
        console.error('Scraping failed:', data.error);
    }
}
```

---

## Step 7: Monitor & Optimize

### 7.1 View Logs

1. Go to Vercel dashboard
2. Click your project
3. Click **Deployments**
4. Click on a deployment
5. Click **Functions** tab
6. View real-time logs

### 7.2 Monitor Costs

Check API usage:
- **Claude:** https://console.anthropic.com/settings/usage
- **GPT:** https://platform.openai.com/usage
- **Grok:** https://console.x.ai/usage
- **Gemini:** https://console.cloud.google.com/apis/dashboard

### 7.3 Optimize Performance

**Enable Edge Functions** (faster responses):

Create `vercel.json`:

```json
{
    "functions": {
        "api/scrape-property.js": {
            "maxDuration": 60
        },
        "api/scrape-batch.js": {
            "maxDuration": 300
        }
    }
}
```

**Caching** (reduce API calls):

```javascript
// Add caching headers to API responses
res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
```

---

## Step 8: Security Best Practices

### 8.1 Add API Authentication

Protect your scraping endpoints with API keys:

```javascript
// api/scrape-property.js
export default async function handler(req, res) {
    // Check API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // ... rest of code
}
```

Add `API_SECRET` to Vercel environment variables.

### 8.2 Rate Limiting

Add rate limiting to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

export default limiter(async function handler(req, res) {
    // ... scraping logic
});
```

### 8.3 CORS Configuration

Allow only your domain:

```javascript
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    // ... rest of code
}
```

---

## Troubleshooting

### Issue 1: API Key Not Found

**Error:** `API key invalid`

**Solution:**
1. Check environment variables in Vercel dashboard
2. Ensure variable names are exact (case-sensitive)
3. Redeploy after adding variables

### Issue 2: Function Timeout

**Error:** `Function execution timed out`

**Solution:**
1. Increase `maxDuration` in `vercel.json`
2. Use batch processing for multiple properties
3. Consider background jobs for large datasets

### Issue 3: Module Not Found

**Error:** `Cannot find module 'xyz'`

**Solution:**
1. Run `npm install` locally
2. Ensure `package.json` includes all dependencies
3. Push `package-lock.json` to Git
4. Redeploy

### Issue 4: CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
1. Add CORS headers to API responses
2. Check allowed origins
3. Use proxy if needed

---

## Next Steps

1. ✅ Set up scheduled scraping (Vercel Cron Jobs)
2. ✅ Add webhook notifications (Discord/Slack)
3. ✅ Implement property change detection
4. ✅ Build admin dashboard for monitoring
5. ✅ Add database integration (Supabase/MongoDB)

---

## Resources

- **Vercel Docs:** https://vercel.com/docs
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Serverless Functions:** https://vercel.com/docs/functions
- **Edge Functions:** https://vercel.com/docs/functions/edge-functions

---

## Support

For deployment issues:
- Email: cluesnomads@gmail.com
- Vercel Support: https://vercel.com/support

---

**Deployment Status:** ✅ Ready for Production

Your Claude API key and Grok API key are ready to be added to Vercel environment variables for secure, serverless scraping!
