---
title: Help & onboarding (pre-release)
description: An in-product user manual and help toolbar — Markdown-based documentation in EN/PL/DE/FR with full-text search, an extensible plugin system for adding contextual help, and a floating help button on every admin page. Distributed via GitHub as a pre-release module.
---

The **Help** module (`openintranet_help`) puts the **user manual right inside the intranet**. Instead of pointing employees to an external docs site, every page of the admin interface gets a floating *Help* button that opens a searchable, in-context manual scoped to what the user is currently doing. The manual ships in **four languages** (English, Polish, German, French) and is extensible through a plugin system so other modules can register their own help sections.

> **Pre-release.** Help is currently distributed via [GitHub](https://github.com/droptica/openintranet_help) (the source repository is private during pre-release) and not yet on drupal.org. The development plan is in the *Open Intranet* internal docs and the module is based on the proven [d_help](https://www.drupal.org/project/d_help) module. Expect API and content churn until the first drupal.org release. This page describes the v1 design as planned.

## What it is

Help solves the *"where do I even start?"* problem on a feature-rich intranet. Without it, training is a slide deck the IT team writes once, gets stale, and nobody opens. With it, the manual is **right there**, on every admin page, in the user's language, with screenshots, search, and contextual entry points.

The module ships:

- A **Markdown-based user manual** stored as `.md` files inside the module — version-controlled, diffable, easy to localise.
- **Four language packs** out of the box — EN, PL, DE, FR.
- A **floating help toolbar block** that admins can place on the entire admin area; one click opens the relevant manual section.
- A **manual landing page** at `/admin/intranet/help/manual` with a table of contents and full-text search.
- A **plugin system** (`OiHelpContent` plugin type) so other modules can register their own help sections (e.g. an installed Recipe can ship its own help content).
- **Automatic prev / next navigation** between pages.
- **Image embedding** with proper path rewriting.
- **Per-section breadcrumbs** that show the current location in the manual hierarchy.

## Components

### The manual

The manual lives under `content/manual/{langcode}/` inside the module:

```
openintranet_help/content/manual/
├── en/
│   ├── 01-introduction.md
│   ├── 02-dashboard.md
│   ├── 03-documents.md
│   ├── 04-folders.md
│   ├── 05-messenger.md
│   ├── 06-calendar.md
│   ├── 07-users-groups.md
│   ├── 08-administration.md
│   └── 09-security.md
├── pl/
│   ├── 01-wprowadzenie.md
│   ├── 02-panel-glowny.md
│   └── …
├── de/
│   ├── 01-einfuehrung.md
│   ├── 02-dashboard.md
│   └── …
└── fr/
    ├── 01-introduction.md
    ├── 02-tableau-de-bord.md
    └── …
```

Each file is **plain Markdown** with image embeds. Authoring help is the same as authoring a README — clone the repo, edit a `.md`, push a commit, the change goes live for everyone the next time the module is updated.

### Language fallback

When a user is browsing the manual in a language that does not have a particular page yet, the module **falls back to English** automatically rather than showing a blank page. This means a community contributor can add a single page in EN and the manual still serves PL/DE/FR users with the EN version, until a translator catches up.

### The manual landing page — `/admin/intranet/help/manual`

The landing page is a generated **table of contents**:

- One entry per `.md` file in the active language directory.
- Entries are ordered by their numeric prefix (`01-`, `02-`, …).
- Each entry shows the H1 of the file as the link text.

A **search box** at the top runs a full-text search over every page's content (title, headings, body) and returns matching entries sorted by relevance. Search runs in the active language with the same EN fallback rule.

### The single-page view — `/admin/intranet/help/manual/{page}`

Each page renders with:

- **Table of contents** — auto-generated from the page's headings (H2 / H3 / H4) so the reader can jump within the page.
- **Body** — the rendered Markdown with images, code blocks, lists and tables.
- **Prev / next navigation** — links to the previous and next pages in the manual sequence.
- **Edit on GitHub** — link directly to the `.md` source file (when the *edit on GitHub* setting is enabled).

### The help toolbar block

The `HelpToolbarBlock` plugin renders a small **floating help button** in the admin interface (typically pinned to the bottom-right corner). It is a configurable block so the admin can place it on whatever pages and regions make sense (most installs place it on every admin page, the dashboard and key user-facing pages).

Clicking the button opens a slim sidebar with:

- **Quick links** to the manual's most-used pages.
- **Search input** — typing here runs the same full-text search as the landing page.
- **Plugin sections** — every registered `OiHelpContent` plugin contributes its own collapsible block (e.g. *Documents*, *Calendar*, *Spaces*, …) with module-specific help.

### The plugin system

Other modules can register their own help content via the `#[OiHelpContent]` attribute:

```php
#[OiHelpContent(
  id: 'my_module',
  label: new TranslatableMarkup('My Module'),
  weight: 50,
)]
class MyModuleHelp extends OiHelpContentBase {
  public function getTitle(): string { return $this->t('My Module help'); }
  public function getContent(): array {
    return [
      '#markup' => $this->t('Quick reference for my module'),
      // … structured links / sections / cards …
    ];
  }
}
```

This is what lets the platform stay coherent as it grows — each new feature can ship its own help section, and the in-product manual gets richer without anyone editing a central HTML file.

### Settings

`/admin/intranet/help/settings` exposes the per-site settings:

- **Default language** — which language to show when the user has no preferred language set.
- **Show on language switch** — whether to display a notice when a manual page is served in EN as a fallback.
- **Edit on GitHub** — show / hide the *Edit on GitHub* link on each page.
- **Toolbar position** — top-left, top-right, bottom-left, bottom-right.
- **Hide for roles** — list of roles that should never see the toolbar.

### Permissions

| Permission | Default role(s) |
| --- | --- |
| Access OpenIntranet help (read help pages) | Authenticated user |
| Access OpenIntranet manual (read the manual) | Authenticated user |
| View help toolbar (see the floating button) | Authenticated user |
| Administer OpenIntranet help (configure settings) | Administrator |

## Workflow

### For administrators

- **Place the toolbar** — At `/admin/structure/block`, place the *Help toolbar* block in the admin region (and / or the front-end region if the manual should also be accessible to regular users).
- **Configure** — At `/admin/intranet/help/settings`, set the default language, choose the toolbar position, hide for specific roles.
- **Update the manual** — Pull the latest module from GitHub / drupal.org; the new content is live immediately.

### For users

- **Browse the manual** — Visit `/admin/intranet/help/manual` and click through the chapters.
- **Search** — Type a keyword into the search box; matching pages appear.
- **Use the toolbar** — Click the floating *Help* button on any page; the sidebar opens with quick links and search.
- **Switch language** — The manual respects the user's active language preference (set on the user profile or via the language switcher).

## Integration with other features

- **[Multilingual](./multilingual)** — The manual ships in EN/PL/DE/FR; the active language drives which version is served. Falls back to EN if a translation is missing.
- **[Search](./search)** — The manual search is a separate full-text search over Markdown files (not part of the Search API content index) for performance reasons. Future versions may unify the two.
- **[Layout Builder & Frontend Editing](./layout-builder)** — The toolbar block can be placed via Layout Builder on per-bundle layouts (e.g. *show the help toolbar on the Documents detail page*).
- **Every other feature** — Each shipped feature module (or recipe) can register its own `OiHelpContent` plugin, so the manual grows organically as the platform is extended.

## Installing the module

Help is currently a pre-release module distributed via GitHub. The Open Intranet wrapper repository pulls it through `modules_github.conf`:

```bash
# In the wrapper repo (private, internal use):
./scripts/setup-environment.sh
# Then sync to the Drupal codebase:
rsync -av --delete \
  modules_openintranet/openintranet_help_github/ \
  openintranet/web/modules/contrib/openintranet_help/
ddev drush en openintranet_help -y
ddev drush cr
```

Once published to drupal.org, Help will install via `composer require drupal/openintranet_help` and the `_github` suffix on the directory will go away.

## Modules behind it

- `openintranet_help` (custom) — controllers, services, plugin manager, toolbar block, settings
- Drupal core: `block`, `system`, `language`, `path`
- Based on the proven [d_help](https://www.drupal.org/project/d_help) module — the architecture is mature even though `openintranet_help` itself is still pre-release

## Learn more

- [Multilingual](./multilingual) — the language fallback rule that drives manual selection
- [Search](./search) — the platform's content search (separate from the manual's own search)
- [Layout Builder & Frontend Editing](./layout-builder) — placing the help toolbar block
- [Open Intranet project on drupal.org](https://www.drupal.org/project/openintranet)
- [d_help module on drupal.org](https://www.drupal.org/project/d_help) — the conceptual ancestor
