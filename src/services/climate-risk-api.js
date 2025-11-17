/**
 * Climate Risk API Service
 * Integrates FEMA Flood Zones, USGS Elevation, and NOAA Sea Level Rise
 *
 * NO API KEYS REQUIRED - All free government APIs
 */

class ClimateRiskAPI {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Get FEMA Flood Zone data for a location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Flood zone information
     */
    async getFEMAFloodZone(lat, lng) {
        const cacheKey = `fema_${lat}_${lng}`;
        if (this.cache.has(cacheKey)) {
            console.log(`✅ Using cached FEMA data for ${lat}, ${lng}`);
            return this.cache.get(cacheKey);
        }

        try {
            const url = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=json`;

            console.log(`🌊 Fetching FEMA flood zone for ${lat}, ${lng}...`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`FEMA API error: ${response.status}`);
            }

            const data = await response.json();

            let result;
            if (data.features && data.features.length > 0) {
                const attrs = data.features[0].attributes;
                result = {
                    zone: attrs.FLD_ZONE || 'X',
                    zoneSubtype: attrs.ZONE_SUBTY || 'N/A',
                    floodway: attrs.FLOODWAY || 'N',
                    staticBFE: attrs.STATIC_BFE || null,
                    message: this.getFloodZoneDescription(attrs.FLD_ZONE)
                };
            } else {
                result = {
                    zone: 'X',
                    message: 'Minimal flood hazard (Zone X - 0.2% annual chance)',
                    zoneSubtype: 'N/A',
                    floodway: 'N',
                    staticBFE: null
                };
            }

            this.cache.set(cacheKey, result);
            console.log(`✅ FEMA flood zone retrieved: ${result.zone}`);
            return result;

        } catch (error) {
            console.error('❌ Error fetching FEMA flood zone:', error);
            return {
                zone: 'UNKNOWN',
                message: 'Unable to determine flood zone',
                error: error.message
            };
        }
    }

    /**
     * Get human-readable flood zone description
     */
    getFloodZoneDescription(zone) {
        const descriptions = {
            'A': 'High risk - 1% annual flood chance (100-year floodplain)',
            'AE': 'High risk - 1% annual flood chance with base flood elevation',
            'AH': 'High risk - 1% annual chance of shallow flooding (1-3 feet)',
            'AO': 'High risk - 1% annual chance of sheet flow flooding',
            'V': 'COASTAL HIGH RISK - 1% annual chance + wave action',
            'VE': 'COASTAL HIGH RISK - 1% annual chance + wave action (with BFE)',
            'X': 'Minimal risk - 0.2% annual flood chance',
            'X500': 'Moderate risk - 0.2% annual flood chance (500-year floodplain)',
            'D': 'Undetermined flood hazard'
        };
        return descriptions[zone] || `Zone ${zone}`;
    }

    /**
     * Get USGS Elevation data
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Elevation information
     */
    async getUSGSElevation(lat, lng) {
        const cacheKey = `elevation_${lat}_${lng}`;
        if (this.cache.has(cacheKey)) {
            console.log(`✅ Using cached elevation data for ${lat}, ${lng}`);
            return this.cache.get(cacheKey);
        }

        try {
            const url = `https://epqs.nationalmap.gov/v1/json?x=${lng}&y=${lat}&units=Feet&wkid=4326&includeDate=false`;

            console.log(`📏 Fetching USGS elevation for ${lat}, ${lng}...`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`USGS API error: ${response.status}`);
            }

            const data = await response.json();

            const result = {
                elevationFeet: data.value || 0,
                elevationMeters: (data.value || 0) * 0.3048,
                dataSource: 'USGS National Elevation Dataset',
                riskLevel: this.getElevationRiskLevel(data.value || 0)
            };

            this.cache.set(cacheKey, result);
            console.log(`✅ Elevation retrieved: ${result.elevationFeet} feet`);
            return result;

        } catch (error) {
            console.error('❌ Error fetching USGS elevation:', error);
            return {
                elevationFeet: null,
                elevationMeters: null,
                dataSource: 'USGS National Elevation Dataset',
                error: error.message
            };
        }
    }

    /**
     * Determine risk level based on elevation
     */
    getElevationRiskLevel(elevationFeet) {
        if (elevationFeet < 5) return 'CRITICAL - Very low elevation';
        if (elevationFeet < 10) return 'HIGH - Low elevation';
        if (elevationFeet < 20) return 'MODERATE - Moderate elevation';
        if (elevationFeet < 50) return 'LOW - Good elevation';
        return 'MINIMAL - High elevation';
    }

    /**
     * Get NOAA Sea Level Rise projections
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Sea level rise projection data
     */
    async getNOAASeaLevelRise(lat, lng) {
        const cacheKey = `sealevel_${lat}_${lng}`;
        if (this.cache.has(cacheKey)) {
            console.log(`✅ Using cached sea level rise data for ${lat}, ${lng}`);
            return this.cache.get(cacheKey);
        }

        try {
            console.log(`🌊 Fetching NOAA sea level rise projections for ${lat}, ${lng}...`);

            // Query multiple sea level rise scenarios
            const scenarios = [0, 1, 2, 3, 4, 5, 6];
            const projections = {};

            for (const ft of scenarios) {
                const url = `https://coast.noaa.gov/arcgis/rest/services/dc_slr/slr_${ft}ft/MapServer/identify?geometry=${lng},${lat}&geometryType=esriGeometryPoint&sr=4326&layers=all:0&tolerance=2&mapExtent=-180,-90,180,90&imageDisplay=400,400,96&returnGeometry=false&f=json`;

                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        projections[`${ft}ft`] = {
                            affected: data.results && data.results.length > 0,
                            scenario: `${ft} feet sea level rise`
                        };
                    }
                } catch (err) {
                    console.warn(`⚠️ Could not fetch ${ft}ft scenario:`, err.message);
                    projections[`${ft}ft`] = {
                        affected: false,
                        scenario: `${ft} feet sea level rise`,
                        error: err.message
                    };
                }
            }

            const result = {
                projections: projections,
                riskSummary: this.summarizeSeaLevelRisk(projections)
            };

            this.cache.set(cacheKey, result);
            console.log(`✅ Sea level rise projections retrieved`);
            return result;

        } catch (error) {
            console.error('❌ Error fetching NOAA sea level rise:', error);
            return {
                projections: {},
                riskSummary: 'Unable to determine sea level rise risk',
                error: error.message
            };
        }
    }

    /**
     * Summarize sea level rise risk
     */
    summarizeSeaLevelRisk(projections) {
        const affected = Object.entries(projections)
            .filter(([_, data]) => data.affected)
            .map(([scenario]) => scenario);

        if (affected.length === 0) {
            return 'LOW RISK - Not affected by projected sea level rise scenarios';
        }

        if (affected.length === 7) {
            return 'CRITICAL RISK - Property affected by ALL sea level rise scenarios (0-6ft)';
        }

        const lowestScenario = affected[0];
        return `HIGH RISK - Property affected by ${lowestScenario}ft sea level rise scenario and ${affected.length} total scenarios`;
    }

    /**
     * Get comprehensive climate risk assessment
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} Complete climate risk data
     */
    async getComprehensiveRisk(lat, lng) {
        console.log(`🌍 Fetching comprehensive climate risk for ${lat}, ${lng}...`);

        try {
            const [floodZone, elevation, seaLevelRise] = await Promise.all([
                this.getFEMAFloodZone(lat, lng),
                this.getUSGSElevation(lat, lng),
                this.getNOAASeaLevelRise(lat, lng)
            ]);

            return {
                floodZone: floodZone,
                elevation: elevation,
                seaLevelRise: seaLevelRise,
                overallRisk: this.calculateOverallRisk(floodZone, elevation, seaLevelRise),
                fetchedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Error fetching comprehensive climate risk:', error);
            return {
                error: error.message,
                fetchedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Calculate overall risk score (0-100, higher = safer)
     */
    calculateOverallRisk(floodZone, elevation, seaLevelRise) {
        let score = 100;

        // Flood zone penalties
        const zonePenalties = {
            'V': 40, 'VE': 40,  // Coastal high hazard
            'A': 25, 'AE': 25, 'AH': 25, 'AO': 25,  // High risk
            'X500': 10,  // Moderate risk
            'X': 0,  // Minimal risk
            'D': 5   // Undetermined
        };
        score -= zonePenalties[floodZone.zone] || 0;

        // Elevation adjustments
        const elevFeet = elevation.elevationFeet || 0;
        if (elevFeet < 5) score -= 30;
        else if (elevFeet < 10) score -= 20;
        else if (elevFeet < 20) score -= 10;
        else if (elevFeet > 50) score += 10;

        // Sea level rise impact
        const affectedCount = Object.values(seaLevelRise.projections || {})
            .filter(p => p.affected).length;
        score -= affectedCount * 5;

        return {
            score: Math.max(0, Math.min(100, score)),
            rating: this.getRiskRating(score),
            components: {
                floodZonePenalty: zonePenalties[floodZone.zone] || 0,
                elevationImpact: elevFeet,
                seaLevelRiseImpact: affectedCount
            }
        };
    }

    /**
     * Get risk rating from score
     */
    getRiskRating(score) {
        if (score >= 80) return 'EXCELLENT - Very low climate risk';
        if (score >= 60) return 'GOOD - Low to moderate risk';
        if (score >= 40) return 'FAIR - Moderate risk';
        if (score >= 20) return 'POOR - High risk';
        return 'CRITICAL - Very high risk';
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Climate risk cache cleared');
    }
}

// Create singleton instance
const climateRiskAPI = new ClimateRiskAPI();

export default climateRiskAPI;
