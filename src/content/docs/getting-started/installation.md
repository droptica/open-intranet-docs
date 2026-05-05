---
title: Installation
description: Install Open Intranet on a production Linux server (Ubuntu / Debian) with Nginx + PHP-FPM + MariaDB, or run it locally with DDEV for evaluation and development.
---

This page walks you through installing Open Intranet. It is a **regular Drupal 11 site**, so installation is the same as for any Drupal project — get the codebase, install dependencies with Composer, point a web server at it, run the installer.

## Choose your installation path

| Path | Use it for | Effort | Skills required |
| --- | --- | --- | --- |
| **Production install on Linux** | Real intranets, staging, on-prem deployments | 1–3 hours | Linux + Nginx/Apache + PHP + Drupal basics |
| **Local development with DDEV** | Evaluation, demos, contributing back, custom development | 5–15 minutes | Docker + Git |
| **Managed Drupal hosting** | If you want zero infra ops | Depends on provider | Provider-specific |

The rest of this page covers **production on Linux** as the primary path, then a short DDEV section for local work, then pointers to managed hosting.

## System requirements

Open Intranet inherits Drupal 11's [system requirements](https://www.drupal.org/docs/getting-started/system-requirements). A typical production stack:

| Component | Minimum | Recommended |
| --- | --- | --- |
| **OS** | Linux (any modern distro) | Ubuntu 24.04 LTS or Debian 12 |
| **PHP** | 8.3 | 8.3 with OPcache, APCu, PHP-FPM |
| **Database** | MariaDB 10.11 / MySQL 8.0 / PostgreSQL 16 | MariaDB 11.x |
| **Web server** | Apache 2.4 or Nginx 1.x | Nginx 1.24+ (default in this guide) |
| **Composer** | 2.x | latest |
| **Drush** | 13.x | installed via Composer (project-local) |
| **Memory** | 2 GB RAM | 4–8 GB RAM for ~1,000 users |
| **Disk** | 5 GB | 20 GB+ depending on document storage |

### Required PHP extensions

Drupal 11 needs the following PHP extensions installed and enabled:

`gd`, `mbstring`, `intl`, `curl`, `xml`, `dom`, `simplexml`, `fileinfo`, `zip`, `opcache`, `pdo_mysql` (or `pdo_pgsql` for PostgreSQL), `sodium`, `apcu` (recommended for performance).

