# CLUES™ Property Data Schema

**Complete Data Structure for Property Intelligence System**

---

## 📋 Full Property Schema

```json
{
  // ===== METADATA =====
  "id": "string (unique)",              // Generated: prop_1234567890_abc123
  "source": "string",                   // csv_import | json_import | zillow_scrape | mls_rets | manual_entry
  "importDate": "ISO 8601 datetime",    // 2025-11-15T00:00:00.000Z
  "lastModified": "ISO 8601 datetime",
  "score": "number (0-100)",            // Calculated by scoring engine
  "qualityScore": "number (0-100)",     // Data completeness score

  // ===== BASIC PROPERTY INFO =====
  "basic": {
    "address": "string (required)",              // Full street address
    "bedrooms": "number",                        // Integer: 0-50
    "bathrooms": "number",                       // Float: 0-50 (allows .5)
    "squareFeet": "number",                      // Integer: 100-1000000
    "lotSize": "number",                         // Integer in square feet
    "yearBuilt": "number",                       // Integer: 1800-2027
    "propertyType": "string",                    // Single Family | Condo | Townhouse | Multi-Family | Land | Commercial
    "description": "string",                     // Full text description
    "mlsNumber": "string",                       // MLS listing ID
    "listingUrl": "string",                      // Source URL
    "stories": "number",                         // Number of floors
    "units": "number",                           // For multi-family (number of units)
    "constructionType": "string",                // Wood frame | Concrete | Steel | Brick
    "architecture": "string"                     // Modern | Craftsman | Victorian | Ranch | etc.
  },

  // ===== FINANCIAL DATA =====
  "financial": {
    "listingPrice": "number (required)",         // Current asking price
    "originalPrice": "number",                   // Initial listing price
    "pricePerSqFt": "number",                    // Calculated: price / sqft
    "daysOnMarket": "number",                    // Days since listed
    "hoaFees": "number",                         // Monthly HOA fees
    "annualTaxes": "number",                     // Annual property tax
    "taxYear": "number",                         // Tax assessment year
    "insurance": "number",                       // Estimated annual insurance
    "utilities": "number",                       // Estimated monthly utilities
    "maintenance": "number",                     // Estimated annual maintenance
    "appreciation": "number",                    // Annual appreciation % (e.g., 5.2)
    "rentalIncome": "number",                    // Monthly rental potential
    "capRate": "number",                         // Cap rate % for investors
    "cashFlow": "number",                        // Monthly cash flow
    "roi": "number",                             // Return on investment %
    "downPayment": "number",                     // Required down payment
    "monthlyPayment": "number",                  // Estimated mortgage payment
    "closingCosts": "number",                    // Estimated closing costs
    "priceHistory": [                            // Price change history
      {
        "date": "ISO 8601 datetime",
        "price": "number",
        "event": "string"                        // Listed | Price cut | Relisted
      }
    ]
  },

  // ===== LOCATION DATA =====
  "location": {
    "city": "string",                            // City name
    "state": "string",                           // State code (CA, TX, etc.)
    "zipCode": "string",                         // ZIP code
    "county": "string",                          // County name
    "neighborhood": "string",                    // Neighborhood/district name
    "latitude": "number",                        // GPS latitude
    "longitude": "number",                       // GPS longitude
    "timezone": "string",                        // IANA timezone (America/Los_Angeles)
    "elevation": "number",                       // Elevation in feet
    "walkScore": "number (0-100)",               // Walk Score API
    "transitScore": "number (0-100)",            // Transit Score API
    "bikeScore": "number (0-100)",               // Bike Score API
    "distanceToDowntown": "number",              // Miles to city center
    "distanceToBeach": "number",                 // Miles to nearest beach
    "distanceToAirport": "number",               // Miles to nearest airport
    "zoning": "string",                          // Zoning classification (R1, C2, etc.)
    "floodZone": "string",                       // FEMA flood zone (X, AE, etc.)
    "earthquakeRisk": "string",                  // Low | Moderate | High
    "crimeRate": "number (0-100)",               // Crime index (lower is better)
    "airQuality": "number (0-500)"               // AQI index
  },

  // ===== FEATURES & AMENITIES =====
  "features": {
    // Parking
    "parking": "string",                         // Description: "2-car attached garage"
    "garage": "number",                          // Number of garage spaces
    "carport": "boolean",
    "driveway": "string",                        // Paved | Gravel | None

    // Climate Control
    "cooling": "string",                         // Central AC | Window units | None
    "heating": "string",                         // Forced air | Radiant | Fireplace
    "fireplace": "boolean",
    "fireplaceCount": "number",

    // Water Features
    "pool": "boolean | string",                  // true | false | "Community pool"
    "poolType": "string",                        // In-ground | Above-ground | Infinity
    "spa": "boolean",
    "hotTub": "boolean",

    // Structure
    "basement": "boolean",
    "attic": "boolean",
    "balcony": "boolean",
    "patio": "boolean",
    "deck": "boolean",
    "porch": "boolean",
    "roofDeck": "boolean",

    // Interior
    "hardwoodFloors": "boolean",
    "carpeting": "boolean",
    "tileFloors": "boolean",
    "vaultedCeilings": "boolean",
    "skylights": "boolean",
    "wainscoting": "boolean",
    "crownMolding": "boolean",

    // Kitchen
    "kitchenIsland": "boolean",
    "granitCounters": "boolean",
    "stainlessSteelAppliances": "boolean",
    "gasStove": "boolean",
    "doubleOven": "boolean",
    "dishwasher": "boolean",
    "pantry": "boolean",

    // Bathrooms
    "masterBath": "boolean",
    "jacuzziTub": "boolean",
    "separateShower": "boolean",
    "dualSinks": "boolean",

    // Utilities
    "laundryRoom": "boolean",
    "washerDryer": "boolean",
    "solarPanels": "boolean",
    "tanklessWater": "boolean",
    "wellWater": "boolean",
    "septicTank": "boolean",
    "cityWater": "boolean",
    "citySewer": "boolean",

    // Smart Home
    "smartHome": "boolean",
    "securitySystem": "boolean",
    "cameras": "boolean",
    "smartThermostat": "boolean",
    "smartLocks": "boolean",

    // Outdoor
    "fenced": "boolean",
    "sprinklerSystem": "boolean",
    "landscaping": "string",                     // Professional | Basic | Natural
    "outdoorKitchen": "boolean",
    "guestHouse": "boolean",
    "workshop": "boolean",
    "shed": "boolean",

    // Special
    "oceanView": "boolean",
    "mountainView": "boolean",
    "cityView": "boolean",
    "waterfront": "boolean",
    "gated": "boolean",
    "gatedCommunity": "boolean",
    "communityAmenities": "boolean | string",
    "wineRoom": "boolean",
    "theater": "boolean",
    "gym": "boolean",
    "sauna": "boolean",
    "elevator": "boolean",
    "wheelchairAccessible": "boolean",

    // Additional
    "originalDetails": "boolean",                // Has original/historic details
    "recentRenovation": "boolean",
    "energyEfficient": "boolean",
    "ecoFriendly": "boolean"
  },

  // ===== CONDITION & QUALITY =====
  "condition": {
    "overall": "string",                         // Mint | Excellent | Very Good | Good | Fair | Poor
    "roof": "string",                            // New | Good | Needs repair | Replace soon
    "roofAge": "number",                         // Years since last replaced
    "foundation": "string",                      // Excellent | Good | Minor issues | Major issues
    "exterior": "string",                        // Excellent | Good | Needs paint | Needs repair
    "interior": "string",                        // Remodeled | Updated | Original | Dated
    "flooring": "string",                        // New | Good | Fair | Poor
    "windows": "string",                         // New | Double-pane | Single-pane | Needs replacement
    "plumbing": "string",                        // New | Good | Old | Issues
    "electrical": "string",                      // Updated | Good | Outdated | Needs upgrade
    "hvac": "string",                            // New | Good | Old | Needs replacement
    "hvacAge": "number",                         // Years since installed
    "appliances": "string",                      // New | Good | Fair | Old
    "lastRenovated": "number",                   // Year of last major renovation
    "inspectionDate": "ISO 8601 datetime",
    "inspectionIssues": "array of strings",      // List of issues found
    "repairsNeeded": "array of objects",         // Detailed repair list
    "estimatedRepairCost": "number"              // Total estimated repair costs
  },

  // ===== SCHOOL DATA =====
  "schools": {
    "elementary": {
      "name": "string",
      "rating": "number (0-10)",                 // GreatSchools rating
      "distance": "number",                      // Miles from property
      "type": "string"                           // Public | Private | Charter
    },
    "middle": {
      "name": "string",
      "rating": "number (0-10)",
      "distance": "number",
      "type": "string"
    },
    "high": {
      "name": "string",
      "rating": "number (0-10)",
      "distance": "number",
      "type": "string"
    },
    "averageRating": "number (0-10)",            // Average of all school ratings
    "district": "string"                         // School district name
  },

  // ===== MARKET DATA =====
  "market": {
    "medianPrice": "number",                     // Median price in neighborhood
    "pricePerSqFtMarket": "number",              // Market average price/sqft
    "daysOnMarketAvg": "number",                 // Average DOM in area
    "inventory": "number",                       // Number of active listings nearby
    "absorption": "number",                      // Months of inventory
    "appreciation1yr": "number",                 // 1-year appreciation %
    "appreciation3yr": "number",                 // 3-year appreciation %
    "appreciation5yr": "number",                 // 5-year appreciation %
    "forecastedAppreciation": "number",          // Predicted next year %
    "demandScore": "number (0-100)",             // Market demand indicator
    "competitiveness": "string",                 // Very Hot | Hot | Warm | Cool | Cold
    "comparables": [                             // Recent comparable sales
      {
        "address": "string",
        "soldPrice": "number",
        "soldDate": "ISO 8601 datetime",
        "squareFeet": "number",
        "similarity": "number (0-100)"           // How similar to this property
      }
    ]
  },

  // ===== ENVIRONMENTAL =====
  "environmental": {
    "solarPotential": "number (0-100)",          // Solar generation potential
    "treeCanopy": "number (%)",                  // Tree coverage percentage
    "greenSpace": "number",                      // Acres of parks within 1 mile
    "noiseLevel": "string",                      // Quiet | Moderate | Noisy
    "lightPollution": "string",                  // Low | Moderate | High
    "nearbyIndustry": "boolean",
    "nearbyHighway": "boolean",
    "distanceToHighway": "number",               // Miles
    "nearbyPowerLines": "boolean",
    "radonLevel": "string",                      // Low | Moderate | High
    "leadPaint": "boolean",
    "asbestos": "boolean",
    "mold": "boolean"
  },

  // ===== LEGAL & OWNERSHIP =====
  "legal": {
    "ownerName": "string",
    "ownerType": "string",                       // Individual | Corporation | Trust | Bank
    "taxID": "string",                           // Tax parcel ID
    "legalDescription": "string",
    "lotNumber": "string",
    "subdivision": "string",
    "deed": "string",                            // Warranty | Quitclaim | etc.
    "easements": "array of strings",
    "liens": "array of objects",
    "restrictions": "array of strings",          // HOA restrictions, covenants
    "permits": "array of objects",               // Building permits
    "variances": "array of objects",
    "titleClean": "boolean"
  },

  // ===== IMAGES & MEDIA =====
  "media": {
    "photos": [
      {
        "url": "string",
        "caption": "string",
        "order": "number",
        "type": "string"                         // Exterior | Interior | Kitchen | etc.
      }
    ],
    "virtualTour": "string (URL)",
    "videoTour": "string (URL)",
    "floorPlan": "string (URL)",
    "aerialView": "string (URL)",
    "streetView": "string (URL)"
  },

  // ===== AGENT & LISTING INFO =====
  "listing": {
    "agentName": "string",
    "agentPhone": "string",
    "agentEmail": "string",
    "brokerageName": "string",
    "listingDate": "ISO 8601 datetime",
    "expirationDate": "ISO 8601 datetime",
    "status": "string",                          // Active | Pending | Sold | Expired | Withdrawn
    "showingInstructions": "string",
    "lockboxCode": "string",
    "privateRemarks": "string",
    "publicRemarks": "string",
    "disclosures": "array of strings",
    "openHouses": [
      {
        "date": "ISO 8601 datetime",
        "startTime": "string",
        "endTime": "string"
      }
    ]
  },

  // ===== BUYER PROFILE SCORES =====
  "buyerScores": {
    "investor": "number (0-100)",                // Score for investor profile
    "family": "number (0-100)",                  // Score for family profile
    "luxury": "number (0-100)",                  // Score for luxury profile
    "firstTimeBuyer": "number (0-100)",          // Score for first-time buyer
    "downsizer": "number (0-100)",               // Score for downsizer
    "balanced": "number (0-100)"                 // Score for balanced profile
  },

  // ===== ANALYTICS & PREDICTIONS =====
  "analytics": {
    "predictedPrice": "number",                  // AI-predicted fair market value
    "predictedPriceRange": {
      "low": "number",
      "high": "number"
    },
    "isOverpriced": "boolean",
    "isPriceReduced": "boolean",
    "isGoodDeal": "boolean",
    "investmentGrade": "string",                 // A+ | A | B | C | D | F
    "riskLevel": "string",                       // Low | Medium | High
    "liquidityScore": "number (0-100)",          // How quickly it will sell
    "sellProbability": "number (0-100)",         // Chance of selling in 30 days
    "competitiveAdvantage": "array of strings",  // What makes it stand out
    "weaknesses": "array of strings",            // What could be improved
    "opportunities": "array of strings",         // Market opportunities
    "threats": "array of strings"                // Market risks
  },

  // ===== CUSTOM FIELDS =====
  "custom": {
    // User can add any custom fields here
    "notes": "string",
    "tags": "array of strings",
    "category": "string",
    "priority": "number (1-5)",
    "followUpDate": "ISO 8601 datetime",
    "clientId": "string",
    "portfolioId": "string",
    "favorite": "boolean",
    "hidden": "boolean"
  }
}
```

