#!/usr/bin/env python3
"""
Fix UI alignment and font sizes:
1. Raise left panel (properties-list) to align with top header
2. Raise right panel (control-panel) to align with top header
3. Raise bottom legend 1.5 inches (144px)
4. Increase toolbar widget font size by 1.5x for readability
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Raise right control panel to align with header (parallel to top)
old_control_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 80px;"""

new_control_panel = """        .control-panel {
            position: absolute;
            right: 82px;
            top: 20px;  /* Aligned with header */"""

content = content.replace(old_control_panel, new_control_panel)

# 2. Raise left properties list to align with header (parallel to top)
old_properties_list = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 80px;  /* Moved down to not hide score display */"""

new_properties_list = """        .properties-list {
            position: absolute;
            left: 20px;
            top: 20px;  /* Aligned with header - parallel to top frame */"""

content = content.replace(old_properties_list, new_properties_list)

# 3. Raise bottom legend 1.5 inches (144px = 1.5 inches at 96 DPI)
old_legend = """        .legend {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);"""

new_legend = """        .legend {
            position: absolute;
            bottom: 164px;  /* Raised 1.5 inches (144px) from 20px */
            left: 50%;
            transform: translateX(-50%);"""

content = content.replace(old_legend, new_legend)

# 4. Raise view-controls if it exists
old_view_controls = """        .view-controls {
            position: absolute;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);"""

new_view_controls = """        .view-controls {
            position: absolute;
            bottom: 234px;  /* Raised 1.5 inches (144px) from 90px */
            left: 50%;
            transform: translateX(-50%);"""

content = content.replace(old_view_controls, new_view_controls)

# 5. Increase toolbar font sizes by 1.5x for better readability
# Icon font size: 18px -> 27px
old_nav_icon = """        .nav-icon {
            font-size: 18px;
            margin-bottom: 2px;
        }"""

new_nav_icon = """        .nav-icon {
            font-size: 27px;  /* 1.5x increase for readability */
            margin-bottom: 3px;
        }"""

content = content.replace(old_nav_icon, new_nav_icon)

# Label font size: 8px -> 12px
old_nav_label = """        .nav-label {
            font-size: 8px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }"""

new_nav_label = """        .nav-label {
            font-size: 12px;  /* 1.5x increase for readability */
            font-weight: 600;  /* Slightly bolder for clarity */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        }"""

content = content.replace(old_nav_label, new_nav_label)

# 6. Increase nav-item min-height to accommodate larger fonts
old_nav_item_height = """            min-height: 55px;
            width: 100%;  /* Fill column width */
        }"""

new_nav_item_height = """            min-height: 62px;  /* Increased for larger fonts */
            width: 100%;  /* Fill column width */
        }"""

content = content.replace(old_nav_item_height, new_nav_item_height)

# 7. Adjust bottom navbar height for larger content
old_navbar_height = """            height: 140px;  /* Fixed height for 2 rows */
        }"""

new_navbar_height = """            height: 150px;  /* Increased for larger fonts */
        }"""

content = content.replace(old_navbar_height, new_navbar_height)

# 8. Adjust container bottom padding to match new navbar height
old_container_padding = """            padding-bottom: 150px;  /* Space for toolbar */
        }"""

new_container_padding = """            padding-bottom: 160px;  /* Space for taller toolbar */
        }"""

content = content.replace(old_container_padding, new_container_padding)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI ALIGNMENT FIXED:")
print("- Right panel (control-panel): Raised from top:80px to top:20px")
print("- Left panel (properties-list): Raised from top:80px to top:20px")
print("- Both side panels now parallel with top header frame")
print("- Bottom legend: Raised 1.5 inches (bottom:20px -> bottom:164px)")
print("- View controls: Raised 1.5 inches (bottom:90px -> bottom:234px)")
print("")
print("TOOLBAR FONTS INCREASED:")
print("- Nav icon: 18px -> 27px (1.5x)")
print("- Nav label: 8px -> 12px (1.5x)")
print("- Label weight: 500 -> 600 (bolder)")
print("- Nav item height: 55px -> 62px")
print("- Toolbar height: 140px -> 150px")
print("")
print("Reload for better alignment and readability!")
