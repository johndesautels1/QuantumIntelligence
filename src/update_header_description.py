#!/usr/bin/env python3
"""
Update the 5D Quantum Explorer header description to be clearer and easier to understand
Keep the title, update the subtitle explanation
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the old technical explanation with a clearer, user-friendly one
old_subtitle = """<p class="subtitle">Each sphere is a property. Position = Quality scores (X=Location, Y=Price, Z=Condition). Size = Investment potential. Color = Lifestyle match. Drag to rotate!</p>"""

new_subtitle = """<p class="subtitle">View properties as 3D houses with real Google Street View and satellite imagery. Height shows match score, color shows overall quality. Click any house to see details. Drag to explore!</p>"""

content = content.replace(old_subtitle, new_subtitle)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HEADER DESCRIPTION UPDATED:")
print("")
print("OLD: Each sphere is a property. Position = Quality scores...")
print("")
print("NEW: View properties as 3D houses with real Google Street View")
print("     and satellite imagery. Height shows match score, color")
print("     shows overall quality. Click any house to see details.")
print("     Drag to explore!")
print("")
print("Much clearer and easier to understand!")
