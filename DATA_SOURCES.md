# CLUES™ Data Sources & Integration Guide

**Complete Guide to Importing Property Data**

Version: 1.0.0
Last Updated: November 2025
Status: Implementation Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Manual Entry](#manual-entry)
3. [CSV Import](#csv-import)
4. [JSON Import](#json-import)
5. [MLS Integration](#mls-integration)
6. [Third-Party APIs](#third-party-apis)
7. [Web Scraping](#web-scraping)
8. [Bulk Upload System](#bulk-upload-system)
9. [Data Enrichment](#data-enrichment)
10. [Data Validation](#data-validation)

---

## 1. Overview

CLUES™ supports **multiple data input methods** to accommodate different workflows and data sources.

### Supported Input Methods

| Method | Use Case | Ease | Automation | Cost |
|--------|----------|------|------------|------|
| **Manual Entry** | 1-5 properties | Easy | None | Free |
| **CSV Upload** | 10-1000 properties | Medium | Manual | Free |
| **JSON Upload** | Bulk import | Medium | Manual | Free |
| **MLS Feed** | Real-time sync | Hard | Full | $$$  |
| **Zillow API** | Market data | Medium | Semi | $$ |
| **Redfin Scrape** | Listings | Medium | Script | Free |
| **Google Sheets** | Team sharing | Easy | Semi | Free |
| **Webhook** | Auto-updates | Hard | Full | Free |

---

## 2. Manual Entry

### Single Property Entry

Access via: Dashboard → "Add Property" → "Manual Entry"

#### Required Fields
```javascript
{
  address: {
    street: "123 Main St",
    city: "Portland",
    state: "OR",
    zip: "97201"
  },
  price: {
    current: 450000
  },
  property_physical: {
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 2000
  }
}
```

#### Optional But Recommended
- Year built
- Lot size
- Property type
- School ratings
- HOA fees
- Property taxes
- Days on market

### Quick Add Mode

For rapid entry during property tours:

1. **Address + Price** (30 seconds)
2. **Photo** (use camera)
3. **Voice Notes** (future feature)
4. **Score Later** (when back at office)

---

## 3. CSV Import

### Template Download

Dashboard → Import → "Download CSV Template"

### Standard Format

```csv
mls_id,street,city,state,zip,price,beds,baths,sqft,lot_sqft,year_built,property_type,status,days_on_market,hoa_monthly,tax_annual,latitude,longitude
MLS001,"123 Main St","Portland","OR","97201",450000,3,2.5,2000,5000,1995,"single_family","active",15,0,4500,45.5152,-122.6784
MLS002,"456 Oak Ave","Portland","OR","97202",650000,4,3,2400,6000,2005,"single_family","active",8,250,6200,45.5155,-122.6790
```

### Column Mapping

CLUES™ automatically detects common column names:

| Your CSV | CLUES™ Field | Aliases Supported |
|----------|--------------|-------------------|
| `address` | `address.street` | street, addr, full_address |
| `price` | `price.current` | listing_price, ask_price, current_price |
| `beds` | `property_physical.bedrooms` | bedrooms, bed, br |
| `baths` | `property_physical.bathrooms` | bathrooms, bath, ba |
| `sqft` | `property_physical.square_feet` | square_feet, living_area, sqft_living |
| `year` | `property_physical.year_built` | year_built, built, yr_built |

### Import Process

1. **Select File**: Click "Import CSV" or drag-drop
2. **Map Columns**: Review auto-detected mapping
3. **Validate Data**: See preview of first 5 properties
4. **Import**: Click "Import All"
5. **Review Results**: See success/failure report

### Example: MLS Export

Most MLS systems export to CSV. Here's how to import from common platforms:

#### Flexmls
```
Export → Custom Report → Select Fields → Download CSV
```

Maps directly to CLUES™ format.

#### Paragon
```
Search → Export → Choose Format: CSV → Download
```

Requires minor column renaming.

#### Realist
```
Results → Export → CSV Format
```

Works with default mapping.

---

## 4. JSON Import

### Standard JSON Format

```json
{
  "properties": [
    {
      "property_id": "550e8400-e29b-41d4-a716-446655440000",
      "mls_number": "MLS12345",
      "source": "mls_import",
      "created_at": 1704067200000,
      "updated_at": 1704067200000,

      "address": {
        "street": "123 Main St",
        "city": "Portland",
        "state": "OR",
        "zip": "97201",
        "county": "Multnomah",
        "latitude": 45.5152,
        "longitude": -122.6784
      },

      "price": {
        "current": 450000,
        "original": 465000,
        "previous": 460000,
        "history": [
          {"date": 1704067200000, "price": 465000},
          {"date": 1705881600000, "price": 460000},
          {"date": 1706659200000, "price": 450000}
        ]
      },

      "property_physical": {
        "bedrooms": 3,
        "bathrooms": 2.5,
        "square_feet": 2000,
        "lot_size": 5000,
        "year_built": 1995,
        "stories": 2,
        "garage_spaces": 2,
        "property_type": "single_family",
        "foundation_type": "slab",
        "roof_age": 15,
        "hvac_age": 8,
        "exterior_condition": 75,
        "interior_condition": 80
      },

      "financial": {
        "property_tax_annual": 4500,
        "hoa_fees_monthly": 0,
        "insurance_annual": 1200,
        "utilities_monthly": 250,
        "maintenance_annual": 2000,
        "price_per_sqft": 225
      },

      "location": {
        "neighborhood": "Pearl District",
        "school_rating_elementary": 8,
        "school_rating_middle": 7,
        "school_rating_high": 9,
        "crime_score": 85,
        "walkability_score": 92,
        "transit_score": 88,
        "distance_to_downtown": 2.5,
        "distance_to_shopping": 0.8,
        "distance_to_parks": 0.5
      },

      "market": {
        "appreciation_3yr": 12.5,
        "appreciation_5yr": 22.3,
        "market_temperature": 75,
        "inventory_level": "low",
        "median_days_on_market": 18,
        "buyer_demand_index": 85
      },

      "risk": {
        "foundation_risk": 15,
        "roof_risk": 25,
        "plumbing_risk": 20,
        "flood_risk": 10,
        "earthquake_risk": 35,
        "title_risk": 5
      },

      "lifestyle": {
        "outdoor_space_quality": 70,
        "view_quality": 60,
        "natural_light": 85,
        "privacy_level": 75,
        "smart_home_features": 40,
        "energy_efficiency": 65
      },

      "investment": {
        "rental_yield_potential": 4.5,
        "appreciation_potential": 75,
        "cash_flow_projection": 1200,
        "cap_rate": 5.2,
        "roi_5yr_projection": 28.5
      },

      "competitive": {
        "unique_features_count": 3,
        "condition_vs_market": 85,
        "price_vs_market": 92,
        "location_vs_market": 88,
        "curb_appeal": 75
      },

      "images": [
        {"url": "https://photos.example.com/prop1/front.jpg", "caption": "Front exterior", "is_primary": true},
        {"url": "https://photos.example.com/prop1/kitchen.jpg", "caption": "Kitchen", "is_primary": false}
      ],

      "listing_status": "active",
      "days_on_market": 15,
      "agent_info": {
        "name": "Jane Smith",
        "email": "jane@realestate.com",
        "phone": "555-1234",
        "brokerage": "Premier Realty"
      }
    }
  ]
}
```

### Minimal JSON Format

```json
{
  "properties": [
    {
      "address": {
        "street": "123 Main St",
        "city": "Portland",
        "state": "OR",
        "zip": "97201"
      },
      "price": {"current": 450000},
      "property_physical": {
        "bedrooms": 3,
        "bathrooms": 2.5,
        "square_feet": 2000
      }
    }
  ]
}
```

CLUES™ will auto-calculate missing variables where possible.

---

## 5. MLS Integration

### Option 1: RETS (Real Estate Transaction Standard)

**What it is**: Industry-standard protocol for MLS data access

**Setup**:
```javascript
// Install RETS client
npm install rets-client

// Configure connection
const rets = new RetsClient({
  loginUrl: 'https://your-mls.rets.com/login',
  username: 'your-username',
  password: 'your-password',
  version: 'RETS/1.7.2'
});

// Search for properties
const results = await rets.search({
  searchType: 'Property',
  class: 'ResidentialProperty',
  query: '(City=Portland)',
  limit: 100
});

// Convert to CLUES™ format
const properties = results.map(convertRetsToClues);

// Import to CLUES™
await dataManager.bulkAddProperties(properties);
```

**MLS Providers Supporting RETS**:
- Flexmls (FBS)
- Paragon
- MLS Grid
- Rapattoni
- CoreLogic Matrix

**Cost**: Varies by MLS ($50-500/month)

### Option 2: RESO Web API

**What it is**: Modern REST API standard replacing RETS

**Setup**:
```javascript
// Example: RESO Web API client
const client = new RESOClient({
  endpoint: 'https://your-mls.com/reso/odata',
  apiKey: 'your-api-key',
  bearerToken: 'your-token'
});

// Query properties
const response = await fetch(
  `${client.endpoint}/Property?$filter=City eq 'Portland' and ListPrice lt 500000&$top=100`,
  {
    headers: {
      'Authorization': `Bearer ${client.bearerToken}`,
      'Accept': 'application/json'
    }
  }
);

const data = await response.json();
const properties = data.value.map(convertResoToClues);
```

**MLS Providers Supporting RESO**:
- Bright MLS
- CRMLS
- MRED
- ARMLS

### Option 3: ListHub (Syndication)

**What it is**: Aggregates listings from multiple MLSs

**Setup**:
```javascript
// Subscribe to ListHub feed
// Receive XML/JSON feed daily

// Parse and import
const parser = new ListHubParser();
const properties = parser.parse(feedXml);
await dataManager.bulkAddProperties(properties);
```

**Cost**: $200-800/month depending on coverage

---

## 6. Third-Party APIs

### Zillow API (Discontinued - Use Alternatives)

Zillow's API is no longer available to new users. Use:

### Option 1: RapidAPI Real Estate APIs

```javascript
// Realtor API via RapidAPI
const response = await fetch(
  'https://realtor.p.rapidapi.com/properties/v2/list-for-sale',
  {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': 'your-api-key',
      'X-RapidAPI-Host': 'realtor.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      city: 'Portland',
      state_code: 'OR',
      limit: 200,
      offset: 0
    })
  }
);

const data = await response.json();
```

**Cost**: $10-50/month for 500-10,000 requests

### Option 2: Redfin Data

```javascript
// Redfin doesn't have official API, but CSV export works
// 1. Search on Redfin.com
// 2. Click "Download All"
// 3. Import CSV to CLUES™
```

### Option 3: Rentcast API (Rental Data)

```javascript
// Get rental estimates
const response = await fetch(
  `https://api.rentcast.io/v1/avm/rent?address=123 Main St&city=Portland&state=OR&zip=97201`,
  {
    headers: {
      'X-Api-Key': 'your-api-key'
    }
  }
);

const rentalData = await response.json();
// Add to property.investment.rental_yield_potential
```

**Cost**: Free tier, $29+/month for more

### Option 4: WalkScore API

```javascript
// Get walkability scores
const response = await fetch(
  `https://api.walkscore.com/score?format=json&address=123 Main St Portland OR 97201&lat=45.5152&lon=-122.6784&wsapikey=your-api-key`
);

const data = await response.json();
// Update property.location.walkability_score
```

**Cost**: Free for < 5,000 requests/day

---

## 7. Web Scraping

### Legal Considerations

⚠️ **Important**: Review Terms of Service before scraping any website.

**Generally OK**:
- Publicly available listings
- For personal/internal use
- Respecting robots.txt
- Reasonable rate limits

**Not OK**:
- Behind login/paywall
- Reselling data
- Excessive requests
- Copyrighted content

### Example: Scraping Realtor.com

```javascript
// Using Puppeteer (headless browser)
const puppeteer = require('puppeteer');

async function scrapeRealtorListing(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Extract property data
  const property = await page.evaluate(() => {
    return {
      address: document.querySelector('[data-label="address"]')?.textContent,
      price: document.querySelector('[data-label="price"]')?.textContent,
      beds: document.querySelector('[data-label="beds"]')?.textContent,
      baths: document.querySelector('[data-label="baths"]')?.textContent,
      sqft: document.querySelector('[data-label="sqft"]')?.textContent,
      // ... more selectors
    };
  });

  await browser.close();
  return convertScrapedToClues(property);
}
```

### Example: Scraping Zillow

```javascript
// Note: Zillow may block scrapers. Use responsibly.
async function scrapeZillowListing(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const property = {
    price: $('[data-testid="price"]').text(),
    address: $('[data-testid="address"]').text(),
    beds: $('[data-testid="bed-info"]').text(),
    // ... extract more fields
  };

  return property;
}
```

### Recommended Scraping Tool: Apify

Pre-built scrapers for real estate sites:

```javascript
// Using Apify's Zillow scraper
const ApifyClient = require('apify-client');
const client = new ApifyClient({ token: 'your-token' });

const run = await client.actor('mstephen190/zillow-scraper').call({
  search: 'Portland, OR',
  maxItems: 100
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
// items contains property data
```

**Cost**: $49+/month

---

## 8. Bulk Upload System

### Large Dataset Import

For 1,000+ properties:

```javascript
// Batch import with progress tracking
async function bulkImport(properties) {
  const batchSize = 100;
  const batches = chunk(properties, batchSize);

  for (let i = 0; i < batches.length; i++) {
    await dataManager.bulkAddProperties(batches[i]);
    updateProgress((i + 1) / batches.length * 100);
  }
}
```

### Performance Optimization

```javascript
// Use transactions for faster imports
async bulkAddProperties(properties) {
  const tx = this.db.transaction([this.stores.properties], 'readwrite');
  const store = tx.objectStore(this.stores.properties);

  for (const property of properties) {
    // Auto-generate ID if missing
    if (!property.property_id) {
      property.property_id = generateUUID();
    }

    // Calculate scores
    property.computed_scores = scoringEngine.calculateScore(property);

    // Add to database
    store.add(property);
  }

  await tx.complete;
}
```

---

## 9. Data Enrichment

### Auto-Enrichment Pipeline

```javascript
async function enrichProperty(property) {
  // 1. Geocode address if lat/long missing
  if (!property.latitude) {
    const coords = await geocodeAddress(property.address);
    property.latitude = coords.lat;
    property.longitude = coords.lng;
  }

  // 2. Get walk score
  const walkScore = await getWalkScore(property.latitude, property.longitude);
  property.location.walkability_score = walkScore;

  // 3. Get school ratings
  const schools = await getSchoolRatings(property.address.zip);
  property.location.school_rating_elementary = schools.elementary;

  // 4. Get crime data
  const crime = await getCrimeData(property.latitude, property.longitude);
  property.location.crime_score = 100 - crime.index;

  // 5. Estimate rental income
  const rental = await getRentalEstimate(property.address);
  property.investment.rental_yield_potential = rental.yield;

  return property;
}
```

### Data Sources for Enrichment

| Data Type | Source | API | Cost |
|-----------|--------|-----|------|
| **Geocoding** | Google Maps | Yes | Free 25k/mo |
| **Walkability** | WalkScore | Yes | Free 5k/day |
| **Schools** | GreatSchools | Yes | Free |
| **Crime** | CrimeReports | Scrape | Free |
| **Demographics** | Census.gov | Yes | Free |
| **Flood Risk** | FEMA | Yes | Free |
| **Rental Estimates** | Rentcast | Yes | $29/mo |
| **Market Data** | Zillow/Redfin | Scrape | Free |

---

## 10. Data Validation

### Required Field Validation

```javascript
function validateProperty(property) {
  const errors = [];

  // Must have address
  if (!property.address?.street || !property.address?.city) {
    errors.push('Address is required');
  }

  // Must have price
  if (!property.price?.current || property.price.current <= 0) {
    errors.push('Valid price is required');
  }

  // Must have basic physical details
  if (!property.property_physical?.bedrooms) {
    errors.push('Bedroom count is required');
  }

  if (!property.property_physical?.bathrooms) {
    errors.push('Bathroom count is required');
  }

  return errors;
}
```

### Data Quality Score

```javascript
function calculateDataQuality(property) {
  let score = 0;
  let max = 0;

  // Check all 100 variables
  for (const [category, variables] of Object.entries(VARIABLE_SYSTEM)) {
    for (const [varName, config] of Object.entries(variables)) {
      max++;
      if (getPropertyValue(property, varName) !== null) {
        score++;
      }
    }
  }

  return {
    percentage: (score / max) * 100,
    missing: max - score,
    message: score > 80 ? 'Excellent' : score > 50 ? 'Good' : 'Fair'
  };
}
```

---

## Summary

CLUES™ supports comprehensive data import:

✅ **Manual Entry**: For individual properties
✅ **CSV/JSON**: For bulk imports
✅ **MLS Integration**: For automated feeds
✅ **Third-Party APIs**: For enrichment
✅ **Web Scraping**: For supplemental data
✅ **Bulk Upload**: For large datasets

**Recommended Workflow**:
1. Start with CSV import of existing listings
2. Enrich with WalkScore, school ratings
3. Set up MLS feed for new listings
4. Add manual entries during property tours
5. Export to JSON for backup

**Next Steps**:
1. Choose primary data source (CSV/MLS)
2. Create import script if needed
3. Test with 10 properties
4. Import full dataset
5. Verify scoring accuracy
6. Begin using enhancements

---

**Document Version**: 1.0.0
**Last Updated**: November 2025
**Contact**: data@clues-app.com (placeholder)
