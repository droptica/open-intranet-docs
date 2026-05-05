---
title: Installation
description: Install Open Intranet on any host that runs Drupal — production server, shared hosting, managed Drupal cloud, or locally with DDEV for evaluation.
---

Open Intranet is a regular Drupal site, so installation is the same as for any Drupal project: get the codebase, install dependencies with Composer, point a web server at `web/`, run the Drupal installer with the `openintranet` profile.

This page focuses on the **Open Intranet–specific parts** of that process. For everything generic (provisioning a Linux box, configuring Nginx / Apache, securing MariaDB, setting up TLS, tuning PHP-FPM…) we link to upstream documentation rather than re-document it here.

## Choose your installation path

| Path | Use it for | Skills |
| --- | --- | --- |
| **Production** on any Drupal-capable host | Real intranets, staging, on-prem | Standard Drupal hosting know-how (or a partner) |
| **Local development** with DDEV | Evaluation, demos, contributing back, custom dev | Docker + Git |
| **Managed Drupal hosting** | Zero infra ops | Provider-specific |

## System requirements

Open Intranet inherits Drupal's [system requirements](https://www.drupal.org/docs/getting-started/system-requirements). In short:

| Component | Required |
| --- | --- |
| **PHP** | 8.3+ with the standard Drupal extensions ([list](https://www.drupal.org/docs/getting-started/system-requirements/php-requirements)) |
| **Database** | MariaDB, MySQL, or PostgreSQL — pick whatever your hosting supports |
| **Web server** | Anything that can serve PHP (Nginx, Apache, Caddy, LiteSpeed…) |
| **Composer** | 2.x |

Sizing rule of thumb: a 200-user intranet runs comfortably on a 4 GB RAM / 2 vCPU box; 1,000+ users want Redis or Memcached caching and ideally Solr for search. For higher loads see the [Drupal scaling guide](https://www.drupal.org/docs/develop/development-tools/configuration-and-deployment/distributed-deployment-considerations).

---

## Production install

Steps 1–4 are Open Intranet–specific. Steps 5–6 link out to the relevant Drupal / upstream docs because they are the same as for any Drupal site.

### Step 1 — Get the codebase

Clone the project from drupal.org:

```bash
git clone https://git.drupalcode.org/project/openintranet.git
cd openintranet
git checkout 1.x   # or a release tag, e.g. 1.9.0
```

Or download a release tarball from the [Open Intranet project page](https://www.drupal.org/project/openintranet) and unpack it.

### Step 2 — Install PHP dependencies

```bash
composer install --no-dev --optimize-autoloader
```

This produces the `vendor/` directory with Drupal core, contrib modules, and Drush.

### Step 3 — Copy the starter theme into place

The repository ships a starter theme that needs to be moved into `web/themes/custom/` before installation. The DDEV launch script does this automatically; for a manual install run:

```bash
cp -r starter-theme/ web/themes/custom/
```

### Step 4 — Run the Drupal installer with the `openintranet` profile

The installer runs as it does for any Drupal site, but you select the **Open Intranet** profile. Two options.

#### Option A — Browser

Point your web server at `web/`, open the site in a browser, follow the steps. When asked for a profile, choose **Open Intranet**. The installer applies recipes and enables modules — takes a few minutes.

#### Option B — Drush (recommended for automation)

```bash
./vendor/bin/drush site:install openintranet \
  --db-url=mysql://USER:PASSWORD@localhost/DATABASE \
  --site-name="My Intranet" \
  --account-name=admin \
  --account-mail=admin@example.com \
  install_configure_form.enable_demo_content=1 \
  -y
```

Drop `install_configure_form.enable_demo_content=1` for a clean install with no sample content.

:::tip[Demo content]
The `enable_demo_content=1` flag applies the `default_content` recipe which loads ~50 sample news articles, events, KB pages, users with profiles, departments and a populated org chart. Highly recommended for first-time installs and demos.
:::

### Step 5 — Apply optional recipes

Open Intranet ships several optional recipes (Room Booking, Courses, FAQ, Ideas, Inventory, Kanban, Kudos, SSO Keycloak…). Enable the ones you need at:

```
/admin/modules/browse/recipes
```

Or via Drush:

```bash
./vendor/bin/drush recipe ../recipes/openintranet_rmb
```

Each recipe imports its own content types, fields, views, roles and demo content. You can re-apply a recipe at any time to restore defaults.

---

## What you also need to do (host setup)

These steps are **the same for any Drupal site** and are not specific to Open Intranet. Follow the upstream documentation for your environment:

| Task | Where to learn |
| --- | --- |
| **Provision a Linux server** | Your hosting provider's docs |
| **Install LAMP/LEMP stack (PHP 8.3, DB, Nginx/Apache)** | [Hosting Drupal](https://www.drupal.org/docs/hosting), [PHP install guide](https://www.php.net/manual/en/install.php) |
| **Configure web server vhost** | [Sample Nginx config for Drupal](https://www.nginx.com/resources/wiki/start/topics/recipes/drupal/), [Apache config example](https://www.drupal.org/docs/system-requirements/web-server) |
| **Create database and DB user** | [MariaDB](https://mariadb.com/kb/en/create-database/), [PostgreSQL](https://www.postgresql.org/docs/current/sql-createdatabase.html) docs |
| **Set file permissions** | [Drupal file permissions guide](https://www.drupal.org/docs/security-in-drupal/securing-file-permissions-and-ownership) |
| **Enable HTTPS** | [Let's Encrypt + Certbot](https://certbot.eff.org/) |
| **Set up cron** | [Configuring cron jobs in Drupal](https://www.drupal.org/docs/administering-a-drupal-site/cron-automated-tasks/cron-automated-tasks-overview) |
| **Configure backups** | [Backup and Migrate module](https://www.drupal.org/project/backup_migrate) (already in the OI bundle) |
| **Performance tuning (OPcache, APCu, Redis)** | [Drupal performance guide](https://www.drupal.org/docs/develop/development-tools/configuration-and-deployment/distributed-deployment-considerations) |
| **`trusted_host_patterns`** | [Trusted Host Settings](https://www.drupal.org/docs/installing-drupal/trusted-host-settings) |

If you have **shared hosting** with cPanel / Plesk / similar, all of the above is typically pre-set; you only need Steps 1–5 from the previous section, plus uploading the codebase to your hosting account and creating a database from the control panel.

---

## Local development with DDEV

For local evaluation, demos and contributing back, [DDEV](https://ddev.com/) is the fastest path. It ships a PHP / web server / DB stack in Docker containers tailored to Drupal.

```bash
git clone https://git.drupalcode.org/project/openintranet.git
cd openintranet
./launch-intranet.sh
ddev drush site-install openintranet install_configure_form.enable_demo_content=1 -y
ddev drush user:login
```

The `launch-intranet.sh` script handles `ddev config`, `ddev start`, `composer install` and the starter-theme copy. The site lives at `https://<directory-name>.ddev.site`.

For details on the launch script and how to contribute back, see the [Open Intranet README](https://git.drupalcode.org/project/openintranet/-/blob/1.x/README.md).

:::tip[One-liner]
A scripted version that wraps everything (clone + DDEV + install) is available:

```bash
curl -sL https://intranet.new/install.sh | bash
```
:::

---

## Managed hosting

If you want a production install without managing a Linux stack, Open Intranet runs on any provider that supports Drupal. Common ones:

- [Pantheon](https://pantheon.io)
- [Acquia Cloud](https://www.acquia.com/products/drupal-cloud)
- [Platform.sh](https://platform.sh)
- [Amazee.io / Lagoon](https://amazee.io)

The codebase is the same — push the OI repository (or your fork) to the provider's Git endpoint, the platform handles PHP / DB / web server / TLS / scaling.

---

## What was installed

After the installer finishes, you have:

| Component | Details |
| --- | --- |
| **Drupal core** | Latest supported major release with all required modules |
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

For the full list of modules pre-shipped, see the [composer.json](https://git.drupalcode.org/project/openintranet/-/blob/1.x/composer.json) on drupal.org.

---

## Troubleshooting (Open Intranet–specific)

For generic Drupal install issues see the [Drupal install troubleshooting guide](https://www.drupal.org/docs/installing-drupal/troubleshooting-installation-issues). Below are the items that come up specifically with Open Intranet.

### "Open Intranet" is not visible in the profile chooser

You forgot Step 3 (copy starter theme) or Step 2 (`composer install`) did not finish. Re-run them and reload the installer page.

### Recipe install times out

Open Intranet's profile applies several recipes during install. On low-memory hosts the PHP process can hit the default memory limit. Bump it before re-running:

```ini
; php.ini
memory_limit = 512M
max_execution_time = 300
```

Or via Drush: pass `--strict=0 --uri=https://your-domain` to `drush site:install` and watch progress in `drush ws --tail`.

### `drush command not found`

Drush is installed locally by Composer at `vendor/bin/drush`. Run it from there, alias it (`alias drush='./vendor/bin/drush'`), or install the [Drush Launcher](https://github.com/drush-ops/drush-launcher).

### DDEV: port conflicts

```bash
ddev config --router-http-port=8080 --router-https-port=8443
ddev restart
```

---

## Next steps

- [Configuration](/docs/getting-started/configuration/) — site name, email, optional recipes, SSO setup
- [User Guide](/docs/user-guide/) — how end users interact with the intranet
- [REST API](/docs/development/api/) — JSON:API integration with external systems
- [Drupal docs](https://www.drupal.org/docs) — for everything Drupal-side that is not Open Intranet–specific
