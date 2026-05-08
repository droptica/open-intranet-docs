---
title: Spaces — department workspaces (pre-release)
description: Dedicated hubs for departments, offices, projects or teams — each Space is a curated central place that aggregates news, documents, knowledge base, events and webforms scoped to that team. Distributed via GitHub as a pre-release module.
---

The **Spaces** module (`openintranet_spaces`) introduces *department / team workspaces* to Open Intranet — dedicated, named areas that aggregate everything published *for* a given group: HR's news, IT's knowledge base, the Berlin office's events, the Marketing team's documents and webforms. Each Space is a clean URL (`/hr`, `/marketing`, `/berlin`), a clear visual identity (colour, icon, logo) and a self-service area that the team's manager can curate without administrator permissions on Drupal.

> **Pre-release.** Spaces is currently distributed via [GitHub](https://github.com/droptica/openintranet_spaces) (the source repository is private during pre-release) and not yet on drupal.org. The development plan is in the *Open Intranet* internal docs. Expect API and configuration churn until the first drupal.org release. This page describes the v1 design as planned.

## What it is

Spaces solves three problems that come up when the company gets large enough that a single homepage is not enough:

1. **Aggregation** — every department wants *its* News, *its* Documents, *its* Events on a single landing page, without the noise of the rest of the company.
2. **Delegated management** — each department manager wants to curate that landing page without a Drupal admin in the loop.
3. **URL coherence** — `/hr`, `/hr/news`, `/hr/documents`, `/hr/events`, `/hr/knowledge-base` should *all* be the HR-scoped versions of the corresponding listings.

Spaces ships:

- A custom **`oi_space`** content entity — the workspace itself with a name, description, URL slug, visibility, image, colour, icon, optional linked OI Group and feature flags.
- An **`oi_space_membership`** relationship table — *who is in this Space, and in what role* (owner / manager / editor / member / viewer).
- A `field_space` reference field added to every relevant content type — News, Pages, Documents, Events, Knowledge Base, Webforms — that says *"this content lives in this Space"*.
- Per-Space landing pages and aggregated lists (`/hr` is the HR landing, `/hr/news` the HR news listing, etc.).
- Optional **automatic access propagation** — when a Space is linked to an OI Group, content in the Space automatically inherits the group restrictions through [Access Control & Groups](./access).

## Components

### The OI Space entity

The central entity. Each Space has:

| Field | Purpose |
| --- | --- |
| **Name** | The display name (e.g. *HR*, *Marketing Berlin*, *Project Atlas*). |
| **Description** | A short blurb shown on the Space's landing page. |
| **URL slug** | The path prefix (e.g. `hr`, `marketing-berlin`, `atlas`). UNIQUE across the site. |
| **Visibility** | `public` (everyone can see it) or `members_only` (only Space members can see anything inside it). |
| **Status** | Active / inactive. Inactive Spaces are hidden from the listing. |
| **Owner (uid)** | The user who created / owns the Space. |
| **Image / colour / icon** | Visual identity used on the landing page and in the Spaces list. |
| **Linked OI Group** | Optional reference to an [OI Group](./access). When set, enables automatic access propagation. |
| **Auto-access** | Boolean. When `true`, every content item in the Space is automatically restricted to the linked group's members. |

A user can belong to **any number** of Spaces — there is no limit. Many users will be members of *Berlin Office* + *Marketing Berlin* + *Project Atlas* simultaneously.

### Space membership and roles

Membership is stored separately from OI Groups so that roles inside a Space can differ from roles inside an organisational group. The hierarchy:

| Role | Capabilities |
| --- | --- |
| **Owner** | Full control. One per Space. Can transfer ownership. |
| **Manager** | Add / remove members, change Space settings, edit the landing page. Multiple per Space. |
| **Editor** | Create / edit / delete content inside the Space. Cannot manage members. |
| **Member** | Read everything in the Space, post comments and reactions. |
| **Viewer** | Read-only — used for stakeholder access without write rights. |

This separation matters: a *Member* of the *HR* Space (e.g. an employee who needs to read HR announcements) should not be a *Member* of the *HR Department* OI Group (e.g. an actual HR officer).

### The `field_space` reference field

Every content type that participates in the Space concept gets a single `field_space` entity-reference field — News articles, Pages, Documents, Events, Knowledge Base pages, Webform nodes. The field is:

- **Required-ish** — When a user is creating content from inside a Space ("*HR landing page → Add News article*"), the field is pre-populated with the active Space.
- **Pickable** — When a user creates content from the global node-add form, they pick the Space from a dropdown of those they belong to.
- **Single-value** — One content item belongs to one Space (or to *no Space* — in which case it is a company-wide item).

### Per-Space URLs

Spaces installs a URL alias rule that maps `/{url_slug}/*` to the Space-scoped versions of each listing:

```
/hr                → HR Space landing
/hr/news           → News articles where field_space = HR
/hr/documents      → Documents folder root for the HR Space
/hr/events         → Events where field_space = HR
/hr/knowledge-base → KB pages where field_space = HR
/hr/forms          → Webforms with field_space = HR
```

The same URL-prefix pattern applies to every Space — `/marketing/news`, `/it/documents`, `/berlin/events`, etc.

### The Space landing page

Each Space's landing page (`/{url_slug}`) aggregates everything in one place:

- **Hero** — the Space's image, colour-tinted title, description.
- **Latest news** in the Space.
- **Upcoming events** in the Space.
- **Latest documents** in the Space.
- **Knowledge base entries** in the Space.
- **Members list** (avatars + roles).
- **Configurable widgets** — managers can add / remove / reorder widget blocks via Layout Builder (the bundled module enables LB on the `oi_space` view display).

### Visibility model

Two levels:

- **`public` Spaces** — Listed for everyone. Their landing page and content are visible to all authenticated users.
- **`members_only` Spaces** — Listed only for members. Outside members see neither the Space's existence nor its content. The visibility check runs at the route level, not just the listing level.

Combined with the *auto-access* flag and the linked OI Group, this gives four common configurations:

| Visibility | Linked group | Auto-access | Behaviour |
| --- | --- | --- | --- |
| `public` | none | n/a | Open Space — visible to everyone, content unrestricted. |
| `public` | group | off | Open Space — visible to everyone, content visible per its own access rules. |
| `members_only` | none | n/a | Private Space — only members see it, content visible to members only. |
| `members_only` | group | on | Private Space — only members see it; content automatically restricted to the linked group (manager doesn't have to set Access on every item). |

## Workflow

### Creating a Space (administrator)

1. *Spaces administration* page — *Add Space*.
2. Enter name, description, URL slug.
3. Pick visibility (public / members_only).
4. (Optional) Link to an OI Group and tick *auto-access*.
5. Upload image, pick colour, pick icon.
6. Save. Add the first manager.

### Day-to-day (Space manager)

1. Visit `/hr` (the Space landing).
2. Click *Add news* / *Add event* / *Add document* / *Add KB page* — `field_space` is pre-populated.
3. Edit the Space landing layout via Layout Builder to feature pinned content, change widget order, add custom blocks.
4. Manage members from `/hr/members`.

### Day-to-day (Space member)

1. Visit `/hr` to see the latest of everything in HR.
2. Visit `/hr/documents` for the HR document tree.
3. Subscribe to the Space (planned for v2) to get notifications when new content is published.

## Integration with other features

- **[Access Control & Groups](./access)** — Auto-access ties a Space to an OI Group and propagates the group restrictions to every content item in the Space. Saves *manually setting* Access on each item.
- **[News](./news), [Events](./events), [Documents](./documents), [Knowledge Base](./knowledge-base), [Pages](./pages), [Webforms](./webforms)** — All gain a `field_space` reference; per-Space listings and aggregations are built on top of standard Drupal views.
- **[Search](./search)** — Search results can be scoped to the active Space (when invoked from `/hr/search`) or to the whole site (from `/search`).
- **[Layout Builder & Frontend Editing](./layout-builder)** — Each Space landing page is a Layout Builder layout that managers can customise.
- **[Engagement scoring](./employee-directory#engagement-scoring)** — Activity inside a Space is recorded against the user; *most-engaged Spaces* dashboards become possible.
- **[Messenger](./messenger)** — A future channel plugin can resolve recipients via Space membership ("*notify everyone in HR*").
- **[ECA — no-code workflows](./eca)** — Models can react to *Insert content into a Space* events to fire welcome notifications, auto-tag, or trigger approvals.

## Permissions

| Permission | Default role(s) |
| --- | --- |
| Administer Spaces (create / edit / delete any Space, manage all settings) | Administrator |
| Create Space | Authenticated user (configurable) |
| Manage own Space (edit, change settings) | Space owner / manager |
| Manage Space members | Space owner / manager |
| Create content in Space | Space editor + manager + owner |
| View public Space | Authenticated user |
| View members_only Space | Space members |

Per-Space role permissions are enforced by a custom access control handler that runs *before* the standard Drupal entity-permission checks.

## Installing the module

Spaces is currently a pre-release module distributed via GitHub. The Open Intranet wrapper repository pulls it through `modules_github.conf`:

```bash
# In the wrapper repo (private, internal use):
./scripts/setup-environment.sh
# Then sync to the Drupal codebase:
rsync -av --delete \
  modules_openintranet/openintranet_spaces_github/ \
  openintranet/web/modules/custom/openintranet_spaces/
ddev drush en openintranet_spaces -y
ddev drush cr
```

Once published to drupal.org (planned for the next minor release of Open Intranet), Spaces will install via `composer require drupal/openintranet_spaces` and the `_github` suffix on the directory will go away.

## Modules behind it

- `openintranet_spaces` (custom) — entities, services, hooks, route alterers
- `openintranet_access` — for the auto-access propagation
- Drupal core: `node`, `field`, `entity`, `views`, `path`, `path_alias`, `user`, `block`
- `layout_builder`, `layout_discovery` — for per-Space landing layouts

## Learn more

- [Access Control & Groups](./access) — the layer Spaces auto-access integrates with
- [News](./news), [Events](./events), [Documents](./documents), [Knowledge Base](./knowledge-base), [Pages](./pages), [Webforms](./webforms) — all participate in the Space aggregation
- [Layout Builder & Frontend Editing](./layout-builder) — used for per-Space landing pages
- [Engagement scoring](./employee-directory#engagement-scoring) — Space-scoped engagement dashboards
- [Open Intranet project on drupal.org](https://www.drupal.org/project/openintranet)
