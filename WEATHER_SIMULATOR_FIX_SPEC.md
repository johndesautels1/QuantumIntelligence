# Weather Simulator Fix - Technical Specification

## Current State Analysis

### Existing Code Structure
1. **weather-api.js** - Uses Open-Meteo Archive API (causing 429 errors)
2. **weathercom-api.js** - Uses Open-Meteo Forecast API (100% working, DO NOT TOUCH)
3. **api/weather.js** - Vercel serverless proxy for WeatherAPI.com (exists but unused)
4. **Initialization** - Loads ALL 20 properties on page load (causes rate limits)

### Current Problems
1. All 20 properties fetch data simultaneously → 429 rate limit errors on Open-Meteo Archive
2. Only 4/20 properties successfully load historical data
3. 16/20 properties fall back to placeholder data
4. No user control over which properties to load

### What's Working (DO NOT BREAK)
- ✅ weathercom-api.js - Current weather + 7-day forecast (Open-Meteo Forecast API)
- ✅ All glassmorphic charts (ApexCharts, tsParticles, Cal-Heatmap)
- ✅ Climate risk assessment
- ✅ Property selection and display

## Required Changes (User's 4 Steps)

### Step 1: Add Property Toolbar (Max 4)
**UI Requirements:**
- Top toolbar with heading "🏠 Compare Properties (Max 4)"
- Instruction text: "Add up to 4 properties to load real weather data"
- "+ Add Property" button
- Shows list of up to 4 selected properties
- Each property shows: Name, Location, Data status indicator

**Behavior:**
- Button opens property picker modal
- Max 4 properties enforced
- Button disabled when 4 selected

### Step 2: Red Trash Icons
**UI Requirements:**
- Each selected property has red 🗑️ trash icon
- Icon positioned on right side of property card
- Click trash icon to remove property

**Behavior:**
- Removes property from selected list
- If removed property was active, switch to first remaining
- If no properties left, show empty state

### Step 3: Smart Loading (Not All 20)
**Current Behavior (BAD):**
```javascript
// Lines 2119-2127 - Fetches ALL 20 properties
const climateNormalsPromises = PROPERTIES.map(prop => fetchRealWeatherData(prop));
await Promise.allSettled(climateNormalsPromises);
```

**New Behavior (GOOD):**
- NO automatic fetching on page load
- Data fetched ONLY when user clicks "+ Add Property"
- 1-second delay between each API call
- Sequential loading (not parallel)

### Step 4: WeatherAPI.com Integration
**Current (weather-api.js):**
- Direct call to Open-Meteo Archive API
- No fallback
- No delays
- Humidity/wind hardcoded to 65/12

**New (weather-api.js):**
- PRIMARY: Use Vercel proxy `/api/weather` → WeatherAPI.com
- FALLBACK: Open-Meteo Archive API if Vercel fails
- 1-second delay before each call
- REAL humidity & wind from WeatherAPI.com

## Implementation Plan

### File: weather-api.js (REWRITE)
```javascript
const cache = new Map();

export default {
  async getWeatherForProperty(property) {
    // 1. Check cache
    // 2. Add 1-second delay
    // 3. Try Vercel proxy first (/api/weather?endpoint=forecast&lat=X&lng=Y&days=365)
    // 4. Parse WeatherAPI.com response → monthly averages
    // 5. If fails, fallback to Open-Meteo Archive
    // 6. Return 12-month array with temp, precip, humidity, wind
  }
};
```

### File: enhancement_5_weather_simulator.html (MODIFY)

**HTML Changes:**
```html
<!-- OLD: Line 788-794 -->
<div class="panel">
    <h2>🏠 Select Property</h2>
    <div class="property-selector" id="propertySelector">...</div>
</div>

<!-- NEW: -->
<div class="panel">
    <h2>🏠 Compare Properties (Max 4)</h2>
    <p class="panel-subtitle">Add up to 4 properties to load real weather data</p>
    <div id="selectedPropertiesToolbar"><!-- Selected properties here --></div>
    <button id="addPropertyBtn" onclick="showPropertyPicker()">+ Add Property</button>
    <div id="propertyPickerModal" style="display: none;">...</div>
</div>
```

**JavaScript Changes:**
```javascript
// NEW GLOBAL VARIABLE
let SELECTED_PROPERTIES = []; // Array of up to 4 property IDs

// NEW FUNCTIONS
function showPropertyPicker() { ... }
function hidePropertyPicker() { ... }
async function addPropertyToSelected(propertyId) {
  // 1. Validate max 4
  // 2. Add to SELECTED_PROPERTIES
  // 3. Add 1-second delay
  // 4. await fetchRealWeatherData(property)
  // 5. Add 500ms delay
  // 6. await fetchWeatherComData(property)
  // 7. Update UI
}
function removePropertyFromSelected(propertyId) { ... }
function renderSelectedPropertiesToolbar() { ... }

// MODIFY INITIALIZATION (Line 2119-2127)
// OLD:
const climateNormalsPromises = PROPERTIES.map(prop => fetchRealWeatherData(prop));
await Promise.allSettled(climateNormalsPromises);

// NEW:
// DO NOT FETCH ANYTHING
// Just initialize empty toolbar
renderSelectedPropertiesToolbar();
```

## Testing Checklist

### Before Committing
- [ ] Verify weathercom-api.js untouched
- [ ] Test adding 1 property - data loads
- [ ] Test adding 4 properties - button disables
- [ ] Test removing property - toolbar updates
- [ ] Test trash icon - doesn't select property
- [ ] Verify current weather still works
- [ ] Verify all charts still render
- [ ] Check console for errors
- [ ] Verify no 429 errors with 4 properties

### Expected Behavior
1. Page loads instantly (no API calls)
2. User clicks "+ Add Property"
3. Modal shows all 20 properties
4. User selects property
5. Modal closes
6. Toolbar shows property with trash icon
7. API calls begin (with delays)
8. Data loads successfully
9. Charts update
10. Repeat up to 4 times

## Vercel Environment Variable

**Required:**
Set in Vercel dashboard → Project → Settings → Environment Variables
```
WEATHERCOM_API_KEY=6c2742fa11984c0cbcd192914251711
```

## Files to Modify
1. `src/services/weather-api.js` - Rewrite to use Vercel proxy
2. `src/enhancement_5_weather_simulator.html` - Add toolbar UI + logic

## Files NOT to Touch
1. `src/services/weathercom-api.js` - Current weather (working)
2. `src/services/climate-risk-api.js` - Working
3. `api/weather.js` - Vercel proxy (already exists)
4. All other enhancement files

## Success Criteria
✅ Max 4 properties can be selected
✅ Each has red trash icon for removal
✅ Data loads ONLY when user adds property
✅ Uses WeatherAPI.com (via Vercel proxy) with Open-Meteo fallback
✅ 1-second delays prevent 429 errors
✅ Real humidity & wind data (not hardcoded)
✅ Current weather unchanged (weathercom-api.js)
✅ All charts still work
✅ No console errors
✅ No 429 rate limit errors
