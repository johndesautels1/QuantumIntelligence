// Vercel serverless function to proxy FEMA flood zone API
// This bypasses CORS and SSL issues by making the request server-side

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get coordinates from query params
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat or lng parameters' });
  }

  try {
    const femaUrl = `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?f=json&geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=FLD_ZONE,STATIC_BFE,ZONE_SUBTY,SFHA_TF`;

    console.log(`[FEMA Proxy] Fetching flood zone for ${lat}, ${lng}`);

    const response = await fetch(femaUrl);

    if (!response.ok) {
      throw new Error(`FEMA API returned ${response.status}`);
    }

    const data = await response.json();

    console.log(`[FEMA Proxy] Success - features found: ${data.features?.length || 0}`);

    return res.status(200).json(data);
  } catch (error) {
    console.error(`[FEMA Proxy] Error:`, error.message);
    return res.status(500).json({
      error: 'Failed to fetch FEMA data',
      message: error.message
    });
  }
}
