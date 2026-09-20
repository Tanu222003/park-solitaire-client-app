#!/usr/bin/env bash
set -e

echo "=============================================="
echo "  Park Solitaire - Android AAB Build Script   "
echo "=============================================="

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/park-solitaire-frontend"
ANDROID_DIR="$FRONTEND_DIR/android"
OUTPUT_DIR="$PROJECT_ROOT/release-bundle"

mkdir -p "$OUTPUT_DIR"

echo "1. Building Production Web Assets (Vite)..."
cd "$FRONTEND_DIR"
npm run build

echo "2. Syncing Assets with Capacitor Android Platform..."
npx cap sync android

echo "3. Building Release Android App Bundle (.aab)..."
cd "$ANDROID_DIR"

if [ -f "./gradlew" ]; then
  chmod +x ./gradlew
  ./gradlew bundleRelease
else
  echo "Error: gradlew not found in $ANDROID_DIR"
  exit 1
fi

AAB_SOURCE="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_SOURCE" ]; then
  DEST_AAB="$OUTPUT_DIR/park-solitaire-v1.0.0.aab"
  cp "$AAB_SOURCE" "$DEST_AAB"
  echo ""
  echo "=============================================="
  echo " SUCCESS! Android App Bundle Created! "
  echo " File: $DEST_AAB"
  echo " Ready for upload to Google Play Console!"
  echo "=============================================="
else
  echo "Error: Release bundle not found at $AAB_SOURCE"
  exit 1
fi
