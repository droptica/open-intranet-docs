---
title: Installation
description: How to install Open Intranet on your server.
---

Open Intranet is a Drupal 11 distribution. You can install it using Composer.

## Requirements

- PHP 8.2 or higher
- MySQL 8.0+ or MariaDB 10.6+
- Composer 2.x
- Node.js 18+ (for theme building)
- Apache or Nginx web server

## Installation with Composer

```bash
composer create-project droptica/openintranet my-intranet
cd my-intranet
```

## Database setup

Create a MySQL database for your intranet:

```sql
CREATE DATABASE openintranet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'intranet'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON openintranet.* TO 'intranet'@'localhost';
```

## Web installer

Navigate to your site in a browser and follow the Drupal installation wizard. Select the **Open Intranet** installation profile.

## Next steps

- [Configuration](/docs/getting-started/configuration/) — Configure SSO, LDAP, and other settings
