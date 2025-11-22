#!/bin/bash
# Build script for Lambda functions
# Run this before terraform apply to ensure all Lambdas are compiled

set -e  # Exit on error

echo "🔨 Building Lambda functions..."

# Build CustomMessage Lambda
echo "📦 Building CustomMessage Lambda..."
cd lambdas/custom-message
npm install
npm run build
cd ../..

# Build Quiz Selector Lambda (already JavaScript)
echo "📦 Installing Quiz Selector Lambda dependencies..."
cd lambdas/quiz-selector
npm install
cd ../..

# Build Score Calculator Lambda (already JavaScript)
echo "📦 Installing Score Calculator Lambda dependencies..."
cd lambdas/score-calculator
npm install
cd ../..

echo "✅ All Lambda functions built successfully!"
echo ""
echo "Next steps:"
echo "1. cd infrastructure/terraform"
echo "2. terraform apply -var=\"article_phase=article-2\""
