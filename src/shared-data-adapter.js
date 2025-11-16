/**
 * CLUES™ Quantum Property Intelligence System
 * Shared Data Adapter
 * Provides REAL property data from IndexedDB to all enhancements
 *
 * REPLACES all hardcoded sample data
 *
 * @version 1.0.0
 */

class SharedDataAdapter {
    constructor() {
        this.dataManager = null;
        this.scoringEngine = null;
        this.initialized = false;
    }

    /**
     * Initialize the adapter (load core systems)
     */
    async init() {
        if (this.initialized) return;

        try {
            // Initialize data manager
            this.dataManager = dataManager;
            await this.dataManager.init();

            // Initialize scoring engine
            this.scoringEngine = scoringEngine;

            this.initialized = true;
            console.log('✅ SharedDataAdapter initialized');
        } catch (error) {
            console.error('❌ SharedDataAdapter initialization failed:', error);
            throw error;
        }
    }

    /**
     * Get all properties from database
     */
    async getAllProperties() {
        await this.ensureInitialized();
        return await this.dataManager.getAllProperties();
    }

    /**
     * Get properties with scores calculated
     * @param {string} profileType - Weight profile (investor, family, etc.)
     * @returns {Array} Properties with computed scores
     */
    async getPropertiesWithScores(profileType = 'balanced') {
        await this.ensureInitialized();

        const properties = await this.dataManager.getAllProperties();

        return properties.map(property => {
            // Transform CSV to scoring engine format
            const transformed = {
                bedrooms: property.basic?.bedrooms || 0,
                bathrooms: { total: property.basic?.bathrooms || 0 },
                square_feet: { living: property.basic?.squareFeet || 0, lot: property.basic?.lotSize || 0 },
                year_built: property.basic?.yearBuilt || 2000,
                price: { current: property.financial?.listingPrice || 0 },
                address: { latitude: property.location?.latitude || 0, longitude: property.location?.longitude || 0 }
            };

            // Calculate scores using weighted engine
            const scores = this.scoringEngine.calculateScore(transformed, profileType);

            return {
                ...property,
                computed_scores: scores
            };
        });
    }

    /**
     * Map real property to 5D format for quantum explorer
     */
    async getPropertiesFor5DExplorer(profileType = 'balanced') {
        const properties = await this.getPropertiesWithScores(profileType);

        return properties.map(prop => {
            const lat = prop.location?.latitude || prop.basic?.coordinates?.latitude || prop.address?.latitude || 0;
            const lng = prop.location?.longitude || prop.basic?.coordinates?.longitude || prop.address?.longitude || 0;

            // Scoring engine returns scores - clamp to 0-100 range
            const scores = prop.computed_scores?.by_category || {};

            const clamp = (val) => Math.max(0, Math.min(100, val || 50));

            return {
                id: prop.property_id || prop.id,
                name: prop.basic?.address || `${prop.location?.city}, ${prop.location?.state}`,
                price: prop.financial?.listingPrice || prop.price?.current || 0,
                dimensions: {
                    location: clamp(scores.location?.score),
                    price: clamp(scores.financial?.score),
                    condition: clamp(scores.property_physical?.score),
                    investment: clamp(scores.investment?.score),
                    lifestyle: clamp(scores.lifestyle?.score)
                },
                // Include ALL possible coordinate formats
                location: {
                    latitude: lat,
                    longitude: lng,
                    lat: lat,
                    lng: lng,
                    city: prop.location?.city,
                    state: prop.location?.state
                },
                address: {
                    latitude: lat,
                    longitude: lng,
                    street: prop.basic?.address,
                    city: prop.location?.city,
                    state: prop.location?.state,
                    zip: prop.location?.zipCode
                },
                basic: {
                    coordinates: {
                        latitude: lat,
                        longitude: lng
                    },
                    address: {
                        street: prop.basic?.address,
                        city: prop.location?.city,
                        state: prop.location?.state,
                        zip: prop.location?.zipCode
                    }
                },
                // CSV structure fields for modal
                bedrooms: prop.basic?.bedrooms || prop.bedrooms,
                bathrooms: prop.basic?.bathrooms || prop.bathrooms?.total || prop.bathrooms,
                sqft_living: prop.basic?.squareFeet || prop.square_feet?.living || prop.sqft_living,
                sqft_lot: prop.basic?.lotSize || prop.square_feet?.lot || prop.sqft_lot,
                year_built: prop.basic?.yearBuilt || prop.year_built,
                property_type: prop.basic?.propertyType || prop.property_type,
                mls_number: prop.basic?.mlsNumber || prop.mls?.number || prop.mls_number
            };
        });
    }

