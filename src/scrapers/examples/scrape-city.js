/**
 * 🏙️ CITY-WIDE PROPERTY SCRAPER
 * Scrapes all listings in a Florida city
 */

import { UnifiedLLMScraper } from '../llm-unified-scraper.js';
import { config, validateConfig } from '../config.js';
import fs from 'fs';
import path from 'path';

async function scrapeCity() {
    console.log('🏙️ CITY-WIDE PROPERTY SCRAPER\n');

    // Get city from command line or use default
    const city = process.argv[2] || 'Miami';
    const state = process.argv[3] || 'FL';
    const maxProperties = parseInt(process.argv[4] || '50');

    console.log(`📍 Target: ${city}, ${state}`);
    console.log(`📊 Max Properties: ${maxProperties}\n`);

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
        console.log('🤖 Starting city-wide scrape...');
        console.log(`🌐 Sites: Zillow, Redfin, Trulia, Homes.com, Compass\n`);

        // Scrape entire city
        const properties = await scraper.scrapeCity(city, state, {
            maxProperties: maxProperties,
            sites: ['zillow', 'redfin', 'trulia', 'homes.com', 'compass'],
            llm: 'auto'
        });

        console.log('\n✅ CITY SCRAPING COMPLETE!\n');

        // Display summary
        console.log('📊 CITY SUMMARY:');
        console.log('─────────────────────────────────────────');
        console.log(`City:           ${city}, ${state}`);
        console.log(`Properties:     ${properties.length}`);

        if (properties.length > 0) {
            // Calculate statistics
            const prices = properties.map(p => p.price?.current).filter(Boolean);
            const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            const bedrooms = properties.map(p => p.property?.bedrooms).filter(Boolean);
            const avgBedrooms = bedrooms.reduce((a, b) => a + b, 0) / bedrooms.length;

            console.log(`Average Price:  $${Math.round(avgPrice).toLocaleString()}`);
            console.log(`Price Range:    $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`);
            console.log(`Avg Bedrooms:   ${avgBedrooms.toFixed(1)}`);

            // Property types breakdown
            const types = {};
            properties.forEach(p => {
                const type = p.property?.property_type || 'Unknown';
                types[type] = (types[type] || 0) + 1;
            });

            console.log('\n🏠 PROPERTY TYPES:');
            Object.entries(types).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });

            // Top 10 most expensive
            console.log('\n💰 TOP 10 MOST EXPENSIVE:');
            const sorted = [...properties].sort((a, b) =>
                (b.price?.current || 0) - (a.price?.current || 0)
            );
            sorted.slice(0, 10).forEach((prop, idx) => {
                console.log(`${idx + 1}. $${prop.price?.current?.toLocaleString() || 'N/A'} - ${prop.address?.full_address || 'N/A'}`);
            });

            // Best schools
            const withSchools = properties.filter(p => p.schools?.average_rating);
            if (withSchools.length > 0) {
                console.log('\n🎓 TOP 10 BEST SCHOOLS:');
                const sortedBySchools = [...withSchools].sort((a, b) =>
                    (b.schools?.average_rating || 0) - (a.schools?.average_rating || 0)
                );
                sortedBySchools.slice(0, 10).forEach((prop, idx) => {
                    console.log(`${idx + 1}. ${prop.schools?.average_rating}/10 - ${prop.address?.full_address || 'N/A'}`);
                });
            }

            // Safest neighborhoods
            const withCrime = properties.filter(p => p.crime?.safety_score);
            if (withCrime.length > 0) {
                console.log('\n🛡️ TOP 10 SAFEST NEIGHBORHOODS:');
                const sortedBySafety = [...withCrime].sort((a, b) =>
                    (b.crime?.safety_score || 0) - (a.crime?.safety_score || 0)
                );
                sortedBySafety.slice(0, 10).forEach((prop, idx) => {
                    console.log(`${idx + 1}. Safety ${prop.crime?.safety_score}/100 - ${prop.address?.full_address || 'N/A'}`);
                });
            }

            // Most walkable
            const withWalk = properties.filter(p => p.walkability?.walk_score);
            if (withWalk.length > 0) {
                console.log('\n🚶 TOP 10 MOST WALKABLE:');
                const sortedByWalk = [...withWalk].sort((a, b) =>
                    (b.walkability?.walk_score || 0) - (a.walkability?.walk_score || 0)
                );
                sortedByWalk.slice(0, 10).forEach((prop, idx) => {
                    console.log(`${idx + 1}. Walk Score ${prop.walkability?.walk_score}/100 - ${prop.address?.full_address || 'N/A'}`);
                });
            }
        }

        console.log('\n');
        scraper.printCostBreakdown();

        // Check cost warnings
        if (scraper.costs.total > config.costs.warnThreshold) {
            console.warn(`\n⚠️ Cost exceeded warning threshold: $${config.costs.warnThreshold.toFixed(2)}`);
        }

        // Save to file
        const outputDir = path.join(process.cwd(), 'data', 'scraped', 'cities');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        const filename = `${citySlug}_${state.toLowerCase()}_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(properties, null, 2));

        console.log(`\n💾 Saved ${properties.length} properties to: ${filepath}`);

        // Save analysis report
        const report = {
            timestamp: new Date().toISOString(),
            city: city,
            state: state,
            totalProperties: properties.length,
            statistics: {
                averagePrice: prices.length > 0 ? Math.round(avgPrice) : null,
                minPrice: prices.length > 0 ? minPrice : null,
                maxPrice: prices.length > 0 ? maxPrice : null,
                averageBedrooms: bedrooms.length > 0 ? parseFloat(avgBedrooms.toFixed(1)) : null
            },
            propertyTypes: types,
            costs: scraper.costs,
            requestCounts: scraper.requestCounts
        };

        const reportFile = path.join(outputDir, `${citySlug}_${state.toLowerCase()}_${timestamp}_report.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        console.log(`📋 Saved analysis report to: ${reportFile}`);
        console.log('\n✅ Done!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run city scraper
scrapeCity();
