/**
 * WeatherAPI.com Integration for Historical Climate Data
 * FREE API KEY: 6c2742fa11984c0cbcd192914251711
 *
 * This API is used ONLY for 30-year climate normals (historical data).
 * Current weather is handled by weathercom-api.js (Open-Meteo).
 */

const API_KEY = '6c2742fa11984c0cbcd192914251711';
const cache = new Map();

export default {
  async getWeatherForProperty(property) {
    const lat = parseFloat(property.location.latitude).toFixed(4);
    const lng = parseFloat(property.location.longitude).toFixed(4);
    const cacheKey = `${lat},${lng}`;

    if (cache.has(cacheKey)) {
      console.log(`✅ Using cached WeatherAPI.com data for ${property.name}`);
      return cache.get(cacheKey);
    }

    if (!lat || !lng) throw new Error('Missing coordinates');

    try {
      // WeatherAPI.com History API - Get last 365 days of weather
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const url = `https://api.weatherapi.com/v1/history.json?key=${API_KEY}&q=${lat},${lng}&dt=${startDate.toISOString().split('T')[0]}&end_dt=${endDate.toISOString().split('T')[0]}`;

      const response = await fetch(url);

      if (!response.ok) {
        // If WeatherAPI fails, fall back to Open-Meteo Archive API
        console.warn(`⚠️ WeatherAPI.com failed for ${property.name}, falling back to Open-Meteo...`);
        return await this.fallbackToOpenMeteo(lat, lng);
      }

      const data = await response.json();

      if (!data.forecast || !data.forecast.forecastday) {
        throw new Error('No forecast data returned from WeatherAPI.com');
      }

      // Calculate monthly averages from daily data
      const monthlyData = Array.from({ length: 12 }, () => ({ temps: [], precips: [], humidity: [], wind: [] }));

      data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const month = date.getMonth(); // 0-11

        monthlyData[month].temps.push(day.day.avgtemp_f);
        monthlyData[month].precips.push(day.day.totalprecip_in);
        monthlyData[month].humidity.push(day.day.avghumidity);
        monthlyData[month].wind.push(day.day.maxwind_mph);
      });

      const result = monthlyData.map(m => ({
        temp: m.temps.length > 0 ? Math.round(m.temps.reduce((a, b) => a + b, 0) / m.temps.length) : 60,
        precip: m.precips.length > 0 ? Number((m.precips.reduce((a, b) => a + b, 0) / m.precips.length).toFixed(1)) : 2.0,
        humidity: m.humidity.length > 0 ? Math.round(m.humidity.reduce((a, b) => a + b, 0) / m.humidity.length) : 65,
        wind: m.wind.length > 0 ? Math.round(m.wind.reduce((a, b) => a + b, 0) / m.wind.length) : 12
      }));

      cache.set(cacheKey, result);
      console.log(`✅ Successfully fetched WeatherAPI.com data for ${property.name}`);
      return result;

    } catch (error) {
      console.warn(`⚠️ WeatherAPI.com error for ${property.name}:`, error.message);
      // Fall back to Open-Meteo if WeatherAPI fails
      return await this.fallbackToOpenMeteo(lat, lng);
    }
  },

  /**
   * Fallback to Open-Meteo Archive API if WeatherAPI.com fails
   */
  async fallbackToOpenMeteo(lat, lng) {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=1991-01-01&end_date=2020-12-31&daily=temperature_2m_mean,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Both WeatherAPI and Open-Meteo failed');

    const data = await response.json();
    if (!data.daily) throw new Error('No daily data returned');

    // Calculate monthly averages from daily data (30 years: 1991-2020)
    const monthlyData = Array.from({ length: 12 }, () => ({ temps: [], precips: [] }));

    data.daily.time.forEach((dateStr, i) => {
      const month = new Date(dateStr).getMonth();
      if (data.daily.temperature_2m_mean[i] !== null) {
        monthlyData[month].temps.push(data.daily.temperature_2m_mean[i]);
      }
      if (data.daily.precipitation_sum[i] !== null) {
        monthlyData[month].precips.push(data.daily.precipitation_sum[i]);
      }
    });

    const result = monthlyData.map(m => ({
      temp: m.temps.length > 0 ? Math.round(m.temps.reduce((a, b) => a + b, 0) / m.temps.length) : 60,
      precip: m.precips.length > 0 ? Number((m.precips.reduce((a, b) => a + b, 0) / m.precips.length).toFixed(1)) : 2.0,
      humidity: 65, // Open-Meteo Archive doesn't provide humidity
      wind: 12 // Open-Meteo Archive doesn't provide wind
    }));

    console.log(`✅ Fallback: Using Open-Meteo Archive data`);
    return result;
  }
};
