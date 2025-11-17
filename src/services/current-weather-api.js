const codeToEmoji = {
  0: "☀️", 1: "☀️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  56: "🌧️", 57: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  66: "🌧️", 67: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️", 77: "❄️",
  80: "🌧️", 81: "🌧️", 82: "🌧️",
  85: "❄️", 86: "❄️",
  95: "⛈️", 96: "⛈️", 99: "⛈️"
};

export default {
  async getWeatherForProperty(property) {
    const lat = property.location.latitude;
    const lng = property.location.longitude;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Open-Meteo forecast failed');

    const data = await response.json();

    const current = {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      wind: Math.round(data.current.wind_speed_10m),
      precip: data.current.precipitation,
      icon: data.current.weather_code
    };

    const forecast = data.daily.time.slice(0, 7).map((dateStr, i) => ({
      date: dateStr,
      tempHigh: Math.round(data.daily.temperature_2m_max[i]),
      tempLow: Math.round(data.daily.temperature_2m_min[i]),
      precip: data.daily.precipitation_sum[i],
      iconEmoji: codeToEmoji[data.daily.weather_code[i]] || "☀️"
    }));

    return { current, forecast };
  }
};
