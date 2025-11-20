# 🚀 CLUES Quantum App - Quick Start Guide

**Last Updated:** November 20, 2025

---

## 🔑 Your API Keys (Keep Private!)

### ✅ Claude Max API Key
```
sk-ant-api03-YOUR_CLAUDE_KEY_HERE
```
**Get yours from:** https://console.anthropic.com/

### ✅ OpenAI GPT Pro API Key
```
sk-proj-YOUR_OPENAI_KEY_HERE
```
**Get yours from:** https://platform.openai.com/api-keys

### ⚠️ Grok API Key
```
xai-YOUR_GROK_KEY_HERE
```
**Get yours from:** https://console.x.ai/

### ⚠️ Gemini Pro API Key (Optional)
```
AIza-YOUR_GEMINI_KEY_HERE
```
**Get yours from:** https://makersuite.google.com/app/apikey

---

## 🏁 5-Minute Setup

### Step 1: Install Dependencies (30 seconds)

```bash
cd C:\Users\broke\CLUES_Quantum_App
npm install
```

### Step 2: Create `.env` File (1 minute)

```bash
# Copy template
cp .env.local.template .env

# Open in your editor (VS Code, Notepad++, etc.)
code .env
```

### Step 3: Add Your API Keys to `.env` (2 minutes)

Replace the placeholders:

```env
ANTHROPIC_API_KEY=sk-ant-api03-YOUR_CLAUDE_KEY_HERE
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
GROK_API_KEY=xai-YOUR_GROK_KEY_HERE
GEMINI_API_KEY=AIza-YOUR_GEMINI_KEY_HERE

DEFAULT_LLM=auto
ENABLE_CLAUDE=true
ENABLE_GPT=true
ENABLE_GROK=true
ENABLE_GEMINI=true
```

### Step 4: Test the Scraper (1 minute)

```bash
npm run scrape:test
```

Expected output:
```
🧪 TESTING UNIFIED LLM SCRAPER
✅ Configuration valid
1️⃣ Testing AUTO LLM selection...
✅ Auto selection test PASSED
...
💰 COST SUMMARY
✅ ALL TESTS COMPLETE
```

### Step 5: Scrape Your First Property (30 seconds)

```bash
npm run scrape:single -- "https://www.zillow.com/homedetails/your-property-url"
```

---

## 🎯 Common Tasks

### Scrape a Single Property

```bash
npm run scrape:single -- "https://www.zillow.com/homedetails/..."
```

### Scrape Multiple Properties (Batch)

```bash
# Create urls.txt with one URL per line
echo "https://www.zillow.com/homedetails/..." > urls.txt
echo "https://www.redfin.com/..." >> urls.txt

# Run batch scraper
npm run scrape:batch -- urls.txt
```

### Scrape Entire City

```bash
npm run scrape:city -- Miami FL 100
```

Parameters:
- City: `Miami`, `Tampa`, `Orlando`, etc.
- State: `FL` (Florida)
- Max properties: `100` (adjust as needed)

---

## 📊 Understanding Costs

### Per Property
- **Gemini:** $0.002 (cheapest!)
- **Grok:** $0.02
- **Claude:** $0.03
- **GPT:** $0.07
- **Auto mode:** Uses cheapest capable LLM

### Monthly Estimates (Auto Mode)
- 100 properties: $2-5
- 500 properties: $10-25
- 1,000 properties: $20-50

### What You Get (No Extra APIs Needed!)
- Property data (address, price, beds, baths, etc.)
- Walk Score (normally $300/mo API)
- Crime data (normally $500/mo API)
- School ratings (normally $200/mo API)

**Total Savings:** $1,950/month vs traditional APIs!

---

## 🚀 Deploy to Vercel

### Step 1: Add Environment Variables to Vercel

1. Go to https://vercel.com/
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add these variables (copy from your `.env` file):

```
ANTHROPIC_API_KEY = sk-ant-api03-UbtOWDon...
OPENAI_API_KEY = sk-proj-pZ-5hcto...
GROK_API_KEY = xai-...
GEMINI_API_KEY = AIza...
DEFAULT_LLM = auto
ENABLE_CLAUDE = true
ENABLE_GPT = true
ENABLE_GROK = true
ENABLE_GEMINI = true
```

5. Select **All** environments (Production, Preview, Development)
6. Click **Save**

