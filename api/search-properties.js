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
        const state = (parts[1]?.trim() || 'FL').toUpperCase();

        // Build Zillow search URL
        const searchUrl = `https://www.zillow.com/${city}-${state}/`;
        console.log(`🔗 Fetching: ${searchUrl}`);

        // Fetch the search page HTML
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
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

        // Extract just the property data section (to reduce token usage)
        // Zillow embeds JSON data in a script tag
        const jsonMatch = html.match(/"listResults":\s*(\[[\s\S]*?\])\s*,\s*"mapResults"/);
        const searchDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

        let propertyData = [];

        if (jsonMatch) {
            try {
                propertyData = JSON.parse(jsonMatch[1]);
                console.log(`✅ Found ${propertyData.length} properties in JSON data`);
            } catch (e) {
                console.log('Could not parse listResults JSON');
            }
        }

        if (propertyData.length === 0 && searchDataMatch) {
            try {
                const nextData = JSON.parse(searchDataMatch[1]);
                const results = nextData?.props?.pageProps?.searchPageState?.cat1?.searchResults?.listResults || [];
                propertyData = results;
                console.log(`✅ Found ${propertyData.length} properties in NEXT_DATA`);
            } catch (e) {
                console.log('Could not parse NEXT_DATA');
            }
        }

        // If we found structured data, use it directly
        if (propertyData.length > 0) {
            const properties = propertyData.slice(0, limit).map((item, idx) => ({
                address: {
                    full_address: item.address || item.streetAddress || `Property ${idx + 1}`,
                    street: item.streetAddress || '',
                    city: item.addressCity || city,
                    state: item.addressState || state,
                    zip: item.addressZipcode || ''
                },
                price: {
                    current: item.price || item.unformattedPrice || 0,
                    formatted: item.price ? `$${item.price.toLocaleString()}` : 'N/A'
                },
                property: {
                    bedrooms: item.beds || 0,
                    bathrooms: item.baths || 0,
                    sqft: item.area || item.livingArea || 0,
                    type: item.homeType || 'House'
                },
                url: item.detailUrl || item.hdpUrl || '',
                image: item.imgSrc || item.carouselPhotos?.[0]?.url || '',
                source: 'zillow'
            }));

            return res.status(200).json({
                success: true,
                properties: properties,
                metadata: {
                    location: location,
                    city: city,
                    state: state,
                    found: properties.length,
                    source: 'zillow_json'
                }
            });
        }

        // Fallback: Use Claude API directly via fetch (no SDK import)
        console.log('📝 Using Claude to parse HTML...');

        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'API key missing',
                message: 'ANTHROPIC_API_KEY not configured'
            });
        }

        // Take a reasonable chunk of HTML (first 30KB)
        const htmlChunk = html.substring(0, 30000);

        const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 2000,
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

        if (!claudeResponse.ok) {
            const errorText = await claudeResponse.text();
            console.error('Claude API error:', errorText);
            return res.status(500).json({
                error: 'LLM parsing failed',
                message: 'Could not parse property data'
            });
        }

        const claudeData = await claudeResponse.json();
        const claudeText = claudeData.content?.[0]?.text || '';

        const parsed = JSON.parse(claudeText.match(/\{[\s\S]*\}/)?.[0] || '{"properties":[]}');

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
            source: 'zillow_claude'
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
                source: 'zillow_claude'
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
