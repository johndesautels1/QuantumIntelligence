# 🏠 CLUES Quantum 3D Textured Homes - Integration Guide

## Overview

This integration adds **5D levitating homes with Google Street View textures** to your Quantum Explorer. Properties are now displayed as 3D textured house slabs instead of colored blocks!

## Files Created

1. **`src/quantum-3d-houses.js`** - Core 3D house creation module
2. **`src/enhancement_1_quantum_explorer_3d.html`** - Standalone demo
3. **`src/enhancement_1_quantum_explorer.html.backup`** - Backup of original file

## Features Added

✨ **3D Textured Houses**
- Properties load Google Street View images as textures
- Houses are displayed as tilted 3D slabs showing the street view on top
- Colored side faces indicate property score/quality

🎈 **Levitation Animation**
- Gentle floating motion for all houses
- Each house has a unique animation phase
- Creates a "quantum levitation" effect

🌟 **Constellation Mode**
- Arrange multiple properties in a circular pattern
- Perfect for comparing neighborhoods
- Camera auto-frames all houses

🎨 **Smart Fallbacks**
- If Street View fails, shows colored block
- Graceful degradation for properties without coordinates
- Maintains all existing functionality

---

## Quick Start - Try the Demo

1. **Open the standalone demo:**
   ```bash
   cd CLUES_Quantum_App/src
   # Open in browser:
   open enhancement_1_quantum_explorer_3d.html
   # OR start a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000/enhancement_1_quantum_explorer_3d.html
   ```

2. **You should see:**
   - 5 sample houses arranged in a circle
   - Each house loading Google Street View images
   - Gentle levitation animation
   - 3D orbit controls (drag to rotate, scroll to zoom)

---

## Integration into Main Quantum Explorer

### Option 1: Simple Script Include (Recommended)

1. **Add the script to your HTML head** (around line 14):

```html
<!-- 3D Graphics -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script src="lib/OrbitControls.js"></script>

<!-- 🆕 ADD THIS LINE -->
<script src="quantum-3d-houses.js"></script>
```

2. **Replace the block creation code** in `createPropertyMeshes()` function (around line 1780):

**FIND THIS:**
```javascript
// Create COLORED BLOCK from ground (-10) to top (y)
const blockHeight = Math.max(0.2, y - (-10));
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
block.position.set(x, -10 + (blockHeight / 2), z);
```

**REPLACE WITH:**
```javascript
// Create 3D TEXTURED HOUSE from Google Street View
const blockHeight = Math.max(0.2, y - (-10));

const block = window.QuantumHouses.create3DTexturedHouse(
    property,      // property object
    x,             // x position
    y,             // y position
    z,             // z position
    blockHeight,   // height of the house
    color,         // base color
    avgScore,      // average score
    index          // property index
);

block.position.set(x, -10 + (blockHeight / 2), z);
```

3. **Add levitation animation** to your `animate()` function (around line 2100):

```javascript
function animate() {
    requestAnimationFrame(animate);

    // 🆕 ADD THIS LINE - Levitate the houses
    window.QuantumHouses.animateLevitatingHouses(propertyMeshes, performance.now());

    // ... rest of your animation code
    controls.update();
    renderer.render(scene, camera);
}
```

4. **Done!** Refresh your browser and watch houses load with Street View textures!

---

### Option 2: Use the Pre-Built Version

Simply use **`enhancement_1_quantum_explorer_3d.html`** which already has everything integrated.

---

## API Reference

### `window.QuantumHouses.create3DTexturedHouse()`

Creates a 3D textured house from a property object.

**Parameters:**
- `property` (Object) - Property object with location data
- `x` (Number) - X position in 3D space
- `y` (Number) - Y position in 3D space
- `z` (Number) - Z position in 3D space
- `blockHeight` (Number) - Height of the house block
- `color` (Hex Number) - Base color for the house (e.g., `0x00FF00`)
- `avgScore` (Number) - Average score (0-100)
- `index` (Number) - Property index

**Returns:** `THREE.Mesh` - The created 3D house

**Example:**
```javascript
const house = window.QuantumHouses.create3DTexturedHouse(
    myProperty,
    5.0,    // x
    2.0,    // y
    -3.0,   // z
    4.5,    // height
    0x00FF00,  // green
    85,     // score
    0       // index
);
scene.add(house);
```

---

### `window.QuantumHouses.animateLevitatingHouses()`

Adds gentle floating animation to an array of house meshes.

**Parameters:**
- `propertyMeshes` (Array<THREE.Mesh>) - Array of house meshes
- `time` (Number) - Current time in milliseconds (use `performance.now()`)

**Example:**
```javascript
function animate() {
    requestAnimationFrame(animate);

    // Animate houses
    window.QuantumHouses.animateLevitatingHouses(
        propertyMeshes,
        performance.now()
    );

    renderer.render(scene, camera);
}
```

