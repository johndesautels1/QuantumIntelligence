# MLS Integration Guide - TODO When MLS Key Available

## 🎯 Overview
This guide provides step-by-step instructions for integrating your MLS data feed into the CLUES™ Quantum Property Intelligence System.

---

## 📋 Pre-Integration Checklist

### What You Need:
- [ ] MLS API Key/Credentials
- [ ] MLS API Documentation URL
- [ ] MLS Provider Name (e.g., STELLAR MLS, Bright MLS, RESO, etc.)
- [ ] API Endpoint URLs
- [ ] Rate Limits (requests per minute/hour)
- [ ] Photo Server URLs (if separate from main API)

---

## 🔧 Step 1: Store MLS Credentials Securely

### Create Environment Configuration File:
**File:** `C:\Users\broke\CLUES_Quantum_App\.env`

```env
# MLS API Configuration
MLS_API_KEY=your_mls_api_key_here
MLS_CLIENT_ID=your_client_id_here
MLS_CLIENT_SECRET=your_client_secret_here
MLS_API_BASE_URL=https://api.mlsprovider.com/v1
MLS_PHOTO_BASE_URL=https://photos.mlsprovider.com
MLS_PROVIDER=STELLAR_MLS
MLS_RATE_LIMIT=60
```

### Add to .gitignore:
```bash
# In .gitignore file
.env
*.env
```

---

## 🔌 Step 2: Create MLS Data Adapter

### Create File: `src/mls-adapter.js`

