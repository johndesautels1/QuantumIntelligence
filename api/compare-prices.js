/**
 * 💰 COMPARE PRICES API ENDPOINT
 * Vercel Serverless Function - Compares prices between multiple properties
 *
 * Usage: POST /api/compare-prices
 * Body: { properties: [{...}, {...}, {...}], area: "Belle Vista, FL" }
 */

import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Use POST to compare prices'
        });
    }

    try {
        const { properties, area = 'Unknown Area' } = req.body;

        // Validate properties
        if (!properties || !Array.isArray(properties) || properties.length < 2) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Need at least 2 properties to compare'
            });
        }

        console.log(`💰 Comparing ${properties.length} properties in ${area}`);

        // Initialize scraper (for comparePricesInArea method)
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        // Run comparison
        const comparison = await scraper.comparePricesInArea(properties, area);

        if (!comparison) {
            return res.status(400).json({
                error: 'Comparison failed',
                message: 'Could not generate price comparison'
            });
        }

        console.log(`✅ Comparison complete`);

        // Return success
        return res.status(200).json({
            success: true,
            comparison: comparison,
            metadata: {
                area: area,
                properties_compared: properties.length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Comparison error:', error);

        return res.status(500).json({
            error: 'Comparison failed',
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
    maxDuration: 30,
};
