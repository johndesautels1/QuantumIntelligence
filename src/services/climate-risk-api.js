export default {
  async getComprehensiveRisk(lat, lng) {
    // 1. Elevation – Open-Elevation (CORS-friendly, always works)
    let elevationFeet = 0;
    try {
      const elevRes = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
      const elevJson = await elevRes.json();
      if (elevJson.results?.[0]?.elevation) {
        elevationFeet = Math.round(elevJson.results[0].elevation * 3.28084); // meters → feet
      }
    } catch (e) {
      console.warn('Open-Elevation failed, using 0');
    }

    // 2. FEMA Flood Zone – current official endpoint
    let floodZone = { zone: 'X', staticBFE: null, message: 'Low risk (Zone X – minimal flood hazard)' };
    try {
      const floodUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=FLD_ZONE,STATIC_BFE,ZONE_SUBTY`;
      const floodRes = await fetch(floodUrl);
      const floodData = await floodRes.json();

      if (floodData.features?.length > 0) {
        const a = floodData.features[0].attributes;
        floodZone = {
          zone: a.FLD_ZONE || 'X',
          staticBFE: a.STATIC_BFE > 0 ? Number(a.STATIC_BFE).toFixed(1) : null,
          message: a.ZONE_SUBTY ? `${a.FLD_ZONE} – ${a.ZONE_SUBTY}` : a.FLD_ZONE
        };
      }
    } catch (e) {
      console.warn('FEMA flood zone unavailable (CORS or service down), using default Zone X');
    }

    // 3. Sea-level-rise risk
    const slrRisk = elevationFeet < 5 ? 'High' : elevationFeet < 15 ? 'Moderate' : 'Low';

    // 4. Overall score
    let score = 100;
    if (['A','AE','AH','AO','A99','AR','V','VE'].includes(floodZone.zone)) score -= 50;
    if (elevationFeet < 10) score -= 30;

    return {
      overallRisk: {
        score: Math.max(0, Math.min(100, score)),
        rating: score >= 70 ? 'Low Risk' : score >= 40 ? 'Moderate Risk' : 'High Risk',
        components: {
          floodZonePenalty: ['A','AE','AH','AO','A99','AR','V','VE'].includes(floodZone.zone) ? 50 : 0,
          elevationImpact: elevationFeet,
          seaLevelRiseImpact: slrRisk
        }
      },
      floodZone,
      elevation: {
        elevationFeet: elevationFeet, // number, not string
        riskLevel: elevationFeet > 20 ? 'Low elevation risk' : 'Monitor closely'
      },
      seaLevelRise: {
        riskSummary: `${slrRisk} risk of sea-level rise impact by 2050`
      }
    };
  }
};
