#!/bin/bash
# ==========================================================
# 🚀 Park Solitaire - Vercel One-Click Deployment Script
# ==========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$DIR/park-solitaire-frontend"

echo ""
echo "=========================================================="
echo "  🏢 PARK SOLITAIRE - DEPLOY TO VERCEL"
echo "=========================================================="
echo ""

cd "$FRONTEND_DIR"

echo "📦 Step 1: Building optimized production bundle..."
npm run build

echo ""
echo "🚀 Step 2: Deploying to Vercel Production..."
echo "If this is your first time, you will be prompted to login (browser)."
echo ""

npx -y vercel --prod

echo ""
echo "✅ Deployment completed successfully!"
echo ""
