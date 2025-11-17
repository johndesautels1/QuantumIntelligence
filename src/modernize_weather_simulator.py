#!/usr/bin/env python3
"""
Modernize Weather Simulator (Enhancement 5) with same UI as Quantum Explorer:
1. Deep midnight cobalt theme (#0a1628)
2. Add 28-item bottom navigation toolbar
3. Improve fonts with antialiasing
4. Proper layout with bottom padding for toolbar
5. Update to match Quantum Explorer aesthetic
"""

with open('enhancement_5_weather_simulator.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace gradient background with deep cobalt
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
            background: #0a1628;  /* Deep midnight cobalt */
            min-height: 100vh;
            padding: 20px;
            padding-bottom: 198px;  /* Space for bottom toolbar */
            overflow-x: hidden;
        }"""

content = content.replace(old_bg, new_bg)

# 2. Add bottom navbar CSS (same as Quantum Explorer)
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
            pointer-events: all;
            height: 168px;  /* Fixed height for 2 rows */
        }

        .navbar-grid {
            display: grid;
            grid-template-columns: repeat(14, 1fr);  /* Exactly 14 columns = 2 rows of 14 */
            gap: 6px;
            max-width: 100%;
            margin: 0 auto;
            padding: 4px 8px;
            height: auto;
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
            font-size: 9px;
            text-align: center;
            min-height: 62px;
            width: 100%;
        }

        .nav-item:hover {
            background: rgba(0, 212, 255, 0.2);
            border-color: rgba(0, 212, 255, 0.6);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }

        .nav-item.active {
            background: rgba(0, 212, 255, 0.3);
            border-color: rgba(0, 212, 255, 0.8);
        }

        .nav-item.home-btn {
            background: rgba(255, 100, 50, 0.3);
            border-color: rgba(255, 100, 50, 0.6);
            font-weight: 600;
        }

        .nav-item.home-btn:hover {
            background: rgba(255, 100, 50, 0.5);
            border-color: rgba(255, 100, 50, 0.9);
        }

        .nav-icon {
            font-size: 27px;
            margin-bottom: 3px;
        }

        .nav-label {
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }

        /* Toolbar collapsed state */
        .bottom-navbar.collapsed {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .bottom-navbar.collapsed .navbar-grid {
            grid-template-columns: auto;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
        }

        .bottom-navbar.collapsed .home-btn {
            margin-top: -10px;
            min-height: 46px;
            padding: 6px 5px;
        }

        .bottom-navbar.collapsed .home-btn .nav-icon {
            font-size: 20px;
        }

        .bottom-navbar.collapsed .home-btn .nav-label {
            font-size: 9px;
        }

        .bottom-navbar.collapsed .nav-item:not(.home-btn) {
            display: none;
        }

        .bottom-navbar.collapsed .navbar-toggle {
            transform: rotate(180deg);
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
            font-weight: 600;
            transition: all 0.3s ease;
            z-index: 10;
        }

        .navbar-toggle:hover {
            background: rgba(0, 212, 255, 0.5);
            transform: translateY(-2px);
        }

        .navbar-grid::-webkit-scrollbar {
            height: 4px;
        }

        .navbar-grid::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
        }

        .navbar-grid::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.4);
            border-radius: 2px;
        }
"""

# Insert before closing style tag
style_close = content.find('</style>')
if style_close > 0:
    content = content[:style_close] + navbar_css + content[style_close:]

