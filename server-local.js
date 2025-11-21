#!/usr/bin/env node
/**
 * Local Development Server
 * Runs API endpoints locally for testing before Vercel deployment
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers (we'll need to adapt them)
import { UnifiedLLMScraper } from './src/scrapers/llm-unified-scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001; // Different port from http-server

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from www
app.use(express.static(path.join(__dirname, 'www')));

/**
 * POST /api/search-properties
 * Method B: Auto-search neighborhood
 */
app.post('/api/search-properties', async (req, res) => {
    try {
        const { location, limit = 3, filters = {} } = req.body;

        if (!location) {
            return res.status(400).json({
                success: false,
                message: 'Location is required'
            });
        }

        console.log(`🔍 Searching for ${limit} properties in: ${location}`);

        // Initialize scraper
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        // Build search URLs
        const searchUrls = buildSearchUrls(location, filters);
        console.log('📍 Search URLs:', searchUrls);

        // Extract listing URLs using Grok
        let listingUrls = [];
        for (const [platform, url] of Object.entries(searchUrls)) {
            try {
                console.log(`🔍 Extracting listings from ${platform}...`);
                const urls = await extractListingUrls(scraper, url, limit);
                listingUrls.push(...urls);
                if (listingUrls.length >= limit) break;
            } catch (error) {
                console.warn(`⚠️ Failed to extract from ${platform}:`, error.message);
            }
        }

        listingUrls = listingUrls.slice(0, limit);

        if (listingUrls.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No properties found in this neighborhood'
            });
        }

        console.log(`✅ Found ${listingUrls.length} listings, scraping...`);

        // Scrape all properties in parallel
        const properties = await Promise.all(
            listingUrls.map(async (url) => {
                try {
                    const property = await scraper.scrapeProperty(url, {
                        preferredLLM: 'auto',
                        enrichData: true
                    });
                    return property;
                } catch (error) {
                    console.error(`❌ Failed to scrape ${url}:`, error.message);
                    return null;
                }
            })
        );

        const validProperties = properties.filter(p => p !== null);

        return res.status(200).json({
            success: true,
            properties: validProperties,
            metadata: {
                location,
                requested: limit,
                found: validProperties.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Search error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/scrape-property
 * Scrape single property URL
 */
app.post('/api/scrape-property', async (req, res) => {
    try {
        const { url, llm = 'auto', enrichData = true } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        console.log(`🏠 Scraping property: ${url}`);

        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        const property = await scraper.scrapeProperty(url, {
            preferredLLM: llm,
            enrichData: enrichData
        });

        const stats = scraper.getStats();

        return res.status(200).json({
            success: true,
            property: property,
            metadata: {
                url,
                llm_used: llm,
                cost: stats.costs.total,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Scrape error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Helper: Build search URLs for different platforms
 */
function buildSearchUrls(location, filters = {}) {
    const parts = location.split(',').map(s => s.trim());
    const neighborhood = parts[0]?.replace(/\s+/g, '-') || '';
    const city = parts[1]?.replace(/\s+/g, '-') || '';
    const state = parts[2]?.replace(/\s+/g, '') || 'FL';
    const zip = parts[3]?.trim() || '';

    const urls = {};

    // Zillow
    const zillowLocation = zip || `${city}-${state}`;
    urls.zillow = `https://www.zillow.com/homes/${zillowLocation}_rb/`;

    // Redfin
    urls.redfin = `https://www.redfin.com/city/${city}/${state}`;

    // Trulia
    urls.trulia = `https://www.trulia.com/${state}/${city}/`;

    return urls;
}

/**
 * Helper: Extract listing URLs from search page
 */
async function extractListingUrls(scraper, searchUrl, limit = 3) {
    const prompt = `Visit this real estate search page and extract the URLs of the first ${limit} property listings.

Search URL: ${searchUrl}

Return ONLY a JSON array of property URLs, like this:
["https://www.zillow.com/homedetails/...", "https://www.redfin.com/..."]

Do not include any explanation, just the JSON array.`;

    try {
        const response = await scraper.grok.chat.completions.create({
            model: 'grok-beta',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1
        });

        const content = response.choices[0].message.content.trim();
        const urls = JSON.parse(content);
        return Array.isArray(urls) ? urls : [];
    } catch (error) {
        console.error('Failed to extract URLs:', error);
        return [];
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Local API Server Running`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`\n🌐 API Endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/search-properties`);
    console.log(`   POST http://localhost:${PORT}/api/scrape-property`);
    console.log(`\n✅ Ready for requests!\n`);
});
