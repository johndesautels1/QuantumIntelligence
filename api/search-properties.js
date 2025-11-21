/**
 * 🔍 SEARCH PROPERTIES API ENDPOINT
 * Vercel Serverless Function - Searches for properties using web scraping + LLM parsing
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', message: 'Use POST' });
    }

    try {
        const { location, limit = 3 } = req.body;

        if (!location) {
            return res.status(400).json({
                error: 'Missing location',
                message: 'Please provide a location (e.g., "St Pete Beach, FL")'
            });
        }

        console.log(`🔍 Searching for ${limit} properties in: ${location}`);

        // Parse location
        const parts = location.split(',').map(s => s.trim());
        const city = parts[0]?.replace(/\s+/g, '-').toLowerCase() || '';
        const state = (parts[1]?.trim() || 'FL').toLowerCase();

        // Build Realtor.com search URL (more scraper-friendly than Zillow)
        const searchUrl = `https://www.realtor.com/realestateandhomes-search/${city}_${state.toUpperCase()}`;
        console.log(`🔗 Fetching: ${searchUrl}`);

        // Fetch the search page HTML
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br'
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch: ${response.status}`);
            return res.status(404).json({
                error: 'Location not found',
                message: `Could not find properties in ${location}. Try a different location.`
            });
        }

        const html = await response.text();
        console.log(`✅ Fetched ${html.length} bytes of HTML`);

        // Check if we got a CAPTCHA or block page
        if (html.includes('captcha') || html.includes('blocked') || html.includes('Access Denied')) {
            console.log('❌ Zillow blocked the request (CAPTCHA/block detected)');
            return res.status(503).json({
                error: 'Service temporarily unavailable',
                message: 'Zillow blocked our request. Try again in a few minutes.',
                debug: { htmlLength: html.length, blocked: true }
            });
        }

        // Extract property data from Realtor.com
        // Realtor.com uses __NEXT_DATA__ script tag
        const searchDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

        let propertyData = [];
        let parseMethod = 'none';

        if (searchDataMatch) {
            try {
                const nextData = JSON.parse(searchDataMatch[1]);
                // Realtor.com structure
                const results = nextData?.props?.pageProps?.properties ||
                               nextData?.props?.pageProps?.searchResults?.properties ||
                               nextData?.props?.pageProps?.listings ||
                               [];
                propertyData = results;
                parseMethod = 'NEXT_DATA';
                console.log(`✅ Found ${propertyData.length} properties in NEXT_DATA`);
            } catch (e) {
                console.log('Could not parse NEXT_DATA:', e.message);
            }
        }

        // If still no data, return debug info
        if (propertyData.length === 0) {
            console.log('❌ No property data found in HTML');
            return res.status(404).json({
                error: 'No properties found',
                message: `Could not find properties in ${location}. The page may have changed or blocked our request.`,
                debug: {
                    htmlLength: html.length,
                    hasListResults: !!jsonMatch,
                    hasNextData: !!searchDataMatch,
                    parseMethod: parseMethod,
                    htmlSample: html.substring(0, 500)
                }
            });
        }

        // If we found structured data, use it directly
        if (propertyData.length > 0) {
            const properties = propertyData.slice(0, limit).map((item, idx) => ({
                address: {
                    full_address: item.location?.address?.line || item.address?.line || `Property ${idx + 1}`,
                    street: item.location?.address?.street || item.address?.street || '',
                    city: item.location?.address?.city || item.address?.city || city,
                    state: item.location?.address?.state_code || item.address?.state_code || state,
                    zip: item.location?.address?.postal_code || item.address?.postal_code || ''
                },
                price: {
                    current: item.list_price || item.price || 0,
                    formatted: item.list_price ? `$${item.list_price.toLocaleString()}` : 'N/A'
                },
                property: {
                    bedrooms: item.description?.beds || item.beds || 0,
                    bathrooms: item.description?.baths || item.baths || 0,
                    sqft: item.description?.sqft || item.sqft || 0,
                    type: item.description?.type || item.prop_type || 'House'
                },
                url: item.permalink ? `https://www.realtor.com${item.permalink}` : '',
                image: item.primary_photo?.href || item.photos?.[0]?.href || '',
                source: 'realtor'
            }));

            return res.status(200).json({
                success: true,
                properties: properties,
                metadata: {
                    location: location,
                    city: city,
                    state: state,
                    found: properties.length,
                    source: 'realtor_json'
                }
            });
        }

        // Fallback: Use Grok API directly via fetch (no SDK import)
        console.log('📝 Using Grok to parse HTML...');

        const apiKey = process.env.GROK_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'API key missing',
                message: 'GROK_API_KEY not configured'
            });
        }

        // Take a reasonable chunk of HTML (first 30KB)
        const htmlChunk = html.substring(0, 30000);

        const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [{
                    role: 'user',
                    content: `Extract the first ${limit} property listings from this real estate search page HTML. Return ONLY valid JSON in this exact format:

{
  "properties": [
    {
      "address": "123 Main St, City, ST 12345",
      "price": 450000,
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 1800,
      "url": "https://..."
    }
  ]
}

HTML:
${htmlChunk}`
                }]
            })
        });

        if (!grokResponse.ok) {
            const errorText = await grokResponse.text();
            console.error('Grok API error:', errorText);
            return res.status(500).json({
                error: 'LLM parsing failed',
                message: 'Could not parse property data'
            });
        }

        const grokData = await grokResponse.json();
        const grokText = grokData.choices?.[0]?.message?.content || '';

        const parsed = JSON.parse(grokText.match(/\{[\s\S]*\}/)?.[0] || '{"properties":[]}');

        const properties = (parsed.properties || []).slice(0, limit).map((item, idx) => ({
            address: {
                full_address: item.address || `Property ${idx + 1}`,
                street: '',
                city: city,
                state: state,
                zip: ''
            },
            price: {
                current: item.price || 0,
                formatted: item.price ? `$${item.price.toLocaleString()}` : 'N/A'
            },
            property: {
                bedrooms: item.bedrooms || 0,
                bathrooms: item.bathrooms || 0,
                sqft: item.sqft || 0,
                type: 'House'
            },
            url: item.url || '',
            source: 'zillow_grok'
        }));

        if (properties.length === 0) {
            return res.status(404).json({
                error: 'No properties found',
                message: `Could not find properties in ${location}. Try searching for a larger area like "St Petersburg, FL".`
            });
        }

        return res.status(200).json({
            success: true,
            properties: properties,
            metadata: {
                location: location,
                city: city,
                state: state,
                found: properties.length,
                source: 'zillow_grok'
            }
        });

    } catch (error) {
        console.error('❌ Search error:', error);
        return res.status(500).json({
            error: 'Search failed',
            message: error.message
        });
    }
}
