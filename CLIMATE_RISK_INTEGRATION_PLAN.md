# Climate Risk & Property Intelligence Integration Plan

## What We've Built (Commit: 176dd84)

Created 4 new API service modules ready for integration into the Weather Simulator:

### 1. Climate Risk API (`src/services/climate-risk-api.js`)
**No API keys required** - Free government data sources

**Features:**
- FEMA Flood Zone detection (A, AE, V, VE, X zones)
- USGS Elevation data (feet above sea level)
- NOAA Sea Level Rise projections (0-6ft scenarios)
- Comprehensive risk scoring (0-100 scale)
- Automatic caching for performance

**Endpoints:**
- `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query`
- `https://epqs.nationalmap.gov/v1/json`
- `https://coast.noaa.gov/arcgis/rest/services/dc_slr/slr_Xft/MapServer`

**Usage:**
```javascript
import climateRiskAPI from './src/services/climate-risk-api.js';

const risk = await climateRiskAPI.getComprehensiveRisk(lat, lng);
// Returns: { floodZone, elevation, seaLevelRise, overallRisk }
```

### 2. MLS API (`src/services/mls-api.js`)
**Requires your MLS API credentials**

**Features:**
- Property structural details (roof age, type, foundation)
- HVAC age and renovation history
- Roof condition assessment
- Structural risk scoring
- Maintenance recommendations

**Configuration needed:**
```javascript
// In config.js (DO NOT COMMIT):
mls: {
    apiKey: 'YOUR_MLS_API_KEY',
    endpoint: 'https://api.your-mls-provider.com/v1'
}
```

**Usage:**
```javascript
import mlsAPI from './src/services/mls-api.js';

const details = await mlsAPI.getPropertyDetails(mlsNumber);
// Returns: { roofAge, roofType, foundationType, yearBuilt, ... }
```

### 3. Google Maps API (`src/services/google-maps-api.js`)
**Requires Google Maps API key**

**Features:**
- Satellite imagery (multiple zoom levels)
- Street view images (4 angles: front, rear, left, right)
- Hybrid maps with labels
- Neighborhood context views

**Get API Key:**
1. Go to https://console.cloud.google.com/
2. Create/select project
3. Enable "Maps Static API" and "Street View Static API"
4. Create API key

**Configuration needed:**
```javascript
// In config.js (DO NOT COMMIT):
googleMaps: {
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
}
```

**Usage:**
```javascript
import googleMapsAPI from './src/services/google-maps-api.js';

const satelliteUrl = googleMapsAPI.getSatelliteImageUrl(lat, lng);
const streetViewUrl = googleMapsAPI.getStreetViewImageUrl(lat, lng);
```

### 4. Extended Weather.com API (`src/services/weathercom-api.js`)
**Already configured** - Using your existing Weather.com key

**New endpoints added:**
- Monthly climate averages
- Severe weather history

**Usage:**
```javascript
import weatherComAPI from './src/services/weathercom-api.js';

const climate = await weatherComAPI.getMonthlyClimateData(lat, lng);
const severe = await weatherComAPI.getSevereWeatherHistory(lat, lng);
```

---

## What's Next: Integration into Weather Simulator

### New Tab: "Climate Risk Assessment"

**Add after existing tabs** in `enhancement_5_weather_simulator.html`:

```html
<div class="tab" onclick="window.setTab('risk')">Climate Risk</div>
```

**Tab Content Section:**
```html
<div id="riskTab" class="tab-content">
    <h2>🌊 Climate Risk & Property Intelligence</h2>

    <!-- Flood Risk Card -->
    <div class="risk-card">
        <h3>Flood Risk Assessment</h3>
        <div id="floodRiskContent"></div>
    </div>

    <!-- Elevation & Sea Level -->
    <div class="risk-card">
        <h3>Elevation & Sea Level Rise</h3>
        <div id="elevationContent"></div>
    </div>

    <!-- Property Structure -->
    <div class="risk-card">
        <h3>Property Structural Data</h3>
        <div id="structuralContent"></div>
    </div>

    <!-- Property Images -->
    <div class="risk-card">
        <h3>Property Imagery</h3>
        <div id="propertyImages"></div>
    </div>

    <!-- Overall Risk Score -->
    <div class="risk-card overall-score">
        <h2>Overall Climate Risk Score</h2>
        <div id="overallRiskScore"></div>
    </div>
</div>
```

