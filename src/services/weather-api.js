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

    // Get REAL 2025 year-to-date data + 16-day forecast
    try {
      console.log(`🌐 Fetching 2025 YTD + forecast data for ${lat},${lng}...`);

      const today = new Date();
      const startOfYear = '2025-01-01';
      const todayStr = today.toISOString().split('T')[0];

      // Fetch actual 2025 year-to-date data
      const ytdUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${startOfYear}&end_date=${todayStr}&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit&precipitation_unit=inch&wind_speed_unit=mph&timezone=auto`;

      // Fetch 16-day forecast
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m,wind_speed_10m_max&temperature_unit=fahrenheit&precipitation_unit=inch&wind_speed_unit=mph&forecast_days=16&timezone=auto`;

      const [ytdRes, forecastRes] = await Promise.all([
        fetch(ytdUrl),
        fetch(forecastUrl)
      ]);

      if (!ytdRes.ok) throw new Error(`YTD data failed: ${ytdRes.status}`);
      if (!forecastRes.ok) throw new Error(`Forecast failed: ${forecastRes.status}`);

      const ytdData = await ytdRes.json();
      const forecastData = await forecastRes.json();

      // Combine YTD actual + forecast into monthly averages
      const monthlyData = Array.from({ length: 12 }, () => ({
        temps: [],
        precips: [],
        humidity: [],
        winds: []
      }));

      // Add YTD actual data
      if (ytdData.daily?.time) {
        ytdData.daily.time.forEach((dateStr, i) => {
          const month = new Date(dateStr).getMonth();
          if (ytdData.daily.temperature_2m_mean[i] !== null) {
            monthlyData[month].temps.push(ytdData.daily.temperature_2m_mean[i]);
          }
          if (ytdData.daily.precipitation_sum[i] !== null) {
            monthlyData[month].precips.push(ytdData.daily.precipitation_sum[i]);
          }
          if (ytdData.daily.relative_humidity_2m?.[i] !== null) {
            monthlyData[month].humidity.push(ytdData.daily.relative_humidity_2m[i]);
          }
          if (ytdData.daily.wind_speed_10m?.[i] !== null) {
            monthlyData[month].winds.push(ytdData.daily.wind_speed_10m[i]);
          }
        });
      }

      // Add next 16 days forecast
      if (forecastData.daily?.time) {
        forecastData.daily.time.forEach((dateStr, i) => {
          const month = new Date(dateStr).getMonth();
          if (forecastData.daily.temperature_2m_mean?.[i] !== null) {
            monthlyData[month].temps.push(forecastData.daily.temperature_2m_mean[i]);
          }
          if (forecastData.daily.precipitation_sum?.[i] !== null) {
            monthlyData[month].precips.push(forecastData.daily.precipitation_sum[i]);
          }
          if (forecastData.daily.relative_humidity_2m?.[i] !== null) {
            monthlyData[month].humidity.push(forecastData.daily.relative_humidity_2m[i]);
          }
          if (forecastData.daily.wind_speed_10m_max?.[i] !== null) {
            monthlyData[month].winds.push(forecastData.daily.wind_speed_10m_max[i]);
          }
        });
      }

      // Calculate monthly averages
      const result = monthlyData.map((m, monthIndex) => ({
        temp: m.temps.length > 0 ? Math.round(m.temps.reduce((a, b) => a + b, 0) / m.temps.length) : 60,
        precip: m.precips.length > 0 ? Number((m.precips.reduce((a, b) => a + b, 0) / m.precips.length).toFixed(1)) : 2.0,
        humidity: m.humidity.length > 0 ? Math.round(m.humidity.reduce((a, b) => a + b, 0) / m.humidity.length) : 65,
        wind: m.winds.length > 0 ? Math.round(m.winds.reduce((a, b) => a + b, 0) / m.winds.length) : 12
      }));

      cache.set(cacheKey, result);
      console.log(`✅ Loaded 2025 YTD + forecast data with REAL humidity/wind for ${lat},${lng}`);
      return result;

    } catch (error) {
      console.error(`❌ Weather data fetch failed for ${lat},${lng}:`, error.message);
      throw error;
    }
  }
};