---

## 📊 Schema Categories Summary

| Category | Fields | Description |
|----------|--------|-------------|
| **Metadata** | 5 | IDs, timestamps, scores |
| **Basic** | 12 | Core property info |
| **Financial** | 20 | Pricing, taxes, ROI |
| **Location** | 18 | Address, GPS, scores |
| **Features** | 60+ | Amenities, special features |
| **Condition** | 15 | Quality, repairs, age |
| **Schools** | 13 | School ratings, distances |
| **Market** | 12 | Comps, trends, demand |
| **Environmental** | 13 | Green, noise, hazards |
| **Legal** | 10 | Ownership, liens, permits |
| **Media** | 6 | Photos, tours, plans |
| **Listing** | 12 | Agent info, showings |
| **Buyer Scores** | 6 | Profile-specific scores |
| **Analytics** | 12 | Predictions, AI insights |
| **Custom** | Unlimited | User-defined fields |

**Total: 200+ possible fields**
**Required: Only 2** (address, listingPrice)

---

## 🎯 Minimal Valid Property

```json
{
  "id": "prop_12345",
  "source": "manual_entry",
  "importDate": "2025-11-15T00:00:00.000Z",
  "basic": {
    "address": "123 Main St"
  },
  "financial": {
    "listingPrice": 500000
  },
  "location": {},
  "features": {},
  "condition": {}
}
```

---

## 📥 Import Format Examples

### CSV Column Names (Auto-Detected)
- address, street, location, property address
- city, town
- state, province
- zip, postal, zipcode
- price, listing price, asking price
- bed, bedroom, beds, br
- bath, bathroom, baths, ba
- sqft, square feet, sq ft, area
- lot, lot size, land
- year, year built, built

### JSON Formats Supported
1. **CLUES™ Full Schema** (above)
2. **MLS Standard** (RETS/RESO)
3. **Zillow Format**
4. **Realtor.com Format**
5. **Generic Object** (auto-normalized)

---

**This is the complete CLUES™ property data schema.**
**Use it for imports, integrations, and custom development.**
