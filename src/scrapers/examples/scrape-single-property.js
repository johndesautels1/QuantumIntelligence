/**
 * 🏠 SCRAPE SINGLE PROPERTY
 * Example script to scrape one property with full enrichment
 */

import { UnifiedLLMScraper } from '../llm-unified-scraper.js';
import { config, validateConfig } from '../config.js';
import fs from 'fs';
import path from 'path';

async function scrapeSingleProperty() {
    console.log('🏠 SINGLE PROPERTY SCRAPER\n');

    // Get URL from command line or use default
    const url = process.argv[2] || 'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/';

    console.log(`📍 Target URL: ${url}\n`);

    // Validate configuration
    if (!validateConfig()) {
        console.error('❌ Configuration invalid - check your .env file');
        process.exit(1);
    }

    // Initialize scraper
    const scraper = new UnifiedLLMScraper({
        anthropicApiKey: config.apiKeys.anthropic,
        openaiApiKey: config.apiKeys.openai,
        grokApiKey: config.apiKeys.grok,
        geminiApiKey: config.apiKeys.gemini
    });

    try {
        console.log('🤖 Starting scrape with full enrichment...\n');

        // Scrape property with enrichment
        const propertyData = await scraper.scrapeProperty(url, {
            preferredLLM: 'auto',    // Auto-select best LLM
            useHybrid: false,        // Set to true to use all LLMs
            enrichData: true         // Add Walk Score, Crime, Schools
        });

        if (!propertyData) {
            console.error('❌ Scraping failed - no data returned');
            process.exit(1);
        }

        console.log('\n✅ SCRAPING COMPLETE!\n');

        // Display results
        console.log('📊 PROPERTY DATA:');
        console.log('─────────────────────────────────────────');
        console.log(`Address:     ${propertyData.address?.full_address || 'N/A'}`);
        console.log(`Price:       $${propertyData.price?.current?.toLocaleString() || 'N/A'}`);
        console.log(`Bedrooms:    ${propertyData.property?.bedrooms || 'N/A'}`);
        console.log(`Bathrooms:   ${propertyData.property?.bathrooms || 'N/A'}`);
        console.log(`Square Feet: ${propertyData.property?.sqft?.toLocaleString() || 'N/A'}`);
        console.log(`Year Built:  ${propertyData.property?.year_built || 'N/A'}`);
        console.log(`Property Type: ${propertyData.property?.property_type || 'N/A'}`);
        console.log(`MLS #:       ${propertyData.listing?.mls_number || 'N/A'}`);

        if (propertyData.walkability) {
            console.log('\n🚶 WALKABILITY:');
            console.log(`Walk Score:    ${propertyData.walkability.walk_score}/100 - ${propertyData.walkability.walk_description || ''}`);
            console.log(`Transit Score: ${propertyData.walkability.transit_score}/100 - ${propertyData.walkability.transit_description || ''}`);
            console.log(`Bike Score:    ${propertyData.walkability.bike_score}/100 - ${propertyData.walkability.bike_description || ''}`);
        }

        if (propertyData.crime) {
            console.log('\n🚨 CRIME & SAFETY:');
            console.log(`Crime Index:   ${propertyData.crime.crime_index}/100`);
            console.log(`Safety Score:  ${propertyData.crime.safety_score}/100`);
            console.log(`Grade:         ${propertyData.crime.grade}`);
            console.log(`Compared to National: ${propertyData.crime.compared_to_national || 'N/A'}`);
        }

        if (propertyData.schools) {
            console.log('\n📚 SCHOOLS:');
            console.log(`District:      ${propertyData.schools.district || 'N/A'}`);
            console.log(`Elementary:    ${propertyData.schools.elementary?.name || 'N/A'} (${propertyData.schools.elementary?.rating || 'N/A'}/10)`);
            console.log(`Middle School: ${propertyData.schools.middle?.name || 'N/A'} (${propertyData.schools.middle?.rating || 'N/A'}/10)`);
            console.log(`High School:   ${propertyData.schools.high?.name || 'N/A'} (${propertyData.schools.high?.rating || 'N/A'}/10)`);
            console.log(`Average Rating: ${propertyData.schools.average_rating || 'N/A'}/10`);
        }

        console.log('\n');
        scraper.printCostBreakdown();

        // Save to file
        const outputDir = path.join(process.cwd(), 'data', 'scraped');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `property_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(propertyData, null, 2));

        console.log(`\n💾 Saved to: ${filepath}`);
        console.log('\n✅ Done!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run scraper
scrapeSingleProperty();
