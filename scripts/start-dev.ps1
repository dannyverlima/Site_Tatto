$ErrorActionPreference = "Stop"

function Test-Port {
  param([int]$Port)
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  return $null -ne $conn
}

$repo = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repo

$pgCtl = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgData = "C:\Program Files\PostgreSQL\18\data"

if (-not (Test-Port 5432)) {
  if (Test-Path $pgCtl) {
    & $pgCtl -D $pgData -l "$pgData\server.log" start
  } else {
    Write-Host "pg_ctl not found at $pgCtl"
  }
}

$webRunning = Test-Port 5173
$apiRunning = Test-Port 5175

if ($apiRunning -and $webRunning) {
  Write-Host "Dev servers already running."
  exit 0
}

if ($apiRunning -and -not $webRunning) {
  pnpm dev:web
  exit 0
}

if (-not $apiRunning -and $webRunning) {
  pnpm dev:server
  exit 0
}

pnpm dev
