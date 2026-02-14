#!/bin/bash

# Start Laravel + Inertia.js SPA

echo "🚀 Starting Modern SPA..."
echo ""
echo "📍 Open your browser: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22.22.0 > /dev/null 2>&1

# Start Vite dev server in background
npm run dev &
VITE_PID=$!

# Wait for Vite to start
sleep 3

# Start Laravel server
php artisan serve

# Cleanup on exit
trap "kill $VITE_PID 2>/dev/null" EXIT