### JavaScript Integration

**Add imports** at top of script:
```javascript
import climateRiskAPI from './services/climate-risk-api.js';
import mlsAPI from './services/mls-api.js';
import googleMapsAPI from './services/google-maps-api.js';
```

**Add data caches:**
```javascript
let CLIMATE_RISK_DATA = {};  // Cache for climate risk
let MLS_DATA = {};           // Cache for MLS property details
```

**Add fetch functions:**
```javascript
async function fetchClimateRiskData(property) {
    const lat = property.location.lat || property.location.latitude;
    const lng = property.location.lng || property.location.longitude;

    if (!lat || !lng) return null;

    if (CLIMATE_RISK_DATA[property.id]) {
        return CLIMATE_RISK_DATA[property.id];
    }

    const risk = await climateRiskAPI.getComprehensiveRisk(lat, lng);
    CLIMATE_RISK_DATA[property.id] = risk;
    return risk;
}

async function fetchMLSData(property) {
    const mlsNumber = property.mls_number || property.mlsNumber;

    if (!mlsNumber) return null;

    if (MLS_DATA[property.id]) {
        return MLS_DATA[property.id];
    }

    const details = await mlsAPI.getPropertyDetails(mlsNumber);
    MLS_DATA[property.id] = details;
    return details;
}
```

**Add render function:**
```javascript
async function renderClimateRisk() {
    if (!currentProperty) return;

    console.log('🌍 Rendering climate risk assessment...');

    const lat = currentProperty.location.lat || currentProperty.location.latitude;
    const lng = currentProperty.location.lng || currentProperty.location.longitude;

    // Fetch all data in parallel
    const [climateRisk, mlsData] = await Promise.all([
        fetchClimateRiskData(currentProperty),
        fetchMLSData(currentProperty)
    ]);

    // Render flood risk
    document.getElementById('floodRiskContent').innerHTML = `
        <div class="risk-metric">
            <span class="label">FEMA Flood Zone:</span>
            <span class="value zone-${climateRisk.floodZone.zone}">${climateRisk.floodZone.zone}</span>
        </div>
        <p>${climateRisk.floodZone.message}</p>
    `;

    // Render elevation
    document.getElementById('elevationContent').innerHTML = `
        <div class="risk-metric">
            <span class="label">Elevation:</span>
            <span class="value">${climateRisk.elevation.elevationFeet.toFixed(1)} feet</span>
        </div>
        <p>${climateRisk.elevation.riskLevel}</p>
        <p><strong>Sea Level Rise:</strong> ${climateRisk.seaLevelRise.riskSummary}</p>
    `;

    // Render structural data
    if (mlsData && mlsData.roofAge) {
        const condition = mlsAPI.getRoofCondition(mlsData.roofAge, mlsData.roofType);
        document.getElementById('structuralContent').innerHTML = `
            <div class="risk-metric">
                <span class="label">Roof Age:</span>
                <span class="value">${mlsData.roofAge} years</span>
            </div>
            <div class="risk-metric">
                <span class="label">Roof Type:</span>
                <span class="value">${mlsData.roofType}</span>
            </div>
            <p><strong>Condition:</strong> ${condition}</p>
            <p><strong>Year Built:</strong> ${mlsData.yearBuilt}</p>
        `;
    } else {
        document.getElementById('structuralContent').innerHTML =
            '<p>⚠️ MLS data not available. Configure MLS API in config.js</p>';
    }

    // Render property images
    if (googleMapsAPI.isConfigured()) {
        const satelliteUrl = googleMapsAPI.getSatelliteImageUrl(lat, lng);
        const streetViewUrl = googleMapsAPI.getStreetViewImageUrl(lat, lng);

        document.getElementById('propertyImages').innerHTML = `
            <div class="image-grid">
                <div class="image-card">
                    <h4>Satellite View</h4>
                    <img src="${satelliteUrl}" alt="Satellite View" />
                </div>
                <div class="image-card">
                    <h4>Street View</h4>
                    <img src="${streetViewUrl}" alt="Street View" />
                </div>
            </div>
        `;
    } else {
        document.getElementById('propertyImages').innerHTML =
            '<p>⚠️ Google Maps API not configured. Add API key to config.js</p>';
    }

    // Render overall risk score
    const score = climateRisk.overallRisk.score;
    const scoreClass = score >= 70 ? 'good' : score >= 40 ? 'fair' : 'poor';

    document.getElementById('overallRiskScore').innerHTML = `
        <div class="score-display ${scoreClass}">
            <div class="score-number">${score}</div>
            <div class="score-label">${climateRisk.overallRisk.rating}</div>
        </div>
        <div class="risk-breakdown">
            <p><strong>Flood Zone Impact:</strong> -${climateRisk.overallRisk.components.floodZonePenalty} points</p>
            <p><strong>Elevation:</strong> ${climateRisk.overallRisk.components.elevationImpact} feet</p>
            <p><strong>Sea Level Rise Scenarios Affected:</strong> ${climateRisk.overallRisk.components.seaLevelRiseImpact}</p>
        </div>
    `;
}
```

