#!/usr/bin/env python3
"""
Lower the top header frame by 0.5 inches (48px at 96 DPI)
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Change header position from top:0 to top:48px (0.5 inches)
old_header = """        .header {
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px;
            padding: 15px 25px;
            border: 2px solid rgba(0, 212, 255, 0.6);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
            position: absolute;
            top: 0;"""

new_header = """        .header {
            background: rgba(0, 212, 255, 0.2);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px;
            padding: 15px 25px;
            border: 2px solid rgba(0, 212, 255, 0.6);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
            position: absolute;
            top: 48px;  /* Lowered 0.5 inches (48px) */"""

content = content.replace(old_header, new_header)

# Also lower the side panels to align with new header position
# Left panel
old_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 20px;  /* Aligned with header - parallel to top frame */"""

new_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 68px;  /* Aligned with lowered header (48px + 20px margin) */"""

content = content.replace(old_left_panel, new_left_panel)

# Right panel
old_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 20px;  /* Aligned with header */"""

new_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 68px;  /* Aligned with lowered header (48px + 20px margin) */"""

content = content.replace(old_right_panel, new_right_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("HEADER FRAME LOWERED:")
print("- Top header frame: top:0 -> top:48px (lowered 0.5 inches)")
print("- Left panel: top:20px -> top:68px (aligned with header)")
print("- Right panel: top:20px -> top:68px (aligned with header)")
print("")
print("Reload to see the lowered header and aligned panels!")
