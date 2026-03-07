# NOTE: This project deploys via SSH using deploy.sh (see .github/workflows/deploy.yml).
# The Procfile is NOT used in the current deployment pipeline.
# If you migrate to a Procfile-based platform (e.g. Heroku, DigitalOcean App Platform),
# replace the web command below with the appropriate one for your platform and PHP setup.
#
# Example for Heroku (requires heroku/php buildpack):
#   web: vendor/bin/heroku-php-apache2 public/
#
# Example for a generic platform using PHP built-in server (non-production):
#   web: php artisan serve --host=0.0.0.0 --port=$PORT
web: vendor/bin/heroku-php-apache2 public/
