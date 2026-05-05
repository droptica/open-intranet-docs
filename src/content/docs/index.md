---
title: Introduction
description: Open Intranet is an open source intranet platform built as a Drupal 11 distribution. Free to use, self-hosted, fully extensible, no per-user fees.
---

Open Intranet is an open source intranet platform that brings together news, knowledge, documents, people and data from your existing systems — with full data ownership and unlimited customisation. It is **free**, **self-hostable**, and built as a **Drupal  distribution**, which means it inherits the entire Drupal ecosystem.

## Who is it for?

Open Intranet is designed for organisations that need:

- **Full control** over their data and infrastructure — on-prem, private cloud, or any hosting that supports PHP
- **No per-user licensing fees** — the software itself is free and always will be
- **Enterprise features out of the box** — SSO/OIDC, must-read tracking, engagement analytics, AI-assisted content, room booking, knowledge base
- **Long-term extensibility** through Drupal's ecosystem of contributed modules — built for 5+ year deployments without vendor lock-in

It scales from small teams (50–100 employees) running it as-is, to enterprises with 7,000+ users running heavily customised implementations.

## Open Intranet installation is a Drupal distribution - what that means

Open Intranet is technically a **Drupal install profile** bundled with a curated set of contributed modules, a starter theme and a collection of **recipes** (reusable Drupal config + content bundles). When you install Open Intranet, you are installing a regular Drupal site that has been pre-configured to behave as an intranet.

Drupal is a fantastic foundation for intranets because it offers:

- **Fine-grained permissions** — combine roles, per-entity access, per-group and per-department visibility to model any organisational structure.
- **Battle-tested security** — governments, banks and public institutions have run Drupal for 20+ years; the Drupal Security Team triages CVEs and ships advisories on a fixed schedule.
- **Unlimited extensibility** — pick from ~50,000 contributed modules, or write your own with Drupal's plugin types, hooks, events and services to bend the platform to any internal process without rebuilding from scratch.

### Open Intranet is a Drupal site

Once installed, Open Intranet behaves exactly like any other Drupal site. The administrative UI is Drupal's, the content model uses Drupal entities (nodes, users, media, taxonomy terms, files, groups), the templating layer is Twig, the configuration system is Drupal's YAML-based configuration management, and the command-line tooling is `drush`.

There is **no proprietary admin layer** sitting on top of Drupal. There is no closed format, no parallel data store, no SaaS API contract. Everything is in the database and the codebase that you own.

The practical consequence is that **everything you can do on a Drupal site, you can do on Open Intranet**:

