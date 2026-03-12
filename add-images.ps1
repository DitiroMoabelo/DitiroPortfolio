# Image Setup Script for Ditiro Moabelo Portfolio
# This script helps you add your images to the portfolio

Write-Host "🌸 Portfolio Image Setup Script 🌸" -ForegroundColor Magenta
Write-Host ""

$imagesPath = "assets\images"
$requiredImages = @("myphoto1.jpg", "myphoto2.jpg", "myphoto3.jpg")

Write-Host "Checking for images in: $imagesPath" -ForegroundColor Cyan
Write-Host ""

# Check which images are already present
$missingImages = @()
foreach ($img in $requiredImages) {
    $fullPath = Join-Path $imagesPath $img
    if (Test-Path $fullPath) {
        Write-Host "✓ Found: $img" -ForegroundColor Green
    } else {
        Write-Host "✗ Missing: $img" -ForegroundColor Red
        $missingImages += $img
    }
}

Write-Host ""

if ($missingImages.Count -eq 0) {
    Write-Host "🎉 All images are present! Your portfolio is ready." -ForegroundColor Green
} else {
    Write-Host "📝 To add your images:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Copy your three photos to this folder:" -ForegroundColor White
    Write-Host "   $((Get-Location).Path)\$imagesPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Rename them to:" -ForegroundColor White
    foreach ($img in $missingImages) {
        Write-Host "   - $img" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "Image recommendations:" -ForegroundColor Yellow
    Write-Host "  • myphoto1.jpg - Hero section (playful portrait, square format)" -ForegroundColor White
    Write-Host "  • myphoto2.jpg - Featured work background (graduation photo, landscape)" -ForegroundColor White
    Write-Host "  • myphoto3.jpg - About me section (close-up portrait, portrait format)" -ForegroundColor White
    Write-Host ""
    Write-Host "After adding the images, run this script again to verify!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

