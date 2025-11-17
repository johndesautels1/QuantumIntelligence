#!/usr/bin/env python3
"""
Raise the left panel back up by 3/8 inches (36px)
Adjust max-height to ensure bottom isn't cut off by toolbar
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Raise top position: 92px -> 56px (92 - 36 = 56)
# 2. Adjust max-height to prevent toolbar cutoff
#    Top at 56px, toolbar at bottom 178px
#    Available space: 100vh - 56px - 178px = 100vh - 234px
old_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 92px;  /* Lowered by 0.75 inches (72px) from 20px */
            background: rgba(0, 212, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
            pointer-events: all;
            max-width: 320px;
            max-height: calc(100vh - 220px);  /* Back to normal height */
            overflow-y: auto;
        }"""

new_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 56px;  /* Raised back up 3/8 inch (36px) from 92px */
            background: rgba(0, 212, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
            pointer-events: all;
            max-width: 320px;
            max-height: calc(100vh - 254px);  /* Adjusted to prevent toolbar cutoff */
            overflow-y: auto;
        }"""

content = content.replace(old_left_panel, new_left_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("LEFT PANEL POSITION ADJUSTED:")
print("- Position: top:92px -> top:56px (raised 3/8 inch / 36px)")
print("- Max-height: calc(100vh - 220px) -> calc(100vh - 254px)")
print("- Bottom won't be cut off by toolbar")
print("- Exposes Google Maps element at top")
print("")
print("Reload to see adjusted panel position!")