**Add tab switching:**
```javascript
function setTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    event.target.classList.add('active');

    // Render content based on tab
    if (tabName === 'risk') {
        renderClimateRisk();
    }
    // ... other tabs
}
```

---

## CSS Styling Needed

Add to `<style>` section:

```css
.risk-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.risk-metric {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

.zone-V, .zone-VE {
    color: #ef4444;
    font-weight: bold;
}

.zone-A, .zone-AE {
    color: #f59e0b;
    font-weight: bold;
}

.zone-X {
    color: #10b981;
    font-weight: bold;
}

.image-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.image-card img {
    width: 100%;
    border-radius: 10px;
    margin-top: 10px;
}

.score-display {
    text-align: center;
    padding: 30px;
    border-radius: 20px;
    margin: 20px 0;
}

.score-display.good { background: linear-gradient(135deg, #10b981, #059669); }
.score-display.fair { background: linear-gradient(135deg, #f59e0b, #d97706); }
.score-display.poor { background: linear-gradient(135deg, #ef4444, #dc2626); }

.score-number {
    font-size: 72px;
    font-weight: bold;
    margin-bottom: 10px;
}

.score-label {
    font-size: 20px;
    opacity: 0.9;
}

.risk-breakdown {
    text-align: left;
    margin-top: 20px;
}
```

---

## API Keys You Need

### ✅ Already Have:
- NOAA Climate Data: `pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd`
- Weather.com: `539f39179dab4d63ad0113545251711`

### ❓ Need to Provide:
1. **Google Maps API Key**
   - Get from: https://console.cloud.google.com/
   - Enable: Maps Static API + Street View Static API
   - Add to `config.js`: `googleMaps.apiKey`

2. **MLS API Credentials**
   - Your MLS provider's API key
   - API endpoint URL
   - Add to `config.js`: `mls.apiKey` and `mls.endpoint`

### 🆓 No Keys Required:
- FEMA Flood Zones (public API)
- USGS Elevation (public API)
- NOAA Sea Level Rise (public API)

---

## Testing Steps

1. **Test FEMA/USGS/NOAA** (should work immediately):
   ```javascript
   // In browser console:
   import climateRiskAPI from './src/services/climate-risk-api.js';
   const test = await climateRiskAPI.getComprehensiveRisk(27.9506, -82.4572);
   console.log(test);
   ```

2. **Add Google Maps Key** to `config.js` and test satellite images

3. **Add MLS credentials** to `config.js` and test structural data

4. **Integrate UI** into weather simulator HTML

5. **Test with your 17 Florida properties**

---

## CORS Issues

**Good news:** FEMA, USGS, and NOAA Sea Level APIs support CORS and should work directly from browser.

**Bad news:** Weather.com and MLS APIs may still be blocked by CORS.

**Solution options:**
1. Keep using placeholder data for now
2. Build backend proxy server later
3. Test and see which APIs actually work

---

## Next Actions

Would you like me to:

1. ✅ **Integrate the UI into the weather simulator now?**
   - Add the Climate Risk tab
   - Wire up all the render functions
   - Add CSS styling
   - Test with FEMA/USGS/NOAA (no keys needed)

2. **Wait for you to get API keys first?**
   - Google Maps API key
   - MLS API credentials

3. **Create a simpler demo version?**
   - Use mock data for MLS
   - Show placeholder images until Google key is added

Let me know which direction to take!

---

**Status:**
- ✅ All API services created
- ✅ Configuration templates ready
- ⏳ UI integration pending
- ⏳ API keys needed (Google Maps, MLS)

**Last Updated:** 2025-11-17
**Commit:** 176dd84
