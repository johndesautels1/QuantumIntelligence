/**
 * 🏠 SCRAPE PROPERTY API ENDPOINT
 * Vercel Serverless Function - Scrapes a single property URL
 *
 * Usage: POST /api/scrape-property
 * Body: { url: "https://zillow.com/...", llm: "auto" }
 */

import { UnifiedLLMScraper } from '../src/scrapers/llm-unified-scraper.js';

// CORS headers for all responses
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
            message: 'Use POST to scrape properties'
        });
    }

    try {
        const { url, llm = 'auto', enrichData = true } = req.body;

        // Validate URL
        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'URL parameter is required'
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                error: 'Invalid URL',
                message: 'Please provide a valid property listing URL'
            });
        }

        console.log(`🏠 Scraping property: ${url}`);

        // Initialize scraper with environment variables
        const scraper = new UnifiedLLMScraper({
            anthropicApiKey: process.env.ANTHROPIC_API_KEY,
            openaiApiKey: process.env.OPENAI_API_KEY,
            grokApiKey: process.env.GROK_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY
        });

        // Scrape property
        const property = await scraper.scrapeProperty(url, {
            preferredLLM: llm,
            enrichData: enrichData
        });

        if (!property) {
            return res.status(404).json({
                error: 'Scraping failed',
                message: 'Could not extract property data from URL'
            });
        }

        // Get cost stats
        const stats = scraper.getStats();

        // Return success
        return res.status(200).json({
            success: true,
            property: property,
            metadata: {
                url: url,
                llm_used: llm,
                cost: stats.costs.total,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Scraping error:', error);

        return res.status(500).json({
            error: 'Scraping failed',
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
    maxDuration: 60, // 60 seconds timeout
};
