/**
 * NOAA Weather API Service
 * Fetches real weather data from NOAA Climate Data Online (CDO)
 */

import { API_KEYS, API_ENDPOINTS } from '../../config.js';

class WeatherAPI {
    constructor() {
        this.token = API_KEYS.noaa.token;
        this.baseUrl = API_ENDPOINTS.noaa.base;
        // Detect if running on Vercel (use proxy) or localhost (direct)
        this.useProxy = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }

    /**
     * Make authenticated request to NOAA API
     */
    async request(endpoint, params = {}) {
        // If on Vercel, use serverless proxy to bypass CORS
        if (this.useProxy) {
            const proxyUrl = new URL('/api/noaa', window.location.origin);
            proxyUrl.searchParams.append('endpoint', endpoint);

            // Add all other params
            Object.keys(params).forEach(key => {
                proxyUrl.searchParams.append(key, params[key]);
            });

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`NOAA proxy error: ${response.status}`);
            }
            return await response.json();
        }

        // Direct API call for localhost (will fail on Vercel due to CORS)
        const url = new URL(this.baseUrl + endpoint);

        // Add query parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const response = await fetch(url, {
            headers: {
                'token': this.token
            }
        });

        if (!response.ok) {
            throw new Error(`NOAA API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Find nearest weather station to lat/lng
     */
    async findNearestStation(lat, lng) {
        try {
            const data = await this.request('/stations', {
                extent: `${lat-0.5},${lng-0.5},${lat+0.5},${lng+0.5}`,
                limit: 5,
                datasetid: 'GHCND' // Global Historical Climatology Network Daily
            });

            if (data.results && data.results.length > 0) {
                return data.results[0];
            }

            return null;
        } catch (error) {
            console.error('Error finding weather station:', error);
            return null;
        }
    }

    /**
     * Get historical weather data for location
     * Returns monthly averages for the past year
     */
    async getHistoricalData(stationId) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);

            const data = await this.request('/data', {
                datasetid: 'GHCND',
                stationid: stationId,
                startdate: startDate.toISOString().split('T')[0],
                enddate: endDate.toISOString().split('T')[0],
                datatypeid: 'TAVG,PRCP', // Average temp and precipitation
                units: 'standard',
                limit: 1000
            });

            return this.processHistoricalData(data.results);
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return null;
        }
    }

    /**
     * Process raw NOAA data into monthly averages
     */
    processHistoricalData(results) {
        if (!results || results.length === 0) return null;

        // Group by month
        const monthlyData = {};

        results.forEach(record => {
            const date = new Date(record.date);
            const month = date.getMonth();

            if (!monthlyData[month]) {
                monthlyData[month] = {
                    temps: [],
                    precip: []
                };
            }

            if (record.datatype === 'TAVG') {
                monthlyData[month].temps.push(record.value / 10); // NOAA temps in tenths of degree C
            } else if (record.datatype === 'PRCP') {
                monthlyData[month].precip.push(record.value / 10); // NOAA precip in tenths of mm
            }
        });

        // Calculate averages and convert to our format
        const months = [];
        for (let i = 0; i < 12; i++) {
            if (monthlyData[i]) {
                const avgTemp = monthlyData[i].temps.length > 0
                    ? monthlyData[i].temps.reduce((a, b) => a + b, 0) / monthlyData[i].temps.length
                    : 70;

                const avgPrecip = monthlyData[i].precip.length > 0
                    ? monthlyData[i].precip.reduce((a, b) => a + b, 0) / monthlyData[i].precip.length
                    : 2;

                months[i] = {
                    temp: Math.round((avgTemp * 9/5) + 32), // Convert C to F
                    precip: Math.round(avgPrecip / 25.4 * 10) / 10, // Convert mm to inches
                    humidity: 60, // NOAA doesn't provide this easily, use default
                    wind: 10 // NOAA doesn't provide this easily, use default
                };
            } else {
                // Default data if no data for this month
                months[i] = {
                    temp: 70,
                    precip: 2,
                    humidity: 60,
                    wind: 10
                };
            }
        }

        return months;
    }

    /**
     * Get weather data for a property
     * Combines station lookup and historical data fetch
     */
    async getWeatherForProperty(property) {
        console.log(`🌦️ Fetching weather data for ${property.name}...`);

        const station = await this.findNearestStation(
            property.location.lat,
            property.location.lng
        );

        if (!station) {
            console.warn(`⚠️ No weather station found for ${property.name}, using defaults`);
            return null;
        }

        console.log(`✅ Found station: ${station.name} (${station.id})`);

        const weatherData = await this.getHistoricalData(station.id);

        if (!weatherData) {
            console.warn(`⚠️ No historical data available for ${station.id}`);
            return null;
        }

        console.log(`✅ Retrieved ${weatherData.length} months of data`);
        return weatherData;
    }
}

// Create singleton instance
const weatherAPI = new WeatherAPI();

export default weatherAPI;
