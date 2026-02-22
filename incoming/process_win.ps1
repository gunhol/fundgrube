param (
    [int]$MaxWidth = 800
)

# Load System.Drawing for image manipulation
Add-Type -AssemblyName System.Drawing

$TargetDir = "..\public\items"

if (!(Test-Path -Path $TargetDir)) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

$Images = Get-ChildItem -Path . -Include *.jpg, *.jpeg, *.png, *.gif, *.bmp -Recurse

foreach ($Image in $Images) {
    # Skip the script files if matched accidentally
    if ($Image.Name -match "^process_") { continue }

    $BaseName = $Image.BaseName -replace ' ', '-'
    $Extension = $Image.Extension.ToLower()
    $TargetImage = Join-Path -Path $TargetDir -ChildPath "$BaseName$Extension"
    $TargetYaml = Join-Path -Path $TargetDir -ChildPath "$BaseName.yaml"
    
    # Resize image if it doesn't exist
    if (!(Test-Path -Path $TargetImage)) {
        Write-Host "Resizing $($Image.Name)..."
        $Img = [System.Drawing.Image]::FromFile($Image.FullName)
        
        $Ratio = $Img.Width / $Img.Height
        if ($Img.Width -gt $MaxWidth -or $Img.Height -gt $MaxWidth) {
            if ($Ratio -gt 1) {
                # Landscape
                $NewWidth = $MaxWidth
                $NewHeight = [int]($MaxWidth / $Ratio)
            } else {
                # Portrait or Square
                $NewHeight = $MaxWidth
                $NewWidth = [int]($MaxWidth * $Ratio)
            }
        } else {
            $NewWidth = $Img.Width
            $NewHeight = $Img.Height
        }
        
        $NewImg = New-Object System.Drawing.Bitmap($NewWidth, $NewHeight)
        $Graphics = [System.Drawing.Graphics]::FromImage($NewImg)
        $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $Graphics.DrawImage($Img, 0, 0, $NewWidth, $NewHeight)
        
        $NewImg.Save($TargetImage)
        
        $Graphics.Dispose()
        $NewImg.Dispose()
        $Img.Dispose()
    } else {
        Write-Host "Skipping $($Image.Name) - already resized."
    }

    # Create YAML template if it doesn't exist
    if (!(Test-Path -Path $TargetYaml)) {
        $YamlContent = @"
- title: "Replace with Item Title"
  description: "Detailed description of the item."
  productlink: ""
  tags: []
"@
        Set-Content -Path $TargetYaml -Value $YamlContent
        Write-Host "Created template $TargetYaml"
    }
}

Write-Host "Batch processing complete. Please edit the YAML files in public/items/ to provide details."
