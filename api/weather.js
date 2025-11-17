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
        const baseUrl = 'https://api.weather.com/v3/wx';

        switch (endpoint) {
            case 'current':
                url = `${baseUrl}/observations/current?geocode=${lat},${lng}&units=e&language=en-US&format=json&apiKey=${apiKey}`;
                break;
            case 'forecast':
                url = `${baseUrl}/forecast/daily/5day?geocode=${lat},${lng}&units=e&language=en-US&format=json&apiKey=${apiKey}`;
                break;
            case 'hourly':
                url = `${baseUrl}/forecast/hourly/12hour?geocode=${lat},${lng}&units=e&language=en-US&format=json&apiKey=${apiKey}`;
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
