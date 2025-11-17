#!/usr/bin/env python3
"""
Final tiny adjustment to prevent toolbar bottom cutoff
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Increase toolbar height slightly more
old_navbar_height = """            height: 160px;  /* Prevent bottom row cutoff */
        }"""

new_navbar_height = """            height: 168px;  /* Extra padding to prevent any cutoff */
        }"""

content = content.replace(old_navbar_height, new_navbar_height)

# Adjust container padding to match
old_container_padding = """            padding-bottom: 170px;  /* Space for taller toolbar */
        }"""

new_container_padding = """            padding-bottom: 178px;  /* Space for taller toolbar */
        }"""

content = content.replace(old_container_padding, new_container_padding)

# Also update the JavaScript toggle function padding
old_js_padding = """                container.style.paddingBottom = '170px';  // Full padding when expanded"""

new_js_padding = """                container.style.paddingBottom = '178px';  // Full padding when expanded"""

content = content.replace(old_js_padding, new_js_padding)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("FINAL TOOLBAR ADJUSTMENT:")
print("- Toolbar height: 160px -> 168px (+8px)")
print("- Container padding: 170px -> 178px (+8px)")
print("- JavaScript toggle: Updated to 178px")
print("")
print("Bottom row should now be fully visible with no cutoff!")
