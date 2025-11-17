#!/usr/bin/env python3
"""
REVERT the height change and instead LOWER the panel from the top by 0.75 inches (72px)
Move top: 20px -> top: 92px (20 + 72)
Put max-height back to calc(100vh - 220px)
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REVERT the max-height back to 220px
# 2. LOWER the top position by 72px (0.75 inches)
old_left_panel = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 20px;  /* Back to original position */
            background: rgba(0, 212, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 25px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
            pointer-events: all;
            max-width: 320px;
            max-height: calc(100vh - 292px);  /* Reduced by 0.75 inches (72px) */
            overflow-y: auto;
        }"""

new_left_panel = """        .properties-list {
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

content = content.replace(old_left_panel, new_left_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("LEFT PANEL LOWERED FROM TOP:")
print("- Position: top:20px -> top:92px (lowered 0.75 inches / 72px)")
print("- Max-height: REVERTED to calc(100vh - 220px)")
print("- Panel now starts lower, exposing Google Maps element above it")
print("- Same total height, just positioned lower")
print("")
print("Reload to see panel lowered from top!")
