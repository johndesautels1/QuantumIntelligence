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

    // PRIMARY: Try Vercel proxy → WeatherAPI.com first
    try {
      console.log(`🌐 Attempting WeatherAPI.com via Vercel proxy for ${lat},${lng}...`);

      // WeatherAPI.com requires specific date format, fetch year of data
      const response = await fetch(`/api/weather?endpoint=history&lat=${lat}&lng=${lng}&date=2020-01-01&end_date=2020-12-31`);

      if (response.ok) {
        const data = await response.json();

        // Parse WeatherAPI.com response into monthly averages
        if (data.forecast?.forecastday) {
          const result = parseWeatherAPIData(data.forecast.forecastday);
          cache.set(cacheKey, result);
          console.log(`✅ Successfully loaded data from WeatherAPI.com for ${lat},${lng}`);
          return result;
        }
      }

      console.warn(`⚠️ WeatherAPI.com returned no data, trying fallback...`);
    } catch (error) {
      console.warn(`⚠️ WeatherAPI.com failed (${error.message}), trying fallback...`);
    }

    // FALLBACK: Use Open-Meteo Archive API
    try {
      console.log(`🌐 Attempting Open-Meteo Archive fallback for ${lat},${lng}...`);

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=1991-01-01&end_date=2020-12-31&daily=temperature_2m_mean,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

      const data = await response.json();

      if (!data.daily) throw new Error('No daily data returned');

      // Calculate monthly averages from daily data (30 years: 1991-2020)
      const monthlyData = Array.from({ length: 12 }, () => ({ temps: [], precips: [] }));

      data.daily.time.forEach((dateStr, i) => {
        const month = new Date(dateStr).getMonth(); // 0-11
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
        humidity: 65, // Note: Open-Meteo Archive doesn't provide humidity/wind
        wind: 12
      }));

      cache.set(cacheKey, result);
      console.log(`✅ Successfully loaded data from Open-Meteo Archive for ${lat},${lng}`);
      return result;

    } catch (error) {
      console.error(`❌ Both APIs failed for ${lat},${lng}:`, error.message);
      throw error;
    }
  }
};

/**
 * Parse WeatherAPI.com forecast data into monthly averages
 * WeatherAPI.com provides: temp_f, humidity, precip_in, wind_mph
 */
function parseWeatherAPIData(forecastDays) {
  const monthlyData = Array.from({ length: 12 }, () => ({
    temps: [],
    humidity: [],
    precips: [],
    winds: []
  }));

  forecastDays.forEach(day => {
    const month = new Date(day.date).getMonth(); // 0-11

    if (day.day) {
      monthlyData[month].temps.push(day.day.avgtemp_f || day.day.maxtemp_f);
      monthlyData[month].humidity.push(day.day.avghumidity);
      monthlyData[month].precips.push(day.day.totalprecip_in);
      monthlyData[month].winds.push(day.day.maxwind_mph);
    }
  });

  return monthlyData.map(m => ({
    temp: m.temps.length > 0 ? Math.round(m.temps.reduce((a, b) => a + b, 0) / m.temps.length) : 60,
    precip: m.precips.length > 0 ? Number((m.precips.reduce((a, b) => a + b, 0) / m.precips.length).toFixed(1)) : 2.0,
    humidity: m.humidity.length > 0 ? Math.round(m.humidity.reduce((a, b) => a + b, 0) / m.humidity.length) : 65,
    wind: m.winds.length > 0 ? Math.round(m.winds.reduce((a, b) => a + b, 0) / m.winds.length) : 12
  }));
}
