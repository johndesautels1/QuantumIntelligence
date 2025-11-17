const cache = new Map();

export default {
  async getWeatherForProperty(property) {
    const lat = property.location.latitude?.toFixed(4);
    const lng = property.location.longitude?.toFixed(4);
    const cacheKey = `${lat},${lng}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    if (!lat || !lng) throw new Error('Missing coordinates');

    // Open-Meteo archive → 30-year monthly averages (1991–2020)
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=1991-01-01&end_date=2020-12-31&monthly=temperature_2m_mean,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Open-Meteo archive failed');

    const data = await response.json();

    const temps = data.monthly.temperature_2m_mean;
    const precips = data.monthly.precipitation_sum;
    const time = data.monthly.time; // ["1991-01", ...]

    // Average each month across the 30 years
    const averages = Array.from({length: 12}, () => ({temp: 0, precip: 0, count: 0}));

    time.forEach((t, i) => {
      const monthIdx = new Date(t + '-01').getMonth(); // 0-11
      if (temps[i] !== null) {
        averages[monthIdx].temp += temps[i];
        averages[monthIdx].count++;
      }
      if (precips[i] !== null) {
        averages[monthIdx].precip += precips[i];
      }
    });

    const result = averages.map(m => ({
      temp: m.count ? Math.round(m.temp / m.count) : 50,
      precip: m.count ? Number((m.precip / m.count).toFixed(1)) : 2.0,
      humidity: 60, // monthly humidity not available in archive → fallback
      wind: 10     // monthly wind not available → fallback
    }));

    cache.set(cacheKey, result);
    return result;
  }
};
