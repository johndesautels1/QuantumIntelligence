/**
 * CLUES™ Data Importer Module
 * Handles all property data import methods:
 * - Manual entry
 * - CSV/Excel import
 * - JSON import
 * - Web scraping (Zillow, Realtor.com, Redfin, etc.)
 * - MLS API integration
 * - Social media import (Facebook Marketplace, Craigslist)
 */

class DataImporter {
    constructor() {
        this.dataManager = null;
        this.scoringEngine = null;
        this.validationRules = this.initializeValidationRules();
    }

    /**
     * Initialize with dependencies
     */
    async initialize(dataManager, scoringEngine) {
        this.dataManager = dataManager;
        this.scoringEngine = scoringEngine;
        console.log('DataImporter initialized');
    }

    /**
     * Import from CSV file
     */
    async importFromCSV(file, columnMapping = null) {
        try {
            const text = await this.readFile(file);
            const data = this.parseCSV(text);

            if (!data || data.length === 0) {
                throw new Error('No data found in CSV file');
            }

            // Auto-detect columns if no mapping provided
            const mapping = columnMapping || this.autoDetectColumns(data[0]);

            console.log('🔍 CSV HEADERS:', data[0]);
            console.log('🔍 DETECTED MAPPING:', mapping);
            console.log('🔍 Latitude column index:', mapping.latitude);
            console.log('🔍 Longitude column index:', mapping.longitude);

            const properties = [];
            const errors = [];

            // Skip header row
            for (let i = 1; i < data.length; i++) {
                try {
                    const property = this.mapCSVRow(data[i], mapping, data[0]);
                    const validation = this.validateProperty(property);

                    if (validation.isValid) {
                        properties.push(property);
                    } else {
                        errors.push({
                            row: i + 1,
                            data: data[i],
                            errors: validation.errors
                        });
                    }
                } catch (error) {
                    errors.push({
                        row: i + 1,
                        data: data[i],
                        error: error.message
                    });
                }
            }

            // Import valid properties
            const imported = await this.importProperties(properties);

            return {
                success: true,
                imported: imported.length,
                total: data.length - 1,
                errors: errors,
                properties: imported
            };

        } catch (error) {
            console.error('CSV import error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse CSV text into array of arrays
     */
    parseCSV(text) {
        const lines = text.split('\n');
        const result = [];

        for (let line of lines) {
            if (line.trim()) {
                // Handle quoted fields with commas
                const fields = [];
                let current = '';
                let inQuotes = false;

                for (let i = 0; i < line.length; i++) {
                    const char = line[i];

                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        fields.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                fields.push(current.trim());
                result.push(fields);
            }
        }

        return result;
    }

    /**
     * Auto-detect CSV column mapping
     */
    autoDetectColumns(headers) {
        const mapping = {};

        const patterns = {
            address: ['address', 'street', 'location', 'property address'],
            city: ['city', 'town'],
            state: ['state', 'province'],
            zipCode: ['zip', 'postal', 'zipcode', 'zip code'],
            price: ['price', 'listing price', 'asking price', 'sale price'],
            bedrooms: ['bed', 'bedroom', 'beds', 'br'],
            bathrooms: ['bath', 'bathroom', 'baths', 'ba'],
            squareFeet: ['sqft', 'square feet', 'sq ft', 'area', 'size'],
            lotSize: ['lot', 'lot size', 'land'],
            yearBuilt: ['year', 'year built', 'built'],
            propertyType: ['type', 'property type', 'category'],
            description: ['description', 'details', 'notes'],
            listingUrl: ['url', 'link', 'listing url', 'source'],
            mls: ['mls', 'mls#', 'mls number'],
            daysOnMarket: ['dom', 'days on market', 'days listed'],
            hoa: ['hoa', 'hoa fee', 'hoa dues'],
            taxes: ['tax', 'taxes', 'property tax', 'annual tax'],
            latitude: ['lat', 'latitude'],
            longitude: ['lng', 'lon', 'long', 'longitude']
        };

        headers.forEach((header, index) => {
            const normalized = header.toLowerCase().trim();

            for (let [field, keywords] of Object.entries(patterns)) {
                for (let keyword of keywords) {
                    if (normalized.includes(keyword)) {
                        mapping[field] = index;
                        break;
                    }
                }
            }
        });

        return mapping;
    }

    /**
     * Map CSV row to property object
     */
    mapCSVRow(row, mapping, headers) {
        const property = {
            id: this.generatePropertyId(),
            source: 'csv_import',
            importDate: new Date().toISOString(),
            basic: {},
            financial: {},
            location: {},
            features: {},
            condition: {}
        };

        // Map basic fields
        if (mapping.address !== undefined) {
            property.basic.address = row[mapping.address];
        }
        if (mapping.city !== undefined) {
            property.location.city = row[mapping.city];
        }
        if (mapping.state !== undefined) {
            property.location.state = row[mapping.state];
        }
        if (mapping.zipCode !== undefined) {
            property.location.zipCode = row[mapping.zipCode];
        }
        if (mapping.price !== undefined) {
            property.financial.listingPrice = this.parseNumber(row[mapping.price]);
        }
        if (mapping.bedrooms !== undefined) {
            property.basic.bedrooms = parseInt(row[mapping.bedrooms]) || 0;
        }
        if (mapping.bathrooms !== undefined) {
            property.basic.bathrooms = parseFloat(row[mapping.bathrooms]) || 0;
        }
        if (mapping.squareFeet !== undefined) {
            property.basic.squareFeet = this.parseNumber(row[mapping.squareFeet]);
        }
        if (mapping.lotSize !== undefined) {
            property.basic.lotSize = this.parseNumber(row[mapping.lotSize]);
        }
        if (mapping.yearBuilt !== undefined) {
            property.basic.yearBuilt = parseInt(row[mapping.yearBuilt]) || null;
        }
        if (mapping.propertyType !== undefined) {
            property.basic.propertyType = row[mapping.propertyType];
        }
        if (mapping.description !== undefined) {
            property.basic.description = row[mapping.description];
        }
        if (mapping.listingUrl !== undefined) {
            property.basic.listingUrl = row[mapping.listingUrl];
        }
        if (mapping.mls !== undefined) {
            property.basic.mlsNumber = row[mapping.mls];
        }
        if (mapping.daysOnMarket !== undefined) {
            property.financial.daysOnMarket = parseInt(row[mapping.daysOnMarket]) || 0;
        }
        if (mapping.hoa !== undefined) {
            property.financial.hoaFees = this.parseNumber(row[mapping.hoa]);
        }
        if (mapping.taxes !== undefined) {
            property.financial.annualTaxes = this.parseNumber(row[mapping.taxes]);
        }
        // Coordinates - save in BOTH location and basic for compatibility
        if (mapping.latitude !== undefined) {
            const rawLat = row[mapping.latitude];
            const lat = parseFloat(rawLat);
            console.log(`🔍 CSV Import - Row lat value: "${rawLat}" (column ${mapping.latitude}) -> parsed: ${lat}`);
            if (!isNaN(lat) && lat !== 0) {
                property.location.latitude = lat;
                // Also save to basic for database compatibility
                if (!property.basic.coordinates) {
                    property.basic.coordinates = {};
                }
                property.basic.coordinates.latitude = lat;
                console.log(`✅ Saved latitude: ${lat} to both locations`);
            } else {
                console.log(`⚠️ Skipped latitude (NaN or zero): ${lat}`);
            }
        } else {
            console.log(`⚠️ No latitude mapping found in CSV headers`);
        }
        if (mapping.longitude !== undefined) {
            const rawLng = row[mapping.longitude];
            const lng = parseFloat(rawLng);
            console.log(`🔍 CSV Import - Row lng value: "${rawLng}" (column ${mapping.longitude}) -> parsed: ${lng}`);
            if (!isNaN(lng) && lng !== 0) {
                property.location.longitude = lng;
                // Also save to basic for database compatibility
                if (!property.basic.coordinates) {
                    property.basic.coordinates = {};
                }
                property.basic.coordinates.longitude = lng;
                console.log(`✅ Saved longitude: ${lng} to both locations`);
            } else {
                console.log(`⚠️ Skipped longitude (NaN or zero): ${lng}`);
            }
        } else {
            console.log(`⚠️ No longitude mapping found in CSV headers`);
        }

        return property;
    }

    /**
     * Import from JSON file
     */
    async importFromJSON(file) {
        try {
            const text = await this.readFile(file);
            const data = JSON.parse(text);

            const properties = Array.isArray(data) ? data : [data];
            const results = [];
            const errors = [];

            for (let i = 0; i < properties.length; i++) {
                try {
                    const property = this.normalizeJSONProperty(properties[i]);
                    const validation = this.validateProperty(property);

                    if (validation.isValid) {
                        results.push(property);
                    } else {
                        errors.push({
                            index: i,
                            errors: validation.errors
                        });
                    }
                } catch (error) {
                    errors.push({
                        index: i,
                        error: error.message
                    });
                }
            }

            const imported = await this.importProperties(results);

            return {
                success: true,
                imported: imported.length,
                total: properties.length,
                errors: errors,
                properties: imported
            };

        } catch (error) {
            console.error('JSON import error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Normalize JSON property to internal format
     */
    normalizeJSONProperty(data) {
        // If already in our format, return as-is
        if (data.basic && data.financial && data.location) {
            return {
                ...data,
                id: data.id || this.generatePropertyId(),
                source: data.source || 'json_import',
                importDate: data.importDate || new Date().toISOString()
            };
        }

        // Otherwise, map from common formats
        return {
            id: data.id || data.propertyId || this.generatePropertyId(),
            source: 'json_import',
            importDate: new Date().toISOString(),
            basic: {
                address: data.address || data.streetAddress || '',
                bedrooms: data.bedrooms || data.beds || 0,
                bathrooms: data.bathrooms || data.baths || 0,
                squareFeet: data.squareFeet || data.sqft || data.livingArea || 0,
                lotSize: data.lotSize || data.lotSqft || 0,
                yearBuilt: data.yearBuilt || data.year || null,
                propertyType: data.propertyType || data.type || '',
                description: data.description || '',
                listingUrl: data.url || data.listingUrl || '',
                mlsNumber: data.mls || data.mlsNumber || ''
            },
            financial: {
                listingPrice: data.price || data.listingPrice || data.askingPrice || 0,
                daysOnMarket: data.daysOnMarket || data.dom || 0,
                hoaFees: data.hoa || data.hoaFees || 0,
                annualTaxes: data.taxes || data.propertyTax || 0
            },
            location: {
                city: data.city || '',
                state: data.state || '',
                zipCode: data.zip || data.zipCode || '',
                latitude: data.lat || data.latitude || null,
                longitude: data.lon || data.longitude || null
            },
            features: data.features || {},
            condition: data.condition || {}
        };
    }

    /**
     * Scrape property data from URL
     */
    async scrapeFromURL(url) {
        try {
            // Detect the website
            const site = this.detectRealEstateSite(url);

            if (!site) {
                throw new Error('Unsupported website. Supported: Zillow, Realtor.com, Redfin, Trulia');
            }

            // Use appropriate scraper
            let property;
            switch (site) {
                case 'zillow':
                    property = await this.scrapeZillow(url);
                    break;
                case 'realtor':
                    property = await this.scrapeRealtor(url);
                    break;
                case 'redfin':
                    property = await this.scrapeRedfin(url);
                    break;
                case 'trulia':
                    property = await this.scrapeTrulia(url);
                    break;
                default:
                    property = await this.scrapeGeneric(url);
            }

            // Validate and import
            const validation = this.validateProperty(property);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            const imported = await this.importProperties([property]);

            return {
                success: true,
                property: imported[0]
            };

        } catch (error) {
            console.error('Scraping error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Detect real estate website from URL
     */
    detectRealEstateSite(url) {
        const urlLower = url.toLowerCase();

        if (urlLower.includes('zillow.com')) return 'zillow';
        if (urlLower.includes('realtor.com')) return 'realtor';
        if (urlLower.includes('redfin.com')) return 'redfin';
        if (urlLower.includes('trulia.com')) return 'trulia';
        if (urlLower.includes('homes.com')) return 'homes';
        if (urlLower.includes('apartments.com')) return 'apartments';

        return null;
    }

    /**
     * Scrape Zillow property
     */
    async scrapeZillow(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();

            // Parse HTML (using DOMParser)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'zillow_scrape',
                importDate: new Date().toISOString(),
                basic: {
                    listingUrl: url
                },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Extract price
            const priceEl = doc.querySelector('[data-testid="price"]') ||
                          doc.querySelector('.ds-summary-row .ds-value');
            if (priceEl) {
                property.financial.listingPrice = this.parseNumber(priceEl.textContent);
            }

            // Extract address
            const addressEl = doc.querySelector('h1[class*="address"]') ||
                            doc.querySelector('[data-testid="property-address"]');
            if (addressEl) {
                const parts = addressEl.textContent.split(',');
                property.basic.address = parts[0]?.trim();
                if (parts.length > 1) property.location.city = parts[1]?.trim();
                if (parts.length > 2) {
                    const stateParts = parts[2].trim().split(' ');
                    property.location.state = stateParts[0];
                    property.location.zipCode = stateParts[1];
                }
            }

            // Extract bedrooms, bathrooms, sqft
            const facts = doc.querySelectorAll('[class*="fact"]');
            facts.forEach(fact => {
                const text = fact.textContent.toLowerCase();
                if (text.includes('bed')) {
                    property.basic.bedrooms = parseInt(fact.textContent) || 0;
                }
                if (text.includes('bath')) {
                    property.basic.bathrooms = parseFloat(fact.textContent) || 0;
                }
                if (text.includes('sqft')) {
                    property.basic.squareFeet = this.parseNumber(fact.textContent);
                }
            });

            // Extract description
            const descEl = doc.querySelector('[class*="description"]');
            if (descEl) {
                property.basic.description = descEl.textContent.trim();
            }

            // Extract year built
            const yearEl = doc.querySelector('[data-label="Year Built"]');
            if (yearEl) {
                property.basic.yearBuilt = parseInt(yearEl.textContent) || null;
            }

            return property;

        } catch (error) {
            console.error('Zillow scraping error:', error);
            throw error;
        }
    }

    /**
     * Scrape Realtor.com property
     */
    async scrapeRealtor(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'realtor_scrape',
                importDate: new Date().toISOString(),
                basic: { listingUrl: url },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Extract structured data (Realtor.com uses JSON-LD)
            const scriptTags = doc.querySelectorAll('script[type="application/ld+json"]');
            for (let script of scriptTags) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data['@type'] === 'SingleFamilyResidence' || data['@type'] === 'Apartment') {
                        // Extract from structured data
                        if (data.name) property.basic.address = data.name;
                        if (data.address) {
                            property.location.city = data.address.addressLocality;
                            property.location.state = data.address.addressRegion;
                            property.location.zipCode = data.address.postalCode;
                        }
                        if (data.numberOfBedrooms) property.basic.bedrooms = data.numberOfBedrooms;
                        if (data.numberOfBathroomsTotal) property.basic.bathrooms = data.numberOfBathroomsTotal;
                        if (data.floorSize) property.basic.squareFeet = this.parseNumber(data.floorSize.value);
                    }
                } catch (e) {
                    // Continue to next script tag
                }
            }

            // Fallback to DOM parsing
            const priceEl = doc.querySelector('[data-testid="list-price"]');
            if (priceEl) {
                property.financial.listingPrice = this.parseNumber(priceEl.textContent);
            }

            return property;

        } catch (error) {
            console.error('Realtor.com scraping error:', error);
            throw error;
        }
    }

    /**
     * Scrape Redfin property
     */
    async scrapeRedfin(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'redfin_scrape',
                importDate: new Date().toISOString(),
                basic: { listingUrl: url },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Redfin often includes data in window object
            const scripts = doc.querySelectorAll('script');
            for (let script of scripts) {
                if (script.textContent.includes('window.__INITIAL_STATE__')) {
                    try {
                        const match = script.textContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/);
                        if (match) {
                            const data = JSON.parse(match[1]);
                            // Extract property data from initial state
                            if (data.propertyDetails) {
                                const details = data.propertyDetails;
                                property.basic.address = details.streetAddress;
                                property.location.city = details.city;
                                property.location.state = details.state;
                                property.location.zipCode = details.zip;
                                property.financial.listingPrice = details.price;
                                property.basic.bedrooms = details.beds;
                                property.basic.bathrooms = details.baths;
                                property.basic.squareFeet = details.sqFt;
                            }
                        }
                    } catch (e) {
                        // Continue
                    }
                }
            }

            return property;

        } catch (error) {
            console.error('Redfin scraping error:', error);
            throw error;
        }
    }

    /**
     * Scrape Trulia property
     */
    async scrapeTrulia(url) {
        return await this.scrapeGeneric(url, {
            priceSelectors: ['[data-testid="home-summary-price"]', '.h3'],
            addressSelectors: ['[data-testid="home-summary-address"]', 'h1'],
            bedsSelectors: ['[data-testid="bed-icon"]', '.mediaBlock'],
            bathsSelectors: ['[data-testid="bath-icon"]', '.mediaBlock'],
            sqftSelectors: ['[data-testid="sqft-icon"]', '.mediaBlock']
        });
    }

    /**
     * Generic web scraper for other real estate sites
     */
    async scrapeGeneric(url, selectors = {}) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'web_scrape',
                importDate: new Date().toISOString(),
                basic: { listingUrl: url },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Try common selectors
            const commonSelectors = {
                price: ['[class*="price"]', '[data-price]', '.price', '#price'],
                address: ['[class*="address"]', '[data-address]', '.address', 'h1'],
                beds: ['[class*="bed"]', '[data-beds]', '.beds'],
                baths: ['[class*="bath"]', '[data-baths]', '.baths'],
                sqft: ['[class*="sqft"]', '[class*="square"]', '[data-sqft]']
            };

            // Merge with custom selectors
            const finalSelectors = { ...commonSelectors, ...selectors };

            // Extract data
            for (let selector of finalSelectors.price) {
                const el = doc.querySelector(selector);
                if (el) {
                    property.financial.listingPrice = this.parseNumber(el.textContent);
                    break;
                }
            }

            for (let selector of finalSelectors.address) {
                const el = doc.querySelector(selector);
                if (el) {
                    property.basic.address = el.textContent.trim();
                    break;
                }
            }

            return property;

        } catch (error) {
            console.error('Generic scraping error:', error);
            throw error;
        }
    }

    /**
     * Scrape Facebook Marketplace listing
     */
    async scrapeFacebookMarketplace(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'facebook_marketplace',
                importDate: new Date().toISOString(),
                basic: { listingUrl: url },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Facebook uses JSON-LD structured data
            const scriptTags = doc.querySelectorAll('script[type="application/ld+json"]');
            for (let script of scriptTags) {
                try {
                    const data = JSON.parse(script.textContent);
                    if (data['@type'] === 'Product') {
                        property.basic.address = data.name;
                        property.basic.description = data.description;
                        if (data.offers && data.offers.price) {
                            property.financial.listingPrice = parseFloat(data.offers.price);
                        }
                    }
                } catch (e) {
                    // Continue
                }
            }

            return property;

        } catch (error) {
            console.error('Facebook Marketplace scraping error:', error);
            throw error;
        }
    }

