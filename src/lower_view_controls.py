#!/usr/bin/env python3
"""
Lower the view-controls (perspective/side/front/top buttons) by 0.5 inches (48px)
This is the frame with the perspective tabs/buttons
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Lower the view-controls frame by 48px (0.5 inches)
# Currently at bottom: 234px, lower it to bottom: 186px (234 - 48)
old_view_controls = """        .view-controls {
            position: absolute;
            bottom: 234px;  /* Raised 1.5 inches (144px) from 90px */"""

new_view_controls = """        .view-controls {
            position: absolute;
            bottom: 186px;  /* Lowered by 0.5 inches (48px) from 234px */"""

content = content.replace(old_view_controls, new_view_controls)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("VIEW CONTROLS LOWERED:")
print("- Perspective/Side/Front/Top button frame")
print("- Position: bottom:234px -> bottom:186px")
print("- Lowered by 0.5 inches (48px)")
print("")
print("Reload to see the lowered view controls!")