```javascript
/**
 * CLUES™ MLS Data Adapter
 * Fetches property data and photos from MLS API
 */

class MLSAdapter {
    constructor() {
        this.apiKey = process.env.MLS_API_KEY || 'YOUR_KEY_HERE';
        this.baseUrl = process.env.MLS_API_BASE_URL || 'https://api.mlsprovider.com/v1';
        this.photoBaseUrl = process.env.MLS_PHOTO_BASE_URL || 'https://photos.mlsprovider.com';
    }

    /**
     * Fetch property details by MLS number
     * @param {string} mlsNumber - MLS listing number
     * @returns {Promise<Object>} Property data
     */
    async getPropertyByMLSNumber(mlsNumber) {
        try {
            const response = await fetch(`${this.baseUrl}/properties/${mlsNumber}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`MLS API Error: ${response.status}`);
            }

            const data = await response.json();
            return this.transformMLSData(data);
        } catch (error) {
            console.error('Failed to fetch MLS property:', error);
            return null;
        }
    }

    /**
     * Fetch property photos
     * @param {string} mlsNumber - MLS listing number
     * @returns {Promise<Array>} Array of photo URLs
     */
    async getPropertyPhotos(mlsNumber) {
        try {
            const response = await fetch(`${this.photoBaseUrl}/${mlsNumber}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.photos || [];
        } catch (error) {
            console.error('Failed to fetch MLS photos:', error);
            return [];
        }
    }

    /**
     * Transform MLS API data to CLUES property format
     * @param {Object} mlsData - Raw MLS API response
     * @returns {Object} CLUES-formatted property
     */
    transformMLSData(mlsData) {
        return {
            property_id: `PROP_${mlsData.ListingKey || Date.now()}`,
            mls_number: mlsData.ListingKey,

            // Address
            address: {
                street: mlsData.StreetNumber + ' ' + mlsData.StreetName,
                city: mlsData.City,
                state: mlsData.StateOrProvince,
                zip: mlsData.PostalCode,
                full_address: mlsData.UnparsedAddress,
                latitude: mlsData.Latitude,
                longitude: mlsData.Longitude
            },

            // Price
            price: {
                current: mlsData.ListPrice,
                original: mlsData.OriginalListPrice,
                history: []
            },

            // Physical details
            bedrooms: mlsData.BedroomsTotal,
            bathrooms: {
                total: mlsData.BathroomsTotalInteger + (mlsData.BathroomsHalf * 0.5),
                full: mlsData.BathroomsFull,
                half: mlsData.BathroomsHalf
            },
            square_feet: {
                living: mlsData.LivingArea,
                lot: mlsData.LotSizeSquareFeet
            },
            year_built: mlsData.YearBuilt,
            property_type: mlsData.PropertyType?.toLowerCase().replace(' ', '_'),

            // Financial
            hoa_fee: mlsData.AssociationFee,
            tax_annual_amount: mlsData.TaxAnnualAmount,

            // Status
            status: {
                current: mlsData.StandardStatus?.toLowerCase(),
                mls_status: mlsData.MlsStatus
            },
            days_on_market: {
                current: mlsData.DaysOnMarket,
                cumulative: mlsData.CumulativeDaysOnMarket
            },

            // Photos
            photos: mlsData.Media?.map(m => m.MediaURL) || [],

            // Additional MLS fields
            features: {
                interior: mlsData.InteriorFeatures || [],
                exterior: mlsData.ExteriorFeatures || [],
                appliances: mlsData.Appliances || []
            },
            parking: {
                spaces: mlsData.ParkingTotal,
                type: mlsData.ParkingFeatures
            },

            // Timestamps
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            mls_updated_at: mlsData.ModificationTimestamp
        };
    }

    /**
     * Search properties by criteria
     * @param {Object} criteria - Search parameters
     * @returns {Promise<Array>} Array of properties
     */
    async searchProperties(criteria) {
        const params = new URLSearchParams({
            City: criteria.city || '',
            MinPrice: criteria.minPrice || '',
            MaxPrice: criteria.maxPrice || '',
            BedroomsTotal: criteria.bedrooms || '',
            StandardStatus: 'Active',
            limit: criteria.limit || 50
        });

        try {
            const response = await fetch(`${this.baseUrl}/properties?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`MLS API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.value?.map(prop => this.transformMLSData(prop)) || [];
        } catch (error) {
            console.error('Failed to search MLS properties:', error);
            return [];
        }
    }
}

// Create singleton instance
const mlsAdapter = new MLSAdapter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLSAdapter;
}
```

---

## 🔄 Step 3: Update Property Import to Use MLS

### Modify `src/enhancement_1_quantum_explorer.html`

Add this at the top of the script section:

```javascript
// Import MLS Adapter
const mlsAdapter = new MLSAdapter();
```

Update the property loading function to enrich with MLS data:

```javascript
async function loadPropertiesWithMLSData() {
    // Get properties from database
    const properties = await sharedDataAdapter.getAllProperties();

    // Enrich each property with MLS photos and latest data
    const enrichedProperties = await Promise.all(
        properties.map(async (prop) => {
            if (prop.mls_number) {
                // Fetch latest MLS data
                const mlsData = await mlsAdapter.getPropertyByMLSNumber(prop.mls_number);

                if (mlsData) {
                    // Merge MLS data with existing property
                    return { ...prop, ...mlsData };
                }
            }
            return prop;
        })
    );

    return enrichedProperties;
}
```

---

## 📸 Step 4: Update Modal to Display MLS Photos

### In `openPropertyModal()` function:

The code is already set up! It checks for `fullProperty.photos[0]` automatically.

When MLS data is loaded with photos array, they will display automatically.

To show multiple photos (carousel/gallery):

```javascript
// Replace the single photo display with:
imagesContainer.innerHTML = `
    ${mlsPhotoUrl ?
        fullProperty.photos.slice(0, 6).map(photoUrl => `
            <img src="${photoUrl}"
                 class="property-image"
                 alt="Property Photo"
                 onclick="openPhotoViewer('${photoUrl}')"
                 onerror="this.style.display='none'">
        `).join('')
    : ''}
    <!-- Street View as fallback -->
    <img src="${streetViewUrl}" class="property-image" alt="Street View">
`;
```

---

## 🔄 Step 5: Set Up Automatic MLS Sync

### Create Sync Script: `src/sync-mls.js`

```javascript
/**
 * MLS Data Sync Script
 * Runs periodically to update property data from MLS
 */

async function syncMLSData() {
    console.log('🔄 Starting MLS sync...');

    const mlsAdapter = new MLSAdapter();
    const dataManager = await (new DataManager()).init();

    // Get all properties with MLS numbers
    const properties = await dataManager.getAllProperties();

    let updated = 0;
    let errors = 0;

    for (const property of properties) {
        if (property.mls_number) {
            try {
                // Fetch latest MLS data
                const mlsData = await mlsAdapter.getPropertyByMLSNumber(property.mls_number);

                if (mlsData) {
                    // Update property in database
                    await dataManager.updateProperty(property.property_id, mlsData);
                    updated++;
                }

                // Respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to sync ${property.mls_number}:`, error);
                errors++;
            }
        }
    }

    console.log(`✅ MLS sync complete: ${updated} updated, ${errors} errors`);
}

