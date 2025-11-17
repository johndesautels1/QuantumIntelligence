#!/usr/bin/env python3
"""
Fix toolbar issues:
1. Fix bottom row cutoff - increase toolbar height
2. Add toggle button to show/hide toolbar (keep only home button visible when hidden)
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Increase toolbar height to prevent cutoff
old_navbar_height = """            height: 150px;  /* Increased for larger fonts */
        }"""

new_navbar_height = """            height: 160px;  /* Prevent bottom row cutoff */
        }"""

content = content.replace(old_navbar_height, new_navbar_height)

# 2. Adjust container padding
old_container_padding = """            padding-bottom: 160px;  /* Space for taller toolbar */
        }"""

new_container_padding = """            padding-bottom: 170px;  /* Space for taller toolbar */
        }"""

content = content.replace(old_container_padding, new_container_padding)

# 3. Add collapsed state CSS for toolbar
navbar_toggle_css = """
        /* Toolbar collapsed state - show only home button */
        .bottom-navbar.collapsed {
            height: 70px;  /* Just enough for home button */
        }

        .bottom-navbar.collapsed .navbar-grid {
            grid-template-columns: auto;  /* Single column for home button */
            justify-content: center;
        }

        .bottom-navbar.collapsed .nav-item:not(.home-btn) {
            display: none;  /* Hide all except home button */
        }

        .bottom-navbar.collapsed .navbar-toggle {
            transform: rotate(180deg);  /* Flip arrow */
        }

        /* Toolbar toggle button */
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
"""

# Insert before closing style tag
style_close = content.find('</style>')
content = content[:style_close] + navbar_toggle_css + content[style_close:]

# 4. Add toggle button HTML to navbar
old_navbar_open = """    <!-- Ultra-Modern Bottom Navigation Toolbar -->
    <div class="bottom-navbar">"""

new_navbar_open = """    <!-- Ultra-Modern Bottom Navigation Toolbar -->
    <div class="bottom-navbar">
        <button class="navbar-toggle" onclick="toggleNavbar()" title="Toggle Navigation">▼</button>"""

content = content.replace(old_navbar_open, new_navbar_open)

# 5. Add toggle JavaScript function
toggle_js = """
        // Toggle navbar visibility (collapse to just home button)
        function toggleNavbar() {
            const navbar = document.querySelector('.bottom-navbar');
            navbar.classList.toggle('collapsed');

            // Update container padding based on state
            const container = document.querySelector('.container');
            if (navbar.classList.contains('collapsed')) {
                container.style.paddingBottom = '80px';  // Less padding when collapsed
            } else {
                container.style.paddingBottom = '170px';  // Full padding when expanded
            }
        }

"""

# Find a good place to insert the function - after initializeEnhancement
init_end = content.find('// Initialize Enhancement with REAL Data')
if init_end > 0:
    # Insert before the function
    content = content[:init_end] + toggle_js + content[init_end:]
else:
    # Fallback: insert before closing script tag
    script_close = content.rfind('</script>')
    content = content[:script_close] + toggle_js + content[script_close:]

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("TOOLBAR FIXES APPLIED:")
print("- Toolbar height: 150px -> 160px (prevents bottom row cutoff)")
print("- Container padding: 160px -> 170px (adjusted)")
print("- Added toggle button (top-right of toolbar)")
print("- Collapsed state: Shows only home button (70px height)")
print("- Expanded state: Shows all 28 navigation items (160px height)")
print("- Arrow icon flips when toggling")
print("")
print("Reload and click the toggle button (▼) to collapse toolbar!")
