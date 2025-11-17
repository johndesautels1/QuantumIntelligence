#!/usr/bin/env python3
"""
Fix toolbar and UI layout:
1. Make toolbar exactly 2 rows with 14 items per row (28 total)
2. Increase widget width to fill screen dynamically
3. Raise dimension controls to be even with title
4. Raise legend and center bottom frame 1.5 inches
5. Add bottom padding to main container to prevent cutoff
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix navbar grid to force exactly 2 rows with 14 columns
old_navbar_grid = """        .navbar-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
            gap: 6px;
            max-width: 1800px;
            margin: 0 auto;
            max-height: 120px;
            overflow-y: auto;
            padding: 4px;
        }"""

new_navbar_grid = """        .navbar-grid {
            display: grid;
            grid-template-columns: repeat(14, 1fr);  /* Exactly 14 columns = 2 rows of 14 */
            gap: 6px;
            max-width: 100%;
            margin: 0 auto;
            padding: 4px 8px;
            height: auto;
        }"""

content = content.replace(old_navbar_grid, new_navbar_grid)

# 2. Increase nav-item size and make it more responsive
old_nav_item = """        .nav-item {
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
        }"""

new_nav_item = """        .nav-item {
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
            min-height: 55px;
            width: 100%;  /* Fill column width */
        }"""

content = content.replace(old_nav_item, new_nav_item)

# 3. Increase bottom navbar padding to accommodate 2 rows
old_bottom_navbar = """        .bottom-navbar {
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
        }"""

new_bottom_navbar = """        .bottom-navbar {
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
            height: 140px;  /* Fixed height for 2 rows */
        }"""

content = content.replace(old_bottom_navbar, new_bottom_navbar)

# 4. Add padding to container to prevent toolbar overlap
old_container = """        .container {
            width: 100vw;
            height: 100vh;
            position: relative;
        }"""

new_container = """        .container {
            width: 100vw;
            height: 100vh;
            position: relative;
            padding-bottom: 150px;  /* Space for toolbar */
        }"""

content = content.replace(old_container, new_container)

# 5. Raise dimension controls to align with title
# Find dimension controls styling
old_dimension_controls = """        .dimension-controls {
            position: fixed;
            top: 120px;
            right: 20px;"""

new_dimension_controls = """        .dimension-controls {
            position: fixed;
            top: 20px;  /* Align with header */
            right: 20px;"""

content = content.replace(old_dimension_controls, new_dimension_controls)

# 6. Raise property selector to align with title
old_property_selector = """        .property-selector {
            position: fixed;
            top: 120px;
            left: 20px;"""

new_property_selector = """        .property-selector {
            position: fixed;
            top: 20px;  /* Align with header */
            left: 20px;"""

content = content.replace(old_property_selector, new_property_selector)

# 7. Raise and center legend (bottom-right info panel)
# Find legend/info styling
old_legend = """        .legend {
            position: fixed;
            bottom: 20px;
            right: 20px;"""

new_legend = """        .legend {
            position: fixed;
            bottom: 170px;  /* 1.5 inches above toolbar (144px + padding) */
            right: 50%;
            transform: translateX(50%);  /* Center horizontally */"""

content = content.replace(old_legend, new_legend)

# Alternative: search for score-legend or similar
if '.legend {' not in content:
    # Try finding score indicator or similar bottom element
    old_score_legend = """        .score-legend {
            position: fixed;
            bottom: 20px;"""

    new_score_legend = """        .score-legend {
            position: fixed;
            bottom: 170px;  /* Raised 1.5 inches */"""

    content = content.replace(old_score_legend, new_score_legend)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("TOOLBAR LAYOUT FIXED:")
print("- Navbar: Exactly 2 rows x 14 columns (28 items)")
print("- Widgets: Dynamically fill screen width")
print("- Widget size: Increased padding and min-height")
print("- Toolbar height: Fixed at 140px for 2 rows")
print("- Dimension controls: Raised to align with title (top: 20px)")
print("- Property selector: Raised to align with title (top: 20px)")
print("- Legend: Raised 1.5 inches and centered")
print("- Container: Added bottom padding to prevent cutoff")
print("")
print("Reload to see the improved layout!")
