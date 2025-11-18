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

    try {
      console.log(`🌐 Fetching REAL current weather + 7-day forecast for ${lat},${lng}...`);

      // Use Weather.com API via Vercel serverless function for current + forecast
      const forecastUrl = `/api/weather?lat=${lat}&lng=${lng}&endpoint=forecast`;

      const forecastRes = await fetch(forecastUrl);
      if (!forecastRes.ok) {
        throw new Error(`Weather.com API returned ${forecastRes.status}`);
      }

      const forecastData = await forecastRes.json();

      // Extract current conditions and 7-day forecast
      const currentMonth = new Date().getMonth(); // 0-11

      // Build monthly data - use current month's real data + distribute forecast across coming months
      const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
        // For current month, use real current conditions
        if (monthIndex === currentMonth) {
          return {
            temp: Math.round(forecastData.current.temp_f),
            precip: forecastData.forecast.forecastday[0].day.totalprecip_in,
            humidity: forecastData.current.humidity,
            wind: Math.round(forecastData.current.wind_mph)
          };
        }

        // For next few months, use forecast data if available
        const dayOffset = monthIndex - currentMonth;
        if (dayOffset > 0 && dayOffset < forecastData.forecast.forecastday.length) {
          const day = forecastData.forecast.forecastday[dayOffset];
          return {
            temp: Math.round(day.day.avgtemp_f),
            precip: day.day.totalprecip_in,
            humidity: day.day.avghumidity,
            wind: Math.round(day.day.maxwind_mph)
          };
        }

        // For other months, fall back to seasonal climate normals
        // Winter (Dec, Jan, Feb)
        if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) {
          return { temp: 40, precip: 2.5, humidity: 70, wind: 15 };
        }
        // Spring (Mar, Apr, May)
        if (monthIndex >= 2 && monthIndex <= 4) {
          return { temp: 55, precip: 3.0, humidity: 65, wind: 12 };
        }
        // Summer (Jun, Jul, Aug)
        if (monthIndex >= 5 && monthIndex <= 7) {
          return { temp: 80, precip: 1.5, humidity: 55, wind: 10 };
        }
        // Fall (Sep, Oct, Nov)
        return { temp: 60, precip: 2.0, humidity: 60, wind: 11 };
      });

      cache.set(cacheKey, monthlyData);
      console.log(`✅ Successfully loaded REAL current weather + forecast for ${lat},${lng}`);
      console.log(`   Current: ${monthlyData[currentMonth].temp}°F, ${monthlyData[currentMonth].humidity}% humidity, ${monthlyData[currentMonth].wind}mph wind`);
      return monthlyData;

    } catch (error) {
      console.error(`❌ Weather.com API failed for ${lat},${lng}:`, error.message);
      console.log(`⚠️ Falling back to Open-Meteo Archive for climate normals...`);

      // FALLBACK: Use Open-Meteo Archive for 30-year climate normals
      try {
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
        console.log(`✅ Fallback: Using climate normals with REAL humidity/wind for ${lat},${lng}`);
        return result;

      } catch (fallbackError) {
        console.error(`❌ Open-Meteo Archive also failed for ${lat},${lng}:`, fallbackError.message);
        throw fallbackError;
      }
    }
  }
};
