#!/usr/bin/env python3
"""
Add Google Maps satellite view on top of houses when viewing from above
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the Street View URL creation to add BOTH street view AND satellite view
old_url_creation = '''const streetViewUrl = lat !== 0 && lng !== 0
                    ? `https://maps.googleapis.com/maps/api/streetview?size=1600x1200&location=${lat},${lng}&fov=90&pitch=10&heading=0&key=AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw`
                    : null;'''

new_url_creation = '''// Street View for front/side view
                const streetViewUrl = lat !== 0 && lng !== 0
                    ? `https://maps.googleapis.com/maps/api/streetview?size=1600x1200&location=${lat},${lng}&fov=90&pitch=10&heading=0&key=AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw`
                    : null;

                // Satellite view for top view (Google Maps Static API)
                const satelliteUrl = lat !== 0 && lng !== 0
                    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=19&size=1600x1200&maptype=satellite&key=AIzaSyAtnlfmqoHQkiJXc3KYUeR5_4mUupOPLbw`
                    : null;'''

content = content.replace(old_url_creation, new_url_creation)

# Now modify the texture loading to load BOTH textures
# Find the texture load section and add satellite texture loading
old_texture_load = '''// Load Street View texture
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
                                    }));'''

new_texture_load = '''// Load Street View texture
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.setCrossOrigin('anonymous');

                    // Load satellite texture for top view
                    let satelliteTexture = null;
                    if (satelliteUrl) {
                        textureLoader.load(
                            satelliteUrl,
                            (tex) => {
                                tex.colorSpace = THREE.SRGBColorSpace;
                                tex.minFilter = THREE.LinearFilter;
                                satelliteTexture = tex;
                                console.log(`🛰️ Satellite texture loaded for ${property.name}`);

                                // Store for switching
                                block.userData.satelliteTexture = satelliteTexture;
                            },
                            undefined,
                            (err) => console.warn(`Failed to load satellite for ${property.name}`)
                        );
                    }

                    textureLoader.load(
                        streetViewUrl,
                        (texture) => {
                            // Texture loaded successfully
                            texture.colorSpace = THREE.SRGBColorSpace;
                            texture.minFilter = THREE.LinearFilter;

                            console.log(`✨ Street View texture loaded for ${property.name}`);

                            // Store both textures in userData
                            block.userData.streetViewTexture = texture;

                            // Update materials - put texture on top face (index 4)
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

content = content.replace(old_texture_load, new_texture_load)

# Add camera angle detection in animate loop to switch textures
old_billboard = '''// Update billboards to face camera
            propertyMeshes.forEach(mesh => {
                if (mesh && mesh.userData.isBillboard) {
                    // Make house face camera
                    mesh.lookAt(camera.position);
                    // Tilt slightly down so we see the top texture
                    mesh.rotation.x = -0.3;
                }
            });'''

new_billboard = '''// Update billboards to face camera and switch textures based on view angle
            propertyMeshes.forEach(mesh => {
                if (mesh && mesh.userData.isBillboard) {
                    // Make house face camera
                    mesh.lookAt(camera.position);

                    // Calculate camera angle (pitch)
                    const cameraDir = new THREE.Vector3();
                    camera.getWorldDirection(cameraDir);
                    const pitch = Math.asin(cameraDir.y); // Angle from horizontal

                    // If looking down from above (pitch < -30 degrees), show satellite view
                    const isTopView = pitch < -0.52; // -30 degrees in radians

                    // Switch texture on top face based on view angle
                    if (Array.isArray(mesh.material) && mesh.material[4]) {
                        const topFaceMaterial = mesh.material[4];

                        if (isTopView && mesh.userData.satelliteTexture) {
                            // Show satellite view from above
                            if (topFaceMaterial.map !== mesh.userData.satelliteTexture) {
                                topFaceMaterial.map = mesh.userData.satelliteTexture;
                                topFaceMaterial.needsUpdate = true;
                            }
                            mesh.rotation.x = -1.57; // Face up (90 degrees)
                        } else if (mesh.userData.streetViewTexture) {
                            // Show street view from side/front
                            if (topFaceMaterial.map !== mesh.userData.streetViewTexture) {
                                topFaceMaterial.map = mesh.userData.streetViewTexture;
                                topFaceMaterial.needsUpdate = true;
                            }
                            mesh.rotation.x = -0.3; // Tilt slightly
                        }
                    }
                }
            });'''

content = content.replace(old_billboard, new_billboard)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS!")
print("Added satellite view that appears when viewing from above:")
print("- Street View shows when looking from front/side")
print("- Satellite view shows when looking from top (camera pitched down >30 degrees)")
print("- Automatic switching based on camera angle")
print("")
print("Reload to see it!")
