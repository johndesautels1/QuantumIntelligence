#!/usr/bin/env python3
"""
Fix JavaScript bug AND modernize Weather Simulator:
1. Fix: Initialize currentProperty properly or add null checks
2. Apply modern UI theme
3. Add bottom navigation toolbar
"""

with open('enhancement_5_weather_simulator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# FIX 1: Add null check in all functions that access currentProperty.climate
functions_to_fix = [
    ('renderWeatherMetrics', 'const data = WEATHER_DATA[currentProperty.climate].months[currentMonth];'),
    ('renderImpactAnalysis', 'const data = WEATHER_DATA[currentProperty.climate].months[currentMonth];'),
    ('renderForecast', 'const data = WEATHER_DATA[currentProperty.climate].months[currentMonth];'),
    ('renderAlerts', 'const data = WEATHER_DATA[currentProperty.climate].months[currentMonth];'),
]

for func_name, old_line in functions_to_fix:
    # Add null check before accessing currentProperty
    old_function_start = f"""        // Render {func_name.replace('render', '').replace('Analysis', ' Analysis').replace('Metrics', ' Metrics').replace('Forecast', '7-Day Forecast').replace('Alerts', 'Alerts')}
        function {func_name}() {{
            const container = document.getElementById"""

    new_function_start = f"""        // Render {func_name.replace('render', '').replace('Analysis', ' Analysis').replace('Metrics', ' Metrics').replace('Forecast', '7-Day Forecast').replace('Alerts', 'Alerts')}
        function {func_name}() {{
            if (!currentProperty || !currentProperty.climate) return;
            const container = document.getElementById"""

    content = content.replace(old_function_start, new_function_start)

# FIX 2: Add null check in initCharts
old_init_charts = """        // Initialize Charts
        function initCharts() {
            // Weather Chart
            const ctx1 = document.getElementById('weatherChart').getContext('2d');
            const climateData = WEATHER_DATA[currentProperty.climate].months;"""

new_init_charts = """        // Initialize Charts
        function initCharts() {
            if (!currentProperty || !currentProperty.climate) return;
            // Weather Chart
            const ctx1 = document.getElementById('weatherChart').getContext('2d');
            const climateData = WEATHER_DATA[currentProperty.climate].months;"""

content = content.replace(old_init_charts, new_init_charts)

# FIX 3: Add null check in updateDisplay
old_update_display = """        // Update Display
        function updateDisplay() {
            document.getElementById('currentMonth').textContent = MONTHS[currentMonth] + ' 2024';

            const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer',
                           'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
            document.getElementById('currentSeason').textContent = seasons[currentMonth];

            renderWeatherMetrics();
        }"""

new_update_display = """        // Update Display
        function updateDisplay() {
            if (!currentProperty) return;
            document.getElementById('currentMonth').textContent = MONTHS[currentMonth] + ' 2024';

            const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer',
                           'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
            document.getElementById('currentSeason').textContent = seasons[currentMonth];

            renderWeatherMetrics();
        }"""

content = content.replace(old_update_display, new_update_display)

# Now apply modernization (same as before)
# 1. Replace gradient background
old_bg = """        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0066CC 0%, #00D4FF 50%, #9D4EDD 100%);
            min-height: 100vh;
            padding: 20px;
            overflow-x: hidden;
        }"""

new_bg = """        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            background: #0a1628;
            min-height: 100vh;
            padding: 20px;
            padding-bottom: 198px;
            overflow-x: hidden;
        }"""

content = content.replace(old_bg, new_bg)

# 2. Add bottom navbar CSS
navbar_css = """
        /* Ultra-Modern Bottom Navigation Toolbar */
        .bottom-navbar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: rgba(10, 22, 40, 0.95);
            backdrop-filter: blur(20px);
            border-top: 2px solid rgba(0, 212, 255, 0.3);
            box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            padding: 10px 12px;
            height: 168px;
        }

        .navbar-grid {
            display: grid;
            grid-template-columns: repeat(14, 1fr);
            gap: 6px;
            padding: 4px 8px;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 6px;
            background: rgba(15, 30, 50, 0.6);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.85);
            text-align: center;
            min-height: 62px;
            width: 100%;
        }

        .nav-item:hover {
            background: rgba(0, 212, 255, 0.2);
            border-color: rgba(0, 212, 255, 0.6);
            transform: translateY(-2px);
        }

        .nav-item.active {
            background: rgba(0, 212, 255, 0.3);
            border-color: rgba(0, 212, 255, 0.8);
        }

        .nav-item.home-btn {
            background: rgba(255, 100, 50, 0.3);
            border-color: rgba(255, 100, 50, 0.6);
        }

        .nav-icon {
            font-size: 27px;
            margin-bottom: 3px;
        }

        .nav-label {
            font-size: 12px;
            font-weight: 600;
        }

        .navbar-toggle {
            position: absolute;
            top: 8px;
            right: 12px;
            background: rgba(0, 212, 255, 0.3);
            border: 1px solid rgba(0, 212, 255, 0.6);
            border-radius: 6px;
            color: white;
            cursor: pointer;
            padding: 6px 12px;
            font-size: 14px;
        }

        .bottom-navbar.collapsed {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bottom-navbar.collapsed .navbar-grid {
            grid-template-columns: auto;
        }

        .bottom-navbar.collapsed .nav-item:not(.home-btn) {
            display: none;
        }
"""

style_close = content.find('</style>')
content = content[:style_close] + navbar_css + content[style_close:]

# 3. Add navbar HTML (abbreviated version with key pages)
navbar_html = """
    <div class="bottom-navbar">
        <button class="navbar-toggle" onclick="toggleNavbar()">▼</button>
        <div class="navbar-grid">
            <a href="../index.html" class="nav-item home-btn"><div class="nav-icon">🏠</div><div class="nav-label">Home</div></a>
            <a href="enhancement_1_quantum_explorer.html" class="nav-item"><div class="nav-icon">🔮</div><div class="nav-label">Quantum</div></a>
            <a href="enhancement_2_comparison_matrix.html" class="nav-item"><div class="nav-icon">📊</div><div class="nav-label">Compare</div></a>
            <a href="enhancement_3_holographic_sphere.html" class="nav-item"><div class="nav-icon">🌐</div><div class="nav-label">Holo</div></a>
            <a href="enhancement_4_market_trends.html" class="nav-item"><div class="nav-icon">📈</div><div class="nav-label">Trends</div></a>
            <a href="enhancement_5_weather_simulator.html" class="nav-item active"><div class="nav-icon">🌤️</div><div class="nav-label">Weather</div></a>
            <a href="enhancement_6_virtual_tour_timeline.html" class="nav-item"><div class="nav-icon">🎬</div><div class="nav-label">Tours</div></a>
            <a href="enhancement_7_annotation_canvas.html" class="nav-item"><div class="nav-icon">✏️</div><div class="nav-label">Notes</div></a>
            <a href="enhancement_8_decision_timeline.html" class="nav-item"><div class="nav-icon">⏱️</div><div class="nav-label">Timeline</div></a>
            <a href="enhancement_9_schedule_coordinator.html" class="nav-item"><div class="nav-icon">📅</div><div class="nav-label">Schedule</div></a>
            <a href="enhancement_10_neighborhood_insights.html" class="nav-item"><div class="nav-icon">🏘️</div><div class="nav-label">Neighbor</div></a>
            <a href="enhancement_11_welcome_portal.html" class="nav-item"><div class="nav-icon">👋</div><div class="nav-label">Welcome</div></a>
            <a href="enhancement_12_personality_profiler.html" class="nav-item"><div class="nav-icon">🧠</div><div class="nav-label">Profile</div></a>
            <a href="enhancement_13_demographic_matrix.html" class="nav-item"><div class="nav-icon">👥</div><div class="nav-label">Demo</div></a>
            <a href="enhancement_14_wants_vs_needs.html" class="nav-item"><div class="nav-icon">⚖️</div><div class="nav-label">Wants</div></a>
            <a href="enhancement_15_ai_matchmaker.html" class="nav-item"><div class="nav-icon">🤖</div><div class="nav-label">AI Match</div></a>
            <a href="enhancement_16_weight_slider.html" class="nav-item"><div class="nav-icon">🎚️</div><div class="nav-label">Weights</div></a>
            <a href="enhancement_17_investment_calculator.html" class="nav-item"><div class="nav-icon">💰</div><div class="nav-label">ROI</div></a>
            <a href="enhancement_18_price_prediction.html" class="nav-item"><div class="nav-icon">💲</div><div class="nav-label">Price</div></a>
            <a href="enhancement_19_competitive_intelligence.html" class="nav-item"><div class="nav-icon">🎯</div><div class="nav-label">Intel</div></a>
            <a href="enhancement_20_risk_matrix.html" class="nav-item"><div class="nav-icon">⚠️</div><div class="nav-label">Risk</div></a>
            <a href="enhancement_21_hawk_alert.html" class="nav-item"><div class="nav-icon">🦅</div><div class="nav-label">Alerts</div></a>
            <a href="enhancement_22_client_portfolio.html" class="nav-item"><div class="nav-icon">📁</div><div class="nav-label">Portfolio</div></a>
            <a href="enhancement_23_smart_notifications.html" class="nav-item"><div class="nav-icon">🔔</div><div class="nav-label">Notify</div></a>
            <a href="enhancement_24_market_pulse.html" class="nav-item"><div class="nav-icon">💓</div><div class="nav-label">Pulse</div></a>
            <a href="enhancement_25_reports_generator.html" class="nav-item"><div class="nav-icon">📄</div><div class="nav-label">Reports</div></a>
            <a href="enhancement_26_data_import.html" class="nav-item"><div class="nav-icon">📥</div><div class="nav-label">Import</div></a>
            <a href="enhancement_27_client_hub.html" class="nav-item"><div class="nav-icon">👨‍💼</div><div class="nav-label">Clients</div></a>
        </div>
    </div>
    <script>
        function toggleNavbar() {
            document.querySelector('.bottom-navbar').classList.toggle('collapsed');
        }
    </script>
"""

body_close = content.find('</body>')
content = content[:body_close] + navbar_html + content[body_close:]

with open('enhancement_5_weather_simulator.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("WEATHER SIMULATOR FIXED & MODERNIZED:")
print("")
print("BUG FIXES:")
print("- Added null checks for currentProperty in all functions")
print("- Prevents 'cannot read properties of undefined' error")
print("- Functions return early if no property selected")
print("")
print("MODERNIZATION:")
print("- Deep midnight cobalt background")
print("- Antialiased fonts")
print("- 28-item bottom navigation toolbar")
print("- Collapsible toolbar")
print("- Weather page marked as active")
print("")
print("Reload - should work without errors now!")
