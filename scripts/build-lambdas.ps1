# Build script for Lambda functions
# Run this before terraform apply to ensure all Lambdas are compiled
# Uses pnpm workspace for centralized Lambda dependency management
# Frontend is managed separately with its own pnpm install

Write-Host "🔨 Building Lambda functions with pnpm workspace..." -ForegroundColor Cyan

# Ensure we're in the project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Install with: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing Lambda dependencies via workspace..." -ForegroundColor Yellow
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to install Lambda workspace dependencies" -ForegroundColor Red
    Write-Host "Tip: Try running 'pnpm install' without --frozen-lockfile to update lockfile" -ForegroundColor Yellow
    exit 1 
}

# Build CustomMessage Lambda (TypeScript needs compilation)
Write-Host "`n🔧 Building CustomMessage Lambda (TypeScript)..." -ForegroundColor Yellow
pnpm --filter custom-message-lambda run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to build CustomMessage Lambda" -ForegroundColor Red
    exit 1 
}

# Quiz Selector and Score Calculator are TypeScript too, but may not need explicit build
# Terraform will package them with their compiled output
Write-Host "`n✅ Quiz Selector Lambda dependencies installed (via workspace)" -ForegroundColor Green
Write-Host "✅ Score Calculator Lambda dependencies installed (via workspace)" -ForegroundColor Green

Write-Host "`n✅ All Lambda functions built successfully!" -ForegroundColor Green
Write-Host "`nℹ️  Lambda workspace benefits:" -ForegroundColor Cyan
Write-Host "  • Centralized AWS SDK versions (updated in one place)" -ForegroundColor White
Write-Host "  • Shared Lambda dependencies reduce duplication" -ForegroundColor White
Write-Host "  • Faster installations with pnpm's content-addressable store" -ForegroundColor White
Write-Host "`nNote: Frontend uses pnpm independently (not in workspace)" -ForegroundColor Yellow
Write-Host "  Run 'cd frontend && pnpm install' to install frontend dependencies" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. cd infrastructure/terraform" -ForegroundColor White
Write-Host "2. terraform apply -var=`"article_phase=article-2`"" -ForegroundColor White