---

### `window.QuantumHouses.createHouseConstellation()`

Creates multiple houses arranged in a circular constellation pattern.

**Parameters:**
- `properties` (Array<Object>) - Array of property objects
- `scene` (THREE.Scene) - Three.js scene to add houses to
- `radius` (Number, optional) - Radius of the constellation circle (default: 15)

**Returns:** `Array<THREE.Mesh>` - Array of created house meshes

**Example:**
```javascript
const houses = window.QuantumHouses.createHouseConstellation(
    myProperties,
    scene,
    20  // radius
);

console.log(`Created ${houses.length} houses in constellation mode`);
```

---

## Customization

### Change House Size

Edit `quantum-3d-houses.js` line 35-37:

```javascript
const houseWidth = 1.4;   // Width of house slab
const houseDepth = 1.0;   // Depth of house slab
const houseThickness = Math.max(0.4, blockHeight * 0.12); // Thickness
```

### Change House Tilt

Edit `quantum-3d-houses.js` line 60-61:

```javascript
block.rotation.x = -0.4; // Tilt down (show top face)
block.rotation.y = 0.5;  // Rotation for 3D effect
```

### Change Levitation Animation

Edit `quantum-3d-houses.js` line 152:

```javascript
const floatAmount = Math.sin(t * 2.1) * 0.08; // Amplitude & speed
```

### Use Different Image Sources

You can modify the Street View URL generation in `quantum-3d-houses.js` line 24:

```javascript
// Current: Google Street View
const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?...`;

// Alternative: Use property MLS photo if available
const streetViewUrl = property.media?.photos?.[0]?.url ||
                     `https://maps.googleapis.com/maps/api/streetview?...`;

// Alternative: Zillow images (requires scraping/API)
const streetViewUrl = property.zillowImageUrl || streetViewUrl;
```

---

## Troubleshooting

### ❌ Textures Not Loading

**Problem:** Houses appear as colored blocks, textures don't load

**Solutions:**
1. Check your Google API key is valid
2. Check browser console for CORS errors
3. Ensure properties have valid lat/lng coordinates
4. Test the Street View URL manually in browser

**Debug:**
```javascript
// Check if property has coordinates
console.log(property.location?.latitude, property.location?.longitude);

// Test Street View URL
const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=YOUR_KEY`;
console.log(url); // Open this in browser
```

### ❌ Houses Not Levitating

**Problem:** Houses are static, no floating animation

**Solution:** Make sure you added the animation call:

```javascript
// In your animate() function:
window.QuantumHouses.animateLevitatingHouses(propertyMeshes, performance.now());
```

### ❌ Module Not Found Error

**Problem:** `Cannot read property 'create3DTexturedHouse' of undefined`

**Solution:** Ensure the script is loaded:

```html
<!-- Add AFTER Three.js -->
<script src="quantum-3d-houses.js"></script>
```

### ❌ Houses Too Small/Large

**Problem:** Houses are not the right size

**Solution:** Adjust the size multipliers in `quantum-3d-houses.js`:

```javascript
// Line 35-37
const houseWidth = 2.0;    // Make wider
const houseDepth = 1.5;    // Make deeper
const houseThickness = 0.6; // Make thicker
```

---

## Performance Notes

- **Texture Loading:** Textures load asynchronously, so houses appear as colored blocks until loaded
- **Memory:** Each texture uses ~200KB, so 100 properties = ~20MB
- **FPS:** Should maintain 60fps with up to 100 textured houses on modern GPUs
- **Mobile:** Works on mobile but may be slower with many houses

**Optimization Tips:**
```javascript
// Reduce texture size in URL
?size=400x300  // Instead of 800x600

// Dispose textures when removing houses
if (house.material && house.material[4]?.map) {
    house.material[4].map.dispose();
}
```

---

## Next Steps

1. ✅ **Test the demo** - Open `enhancement_1_quantum_explorer_3d.html`
2. ✅ **Integrate into main file** - Follow Option 1 above
3. 🔄 **Customize appearance** - Adjust sizes, colors, animations
4. 🚀 **Deploy** - Add to your production app

---

## Support

**Questions?** Check the inline comments in:
- `quantum-3d-houses.js` - Module code
- `enhancement_1_quantum_explorer_3d.html` - Demo implementation

**Issues?** Check the Troubleshooting section above.

---

## Changelog

### v1.0.0 (2025-11-16)
- ✅ Initial release
- ✅ 3D textured houses from Google Street View
- ✅ Levitation animation
- ✅ Constellation mode
- ✅ Standalone demo
- ✅ Integration guide

---

**Built with ❤️ for CLUES™ Quantum Intelligence Platform**
