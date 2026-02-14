#!/bin/bash

echo "🎨 Starting Pavona Studio..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
    echo ""
fi

echo "✅ Ready to start!"
echo ""
echo "Open TWO terminals and run:"
echo ""
echo "Terminal 1: npm run dev"
echo "Terminal 2: php artisan serve"
echo ""
echo "Then visit: http://localhost:8000"
echo ""
echo "Login credentials:"
echo "  Admin: admin@pavonastudio.com / password"
echo "  User:  user@pavonastudio.com / password"
