#!/usr/bin/env node

/**
 * Generate config.js from Vercel environment variables
 * This script runs during Vercel build to create config.js from secure environment variables
 */

const fs = require('fs');

const configContent = `/**
 * API Configuration
 * Generated from environment variables during build
 */

export const API_KEYS = {
    noaa: {
        email: '${process.env.NOAA_EMAIL || 'cluesnomads@gmail.com'}',
        token: '${process.env.NOAA_TOKEN || ''}'
    },
    weathercom: {
        apiKey: '${process.env.WEATHERCOM_API_KEY || ''}'
    },
    googleMaps: {
        apiKey: '${process.env.GOOGLE_MAPS_API_KEY || ''}'
    },
    mls: {
        apiKey: '${process.env.MLS_API_KEY || 'YOUR_MLS_API_KEY_HERE'}',
        endpoint: '${process.env.MLS_API_ENDPOINT || 'YOUR_MLS_API_ENDPOINT_HERE'}'
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
`;

// Write config.js
fs.writeFileSync('config.js', configContent);
console.log('✅ config.js generated from environment variables');
