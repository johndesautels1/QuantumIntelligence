/**
 * Vercel Serverless Function - Weather.com API Proxy
 * Bypasses CORS restrictions by calling Weather.com from server-side
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { lat, lng, endpoint } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng parameters' });
    }

    const apiKey = process.env.WEATHERCOM_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Weather.com API key not configured' });
    }

    try {
        let url;
        const baseUrl = 'https://api.weatherapi.com/v1';

        switch (endpoint) {
            case 'current':
                url = `${baseUrl}/current.json?key=${apiKey}&q=${lat},${lng}`;
                break;
            case 'forecast':
                url = `${baseUrl}/forecast.json?key=${apiKey}&q=${lat},${lng}&days=7`;
                break;
            case 'hourly':
                url = `${baseUrl}/forecast.json?key=${apiKey}&q=${lat},${lng}&days=1`;
                break;
            case 'history':
                // WeatherAPI.com history endpoint for climate normals
                // Note: Free tier limited to past 7 days, paid tier gets full historical
                const days = req.query.days || 365;
                url = `${baseUrl}/history.json?key=${apiKey}&q=${lat},${lng}&dt=${req.query.date || '2020-01-01'}&end_dt=${req.query.end_date || '2020-12-31'}`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid endpoint' });
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather.com API returned ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Weather API proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}
