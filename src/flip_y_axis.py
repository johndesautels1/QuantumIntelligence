#!/usr/bin/env python3
"""
Flip the visualization upside down so rods and houses go UPWARD from the plane
instead of downward.

Current: Everything at y=-10 going down
Fix: Everything at y=0 (ground plane) going UP
"""

with open('enhancement_1_quantum_explorer.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix the Y calculation - flip from downward to upward
# Currently: y = ((matchScore / 100) * 20) - 10  (ranges from -10 to +10)
# New: y = (matchScore / 100) * 20  (ranges from 0 to +20)
old_y_calc = 'const y = ((matchScore / 100) * 20) - 10;'
new_y_calc = 'const y = (matchScore / 100) * 20;  // Score 0=0, 50=10, 100=20'

content = content.replace(old_y_calc, new_y_calc)

# 2. Fix blockHeight calculation - measure from ground plane at 0
# Currently: blockHeight = Math.max(0.2, y - (-10))
# New: blockHeight = Math.max(0.2, y)  (since y is now 0 to 20)
old_blockheight = 'const blockHeight = Math.max(0.2, y - (-10));'
new_blockheight = 'const blockHeight = Math.max(0.2, y);  // Height from ground (y=0)'

content = content.replace(old_blockheight, new_blockheight)

# 3. Fix block position - bottom at ground plane (y=0), top at y
# Currently: block.position.set(x, -10 + (blockHeight / 2), z);
# New: block.position.set(x, blockHeight / 2, z);  // Center at half height
old_block_pos = 'block.position.set(x, -10 + (blockHeight / 2), z);'
new_block_pos = 'block.position.set(x, blockHeight / 2, z);  // Bottom at y=0, top at y'

content = content.replace(old_block_pos, new_block_pos)

# 4. Fix rod position - bottom at ground plane (y=0)
# Currently: rod.position.set(x, -10 + (rodHeight / 2), z);
# New: rod.position.set(x, rodHeight / 2, z);
old_rod_pos = 'rod.position.set(x, -10 + (rodHeight / 2), z);'
new_rod_pos = 'rod.position.set(x, rodHeight / 2, z);  // Rod from ground up'

content = content.replace(old_rod_pos, new_rod_pos)

# 5. Fix the ground plane position itself
# Currently: gridHelper at y=-10
# New: gridHelper at y=0
old_grid = 'gridHelper.position.y = -10;'
new_grid = 'gridHelper.position.y = 0;  // Ground plane at y=0'

content = content.replace(old_grid, new_grid)

# 6. Fix update visualization target position
# Currently: const targetY = -10 + (blockHeight / 2);
# New: const targetY = blockHeight / 2;
old_target_y = 'const targetY = -10 + (blockHeight / 2);'
new_target_y = 'const targetY = blockHeight / 2;  // Position from ground up'

content = content.replace(old_target_y, new_target_y)

with open('enhancement_1_quantum_explorer.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("FLIPPED Y-AXIS:")
print("- Ground plane now at y=0 (was y=-10)")
print("- Houses and rods now go UPWARD from ground")
print("- Score 0 = y=0 (ground)")
print("- Score 50 = y=10 (middle)")
print("- Score 100 = y=20 (top)")
print("")
print("Reload to see houses ABOVE the plane!")
