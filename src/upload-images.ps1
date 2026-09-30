$ErrorActionPreference = "Stop"

# JACKX image uploader
# Put new product images in this folder, then run this file from PowerShell.
$repoRoot = Split-Path -Parent $PSScriptRoot
$repoOwner = "mosadbasha12"
$repoName = "JACKX"
$branch = "master"
$repoFolder = "src"
$rawBase = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/$repoFolder"
$imageExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")

Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
  throw "لم يتم العثور على مستودع Git في: $repoRoot"
}

$images = Get-ChildItem -Path $PSScriptRoot -File |
  Where-Object { $imageExtensions -contains $_.Extension.ToLowerInvariant() }

if (-not $images) {
  Write-Host "لا توجد صور جديدة أو موجودة في مجلد src." -ForegroundColor Yellow
  exit 0
}

foreach ($image in $images) {
  $encodedName = [Uri]::EscapeDataString($image.Name)
  $rawUrl = "$rawBase/$encodedName"
  $txtPath = Join-Path $PSScriptRoot ("{0}.txt" -f $image.BaseName)

  # One TXT file per image, containing only its GitHub raw URL.
  Set-Content -LiteralPath $txtPath -Value $rawUrl -Encoding utf8
  Write-Host "تم تجهيز: $($image.Name)" -ForegroundColor Cyan
  Write-Host "الرابط: $rawUrl" -ForegroundColor DarkGray
}

git add -- "$repoFolder"

$pending = git status --short -- "$repoFolder"
if (-not $pending) {
  Write-Host "لا توجد تغييرات لرفعها." -ForegroundColor Yellow
  exit 0
}

$commitMessage = "add product images and raw links"
git commit -m $commitMessage
git push origin $branch

Write-Host "تم رفع الصور وملفات الروابط بنجاح إلى GitHub." -ForegroundColor Green
