/**
 * 🔍 SEARCH PROPERTIES API ENDPOINT (METHOD B)
 * Vercel Serverless Function - Searches neighborhood and returns top properties
 *
 * Usage: POST /api/search-properties
 * Body: { location: "Belle Vista, St Pete Beach, FL 33706", limit: 3, filters: {...} }
 */

import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Build search URLs for different real estate sites
 */
function buildSearchUrls(location, filters = {}) {
    const {
        minPrice = null,
        maxPrice = null,
        beds = null,
        baths = null,
        propertyType = 'house'
    } = filters;

    // Parse location
    const parts = location.split(',').map(s => s.trim());
    const city = parts[0]?.replace(/\s+/g, '-') || '';
    const state = parts[1]?.replace(/\s+/g, '-') || 'FL';
    const zip = parts[2]?.trim() || '';

    // Build Zillow search URL
    const zillowUrl = `https://www.zillow.com/homes/${city}-${state}${zip ? `-${zip}` : ''}_rb/`;

    // Build Redfin search URL
    const redfinUrl = `https://www.redfin.com/city/${city}/${state}`;

    // Build Trulia search URL
    const truliaUrl = `https://www.trulia.com/${state}/${city}/`;

    return {
        zillow: zillowUrl,
        redfin: redfinUrl,
        trulia: truliaUrl,
        primary: zillowUrl // Default to Zillow
    };
}

/**
 * Use LLM to extract property listing URLs from search page
 */
async function extractListingUrls(scraper, searchUrl, limit = 3) {
    console.log(`🔍 Searching for listings at: ${searchUrl}`);

    const prompt = `Visit this real estate search page and extract the URLs of the first ${limit} property listings you find:

Search URL: ${searchUrl}

Return ONLY a JSON array of property listing URLs (full URLs, not relative paths):
{
  "urls": [
    "https://www.zillow.com/homedetails/123-Main-St...",
    "https://www.zillow.com/homedetails/456-Oak-Ave...",
    ...
  ]
}

Extract exactly ${limit} URLs. Return ONLY the JSON, no other text.`;

    try {
        // Use Grok (fast and cheap for web browsing)
        const response = await scraper.grok.chat.completions.create({
            model: 'grok-beta',
            messages: [{
                role: 'system',
                content: 'You are a real estate listing URL extractor. Return ONLY valid JSON.'
            }, {
                role: 'user',
                content: prompt
            }]
        });

        const content = response.choices[0]?.message?.content?.trim() || '';

        // Remove markdown code blocks
        const cleanContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Extract JSON
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('⚠️ No JSON found in LLM response');
            return [];
        }

        const data = JSON.parse(jsonMatch[0]);
        const urls = data.urls || [];

        console.log(`✅ Found ${urls.length} listing URLs`);
        return urls.slice(0, limit);

    } catch (error) {
        console.error('❌ URL extraction failed:', error.message);
        return [];
    }
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Use POST to search properties'
        });
    }

    try {
        const {
            location,
            limit = 3,
            filters = {},
            llm = 'auto',
            enrichData = true
        } = req.body;

        // Validate location
        if (!location || typeof location !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Location parameter is required (e.g., "Belle Vista, St Pete Beach, FL 33706")'
            });
        }

        console.log(`🏘️ Searching properties in: ${location}`);
        console.log(`📊 Limit: ${limit} properties`);

        // Initialize scraper
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        // Build search URLs
        const searchUrls = buildSearchUrls(location, filters);
        console.log(`🔗 Search URL: ${searchUrls.primary}`);

        // Extract listing URLs using LLM
        const listingUrls = await extractListingUrls(scraper, searchUrls.primary, limit);

        if (listingUrls.length === 0) {
            return res.status(404).json({
                error: 'No properties found',
                message: `Could not find any properties in ${location}. Try a different location or broader search.`,
                searchUrls: searchUrls
            });
        }

        console.log(`🏠 Scraping ${listingUrls.length} properties...`);

        // Scrape all properties in parallel
        const scrapePromises = listingUrls.map(url =>
            scraper.scrapeProperty(url, {
                preferredLLM: llm,
                enrichData: enrichData
            }).catch(error => {
                console.error(`❌ Failed to scrape ${url}:`, error.message);
                return null;
            })
        );

        const properties = (await Promise.all(scrapePromises)).filter(p => p !== null);

        console.log(`✅ Successfully scraped ${properties.length}/${listingUrls.length} properties`);

        // Get cost stats
        const stats = scraper.getStats();

        // Return success
        return res.status(200).json({
            success: true,
            properties: properties,
            metadata: {
                location: location,
                found: listingUrls.length,
                scraped: properties.length,
                failed: listingUrls.length - properties.length,
                cost: stats.costs.total,
                searchUrl: searchUrls.primary,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Search error:', error);

        return res.status(500).json({
            error: 'Search failed',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// Vercel config
export const config = {
    api: {
        bodyParser: true,
        externalResolver: true,
    },
    maxDuration: 300, // 5 minutes for multiple properties
};
