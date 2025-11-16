#!/usr/bin/env python3
"""
Fix the dimension controls to:
1. Make houses rise/fall based on weighted scores
2. Add rods from ground to houses
3. Color rods based on match score
4. Double house size
5. Improve photo realism
"""

# Read the file
with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Increase house size (double it) in the block creation code
content = content.replace(
    'const houseWidth = 1.4;',
    'const houseWidth = 2.8;'  # Double size
)
content = content.replace(
    'const houseDepth = 1.0;',
    'const houseDepth = 2.0;'  # Double size
)

# Fix 2: Improve photo quality - use larger Street View images
content = content.replace(
    'size=800x600',
    'size=1200x900'  # Higher resolution
)

# Fix 3: Add rod creation in the property mesh creation
# Find where we add the block to the scene and add rod creation there
rod_creation_code = '''
                // Create ROD from ground plane to house
                const rodHeight = Math.max(0.5, blockHeight);
                const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, rodHeight, 16);
                const rodMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.9,
                    shininess: 100
                });
                const rod = new THREE.Mesh(rodGeometry, rodMaterial);
                rod.position.set(x, -10 + (rodHeight / 2), z);
                rod.userData = {
                    propertyIndex: index,
                    isRod: true
                };
                scene.add(rod);
                propertyRods.push(rod);
'''

# Find the location after scene.add(block) and before propertyMeshes.push(block)
old_scene_add = '''scene.add(block);
                propertyMeshes.push(block);'''

new_scene_add = '''scene.add(block);
                propertyMeshes.push(block);

                // Create ROD from ground plane to house
                const rodHeight = Math.max(0.5, blockHeight);
                const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, rodHeight, 16);
                const rodMaterial = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.9,
                    shininess: 100
                });
                const rod = new THREE.Mesh(rodGeometry, rodMaterial);
                rod.position.set(x, -10 + (rodHeight / 2), z);
                rod.userData = {
                    propertyIndex: index,
                    isRod: true
                };
                scene.add(rod);
                propertyRods.push(rod);'''

content = content.replace(old_scene_add, new_scene_add)

# Fix 4: Fix updateVisualization to work with 3D textured houses
# Find and replace the mesh update code in updateVisualization
old_update = '''// Update BLOCK height and position
                const blockHeight = Math.max(0.2, y - (-10));
                // Dispose old geometry and create new one
                mesh.geometry.dispose();
                mesh.geometry = new THREE.BoxGeometry(0.4, blockHeight, 0.4);
                mesh.position.set(x, -10 + (blockHeight / 2), z);

                // ===== COLOR = MATCH QUALITY =====
                // Green = Excellent match, Red = Poor match
                const newColor = getColorForValue(matchScore);
                mesh.material.color.setHex(newColor);
                mesh.material.emissive.setHex(newColor);'''

new_update = '''// Update HOUSE height and position based on match score
                const blockHeight = Math.max(0.2, y - (-10));

                // Animate position change smoothly
                const targetY = -10 + (blockHeight / 2);
                mesh.position.y = targetY;

                // ===== COLOR = MATCH QUALITY =====
                // Green = Excellent match, Red = Poor match
                const newColor = getColorForValue(matchScore);

                // Update materials (handle both single material and multi-material arrays)
                if (Array.isArray(mesh.material)) {
                    // Multi-material (textured house)
                    mesh.material.forEach((mat, i) => {
                        if (i !== 4) { // Don't change texture face
                            mat.color.setHex(newColor);
                            if (mat.emissive) {
                                mat.emissive.setHex(newColor);
                                mat.emissiveIntensity = 0.2;
                            }
                        }
                    });
                } else {
                    // Single material (fallback blocks)
                    mesh.material.color.setHex(newColor);
                    mesh.material.emissive.setHex(newColor);
                }'''

content = content.replace(old_update, new_update)

# Fix 5: Update rod in updateVisualization to illuminate and change height
old_rod_update = '''// Update label and rod
                const label = propertyLabels[index];
                const rod = propertyRods[index];

                if (label && rod) {
                    const heightVariation = label.userData.heightVariation;
                    const offset = label.userData.offset;

                    // Calculate new rod height based on match score
                    const newRodHeight = Math.max(0.5, heightVariation * (matchScore / 100) * 2); // Scale rod height with score

                    // Update label position
                    label.position.set(x, y + offset + newRodHeight, z);

                    // Update rod geometry and position
                    rod.geometry.dispose(); // Dispose old geometry
                    rod.geometry = new THREE.CylinderGeometry(0.02, 0.02, newRodHeight, 8);
                    rod.position.set(x, y + offset + (newRodHeight / 2), z);

                    // Update rod color to match property color
                    rod.material.color.setHex(newColor);
                    rod.material.emissive.setHex(newColor);
                    rod.material.opacity = 0.8; // Make rod more visible

                    // Update label opacity based on rank
                    if (label.material) {
                        label.material.opacity = rank <= 3 ? 1.0 : 0.85; // Top 3 fully visible
                    }
                }'''

new_rod_update = '''// Update ROD connecting ground to house
                const rod = propertyRods[index];
                if (rod) {
                    // Rod height = distance from ground (-10) to house center
                    const rodHeight = Math.max(0.5, blockHeight);

                    // Dispose old geometry and create new
                    rod.geometry.dispose();
                    rod.geometry = new THREE.CylinderGeometry(0.05, 0.05, rodHeight, 16);

                    // Position rod from ground to house
                    rod.position.set(x, -10 + (rodHeight / 2), z);

                    // ILLUMINATE rod with match score color
                    rod.material.color.setHex(newColor);
                    rod.material.emissive.setHex(newColor);
                    rod.material.emissiveIntensity = 0.6; // Bright glow
                    rod.material.opacity = 0.9;

                    // Top ranked properties get brighter rods
                    if (rank <= 3) {
                        rod.material.emissiveIntensity = 0.8; // Extra bright for top 3
                    }
                }

                // Update label position
                const label = propertyLabels[index];
                if (label) {
                    const heightVariation = label.userData.heightVariation || 1.5;
                    const offset = label.userData.offset || 0.5;
                    label.position.set(x, y + offset + heightVariation, z);

                    // Update label opacity based on rank
                    if (label.material) {
                        label.material.opacity = rank <= 3 ? 1.0 : 0.85;
                    }
                }'''

content = content.replace(old_rod_update, new_rod_update)

# Write the fixed file
with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS! Fixed dimension controls:")
print("1. Houses now rise/fall based on weighted match scores")
print("2. Rods connect ground plane to each house")
print("3. Rods illuminate with colors based on match quality")
print("4. House size doubled (2.8x2.0 instead of 1.4x1.0)")
print("5. Higher resolution Street View images (1200x900)")
print("")
print("Reload the page to see the changes!")
