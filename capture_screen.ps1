# Wait for page to load
Start-Sleep -Seconds 5

# Load required assemblies
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Capture the screen
$bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $bounds.Width, $bounds.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($bounds.Location, [System.Drawing.Point]::Empty, $bounds.Size)

# Save the screenshot
$filepath = "C:\Users\broke\CLUES_Quantum_App\screenshot.png"
$bitmap.Save($filepath)

# Clean up
$graphics.Dispose()
$bitmap.Dispose()

Write-Host "Screenshot saved to $filepath"