The Ubuntu/Debian command in [Step 2](#step-2--install-the-stack) installs all of them in one apt invocation.

### Sizing guidance

A rough rule of thumb for self-hosted instances:

| Users | vCPU | RAM | Disk | Notes |
| --- | --- | --- | --- | --- |
| 50–200 | 2 | 4 GB | 20 GB | Single VM, Nginx + PHP-FPM + MariaDB on the same box |
| 200–1,000 | 4 | 8 GB | 50 GB | Add Redis / Memcached |
| 1,000–5,000 | 4–8 | 16 GB | 100 GB+ | Move DB to a dedicated VM, swap Search API to Solr |
| 5,000+ | Multiple app servers | — | — | Load balancer, replicated DB, object storage for files |

---

## Production install on Ubuntu / Debian

The steps below are written for **Ubuntu 24.04 LTS** with **Nginx + PHP-FPM 8.3 + MariaDB**. They apply with minimal changes to Debian 12 (use the equivalent `php8.3-*` packages from [`deb.sury.org`](https://deb.sury.org/) on Debian).

Run all commands as a sudo-capable user. The codebase will live at `/var/www/openintranet`.

### Step 1 — Provision the server

1. Provision an Ubuntu 24.04 LTS or Debian 12 server (any cloud provider, VPS, on-prem hypervisor, or bare metal).
2. SSH in. Make sure the system is up to date:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. Set a fully-qualified hostname (used later by Nginx and Let's Encrypt):

   ```bash
   sudo hostnamectl set-hostname intranet.example.com
   ```

4. Open ports `80` and `443` in your firewall / security group.

### Step 2 — Install the stack

Install Nginx, PHP-FPM 8.3 with all required extensions, MariaDB, Composer, Git and unzip:

```bash
sudo apt install -y \
  nginx \
  mariadb-server \
  git unzip curl \
  php8.3-fpm php8.3-cli \
  php8.3-mysql \
  php8.3-gd php8.3-mbstring php8.3-intl php8.3-curl php8.3-xml \
  php8.3-zip php8.3-opcache php8.3-apcu \
  composer
```

:::note[Debian 12]
PHP 8.3 is not in Debian 12's default repositories. Add the [`deb.sury.org`](https://deb.sury.org/) repository first:

```bash
sudo apt install -y lsb-release ca-certificates apt-transport-https software-properties-common gnupg2
sudo curl -sSLo /etc/apt/keyrings/php.gpg https://packages.sury.org/php/apt.gpg
echo "deb [signed-by=/etc/apt/keyrings/php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list
sudo apt update
```

Then run the same `apt install` line as above.
:::

Verify the versions:

```bash
php -v       # PHP 8.3.x
composer -V  # Composer 2.x
mariadb -V   # MariaDB 10.11+ (or 11.x)
nginx -v
```

### Step 3 — Create the database

Secure your MariaDB install (set the root password, remove anon users, etc.):

```bash
sudo mariadb-secure-installation
```

Create a database and a dedicated user:

```bash
sudo mariadb <<'SQL'
CREATE DATABASE openintranet CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'openintranet'@'localhost' IDENTIFIED BY 'CHANGE-ME-strong-password';
GRANT ALL PRIVILEGES ON openintranet.* TO 'openintranet'@'localhost';
FLUSH PRIVILEGES;
SQL
```

Replace `CHANGE-ME-strong-password` with a randomly generated value (`openssl rand -base64 24`).

:::tip[PostgreSQL alternative]
If you prefer PostgreSQL: install `postgresql php8.3-pgsql` instead of MariaDB / `php8.3-mysql`, then create a database and user with `CREATE DATABASE openintranet ENCODING 'UTF8'; CREATE USER openintranet WITH PASSWORD '...'; GRANT ALL PRIVILEGES ON DATABASE openintranet TO openintranet;`. The Drupal installer will autodetect.
:::

### Step 4 — Get the codebase

Open Intranet is a Drupal **install profile**. The repository at [`git.drupalcode.org/project/openintranet`](https://git.drupalcode.org/project/openintranet) contains the profile, recipes, starter theme and a `composer.json` listing every dependency.

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone https://git.drupalcode.org/project/openintranet.git openintranet
cd openintranet
git checkout 1.x   # or a specific release tag, e.g. 1.9.0
```

Alternatively, download a release tarball from the [Open Intranet project page](https://www.drupal.org/project/openintranet) and unpack it:

```bash
cd /var/www
curl -L -o openintranet.tar.gz https://ftp.drupal.org/files/projects/openintranet-1.9.0.tar.gz
tar -xzf openintranet.tar.gz
mv openintranet-1.9.0 openintranet
cd openintranet
```

### Step 5 — Install PHP dependencies

Run Composer **without dev dependencies** (production):

```bash
composer install --no-dev --optimize-autoloader
```

This creates the `vendor/` directory with Drupal core, contrib modules and Drush. Expect a few minutes on first run.

Copy the starter theme into place (the same step `launch-intranet.sh` does for DDEV):

```bash
cp -r starter-theme/ web/themes/custom/
```

### Step 6 — Set file permissions

Drupal needs the web server user (`www-data`) to be able to read all files and **write** to specific directories. Set strict permissions everywhere by default, then loosen the few directories that need it.

```bash
sudo chown -R $USER:www-data /var/www/openintranet
sudo find /var/www/openintranet -type d -exec chmod 755 {} \;
sudo find /var/www/openintranet -type f -exec chmod 644 {} \;

sudo chmod -R 775 /var/www/openintranet/web/sites/default/files
sudo chmod 775 /var/www/openintranet/web/sites/default
```

After installation completes, lock down `settings.php` and `sites/default`:

```bash
sudo chmod 444 /var/www/openintranet/web/sites/default/settings.php
sudo chmod 555 /var/www/openintranet/web/sites/default
```

### Step 7 — Configure Nginx

Create `/etc/nginx/sites-available/openintranet`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name intranet.example.com;

    root /var/www/openintranet/web;
    index index.php index.html;

    client_max_body_size 100M;

    # Drupal-specific URL rewriting
    location / {
        try_files $uri /index.php?$query_string;
    }

    # Block direct access to sensitive locations
    location ~ /\. { deny all; }
    location ~ /vendor/.*\.php$ { deny all; return 404; }
    location ~ /\.(?!well-known).* { deny all; }
    location ~ ^/sites/.*/private/ { internal; }
    location ~ ^/sites/[^/]+/files/.*\.php$ { deny all; }

    # Pass PHP scripts to PHP-FPM
    location ~ '\.php$|^/update.php' {
        fastcgi_split_path_info ^(.+?\.php)(|/.*)$;
        try_files $fastcgi_script_name =404;
        include fastcgi_params;
        fastcgi_param HTTP_PROXY "";
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_param QUERY_STRING $query_string;
        fastcgi_intercept_errors on;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # Cache static assets aggressively
    location ~* \.(?:css|js|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires max;
        add_header Cache-Control "public, immutable";
        try_files $uri @rewrite;
    }
    location @rewrite { rewrite ^/(.*)$ /index.php?q=$1; }
}
```

Enable the site and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/openintranet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

:::note[Apache alternative]
If you prefer Apache, install `apache2 libapache2-mod-php8.3` instead of Nginx + PHP-FPM, drop a vhost into `/etc/apache2/sites-available/openintranet.conf` with `DocumentRoot /var/www/openintranet/web`, ensure `mod_rewrite` is enabled (`sudo a2enmod rewrite`) and that `AllowOverride All` is set on the `<Directory>`. The bundled `web/.htaccess` does the rest.
:::

### Step 8 — Enable HTTPS

Use Let's Encrypt for a free, auto-renewing certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d intranet.example.com
```

Certbot edits the Nginx vhost in place to add the certificate, redirect HTTP → HTTPS, and sets up a renewal cron / systemd timer.

### Step 9 — Run the installer

You have two options.

#### Option A — Browser installer

Open `https://intranet.example.com` in a browser. The Drupal installer launches automatically.

1. **Choose language** — defaults to English.
2. **Choose profile** — select **Open Intranet**.
3. **Verify requirements** — should be green if Steps 2 and 6 went well.
4. **Database setup** — pick MySQL/MariaDB (or PostgreSQL), enter `openintranet` for database name, user and password, host `localhost`.
5. **Install profile** — applies recipes and enables modules. Takes a few minutes.
6. **Configure site** — site name, admin email, admin username, admin password.
7. **Demo content** — optionally tick **Enable demo content** for a fully populated example intranet (recommended for first install).

#### Option B — Drush installer (recommended for automation)

Faster, scriptable, and idempotent if you re-run on a clean DB:

```bash
cd /var/www/openintranet
./vendor/bin/drush site:install openintranet \
  --db-url=mysql://openintranet:CHANGE-ME-strong-password@localhost/openintranet \
  --site-name="My Intranet" \
  --account-name=admin \
  --account-mail=admin@example.com \
  install_configure_form.enable_demo_content=1 \
  -y
```

Drop `install_configure_form.enable_demo_content=1` for a clean install with no sample content.

### Step 10 — Post-install hardening

Once the site is up, do a few production-grade tweaks.

**Trusted host patterns** — open `web/sites/default/settings.php` (you locked it to `444` in Step 6, so `chmod 644` to edit it, then `444` again):

```php
$settings['trusted_host_patterns'] = [
  '^intranet\.example\.com$',
];
```

**Cron** — Drupal runs scheduled tasks (search indexing, queues, engagement events…) via cron. Add a system cron entry:

```bash
sudo crontab -u www-data -e
# Add this line — runs every 15 minutes:
*/15 * * * * cd /var/www/openintranet && /usr/bin/php ./vendor/bin/drush cron -q
```

**OPcache + APCu** — should already be enabled by the Step 2 packages. Verify in `/etc/php/8.3/fpm/php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0      ; production: do not stat files on every request
apc.enabled=1
apc.shm_size=64M
```

Restart PHP-FPM after changes: `sudo systemctl restart php8.3-fpm`.

**Redis (recommended for >200 users)** — install Redis and the Drupal `redis` module:

```bash
sudo apt install -y redis-server
composer require drupal/redis
./vendor/bin/drush en redis -y
```

Then add to `settings.php`:

```php
$settings['redis.connection']['host'] = '127.0.0.1';
$settings['redis.connection']['port'] = 6379;
$settings['cache']['default'] = 'cache.backend.redis';
$settings['container_yamls'][] = 'modules/contrib/redis/example.services.yml';
```

**Backups** — schedule daily DB dumps and weekly file backups:

```bash
# Daily DB dump, keep 14 days
sudo mkdir -p /var/backups/openintranet
echo '0 2 * * * mariadb-dump openintranet | gzip > /var/backups/openintranet/db-$(date +\%F).sql.gz && find /var/backups/openintranet -name "db-*.sql.gz" -mtime +14 -delete' | sudo tee -a /etc/crontab
```

Or use the [`backup_migrate`](https://www.drupal.org/project/backup_migrate) module (UI-based, included in Open Intranet's composer.json).

**Log rotation** — Drupal logs go to the database (`watchdog` table) by default. For server logs, `logrotate` already handles `/var/log/nginx/*` and PHP-FPM logs. To export Drupal logs to syslog, enable the core **syslog** module: `drush en syslog -y`.

**Updates** — fetch a new release, run Composer + DB updates:

```bash
cd /var/www/openintranet
git fetch && git checkout 1.10.0       # or download a new tarball
composer install --no-dev --optimize-autoloader
./vendor/bin/drush updatedb -y
./vendor/bin/drush cache:rebuild
```

---

## Local development with DDEV

For local evaluation, demos and contributing back, [DDEV](https://ddev.com/) is the fastest path. It builds a PHP / web server / DB stack in Docker containers tailored to Drupal.

**Prerequisites:** [DDEV 1.24+](https://ddev.com/get-started/), Docker (or Colima), Git.

```bash
git clone https://git.drupalcode.org/project/openintranet.git
cd openintranet
./launch-intranet.sh
```

The script configures DDEV (`drupal10` project type, PHP 8.3, docroot `web/`), starts containers, runs `composer install` and copies the starter theme.

After it finishes, install the site:

```bash
ddev drush site-install openintranet install_configure_form.enable_demo_content=1 -y
ddev drush user:login   # opens a one-time admin login link
```

The site lives at `https://<directory-name>.ddev.site`.

:::tip[One-liner]
A scripted version that wraps everything (clone + DDEV + install) is available:

```bash
curl -sL https://intranet.new/install.sh | bash
```
:::

For details on the launch script, DDEV configuration and contributing back, see the [Open Intranet README](https://git.drupalcode.org/project/openintranet/-/blob/1.x/README.md).

---

## Managed hosting alternatives

If you want a production-grade install without managing the Linux stack, Open Intranet runs on any provider that supports Drupal 11:

- [Pantheon](https://pantheon.io) — Drupal-specialised PaaS, multi-environment workflow, automatic core updates
- [Acquia Cloud](https://www.acquia.com/products/drupal-cloud) — original Drupal-as-a-Service from Drupal's commercial sponsor
- [Platform.sh](https://platform.sh) — Git-driven hosting with branch-per-environment
- [Amazee.io / Lagoon](https://amazee.io) — open source Kubernetes hosting platform built for Drupal
- [DDEV-Live](https://ddev.com/products/ddev-live/) — same DDEV experience extended to staging/production

The codebase you push is the same as for self-hosting — just the deploy targets differ.

---

## What was installed

After the installer finishes, you have:

| Component | Details |
| --- | --- |
| **Drupal core** | 11.x with all required modules |
| **Open Intranet install profile** | Curated module + recipe stack for intranets |
| **Front-end theme** | Open Intranet Theme (Bootstrap Barrio subtheme) |
| **Admin theme** | Gin with the Gin Toolbar |
| **Content types** | News, Events, Knowledge Base, Pages, Webforms, Books |
| **Document management** | Folder-based document library with upload and search |
| **Employee directory** | User profiles with department, position, contact info, org chart |
| **Knowledge base** | Book-structured internal documentation |
| **Search** | Full-text search powered by Search API |
| **Social features** | Comments, reactions, kudos, bookmarks, must-read flags |
| **AI integration** | CKEditor AI assistant for content creation |
| **Engagement Analytics** | RFV scoring, segments, drush commands, dashboards |
| **Optional recipes** | Room Booking, Courses, FAQ, Ideas, Inventory, Kanban, Kudos, SSO Keycloak — apply at `/admin/modules/browse/recipes` |

---

## Troubleshooting

### `502 Bad Gateway` from Nginx

PHP-FPM is not running or the socket path in the Nginx vhost does not match the FPM pool. Check:

```bash
sudo systemctl status php8.3-fpm
ls -l /run/php/php8.3-fpm.sock
sudo nginx -t
```

If the socket path is `/run/php/php-fpm.sock` instead, update the `fastcgi_pass` line in the vhost.

### "The settings file is not writable" during install

Step 6 set `sites/default` to `775` so the installer can create `settings.php` and `services.yml`. If you locked it before installing, revert temporarily:

```bash
sudo chmod 775 /var/www/openintranet/web/sites/default
sudo chmod 664 /var/www/openintranet/web/sites/default/settings.php   # if it already exists
```

Run the installer, then lock back to `555` / `444`.

### "Trusted host setting is missing" warnings

Status report at `/admin/reports/status` complains. Add `$settings['trusted_host_patterns']` as shown in Step 10 and clear caches.

### `drush` command not found

Drush is installed locally by Composer at `vendor/bin/drush`. Either run it from there, alias it (`alias drush='/var/www/openintranet/vendor/bin/drush'`), or install the [Drush Launcher](https://github.com/drush-ops/drush-launcher) globally so the bare `drush` command finds the project-local binary.

### Composer memory exhaustion

Run with explicit `memory_limit`:

```bash
COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader
```

### Database connection errors

Verify the DB user can connect from `localhost`:

```bash
mariadb -u openintranet -p openintranet -e 'SELECT NOW();'
```

If this fails, re-check `Step 3` and the credentials in `web/sites/default/settings.php`.

### Cache issues

Clear all caches:

```bash
./vendor/bin/drush cache:rebuild
```

### Local DDEV: port conflicts

```bash
ddev config --router-http-port=8080 --router-https-port=8443
ddev restart
```

---

## Next steps

- [Configuration](/docs/getting-started/configuration/) — site name, email, optional recipes, SSO setup
- [User Guide](/docs/user-guide/) — how end users interact with the intranet
- [REST API](/docs/development/api/) — JSON:API integration with external systems
- [Drupal docs](https://www.drupal.org/docs) — for everything Drupal-side that isn't Open Intranet–specific
