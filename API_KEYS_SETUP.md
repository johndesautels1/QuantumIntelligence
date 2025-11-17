# API Keys Setup Guide

## 🔐 Security First

**IMPORTANT:** API keys are stored in `config.js` which is **NOT committed to git**. This keeps your keys safe.

---

## Setup Instructions

### 1. The config.js file has already been created for you with your NOAA credentials:

```javascript
export const API_KEYS = {
    noaa: {
        email: 'cluesnomads@gmail.com',
        token: 'pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd'
    }
};
```

### 2. Verification

Check that `config.js` is protected:

```bash
# Verify it's in .gitignore
cat .gitignore | grep config.js

# Verify git won't track it
git status --ignored | grep config.js
```

You should see: `config.js` listed in ignored files.

---

## Current API Keys

### NOAA Climate Data Online (CDO)

**Status:** ✅ Active
**Email:** cluesnomads@gmail.com
**Token:** pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd
**Documentation:** https://www.ncdc.noaa.gov/cdo-web/webservices/v2

**What it provides:**
- Historical weather data (temperature, precipitation)
- Weather station information
- Climate normals
- Extreme weather events

**Usage Limits:**
- 1000 requests per day (resets at midnight UTC)
- 5 requests per second

### Weather.com API

**Status:** ✅ Active
**API Key:** 539f39179dab4d63ad0113545251711
**Documentation:** https://www.ibm.com/docs/en/wdfaas

**What it provides:**
- Current weather conditions
- 5-day forecast
- 12-hour hourly forecast
- Real-time temperature, humidity, wind speed
- Precipitation data

**Usage Limits:**
- Varies by plan tier
- Check your account dashboard for specific limits

---

## How Weather Data Works

### Real Data Flow:

**NOAA Historical Data:**
1. **Property loaded** → Has lat/lng coordinates
2. **Find nearest station** → NOAA API `/stations` endpoint
3. **Fetch historical data** → NOAA API `/data` endpoint (past year)
4. **Process & cache** → Store monthly averages
5. **Display** → Show historical climate patterns

**Weather.com Current/Forecast Data:**
1. **Property loaded** → Has lat/lng coordinates
2. **Fetch current conditions** → Weather.com API `/observations/current`
3. **Fetch 5-day forecast** → Weather.com API `/forecast/daily/5day`
4. **Fetch hourly forecast** → Weather.com API `/forecast/hourly/12hour`
5. **Cache & display** → Real-time weather information

### Fallback Strategy:

```
Weather.com API → NOAA Historical → Placeholder Climate Data
       ↓                 ↓                      ↓
  Current/Forecast   Historical Avg      Generic Patterns
```

---

## Adding More API Keys

To add additional weather services (OpenWeatherMap, WeatherAPI, etc.):

**1. Update config.js:**

```javascript
export const API_KEYS = {
    noaa: { /* existing */ },
    openweather: {
        key: 'your_key_here'
    },
    weatherapi: {
        key: 'your_key_here'
    }
};
```

**2. Add endpoints:**

```javascript
export const API_ENDPOINTS = {
    noaa: { /* existing */ },
    openweather: {
        base: 'https://api.openweathermap.org/data/2.5',
        current: '/weather',
        forecast: '/forecast'
    }
};
```

---

## Testing API Connection

Open browser console on weather simulator page:

```javascript
// Test NOAA connection
import weatherAPI from './src/services/weather-api.js';

// Find station for Tampa area
const station = await weatherAPI.findNearestStation(27.9506, -82.4572);
console.log(station);

// Get historical data
const data = await weatherAPI.getHistoricalData(station.id);
console.log(data);
```

---

## Security Checklist

- ✅ `config.js` in `.gitignore`
- ✅ `config.example.js` shows structure without keys
- ✅ Keys never in committed files
- ✅ Keys never in screenshots/logs shared publicly
- ⚠️ For production: Use backend proxy to hide keys completely

---

## Troubleshooting

### "Module not found: config.js"

**Solution:** Make sure `config.js` exists in project root:

```bash
ls config.js
```

If not found, copy from example:

```bash
cp config.example.js config.js
# Then edit config.js with your actual keys
```

### NOAA API Returns 403

**Possible causes:**
- Token incorrect
- Daily limit exceeded (1000 requests)
- Rate limit hit (5 requests/second)

**Check:**
```bash
# Test token manually
curl -H "token: pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd" \
  "https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets"
```

### No Data for Property Location

**Possible causes:**
- No NOAA station nearby (rural areas)
- Property lat/lng incorrect
- Station has no historical data

**Fallback:** App uses placeholder climate data automatically

---

## Next Steps

1. ✅ Keys are secured
2. ✅ Weather API service created
3. ⏳ Integrate into weather simulator page
4. ⏳ Add caching to IndexedDB
5. ⏳ Test with real Florida properties

---

**Last Updated:** 2025-11-17
