#!/bin/bash
set -e

echo "🔨 Building CineHive Backend..."
echo "📍 Node version: $(node --version)"
echo "📍 npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Verify installation
echo "✅ Dependencies installed successfully"
echo "📝 Installed packages:"
npm list --depth=0

echo "🎉 Build completed successfully!"
