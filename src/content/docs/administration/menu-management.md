---
title: Menu management
description: How menus work in Open Intranet — the menus that ship out of the box, adding/removing/reordering items, and exposing a menu in a region.
---

Menus are how users navigate Open Intranet. The top bar, the footer columns, the user-account dropdown — every clickable list of links you see is a Drupal **menu** rendered through a **menu block**. This page explains the menus shipped with Open Intranet and the most common admin tasks.

## Mental model

- **Menu** — a named, ordered tree of links (Main navigation, Footer, User account…). Stored as configuration.
- **Menu link** — one entry in a menu. Points to a node, a route, or an external URL. Can have children, can be enabled/disabled.
- **Menu block** — the visible widget that renders a menu in a [region](/docs/administration/block-management/). The same menu can be rendered in multiple regions with different settings (depth, expand, …).

A menu has no visual presence on its own — you place a *menu block* for it in a region. Open Intranet already does this for every menu shipped, so most of the time you only edit menu **items**, not blocks.

The admin UI lives at **Structure → Menus** (`/admin/structure/menu`).

## Menus that ship with Open Intranet

| Menu | Machine name | Where it appears | Purpose |
| --- | --- | --- | --- |
| Main navigation | `main` | Top header (`primary_menu` region) | Primary navigation for end users — Documents, Knowledge Base, News, Events… |
| User account menu | `account` | Top right (`top_header_user_actions` region) | Per-user links — My account, My bookmarks, Log in/out |
| Navigation user links | `navigation-user-links` | User profile dropdown | View / edit profile, log out |
| Footer | `footer` | Footer (currently not placed by default) | Generic site information links |
| Footer – Legal & Compliance | `footer---legal-compliance` | `footer_third` region | Terms, Privacy, GDPR, Code of Conduct |
| Footer – Quick Links | `footer---quick-links` | `footer_fourth` region | Meeting Room Booking, IT Support, HR Policies… |
| Administration | `admin` | Drupal admin toolbar | Administrative tasks (managed by Drupal core, rarely edited by hand) |
| Content | `content` | Admin-only | Content task links |
| Tools | `tools` | Admin-only | Tools menu often added to by contributed modules |

You can see the full structure of any menu at `/admin/structure/menu/manage/<machine_name>`, e.g. `/admin/structure/menu/manage/main` for the main top-bar menu.

## Default contents of the Main navigation

Out of the box, the top-bar **Main navigation** looks like this:

- Home
- News
- Events
- Documents
- Knowledge Base
  - Sales
  - Strategy
  - Operations / Delivery
  - HR & Recruitment
  - Marketing
  - Finance
  - Company
  - Other
- Employee Directory
- About Company
  - Department Pages
  - Legal
  - About Company
- Tools
  - Forms
  - Courses
  - Room Booking *(only if the [Room Booking](/docs/features/room-booking/) recipe is applied)*

This is a starting point. Most production sites rename, reorder or remove items to match their own information architecture.

## Common tasks

### Add a menu item

1. Go to **Structure → Menus** (`/admin/structure/menu`) and click **Edit menu** next to the menu you want (e.g. *Main navigation*).
2. Click **Add link**.
3. Fill in:
   - **Menu link title** — the text users will see.
   - **Link** — start typing a node title to autocomplete to internal content, paste an external URL, or use a Drupal route like `/news` or `<front>` for the homepage.
   - **Parent link** — pick a parent if you want this item nested under another (creates a dropdown).
   - **Weight** — lower number floats up; usually you reorder visually instead of setting weight by hand.
   - **Show as expanded** — keep children visible by default in mega-menu / sidebar renderings.
   - **Description** — optional, used as the link `title` attribute.
4. Save.

:::tip[Adding from a content page]
When editing a node (article, page, KB page, …) you can also expand the **Menu settings** vertical tab on the edit form and tick *"Provide a menu link"*. This is the fastest way to expose a single page in the main menu without leaving the editor.
:::

### Reorder menu items (drag-and-drop)

1. Open the menu at `/admin/structure/menu/manage/<machine_name>`.
2. Use the cross-shaped drag handle on the left of each row to drag a row up/down or to indent/outdent it.
   - **Up/down** — change order within the same parent.
   - **Right** — make the item a child of the item directly above it (creates / extends a dropdown).
   - **Left** — promote the item to a higher level.
