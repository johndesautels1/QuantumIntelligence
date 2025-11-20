/**
 * 📦 BATCH PROPERTY SCRAPER
 * Scrapes multiple properties from a list of URLs
 */

import { UnifiedLLMScraper } from '../llm-unified-scraper.js';
import { config, validateConfig } from '../config.js';
import fs from 'fs';
import path from 'path';

// Example property URLs (replace with real URLs)
const PROPERTY_URLS = [
    'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/',
    'https://www.redfin.com/FL/Tampa/321-Ocean-Ave-33602/home/23456789',
    'https://www.trulia.com/p/fl/orlando/456-Lake-St-32801/1234567890',
    'https://www.homes.com/property/789-beach-blvd-fort-lauderdale-fl-33301/abc123/',
    'https://www.compass.com/listing/890-sunset-dr-naples-fl-34102/def456/'
];

async function scrapeBatch() {
    console.log('📦 BATCH PROPERTY SCRAPER\n');

    // Get URLs from file or use defaults
    let urls = PROPERTY_URLS;
    const urlsFile = process.argv[2];

    if (urlsFile && fs.existsSync(urlsFile)) {
        console.log(`📂 Loading URLs from: ${urlsFile}`);
        const content = fs.readFileSync(urlsFile, 'utf-8');
        urls = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        console.log(`✅ Loaded ${urls.length} URLs\n`);
    } else {
        console.log(`📋 Using ${urls.length} example URLs\n`);
    }

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
        console.log('🤖 Starting batch scrape...');
        console.log(`⚙️ Batch size: ${config.rateLimit.batchSize}`);
        console.log(`⏱️ Delay between batches: ${config.rateLimit.delayBetweenBatches}ms\n`);

        // Scrape all properties
        const properties = await scraper.scrapeMultipleProperties(urls, {
            batchSize: config.rateLimit.batchSize,
            delayMs: config.rateLimit.delayBetweenBatches,
            llm: 'auto'
        });

        console.log('\n✅ BATCH SCRAPING COMPLETE!\n');

        // Display summary
        console.log('📊 BATCH SUMMARY:');
        console.log('─────────────────────────────────────────');
        console.log(`Total URLs:     ${urls.length}`);
        console.log(`Successful:     ${properties.length}`);
        console.log(`Failed:         ${urls.length - properties.length}`);
        console.log(`Success Rate:   ${Math.round((properties.length / urls.length) * 100)}%`);

        // Display top 5 properties
        if (properties.length > 0) {
            console.log('\n🏠 PROPERTIES SCRAPED:');
            properties.slice(0, 5).forEach((prop, idx) => {
                console.log(`${idx + 1}. ${prop.address?.full_address || 'N/A'} - $${prop.price?.current?.toLocaleString() || 'N/A'}`);
            });
            if (properties.length > 5) {
                console.log(`... and ${properties.length - 5} more`);
            }
        }

        console.log('\n');
        scraper.printCostBreakdown();

        // Check cost warnings
        if (scraper.costs.total > config.costs.warnThreshold) {
            console.warn(`\n⚠️ Cost exceeded warning threshold: $${config.costs.warnThreshold.toFixed(2)}`);
        }
        if (scraper.costs.total > config.costs.maxDailyCost) {
            console.error(`\n🚨 Cost exceeded max daily limit: $${config.costs.maxDailyCost.toFixed(2)}`);
        }

        // Save to file
        const outputDir = path.join(process.cwd(), 'data', 'scraped');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `batch_${timestamp}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(properties, null, 2));

        console.log(`\n💾 Saved ${properties.length} properties to: ${filepath}`);

        // Also save summary report
        const report = {
            timestamp: new Date().toISOString(),
            totalUrls: urls.length,
            successful: properties.length,
            failed: urls.length - properties.length,
            successRate: Math.round((properties.length / urls.length) * 100),
            costs: scraper.costs,
            requestCounts: scraper.requestCounts
        };

        const reportFile = path.join(outputDir, `batch_${timestamp}_report.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        console.log(`📋 Saved report to: ${reportFile}`);
        console.log('\n✅ Done!\n');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run batch scraper
scrapeBatch();
