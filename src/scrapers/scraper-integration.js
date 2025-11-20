/**
 * 🔗 SCRAPER INTEGRATION WITH DATA MANAGER
 * Bridges the LLM scraper with IndexedDB storage
 */

import { UnifiedLLMScraper } from './llm-unified-scraper.js';
import { config } from './config.js';

/**
 * ScraperIntegration - Connects LLM scraper to DataManager
 */
export class ScraperIntegration {
    constructor(dataManager, scraperConfig = {}) {
        this.dataManager = dataManager;
        this.scraper = new UnifiedLLMScraper({
            anthropicApiKey: scraperConfig.anthropicApiKey || config.apiKeys.anthropic,
            openaiApiKey: scraperConfig.openaiApiKey || config.apiKeys.openai,
            grokApiKey: scraperConfig.grokApiKey || config.apiKeys.grok,
            geminiApiKey: scraperConfig.geminiApiKey || config.apiKeys.gemini
        });
    }

    /**
     * 🏠 SCRAPE AND STORE PROPERTY
     * Scrapes a property URL and saves to IndexedDB
     */
    async scrapeAndStore(url, options = {}) {
        console.log(`🏠 Scraping and storing: ${url}`);

        try {
            // Scrape property data
            const rawData = await this.scraper.scrapeProperty(url, {
                preferredLLM: options.llm || 'auto',
                useHybrid: options.hybrid || false,
                enrichData: options.enrich !== false  // Default: true
            });

            if (!rawData) {
                console.error('❌ Scraping returned no data');
                return null;
            }

            // Transform to CLUES schema
            const cluesProperty = this.transformToCluesSchema(rawData, url);

            // Save to IndexedDB
            const saved = await this.dataManager.addProperty(cluesProperty);

            console.log(`✅ Property saved: ${cluesProperty.property_id}`);

            return {
                property_id: cluesProperty.property_id,
                address: cluesProperty.address.full_address,
                saved: saved
            };

        } catch (error) {
            console.error('❌ Scrape and store failed:', error.message);
            throw error;
        }
    }

    /**
     * 📦 BATCH SCRAPE AND STORE
     * Scrapes multiple URLs and stores all
     */
    async batchScrapeAndStore(urls, options = {}) {
        console.log(`📦 Batch scraping ${urls.length} properties...`);

        const results = [];
        const errors = [];

        for (const url of urls) {
            try {
                const result = await this.scrapeAndStore(url, options);
                results.push(result);

                // Rate limiting
                await this.sleep(options.delayMs || 1000);

            } catch (error) {
                console.error(`❌ Failed to scrape ${url}:`, error.message);
                errors.push({ url, error: error.message });
            }
        }

        console.log(`✅ Batch complete: ${results.length}/${urls.length} succeeded`);

        return {
            succeeded: results,
            failed: errors,
            costs: this.scraper.costs
        };
    }

    /**
     * 🏙️ SCRAPE CITY AND STORE ALL
     * Scrapes entire city and populates database
     */
    async scrapeCityAndStore(city, state = 'FL', options = {}) {
        console.log(`🏙️ Scraping city: ${city}, ${state}`);

        try {
            // Scrape city
            const properties = await this.scraper.scrapeCity(city, state, {
                maxProperties: options.maxProperties || 100,
                sites: options.sites || ['zillow', 'redfin', 'trulia'],
                llm: options.llm || 'auto'
            });

            console.log(`✅ Scraped ${properties.length} properties`);

            // Store all properties
            const stored = [];
            for (const rawData of properties) {
                try {
                    const cluesProperty = this.transformToCluesSchema(rawData);
                    await this.dataManager.addProperty(cluesProperty);
                    stored.push(cluesProperty.property_id);
                } catch (error) {
                    console.error('❌ Failed to store property:', error.message);
                }
            }

            console.log(`✅ Stored ${stored.length}/${properties.length} properties`);

            return {
                city: city,
                state: state,
                scraped: properties.length,
                stored: stored.length,
                costs: this.scraper.costs
            };

        } catch (error) {
            console.error('❌ City scrape and store failed:', error.message);
            throw error;
        }
    }