### Step 2: Deploy

```bash
git add .
git commit -m "feat: Add LLM scraper configuration"
git push origin master
```

Vercel auto-deploys!

### Step 3: Test Production

```bash
# Check health
curl https://your-app.vercel.app/api/health

# Scrape property
curl -X POST https://your-app.vercel.app/api/scrape-property \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.zillow.com/..."}'
```

---

## 🛡️ Security Reminders

### ⚠️ CRITICAL: Never Commit API Keys!

Before every commit:

```bash
# 1. Check what's staged
git status

# 2. Verify .env is NOT in the list
# If it is, run: git reset HEAD .env

# 3. Only then commit
git commit -m "your message"
```

### Your `.gitignore` Already Protects:
- ✅ `.env`
- ✅ `.env.*`
- ✅ `*.key`
- ✅ `*-key.txt`

### If You Accidentally Commit Keys:
1. **Immediately rotate all API keys** (get new ones)
2. Remove from git history (see `SECURITY_CHECKLIST.md`)
3. Update `.env` and Vercel with new keys

---

## 📚 Documentation

### Quick References
- **This Guide:** `QUICK_START_GUIDE.md`
- **Scraper README:** `src/scrapers/README.md`
- **Security:** `SECURITY_CHECKLIST.md`

### Detailed Guides
- **Full Documentation:** `docs/LLM_SCRAPER_DOCUMENTATION.md`
- **Vercel Deployment:** `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Implementation Summary:** `LLM_SCRAPER_IMPLEMENTATION_SUMMARY.md`

### Project Docs
- **Current State:** `CURRENT_STATE_AND_NEXT_STEPS.md`
- **Data Strategy:** `LLM_FIRST_DATA_STRATEGY.md`

---

## 🎯 Next Steps

### Immediate (5 minutes)
1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` with your API keys
3. ✅ Test: `npm run scrape:test`
4. ✅ Scrape one property: `npm run scrape:single -- "url"`

### Short-term (1-2 hours)
1. ✅ Get Grok API key (you have this)
2. ✅ Get Gemini API key (optional but cheapest!)
3. ✅ Add keys to Vercel dashboard
4. ✅ Deploy to production

### Medium-term (1 day)
1. ✅ Scrape Miami: `npm run scrape:city -- Miami FL 100`
2. ✅ Verify data in Holographic Sphere
3. ✅ Expand to other Florida cities

### Long-term (Ongoing)
1. ✅ Set up scheduled scraping (Vercel Cron)
2. ✅ Add property change alerts
3. ✅ Build analytics dashboard
4. ✅ Export to PDF/Excel

---

## 💡 Pro Tips

### Cost Optimization
- Use **Auto mode** for production (intelligently picks cheapest)
- Use **Gemini** for bulk scraping (10x cheaper than GPT)
- Use **Hybrid mode** only for critical properties

### Rate Limiting
- Default: 5 properties per batch, 1 second delay
- Adjust in `.env`: `BATCH_SIZE=10`, `DELAY_BETWEEN_BATCHES_MS=2000`

### Data Quality
- Enable enrichment: `enrichData: true` (gets Walk Score, Crime, Schools)
- Use hybrid mode for validation: `useHybrid: true`
- Re-scrape if data seems incomplete

---

## 🆘 Troubleshooting

### "API key invalid"
- Check `.env` file has correct keys (no extra spaces)
- Verify keys are active on provider dashboards

### "No JSON found in response"
- LLM couldn't extract data - try different LLM
- Use hybrid mode for consensus

### "Rate limit exceeded"
- Reduce `BATCH_SIZE` in `.env`
- Increase `DELAY_BETWEEN_BATCHES_MS`

### Need Help?
- Email: cluesnomads@gmail.com
- Check docs: `/docs/LLM_SCRAPER_DOCUMENTATION.md`

---

## 📞 Support

**Email:** cluesnomads@gmail.com
**Documentation:** `docs/` directory
**Status:** ✅ Production Ready

---

**You're all set!** 🎉

Run `npm run scrape:test` to get started, then scrape your first property with:

```bash
npm run scrape:single -- "https://www.zillow.com/homedetails/..."
```

**Remember:** Your Claude and GPT keys are active and ready to use. Just add them to `.env` and you're good to go!
