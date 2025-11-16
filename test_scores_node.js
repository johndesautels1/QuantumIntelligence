// Test script to verify property scores are varied
const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
    }
};
global.document = {};
global.navigator = {};

// Load the scripts
try {
    // Read and evaluate the scoring engine
    const scoringEngineCode = fs.readFileSync(path.join(__dirname, 'src/core/scoring-engine.js'), 'utf8');

    // The file creates a global scoringEngine instance
    const scopedEval = eval;
    scopedEval(scoringEngineCode);

    // Create test properties with different IDs
    const testProperties = [
        { property_id: 'PROP001', bedrooms: 3, bathrooms: { total: 2 }, square_feet: { living: 2000, lot: 8000 }, year_built: 2010, price: { current: 500000 } },
        { property_id: 'PROP002', bedrooms: 4, bathrooms: { total: 3 }, square_feet: { living: 2500, lot: 10000 }, year_built: 2015, price: { current: 650000 } },
        { property_id: 'PROP003', bedrooms: 2, bathrooms: { total: 1 }, square_feet: { living: 1200, lot: 5000 }, year_built: 1990, price: { current: 350000 } },
        { property_id: 'PROP004', bedrooms: 5, bathrooms: { total: 4 }, square_feet: { living: 3500, lot: 15000 }, year_built: 2020, price: { current: 850000 } },
        { property_id: 'PROP005', bedrooms: 3, bathrooms: { total: 2 }, square_feet: { living: 1800, lot: 7000 }, year_built: 2005, price: { current: 450000 } }
    ];

    console.log('Testing Property Score Variation');
    console.log('================================\n');

    const allScores = {
        location: [],
        financial: [],
        property_physical: [],
        investment: [],
        lifestyle: []
    };

    // Calculate scores for each property
    testProperties.forEach((prop, index) => {
        const scores = scoringEngine.calculateScore(prop, 'balanced');

        console.log(`Property ${index + 1} (${prop.property_id}):`);
        console.log(`  Overall: ${scores.overall.toFixed(1)}`);

        for (const [category, data] of Object.entries(scores.by_category)) {
            console.log(`  ${category}: ${data.score.toFixed(1)}`);
            if (allScores[category]) {
                allScores[category].push(data.score);
            }
        }
        console.log('');
    });

    // Calculate ranges
    console.log('Score Ranges:');
    console.log('=============');
    let allSame = true;
    for (const [category, scores] of Object.entries(allScores)) {
        if (scores.length > 0) {
            const min = Math.min(...scores);
            const max = Math.max(...scores);
            const range = max - min;
            console.log(`${category}: Min=${min.toFixed(1)}, Max=${max.toFixed(1)}, Range=${range.toFixed(1)}`);
            if (range > 1) {
                allSame = false;
            }
        }
    }

    console.log('\n' + (allSame ? '❌ PROBLEM: Scores are too similar!' : '✅ SUCCESS: Scores are varied!'));

} catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
}