    /**
     * 🔄 UPDATE EXISTING PROPERTY
     * Re-scrapes and updates property data
     */
    async updateProperty(propertyId) {
        console.log(`🔄 Updating property: ${propertyId}`);

        try {
            // Get existing property
            const existing = await this.dataManager.getProperty(propertyId);
            if (!existing) {
                throw new Error(`Property not found: ${propertyId}`);
            }

            // Re-scrape from source URL
            if (!existing.source_url) {
                throw new Error('No source URL found for property');
            }

            const rawData = await this.scraper.scrapeProperty(existing.source_url, {
                preferredLLM: 'auto',
                enrichData: true
            });

            if (!rawData) {
                throw new Error('Re-scraping returned no data');
            }

            // Transform and merge with existing
            const updated = this.transformToCluesSchema(rawData, existing.source_url);
            updated.property_id = propertyId;  // Keep same ID
            updated.created_at = existing.created_at;  // Preserve creation date
            updated.updated_at = new Date().toISOString();

            // Update in database
            await this.dataManager.updateProperty(propertyId, updated);

            console.log(`✅ Property updated: ${propertyId}`);

            return updated;

        } catch (error) {
            console.error('❌ Update property failed:', error.message);
            throw error;
        }
    }

    /**
     * 🔀 TRANSFORM TO CLUES SCHEMA
     * Converts scraped data to CLUES property format
     */
    transformToCluesSchema(rawData, sourceUrl = null) {
        const now = new Date().toISOString();

        // Generate property ID
        const propertyId = rawData.listing?.mls_number ||
            `PROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Build CLUES property object
        const cluesProperty = {
            // Core Identity
            property_id: propertyId,
            mls_number: rawData.listing?.mls_number || null,
            source_url: sourceUrl,
            created_at: now,
            updated_at: now,

            // Address
            address: {
                full_address: rawData.address?.full_address || '',
                street: rawData.address?.street || '',
                city: rawData.address?.city || '',
                state: rawData.address?.state || 'FL',
                zip: rawData.address?.zip || '',
                county: rawData.address?.county || '',
                latitude: rawData.address?.latitude || null,
                longitude: rawData.address?.longitude || null
            },

            // Property Type
            property_type: rawData.property?.property_type || 'Single Family',

            // Status
            status: {
                current: rawData.listing?.status || 'Active',
                last_updated: now,
                days_on_market: rawData.listing?.days_on_market || 0
            },

            // Price
            price: {
                current: rawData.price?.current || 0,
                original: rawData.price?.original || rawData.price?.current || 0,
                per_sqft: rawData.price?.per_sqft || null,
                tax_assessed: rawData.price?.tax_assessed || null,
                history: []
            },

            // Physical Details
            physical: {
                bedrooms: rawData.property?.bedrooms || 0,
                bathrooms: rawData.property?.bathrooms || 0,
                sqft: rawData.property?.sqft || 0,
                lot_size: rawData.property?.lot_size || null,
                year_built: rawData.property?.year_built || null,
                stories: rawData.property?.stories || 1,
                garage: rawData.property?.garage || 0,
                pool: rawData.property?.pool || false,
                condition: 'Good'  // Default
            },

            // HOA
            hoa: {
                required: rawData.property?.hoa ? true : false,
                monthly: rawData.property?.hoa || 0,
                includes: []
            },

            // Listing Information
            listing: {
                agent: rawData.listing?.listing_agent || '',
                brokerage: rawData.listing?.listing_brokerage || '',
                description: rawData.description || '',
                virtual_tour: rawData.virtual_tour_url || null
            },

            // Media
            images: rawData.images || [],
            features: rawData.features || [],

            // Computed Scores (will be calculated by scoring engine)
            computed_scores: {
                overall: 0,
                byCategory: this.buildCategoryScores(rawData),
                last_computed: now
            },

            // Schools
            schools: this.transformSchoolData(rawData.schools),

            // Crime & Safety
            crime: this.transformCrimeData(rawData.crime),

            // Walkability
            walkability: this.transformWalkabilityData(rawData.walkability),

            // Cost of Living
            cost_of_living: {
                index: 100,  // Will be updated by scoring engine
                breakdown: {}
            }
        };

        return cluesProperty;
    }

    /**
     * 📊 BUILD CATEGORY SCORES
     */
    buildCategoryScores(rawData) {
        return {
            location: {
                score: this.estimateLocationScore(rawData),
                components: {}
            },
            property_physical: {
                score: this.estimateConditionScore(rawData),
                components: {}
            },
            lifestyle: {
                score: this.estimateLifestyleScore(rawData),
                components: {}
            },
            investment: {
                score: this.estimateROIScore(rawData),
                components: {}
            }
        };
    }

    /**
     * 🎓 TRANSFORM SCHOOL DATA
     */
    transformSchoolData(schools) {
        if (!schools) {
            return {
                district: '',
                averageRating: 5,
                schools: []
            };
        }

        const schoolList = [];

        if (schools.elementary) {
            schoolList.push({
                name: schools.elementary.name,
                type: 'Elementary',
                rating: schools.elementary.rating,
                distance: schools.elementary.distance
            });
        }

        if (schools.middle) {
            schoolList.push({
                name: schools.middle.name,
                type: 'Middle',
                rating: schools.middle.rating,
                distance: schools.middle.distance
            });
        }

        if (schools.high) {
            schoolList.push({
                name: schools.high.name,
                type: 'High',
                rating: schools.high.rating,
                distance: schools.high.distance
            });
        }

        return {
            district: schools.district || '',
            averageRating: schools.average_rating || 5,
            schools: schoolList
        };
    }

    /**
     * 🚨 TRANSFORM CRIME DATA
     */
    transformCrimeData(crime) {
        if (!crime) {
            return {
                crimeIndex: 50,
                safetyScore: 50,
                grade: 'C'
            };
        }

        return {
            crimeIndex: crime.crime_index || 50,
            safetyScore: crime.safety_score || 50,
            grade: crime.grade || 'C',
            violentCrime: crime.violent_crime || null,
            propertyCrime: crime.property_crime || null
        };
    }

    /**
     * 🚶 TRANSFORM WALKABILITY DATA
     */
    transformWalkabilityData(walkability) {
        if (!walkability) {
            return {
                walkScore: 50,
                transitScore: 50,
                bikeScore: 50
            };
        }

        return {
            walkScore: walkability.walk_score || 50,
            transitScore: walkability.transit_score || 50,
            bikeScore: walkability.bike_score || 50,
            walkDescription: walkability.walk_description || '',
            transitDescription: walkability.transit_description || '',
            bikeDescription: walkability.bike_description || ''
        };
    }

    /**
     * 📍 ESTIMATE LOCATION SCORE (0-100)
     */
    estimateLocationScore(rawData) {
        let score = 50;  // Base score

        // Walk score contributes heavily
        if (rawData.walkability?.walk_score) {
            score += (rawData.walkability.walk_score - 50) * 0.3;
        }

        // Transit score
        if (rawData.walkability?.transit_score) {
            score += (rawData.walkability.transit_score - 50) * 0.2;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 🏠 ESTIMATE CONDITION SCORE (0-100)
     */
    estimateConditionScore(rawData) {
        let score = 70;  // Assume good condition by default

        // Newer properties score higher
        if (rawData.property?.year_built) {
            const age = new Date().getFullYear() - rawData.property.year_built;
            if (age < 5) score += 15;
            else if (age < 10) score += 10;
            else if (age < 20) score += 5;
            else if (age > 50) score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 🎨 ESTIMATE LIFESTYLE SCORE (0-100)
     */
    estimateLifestyleScore(rawData) {
        let score = 60;

        // Pool adds value
        if (rawData.property?.pool) score += 10;

        // Walk score indicates amenities nearby
        if (rawData.walkability?.walk_score > 70) score += 15;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 💰 ESTIMATE ROI SCORE (0-100)
     */
    estimateROIScore(rawData) {
        let score = 50;

        // Price per sqft indicator
        if (rawData.price?.per_sqft) {
            if (rawData.price.per_sqft < 150) score += 20;  // Good deal
            else if (rawData.price.per_sqft > 300) score -= 10;  // Expensive
        }

        // Days on market (longer = worse)
        if (rawData.listing?.days_on_market) {
            if (rawData.listing.days_on_market < 30) score += 10;
            else if (rawData.listing.days_on_market > 180) score -= 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 💤 SLEEP UTILITY
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 📊 GET SCRAPER STATS
     */
    getStats() {
        return this.scraper.getStats();
    }

    /**
     * 🔄 RESET SCRAPER STATS
     */
    resetStats() {
        this.scraper.resetStats();
    }
}

export default ScraperIntegration;
