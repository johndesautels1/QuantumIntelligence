#!/usr/bin/env python3
"""
Raise the home button vertically when toolbar is collapsed (toggled off)
Only affects collapsed state, not expanded state
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the collapsed state CSS and modify it to center home button better
old_collapsed = """        /* Toolbar collapsed state - show only home button */
        .bottom-navbar.collapsed {
            height: 70px;  /* Just enough for home button */
        }

        .bottom-navbar.collapsed .navbar-grid {
            grid-template-columns: auto;  /* Single column for home button */
            justify-content: center;
        }"""

new_collapsed = """        /* Toolbar collapsed state - show only home button */
        .bottom-navbar.collapsed {
            height: 70px;  /* Just enough for home button */
            display: flex;
            align-items: center;  /* Vertically center home button */
            justify-content: center;  /* Horizontally center home button */
        }

        .bottom-navbar.collapsed .navbar-grid {
            grid-template-columns: auto;  /* Single column for home button */
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
        }

        .bottom-navbar.collapsed .home-btn {
            margin-top: -10px;  /* Raise home button slightly when alone */
        }"""

content = content.replace(old_collapsed, new_collapsed)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HOME BUTTON RAISED (COLLAPSED STATE):")
print("- Added negative margin-top: -10px to raise button")
print("- Added flexbox centering for better alignment")
print("- Only affects collapsed state (toolbar toggled off)")
print("- Expanded state remains unchanged")
print("")
print("Reload and toggle toolbar off to see raised home button!")
