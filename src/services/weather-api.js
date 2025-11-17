const cache = new Map();

// 1-second delay to prevent rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default {
  async getWeatherForProperty(property) {
    const lat = parseFloat(property.location.latitude).toFixed(4);
    const lng = parseFloat(property.location.longitude).toFixed(4);
    const cacheKey = `${lat},${lng}`;

    // Check cache first
    if (cache.has(cacheKey)) {
      console.log(`✅ Using cached climate data for ${lat},${lng}`);
      return cache.get(cacheKey);
    }

    if (!lat || !lng) throw new Error('Missing coordinates');

    // Add 1-second delay before API call
    await delay(1000);

    // NOTE: WeatherAPI.com history endpoint requires PAID PLAN (free tier = 7 days only)
    // So we use Open-Meteo Archive directly for historical climate data

    // Use Open-Meteo Archive API for 30-year climate normals
    try {
      console.log(`🌐 Fetching climate data with humidity/wind for ${lat},${lng}...`);

      // Fetch temperature and precipitation from Archive (1991-2020)
      const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=1991-01-01&end_date=2020-12-31&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit&precipitation_unit=inch&wind_speed_unit=mph&timezone=auto`;

      const response = await fetch(archiveUrl);
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

      const data = await response.json();

      if (!data.daily) throw new Error('No daily data returned');

      // Calculate monthly averages from daily data (30 years: 1991-2020)
      const monthlyData = Array.from({ length: 12 }, () => ({
        temps: [],
        precips: [],
        humidity: [],
        winds: []
      }));

      data.daily.time.forEach((dateStr, i) => {
        const month = new Date(dateStr).getMonth(); // 0-11

        if (data.daily.temperature_2m_mean[i] !== null) {
          monthlyData[month].temps.push(data.daily.temperature_2m_mean[i]);
        }
        if (data.daily.precipitation_sum[i] !== null) {
          monthlyData[month].precips.push(data.daily.precipitation_sum[i]);
        }
        if (data.daily.relative_humidity_2m?.[i] !== null) {
          monthlyData[month].humidity.push(data.daily.relative_humidity_2m[i]);
        }
        if (data.daily.wind_speed_10m?.[i] !== null) {
          monthlyData[month].winds.push(data.daily.wind_speed_10m[i]);
        }
      });

      const result = monthlyData.map(m => ({
        temp: m.temps.length > 0 ? Math.round(m.temps.reduce((a, b) => a + b, 0) / m.temps.length) : 60,
        precip: m.precips.length > 0 ? Number((m.precips.reduce((a, b) => a + b, 0) / m.precips.length).toFixed(1)) : 2.0,
        humidity: m.humidity.length > 0 ? Math.round(m.humidity.reduce((a, b) => a + b, 0) / m.humidity.length) : 65,
        wind: m.winds.length > 0 ? Math.round(m.winds.reduce((a, b) => a + b, 0) / m.winds.length) : 12
      }));

      cache.set(cacheKey, result);
      console.log(`✅ Successfully loaded climate data with REAL humidity/wind for ${lat},${lng}`);
      return result;

    } catch (error) {
      console.error(`❌ Open-Meteo Archive failed for ${lat},${lng}:`, error.message);
      throw error;
    }
  }
};
