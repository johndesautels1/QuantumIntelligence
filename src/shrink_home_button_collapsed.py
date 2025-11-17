#!/usr/bin/env python3
"""
Reduce the height of the home button widget itself by 25% when collapsed
Keep position the same, just make the button smaller
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add CSS to scale down the home button by 25% in collapsed state
old_collapsed_home = """        .bottom-navbar.collapsed .home-btn {
            margin-top: -10px;  /* Raise home button slightly when alone */
        }"""

new_collapsed_home = """        .bottom-navbar.collapsed .home-btn {
            margin-top: -10px;  /* Raise home button slightly when alone */
            min-height: 46px;  /* Reduce from 62px by 25% (62 * 0.75 = 46.5) */
            padding: 6px 5px;  /* Reduce padding proportionally */
        }

        .bottom-navbar.collapsed .home-btn .nav-icon {
            font-size: 20px;  /* Reduce from 27px by 25% */
        }

        .bottom-navbar.collapsed .home-btn .nav-label {
            font-size: 9px;  /* Reduce from 12px by 25% */
        }"""

content = content.replace(old_collapsed_home, new_collapsed_home)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HOME BUTTON WIDGET SHRUNK (COLLAPSED STATE):")
print("- Widget height: 62px -> 46px (25% reduction)")
print("- Padding: 8px 6px -> 6px 5px (proportional)")
print("- Icon size: 27px -> 20px (25% smaller)")
print("- Label size: 12px -> 9px (25% smaller)")
print("- Position stays the same")
print("- Only affects collapsed state")
print("")
print("Reload to see smaller home button when toolbar is collapsed!")
