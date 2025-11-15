/**
 * CLUES™ Quantum Property Intelligence System
 * Import/Export Handler
 * Supports CSV, JSON, and MLS data formats
 *
 * @version 1.0.0
 */

class ImportExportHandler {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Import properties from CSV file
     * @param {File} file - CSV file object
     * @returns {Promise<Object>} Import results
     */
    async importCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    const properties = this.parseCSV(csvText);

                    const results = await this.importProperties(properties);
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV text to property objects
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV file is empty or invalid');

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const properties = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const property = this.csvRowToProperty(headers, values);
            if (property) properties.push(property);
        }

        return properties;
    }

    /**
     * Parse CSV line handling quoted commas
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values;
    }

    /**
     * Convert CSV row to property object
     */
    csvRowToProperty(headers, values) {
        const property = {
            property_id: this.dataManager.generateUUID(),
            created_at: Date.now(),
            updated_at: Date.now(),
            source: 'csv_import',
            address: {},
            price: { history: [] },
            bathrooms: {},
            square_feet: {},
            features: { interior: [], exterior: [], appliances: [] },
            status: { current: 'active', history: [] },
            days_on_market: {},
            media: { photos: [], videos: [], virtual_tours: [], documents: [] },
            analytics: { variable_values: {} },
            tags: [],
            categories: []
        };

        headers.forEach((header, index) => {
            const value = values[index]?.replace(/"/g, '') || '';

            // Map CSV columns to property schema
            switch (header.toLowerCase()) {
                case 'mls_number':
                case 'mls_id':
                case 'mls#':
                    property.mls_number = value;
                    break;

                case 'street':
                case 'address':
                    property.address.street = value;
                    break;

                case 'city':
                    property.address.city = value;
                    break;

                case 'state':
                    property.address.state = value;
                    break;

                case 'zip':
                case 'zipcode':
                case 'postal_code':
                    property.address.zip = value;
                    break;

                case 'latitude':
                case 'lat':
                    property.address.latitude = parseFloat(value);
                    break;

                case 'longitude':
                case 'lon':
                case 'lng':
                    property.address.longitude = parseFloat(value);
                    break;

                case 'price':
                case 'list_price':
                case 'asking_price':
                    const price = parseInt(value.replace(/[$,]/g, ''));
                    property.price.current = price;
                    property.price.original = price;
                    break;

                case 'bedrooms':
                case 'beds':
                    property.bedrooms = parseInt(value);
                    break;

                case 'bathrooms':
                case 'baths':
                    const baths = parseFloat(value);
                    property.bathrooms.full = Math.floor(baths);
                    property.bathrooms.half = (baths % 1) > 0 ? 1 : 0;
                    property.bathrooms.total = baths;
                    break;

                case 'sqft':
                case 'sqft_living':
                case 'square_feet':
                case 'living_area':
                case 'sq ft':
                case 'sqft living':
                case 'living sqft':
                    property.square_feet.living = parseInt(value.replace(/[, ]/g, ''));
                    break;

                case 'lot_size':
                case 'sqft_lot':
                case 'lot_sqft':
                    property.square_feet.lot = parseInt(value.replace(/,/g, ''));
                    break;

                case 'year_built':
                case 'year':
                    property.year_built = parseInt(value);
                    break;

                case 'property_type':
                case 'type':
                    property.property_type = value.toLowerCase().replace(/ /g, '_');
                    break;

                case 'status':
                case 'listing_status':
                    property.status.current = value.toLowerCase();
                    break;

                case 'days_on_market':
                case 'dom':
                    property.days_on_market.current = parseInt(value);
                    property.days_on_market.cumulative = parseInt(value);
                    break;

                case 'garage':
                case 'garage_spaces':
                    property.garage_spaces = parseInt(value) || 0;
                    break;

                case 'stories':
                    property.stories = parseInt(value) || 1;
                    break;

                case 'pool':
                    if (value.toLowerCase() === 'yes' || value === '1') {
                        property.features.exterior.push('pool');
                    }
                    break;

                case 'photos':
                case 'photo_urls':
                case 'images':
                    if (value) {
                        const urls = value.split('|').filter(url => url.trim());
                        property.media.photos = urls.map((url, index) => ({
                            url: url.trim(),
                            caption: '',
                            order: index,
                            type: 'exterior'
                        }));
                    }
                    break;

                case 'description':
                    property.description = { public: value, private_notes: '' };
                    break;

                case 'hoa_fees':
                case 'hoa':
                    property.hoa_fees = {
                        monthly: parseInt(value.replace(/[$,]/g, '')) || 0,
                        frequency: 'monthly'
                    };
                    break;

                case 'taxes':
                case 'annual_taxes':
                case 'property_taxes':
                    property.taxes = {
                        annual_amount: parseInt(value.replace(/[$,]/g, '')) || 0,
                        year: new Date().getFullYear()
                    };
                    break;

                // Store unknown fields in analytics.variable_values
                default:
                    if (value && !header.startsWith('_')) {
                        property.analytics.variable_values[header.toLowerCase()] = value;
                    }
            }
        });

        // Compute full address
        property.address.full_address = [
            property.address.street,
            property.address.city,
            property.address.state,
            property.address.zip
        ].filter(Boolean).join(', ');

        // Compute price per sqft if possible
        if (property.price.current && property.square_feet.living) {
            property.analytics.price_per_sqft =
                Math.round(property.price.current / property.square_feet.living);
        }

        return property;
    }

    /**
     * Import properties from JSON file
     */
    async importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    let properties = [];

                    // Handle different JSON formats
                    if (Array.isArray(jsonData)) {
                        properties = jsonData;
                    } else if (jsonData.properties && Array.isArray(jsonData.properties)) {
                        properties = jsonData.properties;
                    } else if (jsonData.data && Array.isArray(jsonData.data.properties)) {
                        properties = jsonData.data.properties;
                    } else {
                        throw new Error('Invalid JSON format');
                    }

                    const results = await this.importProperties(properties);
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    /**
     * Import array of property objects
     */
    async importProperties(properties) {
        const results = {
            total: properties.length,
            succeeded: 0,
            failed: 0,
            errors: []
        };

        for (const property of properties) {
            try {
                // Ensure property has required fields
                if (!property.property_id) {
                    property.property_id = this.dataManager.generateUUID();
                }
                if (!property.created_at) {
                    property.created_at = Date.now();
                }
                property.updated_at = Date.now();

                await this.dataManager.addProperty(property);
                results.succeeded++;
            } catch (error) {
                results.failed++;
                results.errors.push({
                    property: property.address?.full_address || property.property_id,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Export properties to CSV
     */
    async exportToCSV() {
        const properties = await this.dataManager.getAllProperties();

        const headers = [
            'mls_number', 'street', 'city', 'state', 'zip',
            'price', 'bedrooms', 'bathrooms', 'sqft_living', 'sqft_lot',
            'year_built', 'property_type', 'status', 'days_on_market',
            'garage_spaces', 'stories', 'hoa_fees', 'annual_taxes',
            'latitude', 'longitude', 'description'
        ];

        let csv = headers.join(',') + '\n';

        properties.forEach(prop => {
            const row = [
                prop.mls_number || '',
                `"${prop.address?.street || ''}"`,
                prop.address?.city || '',
                prop.address?.state || '',
                prop.address?.zip || '',
                prop.price?.current || '',
                prop.bedrooms || '',
                prop.bathrooms?.total || '',
                prop.square_feet?.living || '',
                prop.square_feet?.lot || '',
                prop.year_built || '',
                prop.property_type || '',
                prop.status?.current || '',
                prop.days_on_market?.current || '',
                prop.garage_spaces || '',
                prop.stories || '',
                prop.hoa_fees?.monthly || '',
                prop.taxes?.annual_amount || '',
                prop.address?.latitude || '',
                prop.address?.longitude || '',
                `"${prop.description?.public || ''}"`
            ];

            csv += row.join(',') + '\n';
        });

        return csv;
    }

    /**
     * Export full data to JSON
     */
    async exportToJSON() {
        const exportData = await this.dataManager.exportAllData();
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Export and download CSV
     */
    async downloadCSV() {
        const csv = await this.exportToCSV();
        const filename = `clues_properties_${Date.now()}.csv`;
        this.downloadFile(csv, filename, 'text/csv');
    }

    /**
     * Export and download JSON
     */
    async downloadJSON() {
        const json = await this.exportToJSON();
        const filename = `clues_backup_${Date.now()}.json`;
        this.downloadFile(json, filename, 'application/json');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImportExportHandler;
}
