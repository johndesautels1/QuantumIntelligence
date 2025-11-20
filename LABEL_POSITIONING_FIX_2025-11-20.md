# 🏷️ Label Positioning Fix - November 20, 2025

## Problem

User reported: **"the tags are too close to the spheres and houses we need to attach them to a tiny little rod and drop them slightly below the houses and spheres so they can be read"**

## Solution

Added connecting rod and moved score labels further below the 3D objects for better readability.

---

## Changes Made

### 1. Label Position (Line 5647)
**Before:**
```javascript
labelSprite.position.set(sphere.position.x, -0.3, sphere.position.z);
```

**After:**
```javascript
const labelYPosition = sphere.position.y - 2.2; // Drop label 2.2 units below sphere center
labelSprite.position.set(sphere.position.x, labelYPosition, sphere.position.z);
```

**Impact:** Labels now positioned 2.2 units below the sphere/house center instead of fixed Y = -0.3, providing much more clearance.

---

### 2. Connecting Rod (Lines 5651-5666)
**Added:**
```javascript
// Create small connecting rod from bottom of sphere/house to label
const sphereBottomY = sphere.position.y - 1.0; // Approximate bottom of sphere/house
const rodGeometry = new THREE.BufferGeometry();
const rodPoints = [
    new THREE.Vector3(sphere.position.x, sphereBottomY, sphere.position.z), // Bottom of sphere
    new THREE.Vector3(sphere.position.x, labelYPosition + 0.5, sphere.position.z) // Top of label
];
rodGeometry.setFromPoints(rodPoints);
const rodMaterial = new THREE.LineBasicMaterial({
    color: color,
    opacity: 0.8,
    transparent: true,
    linewidth: 2
});
const rod = new THREE.Line(rodGeometry, rodMaterial);
scene.add(rod);
```

**Impact:** Visual connection between sphere/house and its label, making it clear which label belongs to which object.

---

### 3. Rod Storage (Line 5670)
**Added:**
```javascript
line.userData.rod = rod;
```

**Impact:** Rod reference stored for proper cleanup when indicators are removed.

---

### 4. Rod Cleanup - Location 1 (Lines 5578-5580)
**Function:** `updateGravityIndicator()`

**Added:**
```javascript
if (gravityIndicators[slot].userData.rod) {
    scene.remove(gravityIndicators[slot].userData.rod);
}
```

**Impact:** Rod properly removed when indicator updates (happens every frame during gravity positioning).

---

### 5. Rod Cleanup - Location 2 (Lines 5762-5764)
**Function:** `toggle3DModel()`

**Added:**
```javascript
if (gravityIndicators[slot].userData.rod) {
    scene.remove(gravityIndicators[slot].userData.rod);
}
```

**Impact:** Rod properly removed when user toggles between 3D houses and classic spheres.

---

### 6. Rod Cleanup - Location 3 (Lines 5834-5836)
**Function:** `toggleGravity()`

**Added:**
```javascript
if (gravityIndicators[slot].userData.rod) {
    scene.remove(gravityIndicators[slot].userData.rod);
}
```

**Impact:** Rod properly removed when user disables gravity mode.

---

## Visual Design

**Rod Specifications:**
- **Color:** Matches Smart Score color (green/blue/yellow/orange/red)
- **Opacity:** 0.8 (slightly transparent)
- **Width:** 2px (thin, unobtrusive)
- **Start Point:** Bottom of sphere/house (Y = sphere.position.y - 1.0)
- **End Point:** Top of label (Y = labelYPosition + 0.5)

**Label Position:**
- **Offset:** 2.2 units below sphere center
- **Dynamic:** Follows sphere vertical position (important for gravity mode)
- **Clearance:** Enough space to read label even when sphere is at lowest position

---

## Technical Details

### Three.js Line Geometry
Used `THREE.BufferGeometry` with `setFromPoints()` for efficient line rendering:
- Creates line between two Vector3 points
- Uses `LineBasicMaterial` for simple colored line
- Minimal performance impact (2 vertices per rod)

