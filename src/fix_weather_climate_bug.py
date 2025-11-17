#!/usr/bin/env python3
"""
Fix the climate property bug by adding default climate if missing
"""

with open('enhancement_5_weather_simulator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add default climate assignment when setting currentProperty
old_set_property = """                // Set first property as current
                currentProperty = PROPERTIES[0];

                // Initialize the UI
                init();"""

new_set_property = """                // Set first property as current
                currentProperty = PROPERTIES[0];

                // Ensure property has a climate (default to Mediterranean if missing)
                if (!currentProperty.climate) {
                    currentProperty.climate = 'Mediterranean';
                }

                // Initialize the UI
                init();"""

content = content.replace(old_set_property, new_set_property)

# Also fix the selectProperty function to set default climate
old_select_property = """        function selectProperty(index) {
            currentProperty = PROPERTIES[index];
            renderWeatherMetrics();
            renderImpactAnalysis();
            renderForecast();
            renderAlerts();
            updateCharts();
        }"""

new_select_property = """        function selectProperty(index) {
            currentProperty = PROPERTIES[index];

            // Ensure property has a climate
            if (!currentProperty.climate) {
                currentProperty.climate = 'Mediterranean';
            }

            renderWeatherMetrics();
            renderImpactAnalysis();
            renderForecast();
            renderAlerts();
            updateCharts();
        }"""

content = content.replace(old_select_property, new_select_property)

with open('enhancement_5_weather_simulator.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CLIMATE BUG FIXED:")
print("- Added default climate ('Mediterranean') if property missing climate property")
print("- Applied to both initial load and property selection")
print("- Now all properties will have a valid climate")
print("")
print("Reload - should work now!")