// Run sync every 6 hours
setInterval(syncMLSData, 6 * 60 * 60 * 1000);

// Run on page load
syncMLSData();
```

---

## 📝 Step 6: Update CSV Import to Include MLS Numbers

### Modify CSV format to include MLS numbers:

**File: `CSV_FORMAT.txt`** - Already includes `mls_number` column ✅

When importing CSV, the system will:
1. Import basic property data
2. Use MLS number to fetch full details + photos from MLS API
3. Store everything in IndexedDB

---

## 🧪 Step 7: Testing MLS Integration

### Test Checklist:

1. **API Connection:**
```javascript
// Test in browser console:
const test = await mlsAdapter.getPropertyByMLSNumber('TB8441001');
console.log(test);
```

2. **Photo Fetching:**
```javascript
const photos = await mlsAdapter.getPropertyPhotos('TB8441001');
console.log(photos);
```

3. **Property Search:**
```javascript
const results = await mlsAdapter.searchProperties({
    city: 'Saint Pete Beach',
    minPrice: 500000,
    maxPrice: 2000000
});
console.log(results);
```

4. **Modal Display:**
   - Click a property label in 5D Explorer
   - Verify MLS photos appear
   - Check all property details populate correctly

---

## 🚨 Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Some MLS APIs block browser requests
- **Solution:** Create a simple proxy server in `src/proxy-server.js`:

```javascript
// Simple Node.js proxy (if needed)
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/api/mls/*', async (req, res) => {
    const mlsUrl = req.params[0];
    const response = await fetch(`https://api.mlsprovider.com/${mlsUrl}`, {
        headers: { 'Authorization': `Bearer ${process.env.MLS_API_KEY}` }
    });
    const data = await response.json();
    res.json(data);
});

app.listen(3000);
```

**2. Rate Limiting:**
- Add delays between requests
- Cache MLS data in IndexedDB
- Use the sync script (Step 5) instead of real-time fetching

**3. Photo URLs Not Loading:**
- Check if photos require authentication
- Verify photo URLs are public
- Add auth headers to photo requests if needed

---

## 📊 Field Mapping Reference

### MLS Standard Fields → CLUES Fields:

| MLS Field | CLUES Field |
|-----------|-------------|
| `ListingKey` | `mls_number` |
| `ListPrice` | `price.current` |
| `StreetNumber + StreetName` | `address.street` |
| `City` | `address.city` |
| `BedroomsTotal` | `bedrooms` |
| `BathroomsTotalInteger` | `bathrooms.total` |
| `LivingArea` | `square_feet.living` |
| `YearBuilt` | `year_built` |
| `Media[].MediaURL` | `photos[]` |
| `AssociationFee` | `hoa_fee` |
| `TaxAnnualAmount` | `tax_annual_amount` |
| `DaysOnMarket` | `days_on_market.current` |

---

## ✅ Final Checklist

Before going live with MLS integration:

- [ ] MLS API credentials stored securely in `.env`
- [ ] `.env` added to `.gitignore`
- [ ] `mls-adapter.js` created and tested
- [ ] Property modal displays MLS photos
- [ ] All property details populate correctly
- [ ] Sync script configured (optional)
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Test with at least 5 different properties
- [ ] Verify photos load on modal
- [ ] Check all 4 listing site buttons work (Zillow, Realtor, Redfin, Compass)

---

## 🎉 You're Ready!

Once you have your MLS key:
1. Follow this guide step by step
2. Start with Step 1 (credentials)
3. Create `mls-adapter.js` (Step 2)
4. Test connection (Step 7)
5. Watch the magic happen!

**The modal is already 100% wired and ready - just plug in the data!**

---

## 📞 Need Help?

If you encounter issues:
1. Check MLS API documentation
2. Review console errors
3. Test API endpoints with Postman first
4. Verify API key permissions
5. Check rate limits haven't been exceeded

**Current Status:** All UI components ready ✅ | Waiting for MLS API key 🔑
