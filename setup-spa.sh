#!/bin/bash

# Modern SPA Quick Start Script
# This script sets up your Laravel + Inertia.js + React SPA

echo "🚀 Starting Modern SPA Setup..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    php artisan key:generate
fi

# Install dependencies
echo "📦 Installing PHP dependencies..."
composer install

echo "📦 Installing Node.js dependencies..."
npm install

# Database setup
echo "🗄️  Setting up database..."
read -p "Do you want to run migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    php artisan migrate
fi

# Build assets
echo "🎨 Building frontend assets..."
npm run build

# Clear caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Configure your database in .env file"
echo "2. Run: npm run dev (for development with hot reload)"
echo "3. Run: php artisan serve (in a new terminal)"
echo "4. Visit: http://localhost:8000"
echo ""
echo "📚 Read SPA_SETUP_GUIDE.md for detailed documentation"
echo ""
echo "🎉 Enjoy your modern SPA with glassmorphism design!"
