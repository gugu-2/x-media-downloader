# PowerShell script to create basic icon files for the extension
# This creates simple colored squares as placeholder icons

$iconSizes = @(16, 32, 48, 128)
$iconsDir = "icons"

# Create icons directory if it doesn't exist
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir
}

# Create a simple 1x1 blue pixel PNG (base64 encoded)
$bluePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

foreach ($size in $iconSizes) {
    $filename = "icons/icon$size.png"
    
    # Create a simple blue square PNG
    $pngHeader = [System.Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
    
    # Write the basic PNG file
    [System.IO.File]::WriteAllBytes($filename, $pngHeader)
    
    Write-Host "Created $filename"
}

Write-Host "Basic icon files created successfully!"
Write-Host "Note: These are placeholder icons. For better quality, use the HTML generator in icons/create_icons.html"