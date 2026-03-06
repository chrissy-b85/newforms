# NewForms — Form Builder & Settings Management

A production-ready form builder application with comprehensive settings management, built with Laravel (PHP 8.1+) and React.

---

## Features

- **Form Settings Management** — tab-based UI covering General, Access, Scheduling, Notifications, and Confirmation settings
- **Access Control** — public, authenticated, role-based, and specific-user access modes with optional password protection
- **Scheduling** — automatic open/close windows with custom before/after messages
- **Notifications** — admin and participant email notifications with recipient management
- **Customisable Confirmations** — show a message or redirect after submission, with live preview
- **Publishing Workflow** — draft → active → closed → archived with validation before publish
- **Deployment Ready** — DigitalOcean App Platform, Heroku, and GitHub Actions configurations included

---

## Tech Stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Backend  | Laravel 10+ / PHP 8.1+         |
| Frontend | React 18 + Tailwind CSS        |
| Database | MySQL 8 (or compatible)        |
| Deploy   | DigitalOcean / Heroku / SSH    |

---

## Quick Start

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+ & npm
- MySQL 8+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/chrissy-b85/newforms.git
cd newforms

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# 5. Configure your database in .env
#    DB_DATABASE, DB_USERNAME, DB_PASSWORD, etc.

# 6. Run migrations
php artisan migrate

# 7. Build frontend assets
npm run build

# 8. Start the development server
php artisan serve
```

---

## API Reference

All endpoints are prefixed with `/api/forms/{form}`.

| Method  | Endpoint              | Description                         |
|---------|-----------------------|-------------------------------------|
| `GET`   | `/settings`           | Retrieve all form settings          |
| `PATCH` | `/settings`           | Update form settings                |
| `POST`  | `/publish`            | Publish the form (validates first)  |
| `POST`  | `/close`              | Close the form                      |
| `POST`  | `/archive`            | Archive the form                    |

### Example: Update Settings

```http
PATCH /api/forms/1/settings
Content-Type: application/json
X-CSRF-TOKEN: <token>

{
  "form_name": "Customer Feedback",
  "access_type": "public",
  "after_submission_action": "message",
  "confirmation_heading": "Thank you!",
  "confirmation_body": "We have received your response."
}
```

### Response

```json
{
  "message": "Settings saved successfully.",
  "data": {
    "id": 1,
    "form_name": "Customer Feedback",
    "status": "draft",
    "is_open": false,
    "has_reached_limit": false,
    ...
  }
}
```

---

## File Structure

```
/
├── .do/
│   └── app.yaml                          # DigitalOcean App Platform config
├── .github/
│   └── workflows/
│       └── deploy.yml                    # GitHub Actions auto-deploy
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   └── FormSettingsController.php
│   │   ├── Requests/
│   │   │   └── UpdateFormSettingsRequest.php
│   │   └── Resources/
│   │       └── FormSettingsResource.php
│   ├── Models/
│   │   ├── Form.php
│   │   └── FormCategory.php
│   └── Services/
│       └── FormPublishingService.php
├── database/migrations/
│   ├── 2026_03_06_000000_create_form_categories_table.php
│   └── 2026_03_06_000001_create_forms_table.php
├── resources/js/
│   ├── components/
│   │   ├── FormSettings.jsx              # Main settings component
│   │   ├── FormSettings/
│   │   │   ├── GeneralTab.jsx
│   │   │   ├── AccessTab.jsx
│   │   │   ├── SchedulingTab.jsx
│   │   │   ├── NotificationsTab.jsx
│   │   │   └── ConfirmationTab.jsx
│   │   ├── Toast.jsx
│   │   └── ValidationModal.jsx
│   └── utils/
│       └── formValidation.js
├── routes/
│   └── api.php
├── deploy.sh                             # Bash deployment script
├── Procfile                              # Heroku process file
└── README.md
```

---

## Deployment

### DigitalOcean App Platform

Push to `main`. The `.do/app.yaml` spec handles automatic deployment.
Set the `APP_KEY` secret in the DigitalOcean dashboard.

### Heroku

```bash
heroku create
heroku config:set APP_KEY=$(php artisan key:generate --show)
git push heroku main
```

### SSH / VPS

```bash
# Run once on the server to deploy
bash deploy.sh
```

### GitHub Actions

Set the following secrets in your repository:
- `SSH_HOST` — server IP or hostname
- `SSH_USER` — SSH username
- `SSH_PRIVATE_KEY` — private key for authentication
- `SSH_PORT` — SSH port (default 22)
- `DEPLOY_PATH` — absolute path to the application on the server

---

## Security

- CSRF protection on all state-changing API routes
- SQL injection prevention via Laravel's query builder / Eloquent
- XSS prevention via Blade/React escaping
- Passwords are hashed with bcrypt before storage
- Sensitive fields (access_password) are hidden from API responses

---

## License

MIT
