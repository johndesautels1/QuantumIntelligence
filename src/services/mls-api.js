/**
 * MLS API Service
 * Fetches property structural details from MLS
 */

import { API_KEYS } from '../../config.js';

class MLSAPI {
    constructor() {
        this.apiKey = API_KEYS.mls.apiKey;
        this.endpoint = API_KEYS.mls.endpoint;
        this.cache = new Map();
    }

    /**
     * Get property details from MLS
     * @param {string} mlsNumber - MLS listing number
     * @returns {Object} Property structural details
     */
    async getPropertyDetails(mlsNumber) {
        if (!mlsNumber) {
            console.warn('⚠️ No MLS number provided');
            return null;
        }

        const cacheKey = `mls_${mlsNumber}`;
        if (this.cache.has(cacheKey)) {
            console.log(`✅ Using cached MLS data for ${mlsNumber}`);
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`🏠 Fetching MLS data for listing ${mlsNumber}...`);

            // Replace this URL with your actual MLS API endpoint structure
            const url = `${this.endpoint}/properties/${mlsNumber}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`MLS API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const result = {
                address: data.address || null,
                lat: data.latitude || data.lat || null,
                lng: data.longitude || data.lng || null,
                roofAge: data.roofAge || data.roof?.age || null,
                roofType: data.roofType || data.roof?.type || 'Unknown',
                foundationType: data.foundationType || data.foundation?.type || 'Unknown',
                yearBuilt: data.yearBuilt || data.year_built || null,
                squareFeet: data.squareFeet || data.square_feet || null,
                stories: data.stories || data.numberOfStories || 1,
                exteriorMaterial: data.exteriorMaterial || data.exterior?.material || 'Unknown',
                hvacAge: data.hvacAge || data.hvac?.age || null,
                photos: data.photos || [],
                lastRenovation: data.lastRenovation || data.renovationYear || null,
                source: 'MLS API',
                fetchedAt: new Date().toISOString()
            };

            this.cache.set(cacheKey, result);
            console.log(`✅ MLS data retrieved for ${mlsNumber}`);
            return result;

        } catch (error) {
            console.error(`❌ Error fetching MLS data for ${mlsNumber}:`, error);

            // Return placeholder data if MLS unavailable
            return {
                roofAge: null,
                roofType: 'Unknown',
                foundationType: 'Unknown',
                yearBuilt: null,
                source: 'MLS API (unavailable)',
                error: error.message
            };
        }
    }

    /**
     * Get roof condition assessment based on age
     */
    getRoofCondition(roofAge, roofType) {
        if (!roofAge) return 'Unknown';

        const lifespans = {
            'Asphalt Shingle': 20,
            'Metal': 50,
            'Tile': 50,
            'Slate': 100,
            'Wood Shake': 30,
            'TPO/EPDM': 25,
            'Unknown': 20
        };

        const expectedLifespan = lifespans[roofType] || 20;
        const remainingLife = expectedLifespan - roofAge;

        if (remainingLife > 10) return `Good - ${remainingLife} years remaining`;
        if (remainingLife > 5) return `Fair - ${remainingLife} years remaining`;
        if (remainingLife > 0) return `Poor - ${remainingLife} years remaining`;
        return `Needs Replacement - ${Math.abs(remainingLife)} years overdue`;
    }

    /**
     * Calculate structural risk score based on MLS data
     */
    calculateStructuralRisk(property) {
        let score = 100;

        // Roof age impact
        const roofAge = property.roofAge || 0;
        if (roofAge > 25) score -= 30;
        else if (roofAge > 20) score -= 20;
        else if (roofAge > 15) score -= 10;

        // Property age impact
        const propertyAge = property.yearBuilt ? (new Date().getFullYear() - property.yearBuilt) : 0;
        if (propertyAge > 75) score -= 20;
        else if (propertyAge > 50) score -= 15;
        else if (propertyAge > 30) score -= 5;

        // HVAC age impact
        const hvacAge = property.hvacAge || 0;
        if (hvacAge > 20) score -= 15;
        else if (hvacAge > 15) score -= 10;
        else if (hvacAge > 10) score -= 5;

        return {
            score: Math.max(0, Math.min(100, score)),
            rating: this.getStructuralRating(score),
            recommendations: this.getRecommendations(property)
        };
    }

    /**
     * Get structural rating from score
     */
    getStructuralRating(score) {
        if (score >= 85) return 'EXCELLENT - Well-maintained property';
        if (score >= 70) return 'GOOD - Minor maintenance recommended';
        if (score >= 55) return 'FAIR - Several items need attention';
        if (score >= 40) return 'POOR - Significant maintenance required';
        return 'CRITICAL - Major renovations needed';
    }

    /**
     * Get maintenance recommendations
     */
    getRecommendations(property) {
        const recommendations = [];

        if (property.roofAge && property.roofAge > 20) {
            recommendations.push('Schedule roof inspection - nearing end of lifespan');
        }
        if (property.roofAge && property.roofAge > 25) {
            recommendations.push('Plan for roof replacement within 1-2 years');
        }

        const propertyAge = property.yearBuilt ? (new Date().getFullYear() - property.yearBuilt) : 0;
        if (propertyAge > 50) {
            recommendations.push('Inspect foundation and structural integrity');
        }

        if (property.hvacAge && property.hvacAge > 15) {
            recommendations.push('Consider HVAC system replacement or upgrade');
        }

        if (!property.lastRenovation && propertyAge > 30) {
            recommendations.push('Property may benefit from modernization updates');
        }

        return recommendations;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ MLS cache cleared');
    }
}

// Create singleton instance
const mlsAPI = new MLSAPI();

export default mlsAPI;
