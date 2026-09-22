<#
.SYNOPSIS
  Deploys the pushed commit into the live checkout and builds the static site into
  <Target>\dist, which Caddy serves as nish.software (see nishant/hosting Caddyfile).
  Run by the GitHub Actions self-hosted runner (as SYSTEM) on every push to main;
  can also be run by hand from an elevated shell. There is no process to restart:
  Caddy reads the folder on every request.
.EXAMPLE
  .\scripts\deploy.ps1                      # C:\Apps\nish.software from origin/main
#>
[CmdletBinding()]
param(
  [string]$Target = 'C:\Apps\nish.software',
  [string]$Repo = 'https://github.com/nishant/nish.software.git',
  [string]$Branch = 'main',
  # Where to fetch the new commit from. 'origin' (GitHub) works for this public repo;
  # the Actions workflow passes its own checkout so every deploy behaves the same way
  # as the private repos' deploys.
  [string]$FetchFrom = 'origin'
)
$ErrorActionPreference = 'Stop'

function Run([string]$Label, [scriptblock]$Block) {
  Write-Host ">> $Label"
  $global:LASTEXITCODE = 0
  # Windows PowerShell 5.1 turns a native command's stderr into a terminating error
  # when $ErrorActionPreference is Stop and the output is captured - and git and npm
  # write ordinary progress to stderr. Relax it for the call; the exit code is the verdict.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try { & $Block } finally { $ErrorActionPreference = $prev }
  if ($LASTEXITCODE) { throw "$Label failed (exit $LASTEXITCODE)" }
}

# The live checkout may be owned by a different account than the one deploying
# (SYSTEM vs the user); git refuses to touch such a directory unless it is marked safe.
$gitTarget = $Target -replace '\\', '/'
$safe = @(git config --global --get-all safe.directory)
if (-not ($safe -contains $gitTarget)) { git config --global --add safe.directory $gitTarget }

if (-not (Test-Path (Join-Path $Target '.git'))) {
  New-Item -ItemType Directory -Force (Split-Path -Parent $Target) | Out-Null
  $src = if ($FetchFrom -eq 'origin') { $Repo } else { $FetchFrom }
  Run "clone $src" { git clone --no-hardlinks --branch $Branch $src $Target }
  if ($FetchFrom -ne 'origin') { git -C $Target remote set-url origin $Repo }
}

Push-Location $Target
try {
  if ($FetchFrom -eq 'origin') {
    Run 'fetch origin' { git fetch --prune origin }
    Run "reset to origin/$Branch" { git reset --hard "origin/$Branch" }
  } else {
    Run "fetch $Branch from $FetchFrom" { git fetch $FetchFrom $Branch }
    Run 'reset to fetched commit' { git reset --hard FETCH_HEAD }
  }

  Run 'npm ci' { npm ci --no-audit --no-fund }
  # Vite writes to dist-next first, then the swap is near-instant, so a visitor never
  # sees a half-written folder (vite build empties its out dir before writing).
  Run 'build' { npx vite build --outDir dist-next --emptyOutDir }
  if (Test-Path 'dist') { Remove-Item -Recurse -Force 'dist' }
  Rename-Item 'dist-next' 'dist'
  if (-not (Test-Path 'dist\index.html')) { throw 'dist\index.html missing after build' }

  Write-Host "deployed $(git rev-parse --short HEAD) ($Branch) to $Target\dist"
} finally {
  Pop-Location
}
