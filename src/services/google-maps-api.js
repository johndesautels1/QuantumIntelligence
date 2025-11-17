/**
 * Google Maps API Service
 * Provides satellite imagery and street view for properties
 */

import { API_KEYS, API_ENDPOINTS } from '../../config.js';

class GoogleMapsAPI {
    constructor() {
        this.apiKey = API_KEYS.googleMaps.apiKey;
        this.staticMapUrl = API_ENDPOINTS.googleMaps.staticMap;
        this.streetViewUrl = API_ENDPOINTS.googleMaps.streetView;
    }

    /**
     * Get satellite image URL for a property
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {Object} options - Image options
     * @returns {string} Image URL
     */
    getSatelliteImageUrl(lat, lng, options = {}) {
        const {
            zoom = 20,           // Max zoom for detailed view
            size = '640x640',    // Image dimensions
            scale = 2,           // Retina display support
            maptype = 'satellite'
        } = options;

        const url = `${this.staticMapUrl}?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=${maptype}&scale=${scale}&key=${this.apiKey}`;

        console.log(`🛰️ Generated satellite image URL for ${lat}, ${lng}`);
        return url;
    }

    /**
     * Get street view image URL for a property
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {Object} options - Image options
     * @returns {string} Image URL
     */
    getStreetViewImageUrl(lat, lng, options = {}) {
        const {
            size = '640x640',
            fov = 120,      // Field of view (max 120)
            heading = 0,    // Compass heading (0-360)
            pitch = 10,     // Vertical angle (-90 to 90)
            radius = 50     // Search radius in meters
        } = options;

        const url = `${this.streetViewUrl}?size=${size}&location=${lat},${lng}&fov=${fov}&heading=${heading}&pitch=${pitch}&radius=${radius}&key=${this.apiKey}`;

        console.log(`📸 Generated street view URL for ${lat}, ${lng}`);
        return url;
    }

    /**
     * Check if street view is available at location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<boolean>}
     */
    async isStreetViewAvailable(lat, lng) {
        try {
            const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${this.apiKey}`;

            const response = await fetch(metadataUrl);
            const data = await response.json();

            return data.status === 'OK';

        } catch (error) {
            console.warn('⚠️ Could not check street view availability:', error);
            return false;
        }
    }

    /**
     * Get hybrid map with both satellite and labels
     */
    getHybridImageUrl(lat, lng, options = {}) {
        return this.getSatelliteImageUrl(lat, lng, { ...options, maptype: 'hybrid' });
    }

    /**
     * Get multiple views of a property
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Object} URLs for different views
     */
    getPropertyViews(lat, lng) {
        return {
            satellite: this.getSatelliteImageUrl(lat, lng),
            hybrid: this.getHybridImageUrl(lat, lng),
            streetView: this.getStreetViewImageUrl(lat, lng),
            streetViewFront: this.getStreetViewImageUrl(lat, lng, { heading: 0 }),
            streetViewLeft: this.getStreetViewImageUrl(lat, lng, { heading: 270 }),
            streetViewRight: this.getStreetViewImageUrl(lat, lng, { heading: 90 }),
            streetViewRear: this.getStreetViewImageUrl(lat, lng, { heading: 180 })
        };
    }

    /**
     * Get property imagery with zoom levels
     * Useful for showing neighborhood context vs. property detail
     */
    getMultiZoomViews(lat, lng) {
        return {
            neighborhood: this.getSatelliteImageUrl(lat, lng, { zoom: 15 }),  // Wide view
            street: this.getSatelliteImageUrl(lat, lng, { zoom: 17 }),       // Street level
            property: this.getSatelliteImageUrl(lat, lng, { zoom: 20 }),     // Property detail
            roof: this.getSatelliteImageUrl(lat, lng, { zoom: 21 })          // Max zoom
        };
    }

    /**
     * Validate API key is configured
     */
    isConfigured() {
        return this.apiKey && this.apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';
    }
}

// Create singleton instance
const googleMapsAPI = new GoogleMapsAPI();

export default googleMapsAPI;
