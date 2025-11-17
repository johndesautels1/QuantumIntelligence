/**
 * API Configuration Template
 * Copy this file to config.js and add your actual API keys
 * config.js is gitignored and will not be committed
 */

export const API_KEYS = {
    noaa: {
        email: 'your-email@example.com',
        token: 'your-noaa-token-here'
    }
};

export const API_ENDPOINTS = {
    noaa: {
        base: 'https://www.ncdc.noaa.gov/cdo-web/api/v2',
        stations: '/stations',
        data: '/data',
        datasets: '/datasets'
    }
};
