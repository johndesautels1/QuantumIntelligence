/**
 * 🧪 TEST LLM SCRAPER
 * Quick test to verify UnifiedLLMScraper is working
 */

import { UnifiedLLMScraper } from '../llm-unified-scraper.js';
import { config, validateConfig } from '../config.js';

async function testScraper() {
    console.log('🧪 TESTING UNIFIED LLM SCRAPER\n');

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

    console.log('\n📋 TEST SCENARIOS:\n');

    // Test 1: Single property with auto LLM selection
    console.log('1️⃣ Testing AUTO LLM selection...');
    try {
        const testUrl = 'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/';
        console.log(`   URL: ${testUrl}`);

        const property1 = await scraper.scrapeProperty(testUrl, {
            preferredLLM: 'auto',
            enrichData: false // Skip enrichment for faster test
        });

        if (property1) {
            console.log('✅ Auto selection test PASSED');
            console.log(`   Address: ${property1.address?.full_address || 'N/A'}`);
            console.log(`   Price: $${property1.price?.current?.toLocaleString() || 'N/A'}`);
        } else {
            console.warn('⚠️ Auto selection test returned null');
        }
    } catch (error) {
        console.error('❌ Auto selection test FAILED:', error.message);
    }

    console.log('\n');

    // Test 2: Specific LLM (Claude)
    console.log('2️⃣ Testing CLAUDE specifically...');
    try {
        if (config.llm.enabled.claude && config.apiKeys.anthropic) {
            const testUrl = 'https://www.redfin.com/FL/Miami/808-Redwood-Dr-33101/home/12345678';
            console.log(`   URL: ${testUrl}`);

            const property2 = await scraper.scrapeProperty(testUrl, {
                preferredLLM: 'claude',
                enrichData: false
            });

            if (property2) {
                console.log('✅ Claude test PASSED');
                console.log(`   Address: ${property2.address?.full_address || 'N/A'}`);
            } else {
                console.warn('⚠️ Claude test returned null');
            }
        } else {
            console.warn('⚠️ Claude disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ Claude test FAILED:', error.message);
    }

    console.log('\n');

    // Test 3: GPT specifically
    console.log('3️⃣ Testing GPT (ChatGPT) specifically...');
    try {
        if (config.llm.enabled.gpt && config.apiKeys.openai) {
            const testUrl = 'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/';
            console.log(`   URL: ${testUrl}`);

            const property3 = await scraper.scrapeProperty(testUrl, {
                preferredLLM: 'gpt',
                enrichData: false
            });

            if (property3) {
                console.log('✅ GPT test PASSED');
                console.log(`   Address: ${property3.address?.full_address || 'N/A'}`);
                console.log(`   Price: $${property3.price?.current?.toLocaleString() || 'N/A'}`);
            } else {
                console.warn('⚠️ GPT test returned null');
            }
        } else {
            console.warn('⚠️ GPT disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ GPT test FAILED:', error.message);
    }

    console.log('\n');

    // Test 4: Grok specifically
    console.log('4️⃣ Testing GROK specifically...');
    try {
        if (config.llm.enabled.grok && config.apiKeys.grok) {
            const testUrl = 'https://www.zillow.com/homedetails/808-Redwood-Dr-Miami-FL-33101/12345678_zpid/';
            console.log(`   URL: ${testUrl}`);

            const property4 = await scraper.scrapeProperty(testUrl, {
                preferredLLM: 'grok',
                enrichData: false
            });

            if (property4) {
                console.log('✅ Grok test PASSED');
                console.log(`   Address: ${property4.address?.full_address || 'N/A'}`);
                console.log(`   Price: $${property4.price?.current?.toLocaleString() || 'N/A'}`);
            } else {
                console.warn('⚠️ Grok test returned null');
            }
        } else {
            console.warn('⚠️ Grok disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ Grok test FAILED:', error.message);
    }

    console.log('\n');

    // Test 5: Walk Score extraction
    console.log('5️⃣ Testing WALK SCORE extraction...');
    try {
        if (config.llm.enabled.gpt && config.apiKeys.openai) {
            const testAddress = '808 Redwood Dr, Miami, FL 33101';
            console.log(`   Address: ${testAddress}`);

            const walkScore = await scraper.getWalkScoreViaLLM(testAddress);

            if (walkScore) {
                console.log('✅ Walk Score test PASSED');
                console.log(`   Walk Score: ${walkScore.walk_score}/100`);
                console.log(`   Transit Score: ${walkScore.transit_score}/100`);
                console.log(`   Bike Score: ${walkScore.bike_score}/100`);
            } else {
                console.warn('⚠️ Walk Score test returned null');
            }
        } else {
            console.warn('⚠️ GPT disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ Walk Score test FAILED:', error.message);
    }

    console.log('\n');

    // Test 6: Crime data extraction
    console.log('6️⃣ Testing CRIME DATA extraction...');
    try {
        if (config.llm.enabled.claude && config.apiKeys.anthropic) {
            const testAddress = '808 Redwood Dr, Miami, FL 33101';
            console.log(`   Address: ${testAddress}`);

            const crimeData = await scraper.getCrimeDataViaLLM(testAddress);

            if (crimeData) {
                console.log('✅ Crime Data test PASSED');
                console.log(`   Crime Index: ${crimeData.crime_index}/100`);
                console.log(`   Safety Score: ${crimeData.safety_score}/100`);
                console.log(`   Grade: ${crimeData.grade}`);
            } else {
                console.warn('⚠️ Crime Data test returned null');
            }
        } else {
            console.warn('⚠️ Claude disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ Crime Data test FAILED:', error.message);
    }

    console.log('\n');

    // Test 7: School data extraction
    console.log('7️⃣ Testing SCHOOL DATA extraction...');
    try {
        if (config.llm.enabled.gemini && config.apiKeys.gemini) {
            const testAddress = '808 Redwood Dr, Miami, FL 33101';
            console.log(`   Address: ${testAddress}`);

            const schoolData = await scraper.getSchoolDataViaLLM(testAddress);

            if (schoolData) {
                console.log('✅ School Data test PASSED');
                console.log(`   Average Rating: ${schoolData.average_rating}/10`);
                console.log(`   Elementary: ${schoolData.elementary?.name || 'N/A'}`);
                console.log(`   High School: ${schoolData.high?.name || 'N/A'}`);
            } else {
                console.warn('⚠️ School Data test returned null');
            }
        } else {
            console.warn('⚠️ Gemini disabled or API key missing - skipping');
        }
    } catch (error) {
        console.error('❌ School Data test FAILED:', error.message);
    }

    console.log('\n');

    // Print cost summary
    console.log('💰 COST SUMMARY:');
    scraper.printCostBreakdown();

    console.log('\n✅ ALL TESTS COMPLETE\n');
}

// Run tests
testScraper().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
