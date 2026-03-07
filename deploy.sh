#!/usr/bin/env bash
# deploy.sh — Production deployment script for newforms
set -euo pipefail

# Ensure .env file exists before proceeding
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Aborting deployment."
  exit 1
fi

echo "==> Pulling latest changes from main..."
git pull origin main

echo "==> Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "==> Installing Node.js dependencies and building assets..."
npm ci
npm run build

echo "==> Enabling maintenance mode..."
php artisan down

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Disabling maintenance mode..."
php artisan up

echo "==> Clearing and rebuilding caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "==> Caching configuration for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Deployment complete."
