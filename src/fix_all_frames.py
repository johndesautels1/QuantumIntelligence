#!/usr/bin/env python3
"""
1. Raise view controls back up 1/4 inch (24px)
2. Raise left, center, and right main frames back to top:20px
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Raise view controls back up 1/4 inch (24px)
# Currently at bottom:186px, raise to bottom:210px (186 + 24)
old_view_controls = """        .view-controls {
            position: absolute;
            bottom: 186px;  /* Lowered by 0.5 inches (48px) from 234px */"""

new_view_controls = """        .view-controls {
            position: absolute;
            bottom: 210px;  /* Raised back up 1/4 inch (24px) */"""

content = content.replace(old_view_controls, new_view_controls)

# 2. Raise top header frame back to top:0
old_header = """        .header {
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px;
            padding: 15px 25px;
            border: 2px solid rgba(0, 212, 255, 0.6);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
            position: absolute;
            top: 48px;  /* Lowered 0.5 inches (48px) */"""

new_header = """        .header {
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px;
            padding: 15px 25px;
            border: 2px solid rgba(0, 212, 255, 0.6);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
            position: absolute;
            top: 0;  /* Back to original position */"""

content = content.replace(old_header, new_header)

# 3. Raise left panel back to top:20px (if it was lowered)
old_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 68px;  /* Aligned with lowered header (48px + 20px margin) */"""

new_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 20px;  /* Back to original position */"""

content = content.replace(old_left_panel, new_left_panel)

# 4. Raise right panel back to top:20px (if it was lowered)
old_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 68px;  /* Aligned with lowered header (48px + 20px margin) */"""

new_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 20px;  /* Back to original position */"""

content = content.replace(old_right_panel, new_right_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("ALL FRAMES FIXED:")
print("- View controls: bottom:186px -> bottom:210px (raised 1/4 inch)")
print("- Top header: top:48px -> top:0 (back to original)")
print("- Left panel: Raised back to top:20px")
print("- Right panel: Raised back to top:20px")
print("")
print("All main frames back to original positions!")
