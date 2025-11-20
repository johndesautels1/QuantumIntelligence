# Performance & UX Fixes Summary

## Changes to Implement:

### 1. Performance Mode Toggle
- Add button to disable expensive animations
- Pause gravity calculations
- Reduce animation frame rate
- Disable photo rings and shockwaves

### 2. Lazy Loading 3D Models
- Start with NO 3D objects visible
- Only show spheres/houses when property selected in dropdown
- Hide 3D object when dropdown cleared

### 3. Delete Winner Diamond
- Remove crown creation function
- Remove crown animation
- Remove crown sprites from scene
- Keep winner detection for panels only

### 4. Verify Gravity Ordering
- Confirm: High COL score (affordable) = Float UP (green, top)
- Confirm: Low COL score (expensive) = Sink DOWN (red, bottom)
- Current formula is CORRECT: ((colScore - 50) / 50) * 2.0
- Score 100 → +2.0 (top), Score 0 → -2.0 (bottom)

