#!/usr/bin/env python3
"""
Reduce the left panel (Select Properties) height by 0.75 inches (72px)
This will prevent it from covering the Google Maps element at the top
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Reduce max-height by 72px (0.75 inches at 96 DPI)
# Current: calc(100vh - 220px)
# New: calc(100vh - 292px)  [220 + 72 = 292]
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
            max-height: calc(100vh - 220px);  /* Fit between top and toolbar */
            overflow-y: auto;
        }"""

new_left_panel = """        .properties-list {
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

content = content.replace(old_left_panel, new_left_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("LEFT PANEL HEIGHT REDUCED:")
print("- Select Properties modal: max-height calc(100vh - 220px) -> calc(100vh - 292px)")
print("- Reduced by 0.75 inches (72px)")
print("- No longer covers Google Maps element at top")
print("- Scroll functionality preserved")
print("")
print("Reload to see smaller left panel!")
