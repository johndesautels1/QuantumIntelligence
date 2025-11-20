/**
 * 💰 TEST PRICE COMPARISON
 * Demonstrates comparing prices between multiple properties in an area
 */

import { UnifiedLLMScraper } from '../llm-unified-scraper.js';
import { config, validateConfig } from '../config.js';

async function testPriceComparison() {
    console.log('💰 TESTING PRICE COMPARISON FEATURE\n');

    // Validate configuration
    const isValid = validateConfig();
    if (!isValid) {
        console.error('❌ Configuration invalid - please check .env file');
        process.exit(1);
    }

    // Initialize scraper
    const scraper = new UnifiedLLMScraper({
        anthropicApiKey: config.apiKeys.anthropic,
        openaiApiKey: config.apiKeys.openai,
        grokApiKey: config.apiKeys.grok,
        geminiApiKey: config.apiKeys.gemini
    });

    console.log('📋 SCENARIO: Comparing 3 properties in Miami, FL\n');

    // Define test property URLs (replace with real URLs)
    const testUrls = [
        'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/',
        'https://www.zillow.com/homedetails/812-Redwood-Dr-Miami-FL-33101/12345679_zpid/',
        'https://www.zillow.com/homedetails/816-Redwood-Dr-Miami-FL-33101/12345680_zpid/'
    ];

    try {
        // Scrape all properties
        console.log('🏠 Scraping properties...\n');
        const properties = [];

        for (const [index, url] of testUrls.entries()) {
            console.log(`\n${index + 1}. Scraping Property ${String.fromCharCode(65 + index)}...`);
            console.log(`   URL: ${url}`);

            const propertyData = await scraper.scrapeProperty(url, {
                preferredLLM: 'auto',
                enrichData: false
            });

            if (propertyData) {
                properties.push(propertyData);
                console.log(`   ✅ Scraped: ${propertyData.address?.full_address || 'N/A'}`);
                console.log(`   💰 Price: $${propertyData.price?.current?.toLocaleString() || 'N/A'}`);
            } else {
                console.warn(`   ⚠️ Failed to scrape property`);
            }

            // Rate limiting
            await scraper.sleep(2000);
        }

        // Compare prices
        if (properties.length >= 2) {
            const comparison = await scraper.comparePricesInArea(properties, 'Miami, FL - Redwood Dr Area');

            // Save comparison to file
            if (comparison) {
                const fs = await import('fs/promises');
                await fs.writeFile(
                    'price-comparison-report.json',
                    JSON.stringify(comparison, null, 2)
                );
                console.log('💾 Comparison report saved to: price-comparison-report.json');
            }
        } else {
            console.warn('⚠️ Not enough properties scraped for comparison');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }

    // Print cost summary
    console.log('\n');
    scraper.printCostBreakdown();

    console.log('\n✅ TEST COMPLETE\n');
}

// Run test
testPriceComparison().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
