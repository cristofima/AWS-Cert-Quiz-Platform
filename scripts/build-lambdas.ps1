# Build script for Lambda functions
# Run this before terraform apply to ensure all Lambdas are compiled

Write-Host "🔨 Building Lambda functions..." -ForegroundColor Cyan

# Build CustomMessage Lambda
Write-Host "`n📦 Building CustomMessage Lambda..." -ForegroundColor Yellow
Set-Location lambdas/custom-message
npm install
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to install CustomMessage dependencies" -ForegroundColor Red
    exit 1 
}
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to build CustomMessage Lambda" -ForegroundColor Red
    exit 1 
}
Set-Location ../..

# Build Quiz Selector Lambda (already JavaScript)
Write-Host "`n📦 Installing Quiz Selector Lambda dependencies..." -ForegroundColor Yellow
Set-Location lambdas/quiz-selector
npm install
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to install Quiz Selector dependencies" -ForegroundColor Red
    exit 1 
}
Set-Location ../..

# Build Score Calculator Lambda (already JavaScript)
Write-Host "`n📦 Installing Score Calculator Lambda dependencies..." -ForegroundColor Yellow
Set-Location lambdas/score-calculator
npm install
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Failed to install Score Calculator dependencies" -ForegroundColor Red
    exit 1 
}
Set-Location ../..

Write-Host "`n✅ All Lambda functions built successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. cd infrastructure/terraform" -ForegroundColor White
Write-Host "2. terraform apply -var=`"article_phase=article-2`"" -ForegroundColor White
