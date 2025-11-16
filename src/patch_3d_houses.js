// Node.js script to patch the Quantum Explorer with REAL 3D textured houses
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'enhancement_1_quantum_explorer.html');
const content = fs.readFileSync(filePath, 'utf8');

// The OLD code (colored blocks)
const oldCode = `                // Create COLORED BLOCK from ground (-10) to top (y)
                const blockHeight = Math.max(0.2, y - (-10)); // Ensure minimum height
                const geometry = new THREE.BoxGeometry(0.4, blockHeight, 0.4);
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.3,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.85
                });

                const block = new THREE.Mesh(geometry, material);
                // Position block so bottom is at ground plane (y=-10) and top is at y
                block.position.set(x, -10 + (blockHeight / 2), z);`;

// The NEW code (3D textured houses with Street View)
const newCode = `                // Create 3D TEXTURED HOUSE from Google Street View
                const blockHeight = Math.max(0.2, y - (-10)); // Ensure minimum height

                // Generate Google Street View URL for this property
                const streetViewUrl = lat !== 0 && lng !== 0
                    ? \`https://maps.googleapis.com/maps/api/streetview?size=800x600&location=\${lat},\${lng}&fov=90&pitch=10&heading=0&key=AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw\`
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

                            console.log(\`✨ Texture loaded for \${property.name}\`);

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
                            console.warn(\`⚠️ Failed to load texture for \${property.name}\`, err);
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
                block.position.set(x, -10 + (blockHeight / 2), z);`;

// Replace the code
const newContent = content.replace(oldCode, newCode);

if (newContent === content) {
    console.error('❌ ERROR: Could not find the old code to replace!');
    console.log('Looking for this pattern:');
    console.log(oldCode.substring(0, 100) + '...');
    process.exit(1);
}

// Write the new file
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('✅ SUCCESS! Patched enhancement_1_quantum_explorer.html with 3D textured houses!');
console.log('🏠 Properties will now load Google Street View images as textures');
console.log('📍 Make sure your properties have lat/lng coordinates');
