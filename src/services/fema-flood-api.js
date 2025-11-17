export default {
  async getFloodZone(lat, lng) {
    try {
      const url = `https://hazards-fema.nfhl.gov/ArcGIS/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=FLD_ZONE,STATIC_BFE,ZONE_SUBTY&f=json`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features?.length > 0) {
        const a = data.features[0].attributes;
        return {
          zone: a.FLD_ZONE || 'X',
          staticBFE: a.STATIC_BFE > 0 ? Number(a.STATIC_BFE) : null,
          message: a.ZONE_SUBTY ? `${a.FLD_ZONE} – ${a.ZONE_SUBTY}` : a.FLD_ZONE
        };
      }

      return { zone: 'X', staticBFE: null, message: 'Low risk (Zone X)' };
    } catch (error) {
      console.warn('FEMA flood zone fetch failed:', error);
      return { zone: 'X', staticBFE: null, message: 'Low risk (Zone X)' };
    }
  }
};
