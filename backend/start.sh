#!/bin/bash
set -e

echo "🚀 Starting CineHive Backend Server..."
echo "📍 Node version: $(node --version)"
echo "📍 npm version: $(npm --version)"
echo "📍 Environment: $NODE_ENV"
echo "📍 Port: $PORT"

exec npm start
