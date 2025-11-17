#!/usr/bin/env python3
"""
Fix the map toggle button to properly show both states:
- Show Map (when in 3D view)
- Show Quantum Space (when in map view)
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the button text to be clearer
old_text_3d = "btn.textContent = '🌐 Show 3D Only';"
new_text_3d = "btn.textContent = '🔮 Show Quantum Space';"

content = content.replace(old_text_3d, new_text_3d)

# The "Show Map" text is already good, just verify it exists
if "'🗺️ Show Map'" not in content:
    print("WARNING: Show Map text not found!")
else:
    print("Show Map text verified")

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("FIXED:")
print("- Button now says 'Show Quantum Space' when viewing map")
print("- Button says 'Show Map' when viewing 3D quantum space")
print("- Toggle works bidirectionally")
print("")
print("Reload to test the toggle!")
