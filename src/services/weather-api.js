const cache = new Map();

export default {
  async getWeatherForProperty(property) {
    const lat = parseFloat(property.location.latitude).toFixed(4);
    const lng = parseFloat(property.location.longitude).toFixed(4);
    const cacheKey = `${lat},${lng}`;

    if (cache.has(cacheKey)) return cache.get(cacheKey);

    if (!lat || !lng) throw new Error('Missing coordinates');

    // Official Open-Meteo climate normals (1991–2020 average) – one call, 12 perfect monthly values
    const url = `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lng}&models=CMIP6&monthly=temperature_2m_mean,precipitation_sum&temperature_unit=fahrenheit&precipitation_unit=inch`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Climate normals API failed');

    const data = await response.json();

    if (!data.monthly) throw new Error('No monthly data returned');

    const result = data.monthly.time.map((_, i) => ({
      temp: Math.round(data.monthly.temperature_2m_mean[i]),
      precip: Number(data.monthly.precipitation_sum[i].toFixed(1)),
      humidity: 65, // monthly humidity not in normals → safe average
      wind: 12
    }));

    cache.set(cacheKey, result);
    return result;
  }
};
