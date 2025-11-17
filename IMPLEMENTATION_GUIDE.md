# Ultra-High-Tech Weather Simulator Upgrade - Complete Implementation Guide

## STATUS: PARTIALLY COMPLETE - HTML STRUCTURE ADDED

### ✅ COMPLETED:
1. Added ApexCharts CDN (line 14)
2. Added Cal-Heatmap CDN (lines 17-18)
3. Added tsParticles CDN (line 910)
4. Added Multi-Hazard Risk Radar panel (lines 871-875)
5. Added Future Projection panel (lines 877-886)
6. Changed chart canvases to divs (lines 888-908)
7. Added Extreme Heat Calendar panel (lines 903-908)

### 🚧 REMAINING JAVASCRIPT TO ADD:

All code below should be added in the `<script type="module">` section AFTER the imports and BEFORE initializeEnhancement():

#### 1. PARTICLE BACKGROUND INIT (add after imports, around line 930):
```javascript
// Initialize particle background
tsParticles.load("tsparticles", {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  particles: {
    number: { value: 80 },
    color: { value: "#00D4FF" },
    shape: { type: "circle" },
    opacity: { value: 0.6 },
    size: { value: 3 },
    move: { enable: true, speed: 2, direction: "bottom", outModes: "out" }
  },
  detectRetina: true
});

function updateParticles(temp, precip) {
  if (temp < 32) {
    tsParticles.load("tsparticles", {
      particles: {
        shape: { type: "circle" },
        color: { value: "#ffffff" },
        move: { speed: 4 }
      }
    });
  } else if (precip > 2) {
    tsParticles.load("tsparticles", {
      particles: {
        shape: { type: "circle" },
        color: { value: "#00aaff" },
        move: { speed: 8, direction: "bottom" }
      }
    });
  }
}
```

#### 2. SCENARIO SWITCHING (add around line 960):
```javascript
let currentScenario = 'ssp245';
window.switchScenario = async function(scenario) {
  currentScenario = scenario;
  document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  if (currentProperty) await loadProjections();
};

async function loadProjections() {
  const lat = currentProperty.location.latitude;
  const lng = currentProperty.location.longitude;
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2015-01-01&end_date=2024-12-31&daily=temperature_2m_mean&temperature_unit=fahrenheit`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Calculate monthly averages for projection
    const monthlyTemps = Array.from({ length: 12 }, () => []);
    data.daily.time.forEach((dateStr, i) => {
      const month = new Date(dateStr).getMonth();
      if (data.daily.temperature_2m_mean[i] !== null) {
        monthlyTemps[month].push(data.daily.temperature_2m_mean[i]);
      }
    });

    const futureTemps = monthlyTemps.map(temps =>
      temps.length > 0 ? Math.round(temps.reduce((a,b) => a+b, 0) / temps.length) + 3 : 60
    );

    const historicalTemps = REAL_WEATHER_DATA[currentProperty.id]?.map(m => m.temp) ||
                           Array(12).fill(60);

    const projOptions = {
      series: [
        { name: 'Historical Avg', data: historicalTemps },
        { name: 'Projected 2050–2100', data: futureTemps }
      ],
      chart: { type: 'area', height: 400, foreColor: '#fff', background: 'transparent', toolbar: { show: false } },
      theme: { mode: 'dark' },
      stroke: { curve: 'smooth', width: 4 },
      fill: { opacity: 0.5 },
      xaxis: { categories: MONTHS },
      colors: ['#00D4FF', '#ff0066'],
      grid: { borderColor: 'rgba(255,255,255,0.1)' }
    };

    if (window.projectionChart) window.projectionChart.destroy();
    window.projectionChart = new ApexCharts(document.getElementById("projectionChart"), projOptions);
    window.projectionChart.render();
  } catch (e) {
    console.warn('Projection load failed:', e);
  }
}
```

#### 3. REPLACE renderCharts() FUNCTION (find and replace entire function around line 1245):
```javascript
function renderCharts() {
  if (!currentProperty) return;
  const weatherMonths = getWeatherData();
  if (!weatherMonths) return;

  // ApexCharts - Annual Weather Patterns
  const weatherOptions = {
    series: [{
      name: 'Temperature °F',
      data: weatherMonths.map(m => m.temp)
    }, {
      name: 'Humidity %',
      data: weatherMonths.map(m => m.humidity)
    }],
    chart: { type: 'area', height: 400, foreColor: '#fff', background: 'transparent', toolbar: { show: true } },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
    xaxis: { categories: MONTHS },
    yaxis: [{ title: { text: 'Temp °F' } }, { opposite: true, title: { text: 'Humidity %' } }],
    grid: { borderColor: 'rgba(255,255,255,0.1)' },
    colors: ['#00D4FF', '#ff0066']
  };

  if (window.weatherApexChart) window.weatherApexChart.destroy();
  window.weatherApexChart = new ApexCharts(document.querySelector("#weatherChart"), weatherOptions);
  window.weatherApexChart.render();

  // ApexCharts - Precipitation Radar
  const precipOptions = {
    series: [{
      name: 'Precipitation',
      data: weatherMonths.map(m => m.precip)
    }],
    chart: { type: 'radar', height: 400, foreColor: '#00D4FF', toolbar: { show: false } },
    theme: { mode: 'dark' },
    plotOptions: { radar: { polygons: { strokeColors: 'rgba(0,212,255,0.3)', fill: { colors: ['transparent'] } } } },
    stroke: { width: 3 },
    fill: { opacity: 0.4 },
    markers: { size: 6, hover: { size: 10 } },
    xaxis: { categories: MONTHS },
    title: { text: 'Monthly Precipitation & Wind Pattern', style: { color: '#fff' } },
    colors: ['#00D4FF']
  };

  if (window.precipApexChart) window.precipApexChart.destroy();
  window.precipApexChart = new ApexCharts(document.querySelector("#precipChart"), precipOptions);
  window.precipApexChart.render();
}
```

#### 4. ADD TO renderClimateRisk() FUNCTION (add at the very end, around line 1530):
```javascript
// Multi-Hazard Risk Radar
const radarOptions = {
  series: [{
    name: 'Risk Level',
    data: [
      climateRisk.overallRisk.components.floodZonePenalty / 10,
      climateRisk.overallRisk.components.elevationPenalty / 10,
      climateRisk.overallRisk.components.heatRiskPenalty / 5,
      climateRisk.overallRisk.components.droughtFirePenalty / 5,
      climateRisk.overallRisk.components.stormPenalty / 5
    ]
  }],
  chart: { height: 400, type: 'radar', foreColor: '#00ffcc', toolbar: { show: false } },
  theme: { mode: 'dark' },
  plotOptions: { radar: { size: 140, polygons: { strokeColors: '#00D4FF', connectorColors: '#00D4FF', fill: { colors: ['#0066CC33'] } } } },
  stroke: { width: 4 },
  fill: { opacity: 0.6 },
  markers: { size: 6, colors: ['#00D4FF'], strokeColor: '#fff', strokeWidth: 3 },
  labels: ['Flood', 'Sea-Level', 'Heat', 'Drought/Fire', 'Storm'],
  yaxis: { show: false },
  title: { text: 'Higher = worse', style: { color: '#ff0066' } },
  colors: ['#00D4FF']
};