    /**
     * Map real property to holographic sphere format
     */
    async getPropertiesForHolographicSphere(profileType = 'balanced') {
        const properties = await this.getPropertiesWithScores(profileType);

        return properties.map(prop => ({
            id: prop.property_id,
            address: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            price: prop.price?.current || 0,
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms?.total || 0,
            sqft: prop.square_feet?.living || 0,
            yearBuilt: prop.year_built || 2000,
            propertyType: prop.property_type || 'single_family',
            score: prop.computed_scores?.overall || 50,
            location: {
                lat: prop.address?.latitude || 0,
                lng: prop.address?.longitude || 0
            },
            dimensions: {
                location: prop.computed_scores?.by_category?.location?.score || 50,
                price: prop.computed_scores?.by_category?.financial?.score || 50,
                size: prop.computed_scores?.by_category?.property_physical?.score || 50
            }
        }));
    }

    /**
     * Map real property to weather simulator format
     */
    async getPropertiesForWeatherSimulator() {
        const properties = await this.getAllProperties();

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            address: prop.address?.full_address || '',
            price: prop.price?.current || 0,
            location: {
                lat: prop.address?.latitude || 0,
                lng: prop.address?.longitude || 0,
                city: prop.address?.city || '',
                state: prop.address?.state || ''
            },
            climate: {
                zone: 'temperate', // Would come from location API
                floodRisk: prop.analytics?.flood_zone ? 'high' : 'low',
                hurricaneRisk: prop.analytics?.variable_values?.hurricane_risk > 50 ? 'high' : 'low'
            }
        }));
    }

    /**
     * Map real property to schedule coordinator format
     */
    async getPropertiesForScheduleCoordinator() {
        const properties = await this.getAllProperties();

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            address: prop.address?.street || '',
            city: prop.address?.city || '',
            location: {
                lat: prop.address?.latitude || 0,
                lng: prop.address?.longitude || 0
            },
            showing_time: 30, // Default 30 min per property
            status: prop.status?.current || 'active'
        }));
    }

    /**
     * Map real property to AI matchmaker format
     */
    async getPropertiesForAIMatchmaker() {
        const properties = await this.getAllProperties();

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            price: prop.price?.current || 0,
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms?.total || 0,
            sqft: prop.square_feet?.living || 0,
            location: prop.address?.city || '',
            style: prop.property_type || 'single_family',
            features: [
                ...(prop.features?.interior || []),
                ...(prop.features?.exterior || [])
            ],
            yearBuilt: prop.year_built || 2000
        }));
    }

    /**
     * Map real property to competitive intelligence format
     */
    async getPropertiesForCompetitiveIntelligence() {
        const properties = await this.getPropertiesWithScores('balanced');

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            price: prop.price?.current || 0,
            value: this.estimateValue(prop),
            sqft: prop.square_feet?.living || 0,
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms?.total || 0,
            dom: prop.days_on_market?.current || 0,
            condition: prop.computed_scores?.by_variable?.condition_rating?.normalized || 70
        }));
    }

    /**
     * Estimate property value (for competitive analysis)
     */
    estimateValue(property) {
        const currentPrice = property.price?.current || 0;
        const priceVsMarket = property.analytics?.price_vs_market || 0;

        // If property is priced below market, estimate true value higher
        if (priceVsMarket < 0) {
            return currentPrice * (1 + Math.abs(priceVsMarket) / 100);
        }

        return currentPrice;
    }

    /**
     * Map real property to Hawk Alert format
     */
    async getPropertiesForHawkAlert() {
        const properties = await this.getAllProperties();

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            price: prop.price?.current || 0,
            priceHistory: prop.price?.history || [],
            status: prop.status?.current || 'active',
            dom: prop.days_on_market?.current || 0,
            alerts: [] // Will be populated by Hawk Alert logic
        }));
    }

    /**
     * Get alerts from database
     */
    async getAlerts() {
        await this.ensureInitialized();
        return await this.dataManager.getAll(this.dataManager.stores.alerts);
    }

    /**
     * Get unread alerts
     */
    async getUnreadAlerts() {
        await this.ensureInitialized();
        return await this.dataManager.getUnreadAlerts();
    }

    /**
     * Add new alert
     */
    async addAlert(alertData) {
        await this.ensureInitialized();
        return await this.dataManager.addAlert(alertData);
    }

    /**
     * Get clients from database
     */
    async getClients() {
        await this.ensureInitialized();
        return await this.dataManager.getAllClients();
    }

    /**
     * Get active clients
     */
    async getActiveClients() {
        await this.ensureInitialized();
        return await this.dataManager.getActiveClients();
    }

    /**
     * Ensure adapter is initialized
     */
    async ensureInitialized() {
        if (!this.initialized) {
            await this.init();
        }
    }

    /**
     * Check if database has properties
     */
    async hasProperties() {
        await this.ensureInitialized();
        const count = await this.dataManager.count(this.dataManager.stores.properties);
        return count > 0;
    }

    /**
     * Get database statistics
     */
    async getStats() {
        await this.ensureInitialized();
        return await this.dataManager.getStats();
    }
}

// Create singleton instance
const sharedDataAdapter = new SharedDataAdapter();

// Export for use in enhancements
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDataAdapter;
}
