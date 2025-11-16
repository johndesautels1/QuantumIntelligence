/**
 * CLUES Quantum 3D Houses Module
 * Replaces colored blocks with 3D textured house models from Google Street View
 */

// Global API Key (should match the one in the HTML)
const GOOGLE_API_KEY = 'AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw';

/**
 * Create a 3D textured house from Google Street View
 * @param {Object} property - Property object with location data
 * @param {number} x - X position in 3D space
 * @param {number} y - Y position in 3D space
 * @param {number} z - Z position in 3D space
 * @param {number} blockHeight - Height of the block/house
 * @param {number} color - Base color for the house (hex)
 * @param {number} avgScore - Average score for the property
 * @param {number} index - Property index
 * @returns {THREE.Mesh} - The created 3D house mesh
 */
function create3DTexturedHouse(property, x, y, z, blockHeight, color, avgScore, index) {
    // Get property coordinates
    const lat = property.location?.latitude || property.location?.lat ||
                property.address?.latitude || property.basic?.coordinates?.latitude || 0;
    const lng = property.location?.longitude || property.location?.lng ||
                property.address?.longitude || property.basic?.coordinates?.longitude || 0;

    // Generate Google Street View URL
    const streetViewUrl = lat !== 0 && lng !== 0
        ? `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&fov=90&pitch=10&heading=0&key=${GOOGLE_API_KEY}`
        : null;

    console.log(`🏠 Creating 3D house for ${property.name}:`, { lat, lng, streetViewUrl });

    // Create block (will be textured or colored)
    let block;

    if (streetViewUrl) {
        // Create geometry for textured house (3D block that will show texture on top)
        const houseWidth = 1.4;
        const houseDepth = 1.0;
        const houseThickness = Math.max(0.4, blockHeight * 0.12); // Thinner slab for house

        const geometry = new THREE.BoxGeometry(houseWidth, houseThickness, houseDepth);

        // Create initial placeholder materials (will be updated when texture loads)
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

        // Tilt the house to show the texture
        block.rotation.x = -0.4; // Tilt down to show top face
        block.rotation.y = 0.5; // Slight rotation for 3D effect

        // Load the Street View texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');

        textureLoader.load(
            streetViewUrl,
            (texture) => {
                // Texture loaded successfully
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;

                console.log(`✨ Texture loaded for ${property.name}`);

                // Create new materials with texture on top face
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
                        // Bottom face - darker
                        newMaterials.push(new THREE.MeshPhongMaterial({
                            color: 0x020617,
                            roughness: 0.9,
                            metalness: 0.0,
                            transparent: true,
                            opacity: 0.8
                        }));
                    } else {
                        // Side faces - colored based on property score
                        newMaterials.push(new THREE.MeshPhongMaterial({
                            color: color,
                            emissive: color,
                            emissiveIntensity: 0.2,
                            roughness: 0.7,
                            metalness: 0.1,
                            transparent: true,
                            opacity: 0.75
                        }));
                    }
                }

                // Update the mesh materials
                if (block && block.material) {
                    // Dispose old materials
                    if (Array.isArray(block.material)) {
                        block.material.forEach(m => m.dispose());
                    }
                    block.material = newMaterials;
                }
            },
            undefined,
            (err) => {
                console.warn(`⚠️ Failed to load texture for ${property.name}:`, err);
                // Keep the colored placeholder materials
            }
        );

    } else {
        // Fallback: colored block if no coordinates
        console.warn(`⚠️ No coordinates for ${property.name}, using colored block`);
        const geometry = new THREE.BoxGeometry(0.5, blockHeight, 0.5);
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

    // Position block
    block.position.set(x, -10 + (blockHeight / 2), z);

    // Store property data in userData
    block.userData = {
        property: property,
        propertyIndex: index,
        baseColor: color,
        avgScore: avgScore,
        hasTexture: !!streetViewUrl
    };

    return block;
}

/**
 * Add levitation animation to houses
 * Call this in your animation loop
 */
function animateLevitatingHouses(propertyMeshes, time) {
    propertyMeshes.forEach((mesh, index) => {
        if (mesh && mesh.userData.hasTexture) {
            // Gentle floating animation
            const t = time * 0.001 + (index * 0.3); // Offset each house's animation
            const baseY = mesh.position.y;
            const floatAmount = Math.sin(t * 2.1) * 0.08; // Gentle up/down motion

            // Don't override the base Y position, just add the float
            // Store original Y if not already stored
            if (mesh.userData.originalY === undefined) {
                mesh.userData.originalY = baseY;
            }

            mesh.position.y = mesh.userData.originalY + floatAmount;
        }
    });
}

/**
 * Add constellation mode - arrange multiple houses in a circular pattern
 */
function createHouseConstellation(properties, scene, radius = 15) {
    const houses = [];

    properties.forEach((property, index) => {
        const angle = (index / properties.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 0;

        const avgScore = 75; // Default score
        const color = getColorForValue(avgScore);
        const blockHeight = 2.0;

        const house = create3DTexturedHouse(
            property, x, y, z, blockHeight, color, avgScore, index
        );

        scene.add(house);
        houses.push(house);
    });

    return houses;
}

/**
 * Helper function to get color based on score
 * (This should match the one in your main file)
 */
function getColorForValue(value) {
    // Map 0-100 to color gradient: red -> yellow -> green
    if (value >= 75) return 0x00FF00; // Green (excellent)
    if (value >= 50) return 0xFFFF00; // Yellow (good)
    if (value >= 25) return 0xFFA500; // Orange (fair)
    return 0xFF0000; // Red (poor)
}

// Export for use in the main file
if (typeof window !== 'undefined') {
    window.QuantumHouses = {
        create3DTexturedHouse,
        animateLevitatingHouses,
        createHouseConstellation,
        getColorForValue
    };
}
