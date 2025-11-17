/**
 * Weather.com API Service
 * Fetches current weather conditions and forecasts
 */

import { API_KEYS, API_ENDPOINTS } from '../../config.js';

class WeatherComAPI {
    constructor() {
        this.apiKey = API_KEYS.weathercom.apiKey;
        this.baseUrl = API_ENDPOINTS.weathercom.base;
        // Detect if running on Vercel (use proxy) or localhost (direct)
        this.useProxy = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    }

    /**
     * Make authenticated request to Weather.com API
     */
    async request(endpoint, params = {}) {
        // If on Vercel, use serverless proxy to bypass CORS
        if (this.useProxy) {
            const proxyUrl = new URL('/api/weather', window.location.origin);
            proxyUrl.searchParams.append('endpoint', endpoint.replace('/observations/current', 'current')
                .replace('/forecast/daily/5day', 'forecast')
                .replace('/forecast/hourly/12hour', 'hourly'));

            // Extract lat/lng from geocode param
            if (params.geocode) {
                const [lat, lng] = params.geocode.split(',');
                proxyUrl.searchParams.append('lat', lat);
                proxyUrl.searchParams.append('lng', lng);
            }

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Weather proxy error: ${response.status}`);
            }
            return await response.json();
        }

        // Direct API call for localhost (will fail on Vercel due to CORS)
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
            const response = await this.request(API_ENDPOINTS.weathercom.currentConditions, {
                geocode: `${lat},${lng}`,
                units: 'e',
                language: 'en-US'
            });

            // weatherapi.com response format
            const current = response.current;

            return {
                temperature: current.temp_f,
                feelsLike: current.feelslike_f,
                humidity: current.humidity,
                windSpeed: current.wind_mph,
                windDirection: current.wind_dir,
                precipitation: current.precip_in,
                conditions: current.condition.text,
                icon: current.condition.code,
                timestamp: response.location.localtime
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
                units: 'e',
                language: 'en-US'
            });

            // weatherapi.com forecast format
            const forecast = data.forecast.forecastday.map(day => ({
                date: day.date,
                dayOfWeek: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                tempHigh: day.day.maxtemp_f,
                tempLow: day.day.mintemp_f,
                precipitation: day.day.totalprecip_in,
                precipChance: day.day.daily_chance_of_rain,
                narrative: day.day.condition.text,
                icon: day.day.condition.code
            }));

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
     * Get historical monthly climate averages
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    async getMonthlyClimateData(lat, lng) {
        try {
            const url = `${this.baseUrl}${API_ENDPOINTS.weathercom.monthlyForecast}?geocode=${lat},${lng}&format=json&units=e&language=en-US`;

            const response = await fetch(url, {
                headers: { 'apiKey': this.apiKey }
            });

            if (!response.ok) {
                throw new Error(`Weather.com API error: ${response.status}`);
            }

            const data = await response.json();

            return {
                monthlyAverages: data.temperatureMax || [],
                precipitation: data.precipitationSum || [],
                historicalData: data,
                source: 'Weather.com Monthly Climate Data'
            };

        } catch (error) {
            console.error('Error fetching monthly climate data:', error);
            return null;
        }
    }

    /**
     * Get severe weather history for a location
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    async getSevereWeatherHistory(lat, lng) {
        try {
            const url = `${this.baseUrl}/v1/location/${lat}:${lng}:4:US/severe.json`;

            const response = await fetch(url, {
                headers: { 'apiKey': this.apiKey }
            });

            if (!response.ok) {
                throw new Error(`Weather.com API error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching severe weather history:', error);
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
            console.warn(`⚠️ No coordinates for ${property.name} (lat: ${lat}, lng: ${lng})`);
            return null;
        }

        console.log(`✅ Using coordinates for ${property.name}: lat=${lat}, lng=${lng}`);

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
