---
title: Configuration
description: Post-installation configuration — site settings, optional modules, user management, and SSO.
---

After [installing Open Intranet](/docs/getting-started/installation/), you can customize it for your organization. This page covers the most common configuration tasks.

## Site information

Update your site name, email address, and slogan in the administration panel:

1. Log in as administrator.
2. Navigate to **Configuration > System > Basic site settings** (`/admin/config/system/site-information`).
3. Update:
   - **Site name** — displayed in the header and browser tab
   - **Site email** — used as the "From" address for outgoing emails
   - **Slogan** — optional tagline shown in the header area
   - **Front page** — the default is `/news-homepage` (the news feed); change this if you want a different landing page

## User management

### User registration

By default, only administrators can create user accounts (`admin_only` registration). To change this:

1. Go to **Configuration > People > Account settings** (`/admin/config/people/accounts`).
2. Under **Registration and cancellation**, choose:
   - **Administrators only** (default) — admin must create each account
   - **Visitors** — anyone can register (useful for open intranets)
   - **Visitors, but administrator approval is required** — users register but need admin approval

### Adding users

To manually add users:

1. Go to **People** (`/admin/people`).
2. Click **Add user**.
3. Fill in the username, email, password, and assign roles.

### Roles

Open Intranet comes with these roles out of the box:

| Role | Permissions |
|---|---|
| **Authenticated user** | View content, comment, use reactions, bookmark, search, view documents, and access the employee directory |
| **Content Editor** | Create, edit, and delete content (news, events, KB pages, basic pages), manage media, and manage taxonomy |
| **Administrator** | Full access to all configuration, content, users, and modules |

Optional recipes may add additional roles (see [Optional features](#optional-features) below).

## Email configuration

Open Intranet uses Drupal's mail system. For a production deployment, configure an SMTP server:

1. Install an SMTP module (e.g. [SMTP Authentication Support](https://www.drupal.org/project/smtp) or [Symfony Mailer](https://www.drupal.org/project/symfony_mailer)) via Composer:
   ```bash
   ddev composer require drupal/smtp
   ddev drush en smtp -y
   ```
2. Navigate to **Configuration > System > SMTP Authentication Support** and enter your mail server settings.

Without SMTP configuration, the site uses PHP's built-in `mail()` function, which may not work reliably on all hosting environments.

## Optional features

Open Intranet ships with optional features packaged as **Drupal recipes**. Each recipe adds a complete feature — content types, views, permissions, and sample content — in a single command.

### Applying a recipe

```bash
ddev drush recipe:apply recipes/<recipe_name>
```

After applying a recipe, clear the cache:

```bash
ddev drush cache:rebuild
```

### Available recipes

| Recipe | Command | What it adds |
|---|---|---|
| **Courses** | `recipes/openintranet_courses` | Learning management with courses, lessons, enrollment tracking, and progress indicators |
| **FAQ** | `recipes/openintranet_faq` | Frequently Asked Questions content type with a categorized listing page |
| **Ideas** | `recipes/openintranet_ideas` | Idea submission and voting system — employees can propose ideas and vote on them |
| **Inventory** | `recipes/openintranet_inventory` | Asset and inventory tracking with items, locations, and assignments |
| **Kanban Board** | `recipes/openintranet_kanban` | Kanban-style task board for visual project management (experimental) |
| **Kudos** | `recipes/openintranet_kudos` | Peer recognition system — send kudos to colleagues |
| **Room Booking** | `recipes/openintranet_rmb` | Room and resource booking with a calendar view; adds a `Room Manager` role |
| **SSO: Keycloak** | `recipes/openintranet_sso_keycloak` | Single Sign-On via Keycloak using OpenID Connect |
| **Consultation Process** | `recipes/consultation_process` | Structured consultation workflow with ECA automation; adds reviewer roles |
| **Demo Content** | `recipes/default_content` | Sample content (news, events, KB pages, users, groups) for evaluation and testing |

:::tip
You can apply multiple recipes. They are additive and do not conflict with each other.
:::

## Single Sign-On (SSO)

To integrate with your organization's identity provider (IdP), apply the Keycloak SSO recipe:

```bash
ddev drush recipe:apply recipes/openintranet_sso_keycloak
ddev drush cache:rebuild
```

Then configure the OpenID Connect settings:

1. Go to **Configuration > People > OpenID Connect** (`/admin/config/people/openid-connect`).
2. Enable the **Keycloak** provider.
3. Enter your Keycloak server details:
   - **Client ID**
   - **Client secret**
   - **Keycloak base URL**
   - **Realm**
4. Save and test the login flow.

:::note
The SSO recipe is pre-configured for Keycloak, but the underlying [OpenID Connect module](https://www.drupal.org/project/openid_connect) supports other providers (Azure AD, Google, Okta, etc.) with additional configuration.
:::

## Theme customization

Open Intranet uses a **Bootstrap Barrio** subtheme with SCSS. The starter theme is located in `web/themes/custom/openintranet_theme/`.

To customize the look and feel:

1. Edit SCSS files in the theme's `scss/` directory.
2. Compile with the included Gulp setup:
   ```bash
   cd web/themes/custom/openintranet_theme
   npm install
   npx gulp
   ```
3. Adjust theme settings at **Appearance > Open Intranet Theme > Settings**.

Key customization options:
- **Logo** — upload your company logo via the theme settings page
- **Favicon** — replace the default favicon
- **Colors** — edit SCSS variables in `scss/_variables.scss`
- **Layout** — Bootstrap Barrio supports various layout options (sidebar position, container width)

## Search configuration

Open Intranet uses **Search API** with a database backend. Search is ready to use out of the box, but you may want to adjust it:

1. Go to **Configuration > Search and metadata > Search API** (`/admin/config/search/search-api`).
2. The default index covers all major content types.
3. To reindex content manually:
   ```bash
   ddev drush search-api:index
   ```

For large installations, consider replacing the database backend with [Solr](https://www.drupal.org/project/search_api_solr) for better performance.

## Cron and scheduled tasks

Drupal relies on cron for background tasks (search indexing, email sending, cache cleanup). Configure cron to run regularly:

### Using DDEV (local development)

DDEV includes a cron add-on. To enable it:

```bash
ddev get ddev/ddev-cron
ddev restart
```

### Using system cron (production)

Add a cron job that runs every 15 minutes:

```
*/15 * * * * cd /path/to/openintranet && vendor/bin/drush cron
```

### Manual cron run

```bash
ddev drush cron
```

## Backups

Open Intranet includes the **Backup and Migrate** module. Configure regular backups at **Administration > Configuration > Development > Backup and Migrate** (`/admin/config/development/backup_migrate`).

For DDEV-based environments, you can also use:

```bash
ddev export-db --file=backup.sql.gz
```

## Performance (production)

For production deployments, enable Drupal's built-in caching:

1. Go to **Configuration > Development > Performance** (`/admin/config/development/performance`).
2. Enable **Page caching** and set a max-age (e.g. 3600 seconds).
3. Enable **CSS and JavaScript aggregation**.

## Next steps

- [User Guide](/docs/user-guide/) — learn how to use the intranet features
- [Creating Content](/docs/user-guide/creating-content/) — how to create news, events, and knowledge base pages
