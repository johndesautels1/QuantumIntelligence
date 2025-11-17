export default {
  async getComprehensiveRisk(lat, lng) {
    // 1. Real elevation from USGS
    let elevationFeet = 0;
    try {
      const elevRes = await fetch(`https://epqs.nationalmap.gov/v1/epqs?x=${lng}&y=${lat}&units=Feet&output=json`);
      const elevJson = await elevRes.json();
      elevationFeet = parseFloat(elevJson.value) || 0;
    } catch (e) {
      console.warn('USGS elevation fetch failed');
    }

    // 2. Real FEMA flood zone (public ArcGIS server, no key)
    let floodZone = { zone: 'X', staticBFE: null, message: 'Low risk (Zone X)' };
    try {
      const floodUrl = `https://hazards-fema.nfhl.gov/ArcGIS/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=FLD_ZONE,STATIC_BFE,ZONE_SUBTY&f=json`;
      const floodRes = await fetch(floodUrl);
      const floodData = await floodRes.json();

      if (floodData.features?.length > 0) {
        const a = floodData.features[0].attributes;
        floodZone = {
          zone: a.FLD_ZONE || 'X',
          staticBFE: a.STATIC_BFE > 0 ? Number(a.STATIC_BFE) : null,
          message: a.ZONE_SUBTY ? `${a.FLD_ZONE} – ${a.ZONE_SUBTY}` : a.FLD_ZONE
        };
      }
    } catch (e) {
      console.warn('FEMA flood zone fetch failed');
    }

    // 3. Simple sea-level-rise risk based on elevation
    const slrRisk = elevationFeet < 5 ? 'High' : elevationFeet < 15 ? 'Moderate' : 'Low';

    // 4. Overall score
    let score = 100;
    if (['A','AE','AH','AO','A99','AR','V','VE'].includes(floodZone.zone)) score -= 50;
    if (elevationFeet < 10) score -= 30;
    if (elevationFeet < 0) score -= 10;

    return {
      overallRisk: {
        score: Math.max(0, Math.min(100, score)),
        rating: score >= 70 ? 'Low Risk' : score >= 40 ? 'Moderate Risk' : 'High Risk',
        components: {
          floodZonePenalty: ['A','AE','AH','AO','A99','AR','V','VE'].includes(floodZone.zone) ? 50 : 10,
          elevationImpact: elevationFeet,
          seaLevelRiseImpact: slrRisk
        }
      },
      floodZone,
      elevation: {
        elevationFeet: elevationFeet.toFixed(1),
        riskLevel: elevationFeet > 20 ? 'Low elevation risk' : 'Monitor closely'
      },
      seaLevelRise: {
        riskSummary: `${slrRisk} risk of sea-level rise impact by 2050`
      }
    };
  }
};
