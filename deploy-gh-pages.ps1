param(
  [string]$RemoteUrl = "",
  [string]$RemoteName = "origin",
  [string]$Branch = "gh-pages",
  [switch]$SkipInstall,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot "package.json"))) {
  throw "package.json not found. Run this script in project root."
}

if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
  $RemoteUrl = (git remote get-url $RemoteName 2>$null)
}

if ([string]::IsNullOrWhiteSpace($RemoteUrl)) {
  throw "git remote '$RemoteName' not found. Configure it first or pass -RemoteUrl."
}

if (-not $SkipInstall) {
  if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
    npm ci
  }
}

npm run build

$distPath = Join-Path $repoRoot "dist"
if (-not (Test-Path $distPath)) {
  throw "dist not found. Build failed or output not generated."
}

$distGitPath = Join-Path $distPath ".git"
if (Test-Path $distGitPath) {
  Remove-Item -Recurse -Force $distGitPath
}

Push-Location $distPath

git init | Out-Null
git checkout -B $Branch | Out-Null

$name = (git -C $repoRoot config user.name 2>$null)
$email = (git -C $repoRoot config user.email 2>$null)
if ([string]::IsNullOrWhiteSpace($name)) { $name = "deploy-bot" }
if ([string]::IsNullOrWhiteSpace($email)) { $email = "deploy-bot@users.noreply.github.com" }
git config user.name $name
git config user.email $email

git add -A
git commit -m ("deploy: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) | Out-Null

$existingRemotes = (git remote)
if ($existingRemotes -contains $RemoteName) {
  git remote set-url $RemoteName $RemoteUrl
} else {
  git remote add $RemoteName $RemoteUrl
}

if ($DryRun) {
  Write-Host "DryRun enabled. Skip push."
} else {
  git push -f $RemoteName $Branch
}

Pop-Location

$distGitCleanupPath = Join-Path $distPath ".git"
if (Test-Path $distGitCleanupPath) {
  Remove-Item -Recurse -Force $distGitCleanupPath
}

Write-Host "Deploy finished: $Branch"