# 3. Add bottom navbar HTML before closing body tag
navbar_html = """
    <!-- Ultra-Modern Bottom Navigation Toolbar -->
    <div class="bottom-navbar">
        <button class="navbar-toggle" onclick="toggleNavbar()" title="Toggle Navigation">▼</button>
        <div class="navbar-grid">
            <a href="../index.html" class="nav-item home-btn">
                <div class="nav-icon">🏠</div>
                <div class="nav-label">Home</div>
            </a>
            <a href="enhancement_1_quantum_explorer.html" class="nav-item">
                <div class="nav-icon">🔮</div>
                <div class="nav-label">Quantum</div>
            </a>
            <a href="enhancement_2_comparison_matrix.html" class="nav-item">
                <div class="nav-icon">📊</div>
                <div class="nav-label">Compare</div>
            </a>
            <a href="enhancement_3_holographic_sphere.html" class="nav-item">
                <div class="nav-icon">🌐</div>
                <div class="nav-label">Holo</div>
            </a>
            <a href="enhancement_4_market_trends.html" class="nav-item">
                <div class="nav-icon">📈</div>
                <div class="nav-label">Trends</div>
            </a>
            <a href="enhancement_5_weather_simulator.html" class="nav-item active">
                <div class="nav-icon">🌤️</div>
                <div class="nav-label">Weather</div>
            </a>
            <a href="enhancement_6_virtual_tour_timeline.html" class="nav-item">
                <div class="nav-icon">🎬</div>
                <div class="nav-label">Tours</div>
            </a>
            <a href="enhancement_7_annotation_canvas.html" class="nav-item">
                <div class="nav-icon">✏️</div>
                <div class="nav-label">Notes</div>
            </a>
            <a href="enhancement_8_decision_timeline.html" class="nav-item">
                <div class="nav-icon">⏱️</div>
                <div class="nav-label">Timeline</div>
            </a>
            <a href="enhancement_9_schedule_coordinator.html" class="nav-item">
                <div class="nav-icon">📅</div>
                <div class="nav-label">Schedule</div>
            </a>
            <a href="enhancement_10_neighborhood_insights.html" class="nav-item">
                <div class="nav-icon">🏘️</div>
                <div class="nav-label">Neighbor</div>
            </a>
            <a href="enhancement_11_welcome_portal.html" class="nav-item">
                <div class="nav-icon">👋</div>
                <div class="nav-label">Welcome</div>
            </a>
            <a href="enhancement_12_personality_profiler.html" class="nav-item">
                <div class="nav-icon">🧠</div>
                <div class="nav-label">Profile</div>
            </a>
            <a href="enhancement_13_demographic_matrix.html" class="nav-item">
                <div class="nav-icon">👥</div>
                <div class="nav-label">Demo</div>
            </a>
            <a href="enhancement_14_wants_vs_needs.html" class="nav-item">
                <div class="nav-icon">⚖️</div>
                <div class="nav-label">Wants</div>
            </a>
            <a href="enhancement_15_ai_matchmaker.html" class="nav-item">
                <div class="nav-icon">🤖</div>
                <div class="nav-label">AI Match</div>
            </a>
            <a href="enhancement_16_weight_slider.html" class="nav-item">
                <div class="nav-icon">🎚️</div>
                <div class="nav-label">Weights</div>
            </a>
            <a href="enhancement_17_investment_calculator.html" class="nav-item">
                <div class="nav-icon">💰</div>
                <div class="nav-label">ROI</div>
            </a>
            <a href="enhancement_18_price_prediction.html" class="nav-item">
                <div class="nav-icon">💲</div>
                <div class="nav-label">Price</div>
            </a>
            <a href="enhancement_19_competitive_intelligence.html" class="nav-item">
                <div class="nav-icon">🎯</div>
                <div class="nav-label">Intel</div>
            </a>
            <a href="enhancement_20_risk_matrix.html" class="nav-item">
                <div class="nav-icon">⚠️</div>
                <div class="nav-label">Risk</div>
            </a>
            <a href="enhancement_21_hawk_alert.html" class="nav-item">
                <div class="nav-icon">🦅</div>
                <div class="nav-label">Alerts</div>
            </a>
            <a href="enhancement_22_client_portfolio.html" class="nav-item">
                <div class="nav-icon">📁</div>
                <div class="nav-label">Portfolio</div>
            </a>
            <a href="enhancement_23_smart_notifications.html" class="nav-item">
                <div class="nav-icon">🔔</div>
                <div class="nav-label">Notify</div>
            </a>
            <a href="enhancement_24_market_pulse.html" class="nav-item">
                <div class="nav-icon">💓</div>
                <div class="nav-label">Pulse</div>
            </a>
            <a href="enhancement_25_reports_generator.html" class="nav-item">
                <div class="nav-icon">📄</div>
                <div class="nav-label">Reports</div>
            </a>
            <a href="enhancement_26_data_import.html" class="nav-item">
                <div class="nav-icon">📥</div>
                <div class="nav-label">Import</div>
            </a>
            <a href="enhancement_27_client_hub.html" class="nav-item">
                <div class="nav-icon">👨‍💼</div>
                <div class="nav-label">Clients</div>
            </a>
        </div>
    </div>

    <script>
        // Toggle navbar visibility
        function toggleNavbar() {
            const navbar = document.querySelector('.bottom-navbar');
            navbar.classList.toggle('collapsed');
        }
    </script>
"""

body_close = content.find('</body>')
if body_close > 0:
    content = content[:body_close] + navbar_html + content[body_close:]

with open('enhancement_5_weather_simulator.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("WEATHER SIMULATOR MODERNIZED:")
print("- Deep midnight cobalt background (#0a1628)")
print("- Crisp antialiased fonts")
print("- 28-item bottom navigation toolbar (2 rows x 14)")
print("- Collapsible toolbar with toggle button")
print("- Weather page marked as active in navbar")
print("- Bottom padding added (198px) for toolbar")
print("")
print("Reload to see modernized Weather Simulator!")