if (window.riskRadarChart) window.riskRadarChart.destroy();
window.riskRadarChart = new ApexCharts(document.getElementById("riskRadar"), radarOptions);
window.riskRadarChart.render();

// Neon Glassmorphic Risk Gauge Ring
const gaugeOptions = {
  series: [climateRisk.overallRisk.score],
  chart: { type: 'radialBar', height: 300, foreColor: '#00ffcc' },
  plotOptions: { radialBar: { hollow: { size: '70%' }, track: { background: '#0a1628' } } },
  fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#ff0066'], inverseColors: true, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
  stroke: { lineCap: 'round' },
  labels: ['Climate Risk Score'],
  colors: ['#00D4FF']
};

document.getElementById('overallRiskScore').innerHTML = '<div id="overallRiskGauge"></div>';
if (window.riskGaugeChart) window.riskGaugeChart.destroy();
window.riskGaugeChart = new ApexCharts(document.getElementById("overallRiskGauge"), gaugeOptions);
window.riskGaugeChart.render();

// Load projections
await loadProjections();

// Heat Calendar (simplified version - can expand with real data)
const heatData = {};
const cal = new CalHeatmap();
cal.paint({
  itemSelector: "#heatCalendar",
  domain: { type: 'year' },
  subDomain: { type: 'day', radius: 4 },
  data: { source: heatData, x: d => new Date(d), y: d => d },
  scale: { color: { range: ["#0a1628", "#ff0066"] } },
  theme: "dark"
});
```

#### 5. UPDATE renderWeatherMetrics() to call updateParticles (find and add at end, around line 1315):
```javascript
// Update particle background based on current weather
const realTime = WEATHERCOM_DATA[currentProperty.id]?.current;
if (realTime) {
  updateParticles(realTime.temp, realTime.precip);
}
```

## NEXT STEPS:
1. Add all JavaScript code blocks above to enhancement_5_weather_simulator.html
2. Test locally
3. Commit and push to GitHub
4. Deploy to Vercel

## FILE LOCATION:
C:\Users\broke\CLUES_Quantum_App\src\enhancement_5_weather_simulator.html
