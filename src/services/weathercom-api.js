/**
 * Weather.com API Service
 * Fetches current weather conditions and forecasts
 */

import { API_KEYS, API_ENDPOINTS } from '../../config.js';

class WeatherComAPI {
    constructor() {
        this.apiKey = API_KEYS.weathercom.apiKey;
        this.baseUrl = API_ENDPOINTS.weathercom.base;
    }

    /**
     * Make authenticated request to Weather.com API
     */
    async request(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);

        // Add API key to all requests
        params.apiKey = this.apiKey;
        params.format = 'json';

        // Add query parameters
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather.com API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get current weather conditions for a location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    async getCurrentConditions(lat, lng) {
        try {
            const data = await this.request(API_ENDPOINTS.weathercom.currentConditions, {
                geocode: `${lat},${lng}`,
                units: 'e', // English units (Fahrenheit)
                language: 'en-US'
            });

            return {
                temperature: data.temperature,
                feelsLike: data.temperatureFeelsLike,
                humidity: data.relativeHumidity,
                windSpeed: data.windSpeed,
                windDirection: data.windDirection,
                precipitation: data.precip1Hour,
                conditions: data.wxPhraseLong,
                icon: data.iconCode,
                timestamp: data.validTimeLocal
            };
        } catch (error) {
            console.error('Error fetching current conditions:', error);
            return null;
        }
    }

    /**
     * Get 5-day forecast for a location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    async get5DayForecast(lat, lng) {
        try {
            const data = await this.request(API_ENDPOINTS.weathercom.forecast, {
                geocode: `${lat},${lng}`,
                units: 'e', // English units
                language: 'en-US'
            });

            // Process forecast data
            const forecast = [];
            for (let i = 0; i < 5; i++) {
                forecast.push({
                    date: data.validTimeLocal[i],
                    dayOfWeek: data.dayOfWeek[i],
                    tempHigh: data.temperatureMax[i],
                    tempLow: data.temperatureMin[i],
                    precipitation: data.qpf[i],
                    precipChance: data.qpfSnow[i],
                    narrative: data.narrative[i],
                    icon: data.daypart[0].iconCode[i * 2]
                });
            }

            return forecast;
        } catch (error) {
            console.error('Error fetching 5-day forecast:', error);
            return null;
        }
    }

    /**
     * Get 12-hour hourly forecast for a location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    async getHourlyForecast(lat, lng) {
        try {
            const data = await this.request(API_ENDPOINTS.weathercom.hourly, {
                geocode: `${lat},${lng}`,
                units: 'e',
                language: 'en-US'
            });

            // Process hourly data
            const hourly = [];
            for (let i = 0; i < 12; i++) {
                hourly.push({
                    time: data.validTimeLocal[i],
                    temperature: data.temperature[i],
                    feelsLike: data.temperatureFeelsLike[i],
                    humidity: data.relativeHumidity[i],
                    windSpeed: data.windSpeed[i],
                    precipChance: data.precipChance[i],
                    conditions: data.wxPhraseLong[i],
                    icon: data.iconCode[i]
                });
            }

            return hourly;
        } catch (error) {
            console.error('Error fetching hourly forecast:', error);
            return null;
        }
    }

    /**
     * Get comprehensive weather data for a property
     * Combines current conditions and forecast
     */
    async getWeatherForProperty(property) {
        console.log(`☀️ Fetching Weather.com data for ${property.name}...`);

        const lat = property.location?.lat || property.location?.latitude;
        const lng = property.location?.lng || property.location?.longitude;

        if (!lat || !lng) {
            console.warn(`⚠️ No coordinates for ${property.name}`);
            return null;
        }

        try {
            // Fetch current and forecast in parallel
            const [current, forecast, hourly] = await Promise.all([
                this.getCurrentConditions(lat, lng),
                this.get5DayForecast(lat, lng),
                this.getHourlyForecast(lat, lng)
            ]);

            if (!current && !forecast) {
                console.warn(`⚠️ No Weather.com data available for ${property.name}`);
                return null;
            }

            console.log(`✅ Retrieved Weather.com data for ${property.name}`);

            return {
                current: current,
                forecast: forecast,
                hourly: hourly,
                source: 'Weather.com API',
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error(`❌ Failed to fetch Weather.com data for ${property.name}:`, error);
            return null;
        }
    }
}

// Create singleton instance
const weatherComAPI = new WeatherComAPI();

export default weatherComAPI;
