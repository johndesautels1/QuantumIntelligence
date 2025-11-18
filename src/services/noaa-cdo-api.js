/**
 * noaa-cdo-api.js - NOAA Climate Data Online Integration
 * Official US Government Climate Data
 * Token provided by John: pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd
 * 100% REAL AUTHORITATIVE DATA
 */

const NOAA_CDO_API = {
    // Your official NOAA CDO Token
    TOKEN: 'pgLwHCIovnmuIoZeVzarJyxjRWLHZjUd',
    BASE_URL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2',
    
    // API Endpoints
    ENDPOINTS: {
        data: '/data',
        datasets: '/datasets',
        datatypes: '/datatypes',
        locationcategories: '/locationcategories',
        locations: '/locations',
        stations: '/stations',
        datacategories: '/datacategories'
    },
    
    // Common dataset IDs
    DATASETS: {
        DAILY_SUMMARIES: 'GHCND',      // Global Historical Climatology Network - Daily
        MONTHLY_SUMMARIES: 'GSOM',      // Global Summary of the Month
        ANNUAL_SUMMARIES: 'GSOY',       // Global Summary of the Year
        CLIMATE_NORMALS: 'NORMAL_ANN',  // Climate Normals Annual/Seasonal
        CLIMATE_INDICES: 'GCAG',        // Global Climate at a Glance
        EXTREME_EVENTS: 'NEXRAD3'       // Weather Radar Data
    },
    
    // Common data types
    DATATYPES: {
        // Temperature
        TMAX: 'TMAX',     // Maximum temperature
        TMIN: 'TMIN',     // Minimum temperature
        TAVG: 'TAVG',     // Average temperature
        TOBS: 'TOBS',     // Temperature at observation time
        
        // Precipitation
        PRCP: 'PRCP',     // Precipitation
        SNOW: 'SNOW',     // Snowfall
        SNWD: 'SNWD',     // Snow depth
        
        // Extremes
        EMXT: 'EMXT',     // Extreme maximum temperature
        EMNT: 'EMNT',     // Extreme minimum temperature
        EMXP: 'EMXP',     // Extreme maximum precipitation
        
        // Wind
        AWND: 'AWND',     // Average wind speed
        WSF2: 'WSF2',     // Fastest 2-minute wind speed
        WSF5: 'WSF5',     // Fastest 5-second wind speed
        
        // Other
        RHAV: 'RHAV',     // Average relative humidity
        PSUN: 'PSUN'      // Percent of possible sunshine
    },
    
    /**
     * Make authenticated request to NOAA CDO API
     */
    async makeRequest(endpoint, params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
            
            console.log(`📡 NOAA CDO Request: ${endpoint}`);
            
            const response = await fetch(url, {
                headers: {
                    'token': this.TOKEN,
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`NOAA API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ NOAA CDO Response received`);
            return data;
            
        } catch (error) {
            console.error('❌ NOAA CDO API error:', error);
            throw error;
        }
    },
    
    /**
     * Get climate data for a specific location
     */
    async getClimateData(lat, lon, options = {}) {
        try {
            // Find nearest weather station
            const station = await this.findNearestStation(lat, lon);
            
            if (!station) {
                console.warn('No weather station found nearby');
                return null;
            }
            
            console.log(`📍 Using station: ${station.name} (${station.id})`);
            
            // Get date range (default: last 12 months)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 1);
            
            // Fetch multiple data types
            const params = {
                datasetid: options.dataset || this.DATASETS.MONTHLY_SUMMARIES,
                stationid: station.id,
                startdate: options.startdate || startDate.toISOString().split('T')[0],
                enddate: options.enddate || endDate.toISOString().split('T')[0],
                units: options.units || 'standard',
                limit: 1000
            };
            
            // Add specific data types if requested
            if (options.datatypes) {
                params.datatypeid = options.datatypes.join(',');
            }
            
            const response = await this.makeRequest(this.ENDPOINTS.data, params);
            
            return {
                station: station,
                data: response.results || [],
                metadata: response.metadata || {},
                source: 'NOAA Climate Data Online',
                token: '***' + this.TOKEN.slice(-4), // Show last 4 chars for verification
                isRealData: true
            };
            
        } catch (error) {
            console.error('Error fetching climate data:', error);
            return null;
        }
    },
    
    /**
     * Find the nearest weather station to coordinates
     */
    async findNearestStation(lat, lon, radius = 50) {
        try {
            // NOAA uses bounding box for location queries
            const extent = `${lon - 0.5},${lat - 0.5},${lon + 0.5},${lat + 0.5}`;
            
            const params = {
                datasetid: this.DATASETS.DAILY_SUMMARIES,
                extent: extent,
                limit: 10
            };
            
            const response = await this.makeRequest(this.ENDPOINTS.stations, params);
            
            if (!response.results || response.results.length === 0) {
                // Try wider search
                const widerExtent = `${lon - 1},${lat - 1},${lon + 1},${lat + 1}`;
                params.extent = widerExtent;
                const widerResponse = await this.makeRequest(this.ENDPOINTS.stations, params);
                
                if (!widerResponse.results || widerResponse.results.length === 0) {
                    return null;
                }
                
                return widerResponse.results[0];
            }
            
            // Return the closest station (first in results)
            return response.results[0];
            
        } catch (error) {
            console.error('Error finding station:', error);
            return null;
        }
    },
    
    /**
     * Get climate normals (30-year averages)
     */
    async getClimateNormals(lat, lon) {
        try {
            const station = await this.findNearestStation(lat, lon);
            
            if (!station) {
                return null;
            }
            
            // Climate normals use different dataset
            const params = {
                datasetid: 'NORMAL_ANN',
                stationid: station.id,
                startdate: '2010-01-01',
                enddate: '2010-12-31',
                datatypeid: [
                    'ANN-TAVG-NORMAL',  // Annual average temperature normal
                    'ANN-TMAX-NORMAL',  // Annual maximum temperature normal
                    'ANN-TMIN-NORMAL',  // Annual minimum temperature normal
                    'ANN-PRCP-NORMAL',  // Annual precipitation normal
                    'ANN-SNOW-NORMAL'   // Annual snowfall normal
                ].join(','),
                limit: 1000
            };
            
            const response = await this.makeRequest(this.ENDPOINTS.data, params);
            
            // Also get monthly normals
            const monthlyParams = {
                ...params,
                datatypeid: [
                    'MLY-TAVG-NORMAL',  // Monthly average temperature normal
                    'MLY-TMAX-NORMAL',  // Monthly maximum temperature normal
                    'MLY-TMIN-NORMAL',  // Monthly minimum temperature normal
                    'MLY-PRCP-NORMAL',  // Monthly precipitation normal
                    'MLY-SNOW-NORMAL'   // Monthly snowfall normal
                ].join(',')
            };
            
            const monthlyResponse = await this.makeRequest(this.ENDPOINTS.data, monthlyParams);
            
            return {
                station: station,
                annual: response.results || [],
                monthly: monthlyResponse.results || [],
                source: 'NOAA Climate Normals (1991-2020)',
                isRealData: true
            };
            
        } catch (error) {
            console.error('Error fetching climate normals:', error);
            return null;
        }
    },
    
    /**
     * Get extreme weather events
     */
    async getExtremeEvents(lat, lon, options = {}) {
        try {
            const station = await this.findNearestStation(lat, lon);
            
            if (!station) {
                return null;
            }
            
            // Get last 10 years of extreme events
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - 10);
            
            const params = {
                datasetid: this.DATASETS.DAILY_SUMMARIES,
                stationid: station.id,
                startdate: startDate.toISOString().split('T')[0],
                enddate: endDate.toISOString().split('T')[0],
                datatypeid: [
                    'EMXT',  // Extreme maximum temperature
                    'EMNT',  // Extreme minimum temperature
                    'EMXP',  // Extreme maximum precipitation
                    'DX90',  // Days with max temp >= 90F
                    'DX70',  // Days with max temp >= 70F
                    'DX32',  // Days with max temp <= 32F
                    'DT00',  // Days with min temp <= 0F
                    'DSNW',  // Days with snow depth >= 1 inch
                    'DPNT'   // Days with min temp <= percentile
                ].join(','),
                limit: 1000
            };
            
            const response = await this.makeRequest(this.ENDPOINTS.data, params);
            
            // Process into summary statistics
            const events = this.processExtremeEvents(response.results || []);
            
            return {
                station: station,
                events: events,
                rawData: response.results || [],
                source: 'NOAA Extreme Weather Data',
                period: `${startDate.getFullYear()}-${endDate.getFullYear()}`,
                isRealData: true
            };
            
        } catch (error) {
            console.error('Error fetching extreme events:', error);
            return null;
        }
    },
    
    /**
     * Get temperature trends over time
     */
    async getTemperatureTrends(lat, lon, years = 30) {
        try {
            const station = await this.findNearestStation(lat, lon);
            
            if (!station) {
                return null;
            }
            
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(endDate.getFullYear() - years);
            
            const params = {
                datasetid: this.DATASETS.ANNUAL_SUMMARIES,
                stationid: station.id,
                startdate: startDate.toISOString().split('T')[0],
                enddate: endDate.toISOString().split('T')[0],
                datatypeid: 'TAVG,TMAX,TMIN',
                limit: 1000
            };
            
            const response = await this.makeRequest(this.ENDPOINTS.data, params);
            
            // Calculate trend line
            const trend = this.calculateTrend(response.results || []);
            
            return {
                station: station,
                data: response.results || [],
                trend: trend,
                period: years,
                source: 'NOAA Temperature Trends',
                isRealData: true
            };
            
        } catch (error) {
            console.error('Error fetching temperature trends:', error);
            return null;
        }
    },
    
    /**
     * Get drought conditions
     */
    async getDroughtData(lat, lon) {
        try {
            // Drought data uses Palmer Drought Severity Index
            const params = {
                datasetid: 'GCAG',
                locationcategoryid: 'ST',
                datatypeid: 'PDSI',
                startdate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
                enddate: new Date().toISOString().split('T')[0],
                limit: 1000
            };
            
            const response = await this.makeRequest(this.ENDPOINTS.data, params);
            
            return {
                data: response.results || [],
                source: 'NOAA Palmer Drought Severity Index',
                isRealData: true
            };
            
        } catch (error) {
            console.error('Error fetching drought data:', error);
            return null;
        }
    },
    
    /**
     * Process extreme events into summary
     */
    processExtremeEvents(data) {
        const summary = {
            heatWaves: 0,
            coldSnaps: 0,
            extremePrecip: 0,
            recordHighs: [],
            recordLows: [],
            total: 0
        };
        
        data.forEach(record => {
            switch(record.datatype) {
                case 'EMXT':
                    summary.recordHighs.push({
                        date: record.date,
                        value: record.value
                    });
                    summary.total++;
                    break;
                case 'EMNT':
                    summary.recordLows.push({
                        date: record.date,
                        value: record.value
                    });
                    summary.total++;
                    break;
                case 'DX90':
                    if (record.value > 3) summary.heatWaves++;
                    break;
                case 'DT00':
                    if (record.value > 3) summary.coldSnaps++;
                    break;
                case 'EMXP':
                    summary.extremePrecip++;
                    summary.total++;
                    break;
            }
        });
        
        return summary;
    },
    
    /**
     * Calculate temperature trend
     */
    calculateTrend(data) {
        if (!data || data.length < 2) return null;
        
        // Simple linear regression
        const temps = data.filter(d => d.datatype === 'TAVG');
        if (temps.length < 2) return null;
        
        const n = temps.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        temps.forEach((record, index) => {
            const x = index;
            const y = record.value;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
        });
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return {
            slope: slope,           // Temperature change per year
            intercept: intercept,
            trendPerDecade: slope * 10,
            confidence: this.calculateR2(temps, slope, intercept)
        };
    },
    
    /**
     * Calculate R-squared for trend confidence
     */
    calculateR2(data, slope, intercept) {
        const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
        let ssRes = 0, ssTot = 0;
        
        data.forEach((record, index) => {
            const predicted = slope * index + intercept;
            ssRes += Math.pow(record.value - predicted, 2);
            ssTot += Math.pow(record.value - mean, 2);
        });
        
        return 1 - (ssRes / ssTot);
    },
    
    /**
     * Format temperature from Celsius to Fahrenheit
     */
    celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    },
    
    /**
     * Format data for charts
     */
    formatForChart(data, datatype) {
        return data
            .filter(d => d.datatype === datatype)
            .map(d => ({
                x: new Date(d.date),
                y: datatype.includes('T') ? this.celsiusToFahrenheit(d.value / 10) : d.value
            }))
            .sort((a, b) => a.x - b.x);
    }
};

// Export for use in other modules
export default NOAA_CDO_API;
