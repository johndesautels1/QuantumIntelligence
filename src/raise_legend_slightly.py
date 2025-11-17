#!/usr/bin/env python3
"""
Raise the legend very slightly by 1/15 of an inch (6.4px, round to 6px)
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the legend position and raise it by 6px
# 1/15 inch = 96/15 = 6.4px, round to 6px
# Currently at bottom: 164px, raise to bottom: 170px (164 + 6)
old_legend = """        .legend {
            position: absolute;
            bottom: 164px;  /* Raised 1.5 inches (144px) from 20px */"""

new_legend = """        .legend {
            position: absolute;
            bottom: 170px;  /* Raised by 1/15 inch (6px) from 164px */"""

content = content.replace(old_legend, new_legend)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("LEGEND RAISED SLIGHTLY:")
print("- Position: bottom:164px -> bottom:170px")
print("- Raised by 6px (1/15 inch)")
print("")
print("Reload to see slightly raised legend!")
