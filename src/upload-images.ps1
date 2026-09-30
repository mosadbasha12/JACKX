$ErrorActionPreference = "Stop"

# JACKX image uploader
# Put new product images in this folder, then run this file from PowerShell.
$repoOwner = "mosadbasha12"
$repoName = "JACKX"
$branch = "master"
$imageExtensions = @(".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif")

function Find-GitRoot {
  param([string]$StartPath)
  $current = (Resolve-Path $StartPath).Path
  while ($current) {
    if (Test-Path (Join-Path $current ".git")) { return $current }
    $parent = Split-Path -Parent $current
    if ($parent -eq $current) { break }
    $current = $parent
  }
  return $null
}

$repoRoot = Find-GitRoot $PSScriptRoot

if (-not $repoRoot) {
  throw "انقل هذا المجلد داخل نسخة مشروع JACKX التي تحتوي على مجلد .git، ثم شغّل السكربت مرة أخرى."
}

Set-Location $repoRoot
$repoFolder = [IO.Path]::GetRelativePath($repoRoot, $PSScriptRoot).Replace("\", "/")
$rawBase = "https://raw.githubusercontent.com/$repoOwner/$repoName/$branch/$repoFolder"

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
