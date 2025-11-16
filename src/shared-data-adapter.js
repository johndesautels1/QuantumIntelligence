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
            // Calculate scores using weighted engine
            const scores = this.scoringEngine.calculateScore(property, profileType);

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

        // Helper function to normalize scores to 0-100 range
        const normalizeScore = (score, min = 0, max = 10000) => {
            if (!score || isNaN(score)) return 50; // Default to middle
            // Clamp between min and max, then scale to 0-100
            const clamped = Math.max(min, Math.min(max, score));
            return (clamped / max) * 100;
        };

        return properties.map(prop => ({
            id: prop.property_id,
            name: prop.address?.full_address || `${prop.address?.street}, ${prop.address?.city}`,
            price: prop.price?.current || 0,
            dimensions: {
                location: normalizeScore(prop.computed_scores?.by_category?.location?.score, 0, 10000),
                price: normalizeScore(prop.computed_scores?.by_category?.financial?.score, 0, 10000),
                condition: normalizeScore(prop.computed_scores?.by_category?.property_physical?.score, 0, 10000),
                investment: normalizeScore(prop.computed_scores?.by_category?.investment?.score, 0, 10000),
                lifestyle: normalizeScore(prop.computed_scores?.by_category?.lifestyle?.score, 0, 10000)
            },
            // CRITICAL: Include coordinates for Google Maps
            location: {
                latitude: prop.location?.latitude || prop.basic?.coordinates?.latitude || prop.address?.latitude,
                longitude: prop.location?.longitude || prop.basic?.coordinates?.longitude || prop.address?.longitude,
                lat: prop.location?.lat || prop.location?.latitude || prop.basic?.coordinates?.latitude || prop.address?.latitude,
                lng: prop.location?.lng || prop.location?.longitude || prop.basic?.coordinates?.longitude || prop.address?.longitude
            },
            address: {
                latitude: prop.address?.latitude || prop.location?.latitude || prop.basic?.coordinates?.latitude,
                longitude: prop.address?.longitude || prop.location?.longitude || prop.basic?.coordinates?.longitude
            },
            basic: {
                coordinates: {
                    latitude: prop.basic?.coordinates?.latitude || prop.location?.latitude || prop.address?.latitude,
                    longitude: prop.basic?.coordinates?.longitude || prop.location?.longitude || prop.address?.longitude
                },
                address: {
                    street: prop.address?.street,
                    city: prop.address?.city,
                    state: prop.address?.state,
                    zip: prop.address?.zip
                }
            },
            // Include full property details for modal
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms?.total || prop.bathrooms,
            sqft_living: prop.square_feet?.living || prop.sqft_living,
            sqft_lot: prop.square_feet?.lot || prop.sqft_lot,
            year_built: prop.year_built,
            property_type: prop.property_type,
            mls_number: prop.mls?.number || prop.mls_number
        }));
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
