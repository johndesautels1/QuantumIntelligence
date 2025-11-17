/**
 * API Configuration Template
 * Copy this file to config.js and add your actual API keys
 * config.js is gitignored and will not be committed
 */

export const API_KEYS = {
    noaa: {
        email: 'your-email@example.com',
        token: 'your-noaa-token-here'
    },
    weathercom: {
        apiKey: 'your-weathercom-api-key-here'
    },
    googleMaps: {
        apiKey: 'your-google-maps-api-key-here'
    },
    mls: {
        apiKey: 'your-mls-api-key-here',
        endpoint: 'your-mls-api-endpoint-here'
    }
};

export const API_ENDPOINTS = {
    noaa: {
        base: 'https://www.ncdc.noaa.gov/cdo-web/api/v2',
        stations: '/stations',
        data: '/data',
        datasets: '/datasets'
    },
    weathercom: {
        base: 'https://api.weather.com/v3/wx',
        currentConditions: '/observations/current',
        forecast: '/forecast/daily/5day',
        hourly: '/forecast/hourly/12hour',
        monthlyForecast: '/forecast/monthly/15day',
        severeHistory: '/severe'
    },
    googleMaps: {
        staticMap: 'https://maps.googleapis.com/maps/api/staticmap',
        streetView: 'https://maps.googleapis.com/maps/api/streetview'
    },
    climateRisk: {
        fema: 'https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query',
        usgsElevation: 'https://epqs.nationalmap.gov/v1/json',
        noaaSeaLevel: 'https://coast.noaa.gov/arcgis/rest/services/dc_slr'
    }
};
