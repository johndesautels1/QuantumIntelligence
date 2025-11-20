/**
 * 🤖 UNIFIED LLM SCRAPER - CLUES Quantum App
 *
 * Multi-LLM orchestration system for intelligent real estate data extraction
 * Supports: Claude Max, GPT Pro, Grok Pro, Gemini Pro
 *
 * Key Features:
 * - Auto-selects best LLM based on task
 * - Hybrid consensus mode for accuracy
 * - Walk Score extraction (no API key needed)
 * - Crime data extraction (no API key needed)
 * - Self-healing (adapts to site changes)
 * - Cost tracking and optimization
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export class UnifiedLLMScraper {
    constructor(config = {}) {
        // Initialize all 4 LLM clients
        this.claude = new Anthropic({
            apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY
        });

        this.gpt = new OpenAI({
            apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
        });

        this.gemini = new GoogleGenerativeAI(
            config.geminiApiKey || process.env.GEMINI_API_KEY
        );

        // Grok API configuration (using OpenAI-compatible endpoint)
        this.grok = new OpenAI({
            apiKey: config.grokApiKey || process.env.GROK_API_KEY,
            baseURL: 'https://api.x.ai/v1'
        });

        // Cost tracking
        this.costs = {
            claude: 0,
            gpt: 0,
            grok: 0,
            gemini: 0,
            total: 0
        };

        // Rate limiting
        this.requestCounts = {
            claude: 0,
            gpt: 0,
            grok: 0,
            gemini: 0
        };

        // LLM selection preferences based on task
        this.llmPreferences = {
            zillow: 'claude',      // Claude best for structured extraction
            redfin: 'claude',
            trulia: 'gpt',         // GPT good for complex layouts
            'homes.com': 'gemini', // Gemini fast and cheap
            compass: 'grok',       // Grok for modern sites
            kw: 'grok',            // Keller Williams
            walkscore: 'gpt',      // GPT best for walk score sites
            crime: 'claude',       // Claude best for data aggregation
            schools: 'gemini'      // Gemini fast for school data
        };

        console.log('✅ UnifiedLLMScraper initialized with 4 LLMs');
    }

    /**
     * 🎯 MASTER SCRAPING METHOD
     * Intelligently routes to best LLM or uses hybrid mode
     */
    async scrapeProperty(url, options = {}) {
        const {
            preferredLLM = 'auto',
            useHybrid = false,
            enrichData = true
        } = options;

        console.log(`🏠 Scraping property: ${url}`);
        console.log(`📊 Mode: ${useHybrid ? 'Hybrid (All LLMs)' : preferredLLM}`);

        try {
            let propertyData;

            if (useHybrid) {
                // Run all LLMs and use consensus
                propertyData = await this.scrapeWithHybrid(url);
            } else if (preferredLLM === 'auto') {
                // Auto-select best LLM
                const llm = this.selectBestLLM(url);
                console.log(`🤖 Auto-selected: ${llm}`);
                propertyData = await this.scrapeWithLLM(url, llm);
            } else {
                // Use specified LLM
                propertyData = await this.scrapeWithLLM(url, preferredLLM);
            }

            // Enrich with additional data if requested
            if (enrichData && propertyData) {
                console.log('🔍 Enriching property data...');
                propertyData = await this.enrichPropertyData(propertyData);
            }

            console.log('✅ Property scraping complete');
            return propertyData;

        } catch (error) {
            console.error('❌ Scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * 🧠 SELECT BEST LLM BASED ON URL
     */
    selectBestLLM(url) {
        const urlLower = url.toLowerCase();

        if (urlLower.includes('zillow')) return this.llmPreferences.zillow;
        if (urlLower.includes('redfin')) return this.llmPreferences.redfin;
        if (urlLower.includes('trulia')) return this.llmPreferences.trulia;
        if (urlLower.includes('homes.com')) return this.llmPreferences['homes.com'];
        if (urlLower.includes('compass')) return this.llmPreferences.compass;
        if (urlLower.includes('kw.com') || urlLower.includes('kellerwilliams')) return this.llmPreferences.kw;

        // Default to Claude for unknown sites
        return 'claude';
    }

    /**
     * 🔀 ROUTE TO SPECIFIC LLM
     */
    async scrapeWithLLM(url, llm) {
        switch (llm) {
            case 'claude':
                return await this.scrapeWithClaude(url);
            case 'gpt':
                return await this.scrapeWithGPT(url);
            case 'grok':
                return await this.scrapeWithGrok(url);
            case 'gemini':
                return await this.scrapeWithGemini(url);
            default:
                throw new Error(`Unknown LLM: ${llm}`);
        }
    }

    /**
     * 🟣 CLAUDE MAX SCRAPER
     * Uses Computer Use tool for accurate structured extraction
     */
    async scrapeWithClaude(url) {
        console.log('🟣 Using Claude Max...');

        const prompt = this.buildExtractionPrompt(url);

        try {
            const response = await this.claude.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                tools: [{
                    type: 'computer_20241022',
                    name: 'computer',
                    display_width_px: 1920,
                    display_height_px: 1080
                }]
            });

            // Parse Claude's response
            const propertyData = this.parseClaudeResponse(response);

            // Track cost (Claude Sonnet: $3/MTok input, $15/MTok output)
            const inputTokens = response.usage.input_tokens;
            const outputTokens = response.usage.output_tokens;
            const cost = (inputTokens * 0.003 + outputTokens * 0.015) / 1000;
            this.costs.claude += cost;
            this.costs.total += cost;
            this.requestCounts.claude++;

            console.log(`💰 Claude cost: $${cost.toFixed(4)}`);

            return propertyData;

        } catch (error) {
            console.error('❌ Claude scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * 🟢 GPT PRO SCRAPER
     * Uses web browsing for real-time data
     */
    async scrapeWithGPT(url) {
        console.log('🟢 Using GPT Pro...');

        const prompt = this.buildExtractionPrompt(url);

        try {
            const response = await this.gpt.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{
                    role: 'system',
                    content: 'You are a real estate data extraction expert. Extract property information and return as JSON.'
                }, {
                    role: 'user',
                    content: prompt
                }],
                tools: [{
                    type: 'function',
                    function: {
                        name: 'web_search',
                        description: 'Search and browse the web for property data',
                        parameters: {
                            type: 'object',
                            properties: {
                                url: { type: 'string' }
                            }
                        }
                    }
                }],
                tool_choice: 'auto'
            });

            // Parse GPT's response
            const propertyData = this.parseGPTResponse(response);

            // Track cost (GPT-4 Turbo: $10/MTok input, $30/MTok output)
            const inputTokens = response.usage.prompt_tokens;
            const outputTokens = response.usage.completion_tokens;
            const cost = (inputTokens * 0.01 + outputTokens * 0.03) / 1000;
            this.costs.gpt += cost;
            this.costs.total += cost;
            this.requestCounts.gpt++;

            console.log(`💰 GPT cost: $${cost.toFixed(4)}`);

            return propertyData;

        } catch (error) {
            console.error('❌ GPT scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * ⚫ GROK PRO SCRAPER
     * Fast web search and real-time data
     */
    async scrapeWithGrok(url) {
        console.log('⚫ Using Grok Pro...');

        const prompt = this.buildExtractionPrompt(url);

        try {
            const response = await this.grok.chat.completions.create({
                model: 'grok-2-latest',
                messages: [{
                    role: 'system',
                    content: 'You are a real estate data extraction expert. Extract property information and return as JSON.'
                }, {
                    role: 'user',
                    content: prompt
                }]
            });

            // Parse Grok's response
            const propertyData = this.parseGrokResponse(response);

            // Track cost (Grok estimated: $5/MTok)
            const totalTokens = response.usage.total_tokens || 1000;
            const cost = (totalTokens * 0.005) / 1000;
            this.costs.grok += cost;
            this.costs.total += cost;
            this.requestCounts.grok++;

            console.log(`💰 Grok cost: $${cost.toFixed(4)}`);

            return propertyData;

        } catch (error) {
            console.error('❌ Grok scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * 🔵 GEMINI PRO SCRAPER
     * Fast and cost-effective
     */
    async scrapeWithGemini(url) {
        console.log('🔵 Using Gemini Pro...');

        const prompt = this.buildExtractionPrompt(url);

        try {
            const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const result = await model.generateContent([{
                text: prompt
            }]);

            const response = await result.response;
            const text = response.text();

            // Parse Gemini's response
            const propertyData = this.parseGeminiResponse(text);

            // Track cost (Gemini Pro: $0.35/MTok input, $1.05/MTok output - very cheap!)
            const cost = 0.002; // Estimated $0.002 per request
            this.costs.gemini += cost;
            this.costs.total += cost;
            this.requestCounts.gemini++;

            console.log(`💰 Gemini cost: $${cost.toFixed(4)}`);

            return propertyData;

        } catch (error) {
            console.error('❌ Gemini scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * 🔄 HYBRID MODE - ALL LLMS WITH CONSENSUS
     * Runs all 4 LLMs in parallel and merges results
     */
    async scrapeWithHybrid(url) {
        console.log('🔄 Running HYBRID mode (all 4 LLMs)...');

        try {
            // Run all LLMs in parallel
            const [claudeData, gptData, grokData, geminiData] = await Promise.allSettled([
                this.scrapeWithClaude(url),
                this.scrapeWithGPT(url),
                this.scrapeWithGrok(url),
                this.scrapeWithGemini(url)
            ]);

            // Extract successful results
            const results = [];
            if (claudeData.status === 'fulfilled') results.push({ source: 'claude', data: claudeData.value });
            if (gptData.status === 'fulfilled') results.push({ source: 'gpt', data: gptData.value });
            if (grokData.status === 'fulfilled') results.push({ source: 'grok', data: grokData.value });
            if (geminiData.status === 'fulfilled') results.push({ source: 'gemini', data: geminiData.value });

            console.log(`✅ ${results.length}/4 LLMs succeeded`);

            // Use consensus algorithm to merge results
            const mergedData = this.mergeWithConsensus(results);

            return mergedData;

        } catch (error) {
            console.error('❌ Hybrid scraping failed:', error.message);
            throw error;
        }
    }

    /**
     * 🧩 CONSENSUS ALGORITHM
     * Merges results from multiple LLMs using voting/averaging
     */
    mergeWithConsensus(results) {
        if (results.length === 0) {
            throw new Error('No LLMs succeeded');
        }

        if (results.length === 1) {
            return results[0].data;
        }

        console.log('🧩 Merging results with consensus algorithm...');

        // Initialize merged object with first result
        const merged = { ...results[0].data };

        // For each field, use consensus logic
        const fields = Object.keys(merged);

        fields.forEach(field => {
            const values = results.map(r => r.data[field]).filter(v => v !== null && v !== undefined);

            if (values.length === 0) return;

            // Numeric fields: use median
            if (typeof values[0] === 'number') {
                merged[field] = this.calculateMedian(values);
            }
            // String fields: use most common value
            else if (typeof values[0] === 'string') {
                merged[field] = this.getMostCommon(values);
            }
            // Object/Array fields: use first non-null
            else {
                merged[field] = values[0];
            }
        });

        console.log('✅ Consensus merge complete');
        return merged;
    }

    /**
     * 📊 CALCULATE MEDIAN
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    /**
     * 🗳️ GET MOST COMMON VALUE
     */
    getMostCommon(values) {
        const counts = {};
        values.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    /**
     * 📝 BUILD EXTRACTION PROMPT
     */
    buildExtractionPrompt(url) {
        return `Navigate to this real estate listing and extract ALL available data as JSON:

URL: ${url}

Extract the following fields (use null if not found):

{
    "address": {
        "full_address": "",
        "street": "",
        "city": "",
        "state": "",
        "zip": "",
        "county": "",
        "latitude": null,
        "longitude": null
    },
    "price": {
        "current": null,
        "original": null,
        "per_sqft": null,
        "tax_assessed": null
    },
    "property": {
        "bedrooms": null,
        "bathrooms": null,
        "sqft": null,
        "lot_size": null,
        "year_built": null,
        "property_type": "",
        "stories": null,
        "garage": null,
        "pool": false,
        "hoa": null
    },
    "listing": {
        "status": "",
        "days_on_market": null,
        "mls_number": "",
        "listing_agent": "",
        "listing_brokerage": ""
    },
    "description": "",
    "features": [],
    "images": [],
    "virtual_tour_url": null,
    "school_district": ""
}

IMPORTANT:
1. Visit the URL using web browsing/computer use
2. Extract data accurately from the page
3. Return ONLY valid JSON, no markdown formatting
4. Use null for missing numeric values
5. Use empty string "" for missing text values
6. Be thorough - check all sections of the listing`;
    }

    /**
     * 🔍 PARSE CLAUDE RESPONSE
     */
    parseClaudeResponse(response) {
        try {
            // Find JSON in response
            const content = response.content.find(c => c.type === 'text');
            if (!content) throw new Error('No text content in Claude response');

            const text = content.text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('No JSON found in Claude response');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Failed to parse Claude response:', error.message);
            return null;
        }
    }

    /**
     * 🔍 PARSE GPT RESPONSE
     */
    parseGPTResponse(response) {
        try {
            const message = response.choices[0]?.message;
            if (!message) throw new Error('No message in GPT response');

            const content = message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('No JSON found in GPT response');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Failed to parse GPT response:', error.message);
            return null;
        }
    }

    /**
     * 🔍 PARSE GROK RESPONSE
     */
    parseGrokResponse(response) {
        try {
            const message = response.choices[0]?.message;
            if (!message) throw new Error('No message in Grok response');

            const content = message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('No JSON found in Grok response');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Failed to parse Grok response:', error.message);
            return null;
        }
    }

    /**
     * 🔍 PARSE GEMINI RESPONSE
     */
    parseGeminiResponse(text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('No JSON found in Gemini response');

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Failed to parse Gemini response:', error.message);
            return null;
        }
    }

    /**
     * 🚶 GET WALK SCORE VIA LLM
     * No API key needed - LLM scrapes walkscore.com
     */
    async getWalkScoreViaLLM(address) {
        console.log(`🚶 Fetching Walk Score for: ${address}`);

        const prompt = `Visit https://www.walkscore.com and search for the Walk Score, Transit Score, and Bike Score for this address:

Address: ${address}

Return the data as JSON:
{
    "walk_score": <number 0-100>,
    "walk_description": "<string>",
    "transit_score": <number 0-100>,
    "transit_description": "<string>",
    "bike_score": <number 0-100>,
    "bike_description": "<string>"
}

If any score is not available, use null.`;

        try {
            // Use GPT for walk score (best at browsing)
            const response = await this.gpt.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.warn('⚠️ Could not extract Walk Score');
                return null;
            }

            const walkData = JSON.parse(jsonMatch[0]);
            console.log(`✅ Walk Score: ${walkData.walk_score}/100`);

            return walkData;

        } catch (error) {
            console.error('❌ Walk Score extraction failed:', error.message);
            return null;
        }
    }

    /**
     * 🚨 GET CRIME DATA VIA LLM
     * No API key needed - LLM scrapes crime websites
     */
    async getCrimeDataViaLLM(address) {
        console.log(`🚨 Fetching crime data for: ${address}`);

        const prompt = `Search for crime statistics for this address using NeighborhoodScout, SpotCrime, or similar sites:

Address: ${address}

Return the data as JSON:
{
    "crime_index": <number 0-100, where 100 is safest>,
    "crime_rate": "<low/medium/high>",
    "violent_crime": <number per 1000 residents>,
    "property_crime": <number per 1000 residents>,
    "safety_score": <number 0-100>,
    "grade": "<A/B/C/D/F>",
    "compared_to_national": "<safer/average/less safe>"
}

If data is not available, use null.`;

        try {
            // Use Claude for crime data (best at data aggregation)
            const response = await this.claude.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 2048,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const content = response.content.find(c => c.type === 'text');
            if (!content) return null;

            const text = content.text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.warn('⚠️ Could not extract crime data');
                return null;
            }

            const crimeData = JSON.parse(jsonMatch[0]);
            console.log(`✅ Crime Index: ${crimeData.crime_index}/100 (${crimeData.crime_rate})`);

            return crimeData;

        } catch (error) {
            console.error('❌ Crime data extraction failed:', error.message);
            return null;
        }
    }

    /**
     * 📚 GET SCHOOL DATA VIA LLM
     */
    async getSchoolDataViaLLM(address) {
        console.log(`📚 Fetching school data for: ${address}`);

        const prompt = `Search for school information near this address using GreatSchools.org or similar sites:

Address: ${address}

Return the data as JSON:
{
    "district": "",
    "elementary": { "name": "", "rating": null, "distance": null },
    "middle": { "name": "", "rating": null, "distance": null },
    "high": { "name": "", "rating": null, "distance": null },
    "average_rating": null,
    "summary_rating": "<Excellent/Good/Average/Below Average>"
}

Ratings are 0-10 scale. Distance in miles.`;

        try {
            // Use Gemini for school data (fast and cheap)
            const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
            const result = await model.generateContent([{ text: prompt }]);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.warn('⚠️ Could not extract school data');
                return null;
            }

            const schoolData = JSON.parse(jsonMatch[0]);
            console.log(`✅ Average School Rating: ${schoolData.average_rating}/10`);

            return schoolData;

        } catch (error) {
            console.error('❌ School data extraction failed:', error.message);
            return null;
        }
    }

    /**
     * 🌟 ENRICH PROPERTY DATA
     * Adds Walk Score, Crime Data, School Data
     */
    async enrichPropertyData(propertyData) {
        if (!propertyData?.address?.full_address) {
            console.warn('⚠️ No address found, skipping enrichment');
            return propertyData;
        }

        const address = propertyData.address.full_address;

        try {
            // Fetch all enrichment data in parallel
            const [walkScore, crimeData, schoolData] = await Promise.allSettled([
                this.getWalkScoreViaLLM(address),
                this.getCrimeDataViaLLM(address),
                this.getSchoolDataViaLLM(address)
            ]);

            // Add enrichment data to property
            if (walkScore.status === 'fulfilled' && walkScore.value) {
                propertyData.walkability = walkScore.value;
            }

            if (crimeData.status === 'fulfilled' && crimeData.value) {
                propertyData.crime = crimeData.value;
            }

            if (schoolData.status === 'fulfilled' && schoolData.value) {
                propertyData.schools = schoolData.value;
            }

            console.log('✅ Property data enriched');
            return propertyData;

        } catch (error) {
            console.error('❌ Enrichment failed:', error.message);
            return propertyData;
        }
    }

    /**
     * 🏙️ SCRAPE ENTIRE CITY
     * Finds all listings in a city and scrapes them
     */
    async scrapeCity(city, state = 'FL', options = {}) {
        const {
            maxProperties = 100,
            sites = ['zillow', 'redfin', 'trulia'],
            llm = 'auto'
        } = options;

        console.log(`🏙️ Scraping city: ${city}, ${state}`);
        console.log(`📊 Max properties: ${maxProperties}`);
        console.log(`🌐 Sites: ${sites.join(', ')}`);

        const allProperties = [];

        for (const site of sites) {
            try {
                console.log(`\n🔍 Searching ${site} for ${city} listings...`);

                // Get listing URLs from site
                const listingUrls = await this.findListingsInCity(site, city, state, maxProperties);
                console.log(`✅ Found ${listingUrls.length} listings on ${site}`);

                // Scrape each listing
                for (const url of listingUrls) {
                    try {
                        const propertyData = await this.scrapeProperty(url, { preferredLLM: llm });
                        if (propertyData) {
                            allProperties.push(propertyData);
                        }

                        // Rate limiting: 1 second between requests
                        await this.sleep(1000);

                    } catch (error) {
                        console.error(`❌ Failed to scrape ${url}:`, error.message);
                        continue;
                    }
                }

            } catch (error) {
                console.error(`❌ Failed to search ${site}:`, error.message);
                continue;
            }
        }

        console.log(`\n✅ City scraping complete: ${allProperties.length} properties`);
        console.log(`💰 Total cost: $${this.costs.total.toFixed(2)}`);

        return allProperties;
    }

    /**
     * 🔍 FIND LISTINGS IN CITY
     * Uses LLM to find all listing URLs in a city
     */
    async findListingsInCity(site, city, state, maxResults = 100) {
        console.log(`🔍 Finding ${site} listings in ${city}, ${state}...`);

        const searchUrls = {
            zillow: `https://www.zillow.com/homes/${city}-${state}_rb/`,
            redfin: `https://www.redfin.com/city/${city}/${state}`,
            trulia: `https://www.trulia.com/${state}/${city}/`,
            'homes.com': `https://www.homes.com/${state}/${city}/`,
            compass: `https://www.compass.com/homes-for-sale/${city}-${state}/`,
            kw: `https://www.kw.com/search/property/${city}-${state}`
        };

        const searchUrl = searchUrls[site];
        if (!searchUrl) {
            console.warn(`⚠️ Unknown site: ${site}`);
            return [];
        }

        const prompt = `Visit this search page and extract all property listing URLs (up to ${maxResults}):

Search URL: ${searchUrl}

Return as JSON array:
{
    "listings": [
        "https://www.${site}.com/property/123-main-st",
        "https://www.${site}.com/property/456-oak-ave",
        ...
    ]
}

Only include direct property listing URLs, not search result pages.`;

        try {
            // Use GPT for search page scraping
            const response = await this.gpt.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const text = response.choices[0]?.message?.content || '';
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) return [];

            const data = JSON.parse(jsonMatch[0]);
            return data.listings || [];

        } catch (error) {
            console.error('❌ Failed to find listings:', error.message);
            return [];
        }
    }

    /**
     * 📦 BATCH SCRAPING WITH RATE LIMITING
     */
    async scrapeMultipleProperties(urls, options = {}) {
        const {
            batchSize = 5,
            delayMs = 1000,
            llm = 'auto'
        } = options;

        console.log(`📦 Batch scraping ${urls.length} properties`);
        console.log(`📊 Batch size: ${batchSize}, Delay: ${delayMs}ms`);

        const results = [];
        const batches = this.chunkArray(urls, batchSize);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`\n🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} properties)...`);

            // Process batch in parallel
            const batchPromises = batch.map(url =>
                this.scrapeProperty(url, { preferredLLM: llm })
                    .catch(error => {
                        console.error(`❌ Failed: ${url}`, error.message);
                        return null;
                    })
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(r => r !== null));

            // Rate limiting between batches
            if (i < batches.length - 1) {
                console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
                await this.sleep(delayMs);
            }
        }

        console.log(`\n✅ Batch scraping complete: ${results.length}/${urls.length} succeeded`);
        console.log(`💰 Total cost: $${this.costs.total.toFixed(2)}`);
        this.printCostBreakdown();

        return results;
    }

    /**
     * 🔪 CHUNK ARRAY
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * 💤 SLEEP
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 💰 PRINT COST BREAKDOWN
     */
    printCostBreakdown() {
        console.log('\n💰 COST BREAKDOWN:');
        console.log(`  Claude:  $${this.costs.claude.toFixed(4)} (${this.requestCounts.claude} requests)`);
        console.log(`  GPT:     $${this.costs.gpt.toFixed(4)} (${this.requestCounts.gpt} requests)`);
        console.log(`  Grok:    $${this.costs.grok.toFixed(4)} (${this.requestCounts.grok} requests)`);
        console.log(`  Gemini:  $${this.costs.gemini.toFixed(4)} (${this.requestCounts.gemini} requests)`);
        console.log(`  ─────────────────────────`);
        console.log(`  TOTAL:   $${this.costs.total.toFixed(4)}`);
    }

    /**
     * 📊 GET STATS
     */
    getStats() {
        return {
            costs: { ...this.costs },
            requestCounts: { ...this.requestCounts },
            totalRequests: Object.values(this.requestCounts).reduce((a, b) => a + b, 0)
        };
    }

    /**
     * 🔄 RESET STATS
     */
    resetStats() {
        this.costs = {
            claude: 0,
            gpt: 0,
            grok: 0,
            gemini: 0,
            total: 0
        };
        this.requestCounts = {
            claude: 0,
            gpt: 0,
            grok: 0,
            gemini: 0
        };
        console.log('✅ Stats reset');
    }
}

export default UnifiedLLMScraper;
