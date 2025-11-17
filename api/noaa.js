/**
 * Vercel Serverless Function - NOAA API Proxy
 * Bypasses CORS restrictions by calling NOAA from server-side
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { endpoint, ...params } = req.query;

    const token = process.env.NOAA_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'NOAA API token not configured' });
    }

    try {
        const baseUrl = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';

        // Vercel auto-decodes req.query, so endpoint should already be decoded
        // If it starts with /, use it directly; otherwise decode it
        const finalEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

        // Build query string
        const queryString = new URLSearchParams(params).toString();
        const url = `${baseUrl}${finalEndpoint}${queryString ? '?' + queryString : ''}`;

        console.log('NOAA API call:', url);

        const response = await fetch(url, {
            headers: {
                'token': token
            }
        });

        if (!response.ok) {
            throw new Error(`NOAA API returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('NOAA API proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}
