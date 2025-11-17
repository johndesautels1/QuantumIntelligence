#!/usr/bin/env python3
"""
1. Change background to deep midnight cobalt blue with higher contrast
2. Improve font readability with crisper text
3. Add ultra-modern bottom navigation toolbar with all 27 enhancement pages
   - Modern widget icons for each page
   - Double row format
   - Home button visible on each page
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change background from light blue to deep midnight cobalt
old_bg = "background: #0B1F3F;"
new_bg = "background: #0a1628;  /* Deep midnight cobalt */"

content = content.replace(old_bg, new_bg)

# 2. Update renderer background color to match
old_renderer_bg = "renderer.setClearColor(0x0066CC, 1);"
new_renderer_bg = "renderer.setClearColor(0x0a1628, 1);  // Deep midnight cobalt"

content = content.replace(old_renderer_bg, new_renderer_bg)

# 3. Improve font rendering for better readability
old_font = "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"
new_font = """font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;"""

content = content.replace(old_font, new_font)

# 4. Add ultra-modern bottom navigation toolbar CSS
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
            padding: 8px 12px;
            pointer-events: all;
        }

        .navbar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 6px;
            max-width: 1800px;
            margin: 0 auto;
            max-height: 120px;
            overflow-y: auto;
            padding: 4px;
        }

        .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 6px 4px;
            background: rgba(15, 30, 50, 0.6);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            color: rgba(255, 255, 255, 0.85);
            font-size: 9px;
            text-align: center;
            min-height: 50px;
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
            font-size: 18px;
            margin-bottom: 2px;
        }

        .nav-label {
            font-size: 8px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }

        /* Scrollbar styling */
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

# Find the closing style tag and insert before it
style_close = content.find('</style>')
content = content[:style_close] + navbar_css + content[style_close:]

# 5. Add bottom navbar HTML structure
navbar_html = """
    <!-- Ultra-Modern Bottom Navigation Toolbar -->
    <div class="bottom-navbar">
        <div class="navbar-grid">
            <a href="../index.html" class="nav-item home-btn">
                <div class="nav-icon">🏠</div>
                <div class="nav-label">Home</div>
            </a>
            <a href="enhancement_1_quantum_explorer.html" class="nav-item active">
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
            <a href="enhancement_5_weather_simulator.html" class="nav-item">
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
"""

# Insert navbar before closing body tag
body_close = content.find('</body>')
content = content[:body_close] + navbar_html + content[body_close:]

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("ENHANCED UI:")
print("- Background: Deep midnight cobalt (#0a1628)")
print("- Fonts: Crisper with antialiasing and better rendering")
print("- Bottom navbar: Ultra-modern double-row grid")
print("- 28 navigation items: Home + 27 enhancement pages")
print("- Modern widget icons with minimal text")
print("- Active state shows current page")
print("")
print("Reload to see the new theme!")
