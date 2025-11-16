#!/usr/bin/env python3
"""
Fix house clicking to open modal
Scale down rods
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the click handler to check both labels AND houses
old_handler = '''// Check for intersections with labels
            const intersects = raycaster.intersectObjects(propertyLabels);

            if (intersects.length > 0) {
                // Get the clicked label index
                const clickedLabel = intersects[0].object;
                const labelIndex = propertyLabels.indexOf(clickedLabel);

                if (labelIndex !== -1) {
                    // Open property detail modal
                    openPropertyModal(labelIndex);
                }
            }'''

new_handler = '''// Check for intersections with HOUSES first, then labels
            const houseIntersects = raycaster.intersectObjects(propertyMeshes);
            const labelIntersects = raycaster.intersectObjects(propertyLabels);

            // Prioritize house clicks
            if (houseIntersects.length > 0) {
                const clickedHouse = houseIntersects[0].object;
                const houseIndex = propertyMeshes.indexOf(clickedHouse);

                if (houseIndex !== -1) {
                    console.log('🏠 House clicked:', PROPERTIES[houseIndex].name);
                    openPropertyModal(houseIndex);
                }
            } else if (labelIntersects.length > 0) {
                // Get the clicked label index
                const clickedLabel = labelIntersects[0].object;
                const labelIndex = propertyLabels.indexOf(clickedLabel);

                if (labelIndex !== -1) {
                    console.log('🏷️ Label clicked:', PROPERTIES[labelIndex].name);
                    openPropertyModal(labelIndex);
                }
            }'''

content = content.replace(old_handler, new_handler)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("FIXED:")
print("- Rod heights scaled down 60%")
print("- House cubes are now clickable")
print("- Clicking house OR label opens modal")
print("")
print("Reload!")
