/**
 * 🔍 PROPERTY SEARCH WIDGET
 * Frontend UI for Method B - Neighborhood Auto-Search
 *
 * Usage: Include in Holographic Sphere HTML:
 * <script src="lib/property-search-widget.js"></script>
 * Then call: PropertySearchWidget.init();
 */

export class PropertySearchWidget {
    constructor(apiBaseUrl = '') {
        this.apiBaseUrl = apiBaseUrl || (
            window.location.hostname === 'localhost'
                ? 'http://localhost:3000'
                : 'https://quantumintelligence.vercel.app'
        );

        this.isSearching = false;
    }

    /**
     * Initialize the search widget UI
     */
    init() {
        // Create search widget HTML
        const widgetHtml = `
        <div id="property-search-widget" class="search-widget">
            <button onclick="PropertySearchWidget.toggle()" class="search-toggle-btn">
                🏠 HOME SEARCH
            </button>

            <div id="search-panel" class="search-panel" style="display:none;">
                <div class="search-header">
                    <h3>🔍 Find Properties in Your Neighborhood</h3>
                    <button onclick="PropertySearchWidget.toggle()" class="close-btn">×</button>
                </div>

                <div class="search-body">
                    <div class="search-example">
                        Example: "Belle Vista, St Pete Beach, FL 33706"
                    </div>

                    <input type="text"
                           id="neighborhood-input"
                           placeholder="Enter neighborhood, city, state, zip..."
                           class="search-input">

                    <div class="search-filters">
                        <label>
                            Number of properties:
                            <select id="limit-select">
                                <option value="3" selected>3 properties</option>
                                <option value="5">5 properties</option>
                                <option value="10">10 properties</option>
                            </select>
                        </label>
                    </div>

                    <button onclick="PropertySearchWidget.search()"
                            id="search-btn"
                            class="search-btn">
                        🔍 Search Properties
                    </button>

                    <div id="search-status" class="search-status"></div>

                    <div id="search-results" class="search-results"></div>
                </div>
            </div>
        </div>

        <style>
            /* Desktop: Position above Property A/B/C selectors */
            .search-widget {
                position: fixed;
                top: 140px; /* Below header, above property selectors */
                left: 50%;
                transform: translateX(-50%);
                z-index: 500;
            }

            .search-toggle-btn {
                /* History Timeline color: purple/cyan gradient */
                background: linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(0, 212, 255, 0.6));
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-size: 0.9em;
                font-weight: bold;
                cursor: pointer;
                box-shadow: inset 0 2px 4px rgba(138, 43, 226, 0.3), 0 3px 12px rgba(138, 43, 226, 0.4);
                transition: all 0.3s ease;
                min-width: 220px;
            }

            .search-toggle-btn:hover {
                transform: translateY(-2px);
                box-shadow: inset 0 2px 4px rgba(138, 43, 226, 0.3), 0 5px 15px rgba(138, 43, 226, 0.6);
            }

            /* Mobile: Position below header, above Analytics Dashboard */
            @media (max-width: 768px) {
                .search-widget {
                    position: fixed;
                    top: 85px; /* Below header on mobile */
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 600;
                }

                .search-toggle-btn {
                    min-width: 200px;
                    padding: 8px 16px;
                    font-size: 0.85em;
                }
            }

            @media (max-width: 480px) {
                .search-widget {
                    top: 75px;
                }

                .search-toggle-btn {
                    min-width: 180px;
                    padding: 8px 14px;
                    font-size: 0.8em;
                }
            }

            /* Desktop: Panel opens downward (button is at top) */
            .search-panel {
                position: absolute;
                top: 50px; /* Opens below the button */
                left: 50%;
                transform: translateX(-50%) scale(0.91);
                transform-origin: top center;
                width: 380px;
                background: rgba(20, 20, 40, 0.95);
                border: 2px solid rgba(138, 43, 226, 0.5);
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
            }

            /* Mobile: Panel opens downward too */
            @media (max-width: 768px) {
                .search-panel {
                    width: 320px;
                    top: 45px;
                }
            }

            @media (max-width: 480px) {
                .search-panel {
                    width: 280px;
                    top: 40px;
                }
            }

            .search-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(0, 212, 255, 0.3);
            }

            .search-header h3 {
                margin: 0;
                color: #FFD700;
                font-size: 18px;
            }

            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 32px;
                height: 32px;
            }

            .search-body {
                padding: 20px;
            }

            .search-example {
                color: rgba(255, 255, 255, 0.6);
                font-size: 12px;
                margin-bottom: 10px;
                font-style: italic;
            }

            .search-input {
                width: 100%;
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                color: white;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .search-input:focus {
                outline: none;
                border-color: #00D4FF;
                box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
            }

            .search-filters {
                margin-bottom: 15px;
            }

            .search-filters label {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                display: block;
            }

            .search-filters select {
                margin-top: 5px;
                width: 100%;
                padding: 8px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                color: white;
                font-size: 14px;
            }

            .search-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .search-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
            }

            .search-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .search-status {
                margin-top: 15px;
                padding: 10px;
                border-radius: 4px;
                font-size: 14px;
                text-align: center;
            }

            .search-status.loading {
                background: rgba(0, 212, 255, 0.2);
                color: #00D4FF;
                border: 1px solid rgba(0, 212, 255, 0.5);
            }

            .search-status.success {
                background: rgba(76, 175, 80, 0.2);
                color: #4CAF50;
                border: 1px solid rgba(76, 175, 80, 0.5);
            }

            .search-status.error {
                background: rgba(244, 67, 54, 0.2);
                color: #F44336;
                border: 1px solid rgba(244, 67, 54, 0.5);
            }

            .search-results {
                margin-top: 15px;
                max-height: 400px;
                overflow-y: auto;
            }

            .property-result {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .property-result:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #00D4FF;
                transform: translateX(5px);
            }

            .property-result h4 {
                margin: 0 0 5px 0;
                color: #FFD700;
                font-size: 14px;
            }

            .property-result .price {
                color: #4CAF50;
                font-size: 16px;
                font-weight: bold;
                margin: 5px 0;
            }

            .property-result .details {
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
            }

            @media (max-width: 768px) {
                .search-panel {
                    width: calc(100vw - 40px);
                    right: -10px;
                }
            }
        </style>
        `;

        // Insert widget into page
        document.body.insertAdjacentHTML('beforeend', widgetHtml);

        // Add enter key support
        document.getElementById('neighborhood-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                PropertySearchWidget.search();
            }
        });

        console.log('✅ Property Search Widget initialized');
    }

    /**
     * Toggle search panel visibility
     */
    static toggle() {
        const panel = document.getElementById('search-panel');
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';

        if (!isVisible) {
            document.getElementById('neighborhood-input').focus();
        }
    }

    /**
     * Perform neighborhood search
     */
    static async search() {
        const input = document.getElementById('neighborhood-input').value.trim();
        const limit = parseInt(document.getElementById('limit-select').value);
        const statusDiv = document.getElementById('search-status');
        const resultsDiv = document.getElementById('search-results');
        const searchBtn = document.getElementById('search-btn');

        // Validate input
        if (!input) {
            statusDiv.className = 'search-status error';
            statusDiv.textContent = '❌ Please enter a location';
            return;
        }

        // Show loading
        statusDiv.className = 'search-status loading';
        statusDiv.textContent = `🔍 Searching for ${limit} properties in ${input}...`;
        resultsDiv.innerHTML = '';
        searchBtn.disabled = true;

        try {
            // Call backend API - use same origin for Vercel deployment
            const apiUrl = `${window.location.origin}/api/search-properties`;
            console.log('🔍 Calling API:', apiUrl);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location: input, limit: limit })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Search failed');
            }

            const data = await response.json();

            // Show success
            statusDiv.className = 'search-status success';
            statusDiv.textContent = `✅ Found ${data.properties.length} properties! Click to add to comparison.`;

            // Display results
            resultsDiv.innerHTML = data.properties.map((prop, idx) => `
                <div class="property-result" onclick="PropertySearchWidget.selectProperty(${idx}, ${JSON.stringify(prop).replace(/"/g, '&quot;')})">
                    <h4>${String.fromCharCode(65 + idx)}. ${prop.address?.full_address || 'Unknown Address'}</h4>
                    <div class="price">$${prop.price?.current?.toLocaleString() || 'N/A'}</div>
                    <div class="details">
                        ${prop.property?.bedrooms || '?'} bed |
                        ${prop.property?.bathrooms || '?'} bath |
                        ${prop.property?.sqft?.toLocaleString() || '?'} sqft
                    </div>
                </div>
            `).join('');

        } catch (error) {
            statusDiv.className = 'search-status error';
            statusDiv.textContent = `❌ ${error.message}`;
        } finally {
            searchBtn.disabled = false;
        }
    }

    /**
     * Select a property from search results
     */
    static selectProperty(index, property) {
        console.log(`Selected property ${index + 1}:`, property);

        // Check if holographic sphere functions exist
        if (typeof window.selectProperty === 'function') {
            // Use slot A, B, or C based on index
            const slots = ['A', 'B', 'C'];
            const slot = slots[index] || 'A';

            // Create property object in the format expected by holographic sphere
            window[`property${slot}`] = {
                name: property.address?.full_address || `Property ${slot}`,
                price: property.price?.current || 0,
                dimensions: {
                    location: property.dimensions?.location || 70,
                    condition: property.dimensions?.condition || 70,
                    schools: property.dimensions?.schools || 70,
                    safety: property.dimensions?.safety || 70,
                    roi: property.dimensions?.roi || 5,
                    costOfLiving: property.dimensions?.costOfLiving || 70
                },
                coordinates: property.address?.latitude && property.address?.longitude
                    ? [property.address.latitude, property.address.longitude]
                    : null,
                rawData: property
            };

            // Update the property selector
            const selector = document.getElementById(`property-${slot.toLowerCase()}-select`);
            if (selector) {
                selector.value = `property${slot}`;
                window.selectProperty(slot, `property${slot}`);
            }

            console.log(`✅ Property added to slot ${slot}`);

            // Show success message
            const statusDiv = document.getElementById('search-status');
            if (statusDiv) {
                statusDiv.className = 'search-status success';
                statusDiv.textContent = `✅ Property ${index + 1} added to slot ${slot}!`;
            }

        } else {
            console.warn('Holographic sphere selectProperty function not found');
            alert('Property selected! Please ensure Holographic Sphere is loaded.');
        }
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const widget = new PropertySearchWidget();
        widget.init();
        window.PropertySearchWidget = PropertySearchWidget;
    });
} else {
    const widget = new PropertySearchWidget();
    widget.init();
    window.PropertySearchWidget = PropertySearchWidget;
}

export default PropertySearchWidget;