3. Click **Save** at the bottom of the page. The new order will not stick until you save.

The hierarchy you build here is what the Main navigation will render as a dropdown / mega-menu.

### Edit or rename a menu item

1. On the menu's edit page, click **Edit** next to the item.
2. Change the title, link target, parent or any other field.
3. Save.

Renaming a menu item does *not* change the URL of the page it points to — you are only changing the label users see in the menu.

### Disable a menu item (without deleting it)

On the menu edit page, untick **Enabled** for the row and save. The item stays in configuration but stops rendering. Re-tick to bring it back. This is the safest way to "hide for now" a menu item that you may want later, without losing its link or sub-tree.

### Delete a menu item

Click **Delete** on the row, confirm. If the item has children, Drupal will ask whether to delete them too or move them up one level.

### Link to an external URL

In the **Link** field, paste the full URL (`https://example.com/something`). External links are allowed for any role with the *"Administer menus and menu items"* permission, which by default is restricted to administrators.

### Link to internal content using a path or route

In the **Link** field you can use:

- A path — `/news`, `/events`, `/documents`.
- A token — `<front>` for the homepage, `<nolink>` for a non-clickable parent (useful for grouping headers in mega-menus), `<button>` for a JavaScript-only trigger.
- A node autocomplete — type the title of a node and pick it; Drupal will store the canonical entity reference and your link will keep working even if you change the URL alias later.

### Create a new menu

Most of the time you should not need to — Open Intranet already ships a menu for every typical region. If you genuinely need a new one (e.g. a custom sidebar menu for one section of the site):

1. **Structure → Menus → Add menu** (`/admin/structure/menu/add`).
2. Give it a label and a description, save.
3. Add menu links as usual.
4. **Place a menu block** for it in the region you want — see below.

### Show a menu in a region (place a menu block)

If you create a new menu, or if you want to show an existing one in another region (e.g. a sidebar mini-menu of the KB), you place a **menu block**:

1. Go to **Structure → Block layout** (`/admin/structure/block`).
2. Find the region you want, click **Place block**, search for the menu's name (e.g. *"Footer – Quick Links"*).
3. Configure depth, expand-by-default, visibility (per role / path / content type), save.

For full mechanics, see [Block management](/docs/administration/block-management/).

## Mega-menu / dropdown rendering

The Main navigation in `openintranet_theme` is rendered as a multi-column dropdown when items have children. To take advantage of it:

- Add at least one **child** under a top-level item — that item will gain a dropdown caret.
- Tick **Show as expanded** on the parent so the children render automatically.
- Use `<nolink>` as the link target on a parent item if it should only be a label opening a dropdown (no destination page).

For richer mega-menus with images and multiple columns, the contributed module [Mega Menu](https://www.drupal.org/project/mega_menu) integrates with Drupal core menus and is a popular drop-in.

## Permissions

The relevant Drupal permissions, all assigned to the *Administrator* role by default:

- **Administer menus and menu items** — full access to `/admin/structure/menu` and all menu CRUD operations.
- **Use the administration toolbar** — needed to actually navigate to the menu admin UI from the top bar.

For non-admin roles (e.g. a *Content editor* who should manage the main navigation but not the rest of Drupal), grant *Administer menus and menu items* and consider scoping with the contributed module [Menu Admin per Menu](https://www.drupal.org/project/menu_admin_per_menu) — it lets you allow a role to edit, say, only the *Main navigation* without touching the *Footer*.

## Where to learn more

- [Drupal Menu UI module documentation](https://www.drupal.org/docs/8/core/modules/menu-ui) — full reference for menus and menu links.
- [Working with menus in the Drupal admin UI](https://www.drupal.org/docs/user_guide/en/menu-concept.html) — beginner-friendly walkthrough in the official user guide.
- [Menu Admin per Menu](https://www.drupal.org/project/menu_admin_per_menu) — delegate editing of a single menu to non-admin roles.
- [Mega Menu](https://www.drupal.org/project/mega_menu) — multi-column dropdowns with images and HTML.
- [Block management](/docs/administration/block-management/) — needed when you want a menu visible in a new region.
