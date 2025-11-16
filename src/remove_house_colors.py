#!/usr/bin/env python3
"""
Remove colors from house cubes - make them neutral/clear
Keep rod colors based on score
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change initial materials to neutral/clear (no color tint)
old_initial = '''// Create initial materials (will be updated when texture loads)
                    const materials = [];
                    for (let i = 0; i < 6; i++) {
                        materials.push(new THREE.MeshPhongMaterial({
                            color: color,
                            emissive: color,
                            emissiveIntensity: 0.3,
                            shininess: 100,
                            transparent: true,
                            opacity: 0.85
                        }));
                    }'''

new_initial = '''// Create initial materials - NEUTRAL (no color tint for clear view)
                    const materials = [];
                    for (let i = 0; i < 6; i++) {
                        materials.push(new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,  // White/neutral
                            roughness: 0.3,
                            metalness: 0.1,
                            transparent: false,
                            opacity: 1.0
                        }));
                    }'''

content = content.replace(old_initial, new_initial)

# 2. Make top face (Street View) have no color overlay
old_top = '''if (i === 4) {
                                    // Top face gets Street View
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        map: texture,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));'''

new_top = '''if (i === 4) {
                                    // Top face gets Street View - CLEAR (no color overlay)
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        map: texture,
                                        roughness: 0.3,
                                        metalness: 0.1
                                    }));'''

content = content.replace(old_top, new_top)

# 3. Make front face (Satellite) have no color overlay
old_front = '''} else if (i === 2) {
                                    // Front face - will get satellite
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        color: color,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));'''

new_front = '''} else if (i === 2) {
                                    // Front face - will get satellite - CLEAR placeholder
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        color: 0xFFFFFF,
                                        roughness: 0.3,
                                        metalness: 0.1
                                    }));'''

content = content.replace(old_front, new_front)

# 4. Make side faces neutral too
old_sides = '''} else {
                                    // Sides - colored
                                    newMaterials.push(new THREE.MeshPhongMaterial({
                                        color: color,
                                        emissive: color,
                                        emissiveIntensity: 0.2,
                                        transparent: true,
                                        opacity: 0.75
                                    }));
                                }'''

new_sides = '''} else {
                                    // Sides - NEUTRAL/CLEAR
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        color: 0xEEEEEE,  // Light gray
                                        roughness: 0.5,
                                        metalness: 0.05,
                                        transparent: true,
                                        opacity: 0.9
                                    }));
                                }'''

content = content.replace(old_sides, new_sides)

# 5. Remove color updates in updateVisualization - keep houses clear
old_update_color = '''// Update materials (handle both single material and multi-material arrays)
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

new_update_color = '''// Keep house materials CLEAR - don't update color
                // (Rods show the color/score instead)'''

content = content.replace(old_update_color, new_update_color)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("DONE:")
print("- House cubes now CLEAR/NEUTRAL (white/light gray)")
print("- No color overlay on textures")
print("- Rods KEEP their colors based on score")
print("- Houses show property images clearly")
print("")
print("Reload!")
