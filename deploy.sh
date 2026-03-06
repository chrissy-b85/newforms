#!/usr/bin/env bash
# deploy.sh — Production deployment script for newforms
set -euo pipefail

echo "==> Pulling latest changes from main..."
git pull origin main

echo "==> Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "==> Installing Node.js dependencies and building assets..."
npm ci
npm run build

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Clearing and rebuilding caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "==> Caching configuration for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Optimizing class autoloading..."
php artisan optimize

echo "✅ Deployment complete."
