#!/usr/bin/env python3
"""
Fix side panel heights to fit between top and toolbar
- Toolbar is 168px from bottom
- Top is at 20px
- Available space: 100vh - 20px (top) - 178px (toolbar + padding) = 100vh - 198px
- Add some margin for safety: 100vh - 220px
Keep scroll functionality intact
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix left panel (properties-list) max-height
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
            max-height: calc(100vh - 100px);  /* Adjusted for new position */
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
            max-height: calc(100vh - 220px);  /* Fit between top and toolbar */
            overflow-y: auto;
        }"""

content = content.replace(old_left_panel, new_left_panel)

# 2. Fix right panel (control-panel) max-height
old_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 20px;  /* Back to original position */
            background: rgba(0, 212, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 20px;
            padding-bottom: 30px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
            pointer-events: all;
            max-width: 320px;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            overflow-x: hidden;
        }"""

new_right_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 20px;  /* Back to original position */
            background: rgba(0, 212, 255, 0.15);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 20px;
            padding-bottom: 30px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
            pointer-events: all;
            max-width: 320px;
            max-height: calc(100vh - 220px);  /* Fit between top and toolbar */
            overflow-y: auto;
            overflow-x: hidden;
        }"""

content = content.replace(old_right_panel, new_right_panel)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SIDE PANEL HEIGHTS FIXED:")
print("- Left panel (Select Properties): max-height calc(100vh - 100px) -> calc(100vh - 220px)")
print("- Right panel (Dimension Controls): max-height calc(100vh - 100px) -> calc(100vh - 220px)")
print("- Both panels now fit between top (20px) and toolbar (bottom 178px)")
print("- Scroll functionality preserved (overflow-y: auto)")
print("- No content deleted - just better sizing")
print("")
print("Reload to see panels properly fitted without cutoff!")
