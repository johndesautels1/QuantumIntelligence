#!/usr/bin/env python3
# Patch the Quantum Explorer with REAL 3D textured houses

import re

# Read the file
with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the block creation code
# Use regex to handle any whitespace variations
old_pattern = r'// Create COLORED BLOCK from ground.*?block\.position\.set\(x, -10 \+ \(blockHeight / 2\), z\);'

new_code = '''// Create 3D TEXTURED HOUSE from Google Street View
                const blockHeight = Math.max(0.2, y - (-10)); // Ensure minimum height

                // Generate Google Street View URL for this property
                const streetViewUrl = lat !== 0 && lng !== 0
                    ? `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&fov=90&pitch=10&heading=0&key=AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw`
                    : null;

                let block;

                if (streetViewUrl) {
                    // Create 3D house geometry (textured slab)
                    const houseWidth = 1.4;
                    const houseDepth = 1.0;
                    const houseThickness = Math.max(0.4, blockHeight * 0.15);
                    const geometry = new THREE.BoxGeometry(houseWidth, houseThickness, houseDepth);

                    // Create initial materials (will be updated when texture loads)
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
                    }

                    block = new THREE.Mesh(geometry, materials);
                    block.rotation.x = -0.4; // Tilt to show texture
                    block.rotation.y = 0.5;  // Slight rotation

                    // Load Street View texture
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.setCrossOrigin('anonymous');

                    textureLoader.load(
                        streetViewUrl,
                        (texture) => {
                            // Texture loaded successfully
                            texture.colorSpace = THREE.SRGBColorSpace;
                            texture.minFilter = THREE.LinearFilter;

                            console.log(`✨ Texture loaded for ${property.name}`);

                            // Update materials - put texture on top face (index 4)
                            const newMaterials = [];
                            for (let i = 0; i < 6; i++) {
                                if (i === 4) {
                                    // Top face gets the house texture
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        map: texture,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));
                                } else if (i === 5) {
                                    // Bottom darker
                                    newMaterials.push(new THREE.MeshPhongMaterial({
                                        color: 0x020617,
                                        transparent: true,
                                        opacity: 0.8
                                    }));
                                } else {
                                    // Sides - colored
                                    newMaterials.push(new THREE.MeshPhongMaterial({
                                        color: color,
                                        emissive: color,
                                        emissiveIntensity: 0.2,
                                        transparent: true,
                                        opacity: 0.75
                                    }));
                                }
                            }

                            // Dispose old materials and update
                            if (block && block.material) {
                                if (Array.isArray(block.material)) {
                                    block.material.forEach(m => m.dispose());
                                }
                                block.material = newMaterials;
                            }
                        },
                        undefined,
                        (err) => {
                            console.warn(`⚠️ Failed to load texture for ${property.name}`, err);
                        }
                    );
                } else {
                    // Fallback: colored block if no coordinates
                    const geometry = new THREE.BoxGeometry(0.4, blockHeight, 0.4);
                    const material = new THREE.MeshPhongMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 0.3,
                        shininess: 100,
                        transparent: true,
                        opacity: 0.85
                    });
                    block = new THREE.Mesh(geometry, material);
                }

                // Position block so bottom is at ground plane (y=-10) and top is at y
                block.position.set(x, -10 + (blockHeight / 2), z);'''

# Replace
new_content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

if new_content == content:
    print("❌ ERROR: Could not find the pattern to replace!")
    print("Searching for a simpler pattern...")

    # Try simpler replacement
    if '// Create COLORED BLOCK from ground' in content:
        # Find the section manually
        start_idx = content.find('// Create COLORED BLOCK from ground')
        end_idx = content.find('block.position.set(x, -10 + (blockHeight / 2), z);', start_idx)

        if start_idx != -1 and end_idx != -1:
            end_idx += len('block.position.set(x, -10 + (blockHeight / 2), z);')
            old_section = content[start_idx:end_idx]
            new_content = content[:start_idx] + new_code + content[end_idx:]
            print("✅ Found and replaced using manual method!")
        else:
            print("❌ Still couldn't find it")
            exit(1)
    else:
        print("❌ Pattern not found at all")
        exit(1)

# Write the patched file
with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ SUCCESS! Patched enhancement_1_quantum_explorer.html")
print("🏠 Properties will now load as 3D textured houses with Street View images")
print("📍 Reload the Quantum Explorer to see the changes!")