### Dynamic Positioning
Rod and label positions are **recalculated every frame** in `updateGravityIndicator()` when gravity is enabled:
- Rod start point always tracks bottom of sphere/house
- Rod end point always tracks top of label
- Rod color updates to match current Smart Score tier

### Memory Management
Rods are properly cleaned up in 3 scenarios:
1. **Indicator Update:** Old rod removed before creating new one
2. **Mode Toggle:** All rods removed when switching house/sphere mode
3. **Gravity Toggle:** All rods removed when gravity disabled

---

## Testing Checklist

### Hard Refresh Required
**Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
**Mac:** `Cmd + Shift + R`

### Test Cases

1. **Basic Visibility:**
   - ✅ Select 3 properties
   - ✅ Labels appear below houses/spheres with connecting rods
   - ✅ Rods match Smart Score colors (green/blue/yellow/orange/red)

2. **Gravity Mode:**
   - ✅ Change persona to adjust Smart Scores
   - ✅ Houses float up/down based on scores
   - ✅ Labels and rods follow houses smoothly
   - ✅ Rods always connect bottom of house to top of label

3. **Readability:**
   - ✅ Labels clearly readable with new 2.2 unit offset
   - ✅ Labels don't overlap with houses even at lowest position
   - ✅ Connecting rod makes it clear which label belongs to which property

4. **Mode Toggle:**
   - ✅ Switch from 3D houses to classic spheres
   - ✅ Labels and rods properly recreated for new mode
   - ✅ No leftover rods from previous mode

5. **Gravity Toggle:**
   - ✅ Disable gravity
   - ✅ All rods and labels removed cleanly
   - ✅ Re-enable gravity
   - ✅ Rods and labels recreated at correct positions

---

## Files Modified

- **src/enhancement_3_holographic_sphere.html**
  - Lines 5646-5670: Added rod creation and label repositioning
  - Lines 5578-5580: Added rod cleanup in `updateGravityIndicator()`
  - Lines 5762-5764: Added rod cleanup in `toggle3DModel()`
  - Lines 5834-5836: Added rod cleanup in `toggleGravity()`

---

## Performance Impact

**Minimal** - Each rod adds:
- 2 vertices (Vector3) = 24 bytes
- 1 Three.js Line object = ~200 bytes
- 1 LineBasicMaterial = ~150 bytes

**Total per property:** ~400 bytes
**Max 3 properties:** ~1.2 KB

**Rendering:** Lines are extremely cheap to render (2 vertices vs. 1000+ for house mesh).

---

## Visual Comparison

**Before:**
```
     🏠 House
    -------- (Y = 0)
[Score: 85 Good] ← TOO CLOSE, hard to read
```

**After:**
```
     🏠 House
      |
      | ← Thin colored rod
      |
    -------- (Y = 0)


[Score: 85 Good] ← Clear separation, easy to read
```

---

## Future Enhancements (Optional)

1. **Adjustable Label Distance:** Allow user to customize Y offset in settings
2. **Rod Thickness:** Make rod width configurable
3. **Label Background Opacity:** Add slider for label background transparency
4. **Rod Animation:** Subtle pulsing effect for winning property
5. **Curved Rod:** Use THREE.QuadraticBezierCurve3 for aesthetic curved connection

---

## Related Functions

- `updateGravityIndicator(sphere, slot, overallScore, gravityOffset)` - Lines 5572-5671 (creates rod and label)
- `toggle3DModel()` - Lines 5726-5801 (cleans up rods on mode change)
- `toggleGravity()` - Lines 5817-5844 (cleans up rods on gravity disable)
- `updateConnectedObjects()` - Lines 5673-5724 (follows sphere position)

---

## Notes

**Why 2.2 units offset?**
- Sphere/house height is ~2 units
- 2.2 units provides clearance even when sphere at Y = 0
- Prevents label from clipping into ground plane

**Why start rod at Y = sphere.position.y - 1.0?**
- Approximates bottom of sphere (radius ~1 unit)
- For houses, aligns with bottom of main body
- Prevents rod from overlapping house interior

**Why end rod at Y = labelYPosition + 0.5?**
- Label height is ~1 unit (scaled to 2.0 x 1.0)
- 0.5 connects to approximate top edge of label
- Creates visual "pin" effect connecting label to house
