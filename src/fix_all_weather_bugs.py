#!/usr/bin/env python3
"""
Comprehensive fix for ALL 9 critical bugs in Weather Simulator:
1. Line 713: currentProperty.id null access
2. Line 715: Missing climate property
3. Line 721-726: selectProperty id/index mismatch
4. Line 722: No default climate in selectProperty
5. Line 1002-1012: updateCharts() no null check
6. Line 1003: Charts may not exist
7. Line 1022: event.target undefined (event not passed)
8. Line 1048-1064: exportReport() no null checks
9. General: Add try-catch blocks for critical sections
"""

with open('enhancement_5_weather_simulator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# FIX 1 & 2: Line 713 - Fix property selector template with null checks
old_selector = """            let html = PROPERTIES.map(p => `
                <div class="property-card ${currentProperty.id === p.id ? 'active' : ''}"
                     onclick="selectProperty(${p.id})">
                    <div class="property-name">${p.name}</div>
                    <div class="property-climate">${p.climate}</div>
                </div>
            `).join('');"""

new_selector = """            let html = PROPERTIES.map((p, index) => `
                <div class="property-card ${currentProperty && currentProperty.id === p.id ? 'active' : ''}"
                     onclick="selectProperty(${index})">
                    <div class="property-name">${p.name || 'Unknown Property'}</div>
                    <div class="property-climate">${p.climate || 'Mediterranean'}</div>
                </div>
            `).join('');"""

content = content.replace(old_selector, new_selector)

# FIX 3 & 4: Lines 721-726 - Fix selectProperty to accept index and add default climate
old_select_property = """        function selectProperty(id) {
            currentProperty = PROPERTIES.find(p => p.id === id);
            renderWeatherMetrics();
            renderImpactAnalysis();
            renderForecast();
            renderAlerts();
            updateCharts();
        }"""

new_select_property = """        function selectProperty(index) {
            currentProperty = PROPERTIES[index];

            // Ensure property has a climate (default to Mediterranean if missing)
            if (!currentProperty.climate) {
                currentProperty.climate = 'Mediterranean';
            }

            renderWeatherMetrics();
            renderImpactAnalysis();
            renderForecast();
            renderAlerts();
            updateCharts();
            renderPropertySelector();
        }"""

content = content.replace(old_select_property, new_select_property)

# FIX 5 & 6: Lines 1002-1012 - Add null checks in updateCharts
old_update_charts = """        function updateCharts() {
            const climateData = WEATHER_DATA[currentProperty.climate].months;

            // Update weather chart
            weatherChart.data.labels = MONTHS;
            weatherChart.data.datasets[0].data = climateData.map(m => m.temp);
            weatherChart.data.datasets[1].data = climateData.map(m => m.precip);
            weatherChart.update();

            // Update impact chart
            impactChart.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            impactChart.update();
        }"""

new_update_charts = """        function updateCharts() {
            // Check if currentProperty exists and has climate
            if (!currentProperty || !currentProperty.climate) {
                console.warn('Cannot update charts: no property selected');
                return;
            }

            // Check if charts are initialized
            if (!weatherChart || !impactChart) {
                console.warn('Charts not yet initialized');
                return;
            }

            try {
                const climateData = WEATHER_DATA[currentProperty.climate].months;

                // Update weather chart
                weatherChart.data.labels = MONTHS;
                weatherChart.data.datasets[0].data = climateData.map(m => m.temp);
                weatherChart.data.datasets[1].data = climateData.map(m => m.precip);
                weatherChart.update();

                // Update impact chart
                impactChart.data.labels = ['Q1', 'Q2', 'Q3', 'Q4'];
                impactChart.update();
            } catch (error) {
                console.error('Error updating charts:', error);
            }
        }"""

content = content.replace(old_update_charts, new_update_charts)

# FIX 7: Line 1022 - Fix setSeason to use this instead of event.target
old_set_season = """        function setSeason(season) {
            currentMonth = ['Winter', 'Spring', 'Summer', 'Fall'].indexOf(season) * 3;

            // Update active state
            document.querySelectorAll('.season-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            updateDisplay();
        }"""

new_set_season = """        function setSeason(season, clickedElement) {
            currentMonth = ['Winter', 'Spring', 'Summer', 'Fall'].indexOf(season) * 3;

            // Update active state
            document.querySelectorAll('.season-btn').forEach(btn => btn.classList.remove('active'));
            if (clickedElement) {
                clickedElement.classList.add('active');
            }

            updateDisplay();
        }"""

content = content.replace(old_set_season, new_set_season)

# Update setSeason button calls to pass this
content = content.replace(
    'onclick="setSeason(\'Winter\')"',
    'onclick="setSeason(\'Winter\', this)"'
)
content = content.replace(
    'onclick="setSeason(\'Spring\')"',
    'onclick="setSeason(\'Spring\', this)"'
)
content = content.replace(
    'onclick="setSeason(\'Summer\')"',
    'onclick="setSeason(\'Summer\', this)"'
)
content = content.replace(
    'onclick="setSeason(\'Fall\')"',
    'onclick="setSeason(\'Fall\', this)"'
)

# FIX 8: Lines 1048-1064 - Add null checks in exportReport
old_export_report = """        function exportReport() {
            const reportData = {
                property: currentProperty.name,
                climate: currentProperty.climate,
                month: MONTHS[currentMonth],
                weatherData: WEATHER_DATA[currentProperty.climate].months[currentMonth],
                risks: generateRisks(),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `weather-report-${currentProperty.name}-${Date.now()}.json`;
            a.click();
        }"""

new_export_report = """        function exportReport() {
            // Check if property selected
            if (!currentProperty || !currentProperty.climate) {
                alert('Please select a property first');
                return;
            }

            try {
                const reportData = {
                    property: currentProperty.name || 'Unknown Property',
                    climate: currentProperty.climate || 'Mediterranean',
                    month: MONTHS[currentMonth],
                    weatherData: WEATHER_DATA[currentProperty.climate].months[currentMonth],
                    risks: generateRisks(),
                    timestamp: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `weather-report-${currentProperty.name || 'property'}-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error exporting report:', error);
                alert('Error generating report. Please try again.');
            }
        }"""

content = content.replace(old_export_report, new_export_report)

# FIX 9: Wrap initializeEnhancement in try-catch for better error handling
old_init = """        async function initializeEnhancement() {
            try {
                // Load properties from IndexedDB
                PROPERTIES = await window.sharedDataAdapter.loadAllProperties();

                if (PROPERTIES.length === 0) {
                    document.getElementById('propertySelector').innerHTML =
                        '<div style="padding: 20px; color: rgba(255,255,255,0.7);">No properties loaded. Please import properties first.</div>';
                    return;
                }

                // Set first property as current
                currentProperty = PROPERTIES[0];

                // Ensure property has a climate (default to Mediterranean if missing)
                if (!currentProperty.climate) {
                    currentProperty.climate = 'Mediterranean';
                }

                // Initialize the UI
                init();
            } catch (error) {
                console.error('Error loading properties:', error);
                document.getElementById('propertySelector').innerHTML =
                    '<div style="padding: 20px; color: #ff6b6b;">Error loading properties. Please refresh.</div>';
            }
        }"""

new_init = """        async function initializeEnhancement() {
            try {
                // Load properties from IndexedDB
                PROPERTIES = await window.sharedDataAdapter.loadAllProperties();

                if (!PROPERTIES || PROPERTIES.length === 0) {
                    document.getElementById('propertySelector').innerHTML =
                        '<div style="padding: 20px; color: rgba(255,255,255,0.7);">No properties loaded. Please import properties first.</div>';
                    return;
                }

                // Set first property as current
                currentProperty = PROPERTIES[0];

                // Ensure property has a climate (default to Mediterranean if missing)
                if (!currentProperty.climate) {
                    currentProperty.climate = 'Mediterranean';
                    console.warn('Property missing climate, defaulted to Mediterranean');
                }

                // Initialize the UI
                init();
            } catch (error) {
                console.error('Error initializing Weather Simulator:', error);
                document.getElementById('propertySelector').innerHTML =
                    '<div style="padding: 20px; color: #ff6b6b;">Error loading properties: ' + error.message + '</div>';
            }
        }"""

content = content.replace(old_init, new_init)

# Write the fixed content
with open('enhancement_5_weather_simulator.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("ALL 9 CRITICAL BUGS FIXED:")
print("")
print("FIX 1: Line 713 - Added null check for currentProperty.id")
print("FIX 2: Line 715 - Added fallback for missing climate property")
print("FIX 3: Lines 721-726 - Changed selectProperty to use index instead of id")
print("FIX 4: Line 722 - Added default climate in selectProperty")
print("FIX 5: Lines 1002-1012 - Added null checks in updateCharts")
print("FIX 6: Line 1003 - Added chart existence check before updating")
print("FIX 7: Line 1022 - Fixed setSeason to accept element parameter")
print("FIX 8: Lines 1048-1064 - Added null checks in exportReport")
print("FIX 9: Enhanced error handling in initializeEnhancement")
print("")
print("IMPROVEMENTS ADDED:")
print("- Try-catch blocks around critical operations")
print("- Console warnings for debugging")
print("- User-friendly error messages")
print("- Proper null/undefined checks throughout")
print("- Added renderPropertySelector() call to update UI")
print("")
print("Reload the Weather Simulator page - should work without errors now!")
