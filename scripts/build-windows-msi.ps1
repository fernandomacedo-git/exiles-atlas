# Requires Windows PowerShell 5.1+ or PowerShell 7+.
# Builds the Exiles Atlas Tauri MSI installer.

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $RepoRoot

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

Require-Command node
Require-Command npm
Require-Command cargo
Require-Command rustc

Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed." }

Write-Host "Building Exiles Atlas MSI installer..." -ForegroundColor Cyan
npm run tauri -- build --bundles msi
if ($LASTEXITCODE -ne 0) { throw "Tauri MSI build failed." }

$MsiDirectory = Join-Path $RepoRoot 'src-tauri\target\release\bundle\msi'
$Packages = Get-ChildItem -Path $MsiDirectory -Filter '*.msi' -ErrorAction SilentlyContinue

if (-not $Packages) {
    throw "Build completed but no MSI package was found in $MsiDirectory"
}

Write-Host "MSI package created:" -ForegroundColor Green
$Packages | ForEach-Object { Write-Host $_.FullName }