    /**
     * Scrape Craigslist listing
     */
    async scrapeCraigslist(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const property = {
                id: this.generatePropertyId(),
                source: 'craigslist',
                importDate: new Date().toISOString(),
                basic: { listingUrl: url },
                financial: {},
                location: {},
                features: {},
                condition: {}
            };

            // Extract title
            const titleEl = doc.querySelector('#titletextonly');
            if (titleEl) {
                property.basic.address = titleEl.textContent.trim();
            }

            // Extract price
            const priceEl = doc.querySelector('.price');
            if (priceEl) {
                property.financial.listingPrice = this.parseNumber(priceEl.textContent);
            }

            // Extract description
            const descEl = doc.querySelector('#postingbody');
            if (descEl) {
                property.basic.description = descEl.textContent.trim();
            }

            // Extract location
            const mapEl = doc.querySelector('#map');
            if (mapEl) {
                property.location.latitude = parseFloat(mapEl.getAttribute('data-latitude'));
                property.location.longitude = parseFloat(mapEl.getAttribute('data-longitude'));
            }

            // Parse description for details
            const desc = property.basic.description.toLowerCase();
            const bedsMatch = desc.match(/(\d+)\s*b[er]d/);
            if (bedsMatch) property.basic.bedrooms = parseInt(bedsMatch[1]);

            const bathsMatch = desc.match(/(\d+(?:\.\d+)?)\s*ba/);
            if (bathsMatch) property.basic.bathrooms = parseFloat(bathsMatch[1]);

            const sqftMatch = desc.match(/(\d+)\s*sq/);
            if (sqftMatch) property.basic.squareFeet = parseInt(sqftMatch[1]);

            return property;

        } catch (error) {
            console.error('Craigslist scraping error:', error);
            throw error;
        }
    }

    /**
     * Import from MLS API (RETS/RESO)
     */
    async importFromMLS(config) {
        try {
            const { apiType, endpoint, username, password, query } = config;

            if (apiType === 'RETS') {
                return await this.importFromRETS(endpoint, username, password, query);
            } else if (apiType === 'RESO') {
                return await this.importFromRESO(endpoint, query);
            } else {
                throw new Error('Unsupported MLS API type. Use RETS or RESO.');
            }

        } catch (error) {
            console.error('MLS import error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Import from RETS MLS API
     */
    async importFromRETS(endpoint, username, password, query) {
        try {
            // RETS authentication
            const auth = btoa(`${username}:${password}`);

            // Login to RETS
            const loginResponse = await fetch(`${endpoint}/login`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'RETS-Version': 'RETS/1.7'
                }
            });

            if (!loginResponse.ok) {
                throw new Error('RETS authentication failed');
            }

            // Search for properties
            const searchResponse = await fetch(`${endpoint}/search`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    SearchType: 'Property',
                    Class: 'RE_1',
                    Query: query || '(Status=Active)',
                    Format: 'COMPACT-DECODED',
                    Limit: '100'
                })
            });

            const xmlText = await searchResponse.text();

            // Parse RETS XML response
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            const properties = [];
            const dataElements = xmlDoc.querySelectorAll('DATA');

            dataElements.forEach(dataEl => {
                const property = this.parseRETSData(dataEl);
                if (property) {
                    properties.push(property);
                }
            });

            // Import properties
            const imported = await this.importProperties(properties);

            // Logout
            await fetch(`${endpoint}/logout`, {
                headers: { 'Authorization': `Basic ${auth}` }
            });

            return {
                success: true,
                imported: imported.length,
                total: properties.length,
                properties: imported
            };

        } catch (error) {
            console.error('RETS import error:', error);
            throw error;
        }
    }

    /**
     * Import from RESO Web API (modern MLS standard)
     */
    async importFromRESO(endpoint, query) {
        try {
            // RESO uses OData protocol
            const url = `${endpoint}/Property?$filter=${encodeURIComponent(query || 'StandardStatus eq \'Active\'')}&$top=100`;

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'OData-Version': '4.0'
                }
            });

            if (!response.ok) {
                throw new Error('RESO API request failed');
            }

            const data = await response.json();
            const properties = [];

            if (data.value && Array.isArray(data.value)) {
                data.value.forEach(listing => {
                    const property = this.parseRESOData(listing);
                    if (property) {
                        properties.push(property);
                    }
                });
            }

            const imported = await this.importProperties(properties);

            return {
                success: true,
                imported: imported.length,
                total: properties.length,
                properties: imported
            };

        } catch (error) {
            console.error('RESO import error:', error);
            throw error;
        }
    }

    /**
     * Parse RETS XML data element
     */
    parseRETSData(dataEl) {
        try {
            const getText = (field) => {
                const el = dataEl.querySelector(field);
                return el ? el.textContent : null;
            };

            return {
                id: this.generatePropertyId(),
                source: 'mls_rets',
                importDate: new Date().toISOString(),
                basic: {
                    address: getText('StreetName'),
                    bedrooms: parseInt(getText('BedroomsTotal')) || 0,
                    bathrooms: parseFloat(getText('BathroomsTotalInteger')) || 0,
                    squareFeet: parseInt(getText('LivingArea')) || 0,
                    lotSize: parseInt(getText('LotSizeSquareFeet')) || 0,
                    yearBuilt: parseInt(getText('YearBuilt')) || null,
                    propertyType: getText('PropertyType'),
                    description: getText('PublicRemarks'),
                    mlsNumber: getText('ListingId')
                },
                financial: {
                    listingPrice: parseFloat(getText('ListPrice')) || 0,
                    daysOnMarket: parseInt(getText('DaysOnMarket')) || 0,
                    annualTaxes: parseFloat(getText('TaxAnnualAmount')) || 0
                },
                location: {
                    city: getText('City'),
                    state: getText('StateOrProvince'),
                    zipCode: getText('PostalCode'),
                    latitude: parseFloat(getText('Latitude')) || null,
                    longitude: parseFloat(getText('Longitude')) || null
                },
                features: {},
                condition: {}
            };
        } catch (error) {
            console.error('RETS parsing error:', error);
            return null;
        }
    }

    /**
     * Parse RESO JSON data
     */
    parseRESOData(listing) {
        try {
            return {
                id: this.generatePropertyId(),
                source: 'mls_reso',
                importDate: new Date().toISOString(),
                basic: {
                    address: listing.UnparsedAddress || listing.StreetName,
                    bedrooms: listing.BedroomsTotal || 0,
                    bathrooms: listing.BathroomsTotalInteger || 0,
                    squareFeet: listing.LivingArea || 0,
                    lotSize: listing.LotSizeSquareFeet || 0,
                    yearBuilt: listing.YearBuilt || null,
                    propertyType: listing.PropertyType,
                    description: listing.PublicRemarks,
                    mlsNumber: listing.ListingKey || listing.ListingId
                },
                financial: {
                    listingPrice: listing.ListPrice || 0,
                    daysOnMarket: listing.DaysOnMarket || 0,
                    annualTaxes: listing.TaxAnnualAmount || 0
                },
                location: {
                    city: listing.City,
                    state: listing.StateOrProvince,
                    zipCode: listing.PostalCode,
                    latitude: listing.Latitude || null,
                    longitude: listing.Longitude || null
                },
                features: {},
                condition: {}
            };
        } catch (error) {
            console.error('RESO parsing error:', error);
            return null;
        }
    }

    /**
     * Helper: Read file as text
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Helper: Parse number from string
     */
    parseNumber(str) {
        if (typeof str === 'number') return str;
        if (!str) return 0;

        // Remove currency symbols, commas, spaces
        const cleaned = str.toString()
            .replace(/[$,\s]/g, '')
            .replace(/[^\d.]/g, '');

        return parseFloat(cleaned) || 0;
    }

    /**
     * Helper: Generate unique property ID
     */
    generatePropertyId() {
        return 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Validate property data
     */
    validateProperty(property) {
        const errors = [];

        // Required fields
        if (!property.basic || !property.basic.address) {
            errors.push('Address is required');
        }

        if (!property.financial || !property.financial.listingPrice || property.financial.listingPrice <= 0) {
            errors.push('Valid listing price is required');
        }

        // Data quality checks
        if (property.basic.bedrooms && property.basic.bedrooms < 0) {
            errors.push('Bedrooms cannot be negative');
        }

        if (property.basic.bathrooms && property.basic.bathrooms < 0) {
            errors.push('Bathrooms cannot be negative');
        }

        if (property.basic.squareFeet && property.basic.squareFeet < 100) {
            errors.push('Square feet seems too small (minimum 100)');
        }

        if (property.basic.yearBuilt) {
            const currentYear = new Date().getFullYear();
            if (property.basic.yearBuilt < 1800 || property.basic.yearBuilt > currentYear + 2) {
                errors.push('Year built is out of valid range');
            }
        }

        // Calculate quality score
        let qualityScore = 100;

        if (!property.basic.city) qualityScore -= 5;
        if (!property.basic.state) qualityScore -= 5;
        if (!property.basic.zipCode) qualityScore -= 5;
        if (!property.basic.bedrooms) qualityScore -= 10;
        if (!property.basic.bathrooms) qualityScore -= 10;
        if (!property.basic.squareFeet) qualityScore -= 15;
        if (!property.basic.yearBuilt) qualityScore -= 10;
        if (!property.basic.propertyType) qualityScore -= 10;
        if (!property.basic.description) qualityScore -= 20;

        property.qualityScore = qualityScore;

        return {
            isValid: errors.length === 0,
            errors: errors,
            qualityScore: qualityScore
        };
    }

    /**
     * Initialize validation rules
     */
    initializeValidationRules() {
        return {
            required: ['basic.address', 'financial.listingPrice'],
            numeric: ['financial.listingPrice', 'basic.bedrooms', 'basic.bathrooms', 'basic.squareFeet'],
            ranges: {
                'basic.bedrooms': { min: 0, max: 50 },
                'basic.bathrooms': { min: 0, max: 50 },
                'basic.squareFeet': { min: 100, max: 1000000 },
                'basic.yearBuilt': { min: 1800, max: new Date().getFullYear() + 2 },
                'financial.listingPrice': { min: 1, max: 1000000000 }
            }
        };
    }

    /**
     * Import properties to database
     */
    async importProperties(properties) {
        const imported = [];

        for (let property of properties) {
            try {
                // Add to database
                const id = await this.dataManager.addProperty(property);

                // Calculate score
                if (this.scoringEngine) {
                    const score = await this.scoringEngine.calculatePropertyScore(id);
                    await this.dataManager.updateProperty(id, { score: score });
                }

                imported.push({ ...property, id: id });

            } catch (error) {
                console.error('Failed to import property:', error);
            }
        }

        return imported;
    }

    /**
     * Batch import from multiple URLs
     */
    async batchScrapeURLs(urls, onProgress = null) {
        const results = {
            success: [],
            failed: [],
            total: urls.length
        };

        for (let i = 0; i < urls.length; i++) {
            try {
                const result = await this.scrapeFromURL(urls[i]);

                if (result.success) {
                    results.success.push({
                        url: urls[i],
                        property: result.property
                    });
                } else {
                    results.failed.push({
                        url: urls[i],
                        error: result.error
                    });
                }

                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: urls.length,
                        success: results.success.length,
                        failed: results.failed.length
                    });
                }

                // Rate limiting: wait 1 second between requests
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                results.failed.push({
                    url: urls[i],
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Export properties to CSV
     */
    async exportToCSV(properties) {
        const headers = [
            'Address', 'City', 'State', 'ZIP', 'Price', 'Bedrooms', 'Bathrooms',
            'Sq Ft', 'Lot Size', 'Year Built', 'Property Type', 'MLS#',
            'Days on Market', 'HOA Fees', 'Annual Taxes', 'Score', 'Description'
        ];

        const rows = [headers.join(',')];

        for (let prop of properties) {
            const row = [
                this.escapeCSV(prop.basic.address),
                this.escapeCSV(prop.location.city),
                this.escapeCSV(prop.location.state),
                this.escapeCSV(prop.location.zipCode),
                prop.financial.listingPrice || 0,
                prop.basic.bedrooms || 0,
                prop.basic.bathrooms || 0,
                prop.basic.squareFeet || 0,
                prop.basic.lotSize || 0,
                prop.basic.yearBuilt || '',
                this.escapeCSV(prop.basic.propertyType),
                this.escapeCSV(prop.basic.mlsNumber),
                prop.financial.daysOnMarket || 0,
                prop.financial.hoaFees || 0,
                prop.financial.annualTaxes || 0,
                prop.score || 0,
                this.escapeCSV(prop.basic.description)
            ];

            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    /**
     * Helper: Escape CSV value
     */
    escapeCSV(value) {
        if (!value) return '';

        const str = value.toString();

        // If contains comma, quote, or newline, wrap in quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }

        return str;
    }
}

// Export singleton instance
const dataImporter = new DataImporter();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataImporter;
}
