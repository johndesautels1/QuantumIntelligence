#!/usr/bin/env python3
"""
Final enhancements:
1. Double house size again (5.6x4.0)
2. Make houses billboard/face camera
3. Higher quality images (1600x1200)
4. Click to explode into full-size modal
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Double house size again
content = content.replace('const houseWidth = 2.8;', 'const houseWidth = 5.6;')
content = content.replace('const houseDepth = 2.0;', 'const houseDepth = 4.0;')

# 2. Higher quality Street View images
content = content.replace('size=1200x900', 'size=1600x1200')

# 3. Remove fixed rotation, make houses billboard (always face camera)
# Find the rotation setting and replace with billboard behavior
old_rotation = '''block.rotation.x = -0.4; // Tilt to show texture
                    block.rotation.y = 0.5;  // Slight rotation'''

new_rotation = '''// Billboard behavior - will face camera in animate loop
                    block.userData.isBillboard = true;'''

content = content.replace(old_rotation, new_rotation)

# 4. Add billboard update in animate loop
# Find the animate function and add billboard logic
old_animate_start = '''function animate() {
            requestAnimationFrame(animate);'''

new_animate_start = '''function animate() {
            requestAnimationFrame(animate);

            // Update billboards to face camera
            propertyMeshes.forEach(mesh => {
                if (mesh && mesh.userData.isBillboard) {
                    // Make house face camera
                    mesh.lookAt(camera.position);
                    // Tilt slightly down so we see the top texture
                    mesh.rotation.x = -0.3;
                }
            });'''

content = content.replace(old_animate_start, new_animate_start)

# 5. Add click handler for houses to show modal
# Find where we add raycaster click and enhance it
old_click = '''if (intersects.length > 0) {
                const clickedObject = intersects[0].object;'''

new_click = '''if (intersects.length > 0) {
                const clickedObject = intersects[0].object;

                // If clicked on a house mesh, explode into full modal
                if (clickedObject.userData && clickedObject.userData.property) {
                    explodeHouseModal(clickedObject.userData.property, clickedObject);
                    return;
                }'''

content = content.replace(old_click, new_click)

# 6. Add explodeHouseModal function before the animate function
explode_function = '''
        // Explode house into full-size modal with data
        function explodeHouseModal(property, houseMesh) {
            console.log('🎆 Exploding house:', property.name);

            // Get property position
            const housePos = houseMesh.position.clone();

            // Create full-size house (10x larger)
            const explodedWidth = 56;
            const explodedDepth = 40;
            const explodedHeight = 5;

            const geometry = new THREE.BoxGeometry(explodedWidth, explodedHeight, explodedDepth);

            // Clone materials from original house
            const materials = [];
            if (Array.isArray(houseMesh.material)) {
                houseMesh.material.forEach(mat => materials.push(mat.clone()));
            }

            const explodedHouse = new THREE.Mesh(geometry, materials);
            explodedHouse.position.copy(housePos);
            explodedHouse.position.y += 10; // Float above
            explodedHouse.lookAt(camera.position);
            explodedHouse.rotation.x = -0.3;
            scene.add(explodedHouse);

            // Animate explosion
            let scale = 0.1;
            const explodeInterval = setInterval(() => {
                scale += 0.1;
                explodedHouse.scale.set(scale, scale, scale);

                if (scale >= 1.0) {
                    clearInterval(explodeInterval);

                    // Show property modal after explosion
                    showPropertyModal(property);

                    // Remove exploded house after 3 seconds
                    setTimeout(() => {
                        scene.remove(explodedHouse);
                        explodedHouse.geometry.dispose();
                        if (Array.isArray(explodedHouse.material)) {
                            explodedHouse.material.forEach(m => m.dispose());
                        }
                    }, 3000);
                }
            }, 30);

            // Camera zoom to house
            const targetPos = housePos.clone();
            targetPos.y += 5;
            controls.target.copy(targetPos);
            camera.position.set(housePos.x + 30, housePos.y + 20, housePos.z + 30);
        }

'''

# Insert before animate function
animate_pos = content.find('function animate() {')
content = content[:animate_pos] + explode_function + content[animate_pos:]

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Final enhancements applied:")
print("1. Houses now 2X LARGER (5.6x4.0 - 4x original size)")
print("2. Houses BILLBOARD - always face camera as you rotate")
print("3. Higher quality images (1600x1200)")
print("4. Click house to EXPLODE into full-size with modal")
print("")
print("Reload to see the changes!")