- Add custom content types, fields, taxonomies, views, blocks and menus through the admin UI
- Override Twig templates and CSS in your own theme to match your brand
- Use Drupal's permission and role system for access control
- Hook into events with [ECA](https://www.drupal.org/project/eca) (no-code business rules) or with custom modules
- Manage configuration in code with the standard Drupal config-export workflow
- Run any standard Drupal contrib module alongside Open Intranet's stack

### You can use thousands of Drupal modules

Drupal.org has roughly **50,000 contributed modules**. Most are GPL-compatible, security-tracked and trivially installed with Composer. Because Open Intranet is just a Drupal site, all of these are available to extend it.

#### What is already in the box

Open Intranet ships with around **80 contributed modules** pre-selected and pre-configured for an intranet workload. Names you may recognise:

| Area | Pre-shipped modules |
| --- | --- |
| **Editorial UX** | [`gin`](https://www.drupal.org/project/gin), [`gin_toolbar`](https://www.drupal.org/project/gin_toolbar), [`coffee`](https://www.drupal.org/project/coffee), [`frontend_editing`](https://www.drupal.org/project/frontend_editing), [`autosave_form`](https://www.drupal.org/project/autosave_form), [`diff`](https://www.drupal.org/project/diff), [`entity_clone`](https://www.drupal.org/project/entity_clone), [`book`](https://www.drupal.org/project/book) |
| **Content authoring** | [`ckeditor5_allowed_html`](https://www.drupal.org/project/ckeditor5_allowed_html), [`ckeditor_iframe`](https://www.drupal.org/project/ckeditor_iframe), [`ckeditor_media_resize`](https://www.drupal.org/project/ckeditor_media_resize), [`smart_trim`](https://www.drupal.org/project/smart_trim), [`token`](https://www.drupal.org/project/token), [`pathauto`](https://www.drupal.org/project/pathauto), [`auto_entitylabel`](https://www.drupal.org/project/auto_entitylabel) |
| **Forms & workflows** | [`webform`](https://www.drupal.org/project/webform), [`eca`](https://www.drupal.org/project/eca), [`bpmn_io`](https://www.drupal.org/project/bpmn_io), [`field_group`](https://www.drupal.org/project/field_group), [`inline_entity_form`](https://www.drupal.org/project/inline_entity_form) |
| **Permissions & access** | [`config_perms`](https://www.drupal.org/project/config_perms), [`flexible_permissions`](https://www.drupal.org/project/flexible_permissions), [`masquerade`](https://www.drupal.org/project/masquerade), [`anonymous_redirect`](https://www.drupal.org/project/anonymous_redirect), [`autologout`](https://www.drupal.org/project/autologout), [`private_files_download_permission`](https://www.drupal.org/project/private_files_download_permission) |
| **Identity / SSO** | [`openid_connect`](https://www.drupal.org/project/openid_connect), [`noreqnewpass`](https://www.drupal.org/project/noreqnewpass) |
| **Search** | [`search_api`](https://www.drupal.org/project/search_api), [`search_api_solr`](https://www.drupal.org/project/search_api_solr), [`easy_breadcrumb`](https://www.drupal.org/project/easy_breadcrumb), [`simple_sitemap`](https://www.drupal.org/project/simple_sitemap) |
| **Calendar & events** | [`calendar_view`](https://www.drupal.org/project/calendar_view), [`fullcalendar_view`](https://www.drupal.org/project/fullcalendar_view), [`leaflet`](https://www.drupal.org/project/leaflet) |
| **Views power-ups** | [`better_exposed_filters`](https://www.drupal.org/project/better_exposed_filters), [`views_aggregator`](https://www.drupal.org/project/views_aggregator), [`views_conditional`](https://www.drupal.org/project/views_conditional), [`views_kanban`](https://www.drupal.org/project/views_kanban), [`views_organization_chart`](https://www.drupal.org/project/views_organization_chart), [`views_send`](https://www.drupal.org/project/views_send) |
| **Layout & theming** | [`bootstrap_sass`](https://www.drupal.org/project/bootstrap_sass), [`layout_builder_styles`](https://www.drupal.org/project/layout_builder_styles), [`layout_custom_section_classes`](https://www.drupal.org/project/layout_custom_section_classes), [`twig_tweak`](https://www.drupal.org/project/twig_tweak), [`dashboard`](https://www.drupal.org/project/dashboard), [`theme_switcher`](https://www.drupal.org/project/theme_switcher) |
| **Media** | [`focal_point`](https://www.drupal.org/project/focal_point), [`imagemagick`](https://www.drupal.org/project/imagemagick), [`imce`](https://www.drupal.org/project/imce), [`iconify_field`](https://www.drupal.org/project/iconify_field) |
| **Messaging** | [`smsapi`](https://www.drupal.org/project/smsapi), [`flag`](https://www.drupal.org/project/flag) |
| **Engagement & social** | [`votingapi`](https://www.drupal.org/project/votingapi), [`votingapi_reaction`](https://www.drupal.org/project/votingapi_reaction), [`recently_read`](https://www.drupal.org/project/recently_read), [`statistics`](https://www.drupal.org/docs/8/core/modules/statistics), [`gtm`](https://www.drupal.org/project/gtm) |
| **AI** | [`ai`](https://www.drupal.org/project/ai), [`ai_provider_openai`](https://www.drupal.org/project/ai_provider_openai), [`ai_agents`](https://www.drupal.org/project/ai_agents), [`alpine_js`](https://www.drupal.org/project/alpine_js) |
| **Operational** | [`automatic_updates`](https://www.drupal.org/project/automatic_updates), [`backup_migrate`](https://www.drupal.org/project/backup_migrate), [`queue_ui`](https://www.drupal.org/project/queue_ui), [`recipe_tracker`](https://www.drupal.org/project/recipe_tracker), [`tour`](https://www.drupal.org/project/tour), [`project_browser`](https://www.drupal.org/project/project_browser) |
| **Open Intranet custom** | `openintranet_access`, `openintranet_documents`, `openintranet_engagement`, `openintranet_messenger` |

The full list lives in [`composer.json`](https://git.drupalcode.org/project/openintranet/-/blob/1.x/composer.json) on drupal.org.

#### What you can add yourself

Beyond what is already shipped, you can `composer require` any of the ~50,000 modules on drupal.org. Categories that come up often on intranet projects:


| Category | Common modules to add | Use case |
| --- | --- | --- |
| **AI extensions** | additional [`ai_provider_*`](https://www.drupal.org/project/ai) packages, custom agents on top of [`ai_agents`](https://www.drupal.org/project/ai_agents) | Swap from OpenAI to Anthropic / Mistral / on-prem LLM, add domain-specific agents |
| **Identity / SSO** | [`simple_oidc`](https://www.drupal.org/project/simple_oidc), [`samlauth`](https://www.drupal.org/project/samlauth), [`ldap`](https://www.drupal.org/project/ldap) | Microsoft Entra ID / Azure AD, Okta, Google Workspace, Keycloak, on-prem AD |
| **Authentication** | [`tfa`](https://www.drupal.org/project/tfa), [`password_policy`](https://www.drupal.org/project/password_policy) | Two-factor auth, enterprise password rules |
| **API / decoupled** | [`jsonapi_extras`](https://www.drupal.org/project/jsonapi_extras), [`simple_oauth`](https://www.drupal.org/project/simple_oauth), [`graphql`](https://www.drupal.org/project/graphql), [`rest_api_authentication`](https://www.drupal.org/project/rest_api_authentication) | Mobile apps, headless front-ends, third-party integrations |
| **Multilingual** | Drupal core + [`tmgmt`](https://www.drupal.org/project/tmgmt) | Global organisations, translation workflows |
| **Compliance / GDPR** | [`gdpr`](https://www.drupal.org/project/gdpr), [`auditfiles`](https://www.drupal.org/project/auditfiles), [`auto_purge`](https://www.drupal.org/project/auto_purge) | Right-to-be-forgotten, data retention, audit logs |
| **Search** | [`search_api`](https://www.drupal.org/project/search_api), [`search_api_solr`](https://www.drupal.org/project/search_api_solr), [`search_api_meilisearch`](https://www.drupal.org/project/search_api_meilisearch) | Solr / Meilisearch / Elasticsearch swap-ins |
| **Workflow / BPM** | [`workflows`](https://www.drupal.org/docs/8/core/modules/workflows), [`content_moderation`](https://www.drupal.org/docs/8/core/modules/content-moderation), [`bpmn_io`](https://www.drupal.org/project/bpmn_io) | HR approval flows, document review, change requests |
| **Integrations** | [`google_api_client`](https://www.drupal.org/project/google_api_client), [`microsoft_graph`](https://www.drupal.org/project/microsoft_graph), [`migrate_plus`](https://www.drupal.org/project/migrate_plus) | Microsoft 365, Google Workspace, HR/CRM/ERP imports |
| **Performance** | [`redis`](https://www.drupal.org/project/redis), [`memcache`](https://www.drupal.org/project/memcache), [`big_pipe`](https://www.drupal.org/docs/8/core/modules/bigpipe) | Caching layer for thousands of concurrent users |
| **Backup / DR** | [`backup_migrate`](https://www.drupal.org/project/backup_migrate) | Scheduled DB + files backups |

To add any of them: `composer require drupal/<module>` then enable in the admin UI or via `drush en <module>`.

### You can use Drupal recipes for repeatable customisation

Open Intranet ships several optional **recipes** (e.g. **Room Booking**, **Courses**, **FAQ**, **Ideas**, **Inventory**, **Kanban**, **Kudos**, **SSO Keycloak**, **Demo Content**) that bundle config + content + dependencies for a specific use case and can be applied with one click at `/admin/modules/browse/recipes`.

You can author your own recipes for company-specific configuration (e.g. "internal-policies-suite" — your own content types, workflows, default permissions and demo content) and apply them to any Open Intranet instance — staging, production, a new department site — without copy-pasting configuration.

### You can host it anywhere PHP runs

Because Open Intranet is "just" a Drupal site:

- **Self-host** on your own Linux server (Ubuntu, Debian, RHEL — see [Installation](/docs/getting-started/installation/))
- **Docker / Kubernetes** in your private cloud
- **Managed Drupal hosting** like [Pantheon](https://pantheon.io), [Acquia Cloud](https://www.acquia.com/products/drupal-cloud), [Platform.sh](https://platform.sh) or [Amazee.io / Lagoon](https://amazee.io)
- **Generic PHP hosting** with MariaDB / MySQL / PostgreSQL — typically requires SSH + Composer

There is no SaaS lock-in: you can move between hosting providers by moving the codebase, the database and the `sites/default/files` directory.

### You patch and update with Composer

Updates are the same as any Drupal project — `composer update`, run database updates with `drush updb -y`, clear caches with `drush cr`. Security advisories are tracked at [drupal.org/security](https://www.drupal.org/security) and apply to every component in the stack.

You can pin versions, apply patches with [`cweagans/composer-patches`](https://github.com/cweagans/composer-patches) (already included), and run staging/production from the same `composer.lock`.

## What Open Intranet is *not*

To set realistic expectations:

- **Not a SaaS** — there is no `app.openintranet.com` to sign up to. You install and run it.
- **Not zero-effort** — running a production intranet for hundreds of users requires Linux/PHP/Drupal know-how, in-house or via a partner. There are no per-user fees, but there is OPEX (hosting + administration time).
- **Not a black box on top of Drupal** — Open Intranet is the Drupal site itself, not a layer above it. If you avoid Drupal entirely, you will hit a wall the first time you need to extend something.
- **Not 100% feature-parity with SharePoint / Workplace / Simpplr** — instead, it is a curated foundation with the most-requested intranet features pre-built, plus the entire Drupal ecosystem to fill any gap. Comparison docs are on the roadmap.

## Total cost of ownership

| Component | Open Intranet | Typical SaaS intranet |
| --- | --- | --- |
| **Software licence** | $0 (GPL v2+) | $4–$12 per user / month |
| **Hosting** | $20–$200+ / month for self-host, more for managed | Included in subscription |
| **Admin time** | In-house Drupal admin (or partner) | Vendor-handled |
| **Customisation** | Free, unlimited (you own the code) | Per-feature SaaS charges, often blocked |
| **Data ownership** | 100% yours | Vendor-controlled |

For a 1,000-user organisation, Open Intranet typically pays back its setup cost in 6–12 months versus per-seat SaaS licensing.

## Where to learn Drupal

Because Open Intranet is a regular Drupal site, the entire upstream Drupal documentation applies. Useful starting points for non-Drupal teams:

- [drupal.org/docs](https://www.drupal.org/docs) — official user, admin, and developer guides
- [Drupal User Guide](https://www.drupal.org/docs/user_guide/en/index.html) — comprehensive end-to-end manual
- [api.drupal.org](https://api.drupal.org) — full API reference for developers
- [drush.org](https://www.drush.org/latest/) — the command-line tool you will use a lot

Open Intranet's own documentation focuses on what is **specific to Open Intranet**. For general Drupal mechanics (entities, fields, views, plugin types, hooks, services), follow the links to drupal.org rather than expecting the same depth here.

## Next steps

- [Installation](/docs/getting-started/installation/) — production install on Linux, plus a quick local-dev path with DDEV
- [Configuration](/docs/getting-started/configuration/) — site name, email, recipes, SSO, theme
- [User Guide](/docs/user-guide/) — how end users interact with the intranet
- [Features](/docs/features/engagement/) — deep dives into Engagement Analytics, Must-Read, Room Booking and more
- [REST API](/docs/development/api/) — JSON:API reference for integrating with external systems
