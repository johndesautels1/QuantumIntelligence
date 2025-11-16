#!/usr/bin/env python3
"""
Fix texture assignment:
- Front face (index 2) = Street View
- Top face (index 4) = Satellite
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the material creation and fix it
old_materials = '''// Update materials - put texture on top face (index 4)
                            const newMaterials = [];
                            for (let i = 0; i < 6; i++) {
                                if (i === 4) {
                                    // Top face gets the house texture (will switch based on camera angle)
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        map: texture,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));'''

new_materials = '''// Update materials - Street View on FRONT (2), Satellite will go on TOP (4)
                            const newMaterials = [];
                            for (let i = 0; i < 6; i++) {
                                if (i === 2) {
                                    // Front face gets Street View
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        map: texture,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));
                                } else if (i === 4) {
                                    // Top face - will get satellite (placeholder for now)
                                    newMaterials.push(new THREE.MeshStandardMaterial({
                                        color: color,
                                        roughness: 0.45,
                                        metalness: 0.05,
                                        emissive: new THREE.Color(color),
                                        emissiveIntensity: 0.15
                                    }));'''

content = content.replace(old_materials, new_materials)

# Now fix the satellite loading to actually work
old_satellite = '''// ALSO load satellite on top face immediately
                            if (satelliteUrl) {
                                const satLoader = new THREE.TextureLoader();
                                satLoader.setCrossOrigin("anonymous");
                                satLoader.load(
                                    satelliteUrl,
                                    (satTex) => {
                                        satTex.colorSpace = THREE.SRGBColorSpace;
                                        // Replace top face with satellite
                                        if (Array.isArray(block.material) && block.material[4]) {
                                            block.material[4].map = satTex;
                                            block.material[4].needsUpdate = true;
                                            console.log("Satellite view applied to top");
                                        }
                                    }
                                );
                            }'''

new_satellite = '''// Load satellite on top face AFTER materials are assigned
                            if (satelliteUrl) {
                                const satLoader = new THREE.TextureLoader();
                                satLoader.setCrossOrigin("anonymous");
                                satLoader.load(
                                    satelliteUrl,
                                    (satTex) => {
                                        satTex.colorSpace = THREE.SRGBColorSpace;
                                        satTex.minFilter = THREE.LinearFilter;
                                        // Apply to top face (index 4)
                                        if (block && Array.isArray(block.material) && block.material[4]) {
                                            block.material[4].map = satTex;
                                            block.material[4].needsUpdate = true;
                                            console.log(`🛰️ Satellite applied to TOP of ${property.name}`);
                                        }
                                    },
                                    undefined,
                                    (err) => console.warn(`Failed to load satellite for ${property.name}`)
                                );
                            }'''

content = content.replace(old_satellite, new_satellite)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("FIXED:")
print("- Front face (2) = Street View photo")
print("- Top face (4) = Satellite aerial view")
print("Reload now!")
