---
title: User management
description: Managing users, roles, permissions and the user profile in Open Intranet — adding/editing accounts, bulk import, roles shipped out of the box, registration policy, masquerade, and where to extend with SSO/LDAP.
---

Every person who uses your Open Intranet has a user account, and what they can see and do is decided by the **roles** assigned to that account. This page covers what ships out of the box, the most common admin tasks, and the modules you can add when you outgrow the basics.

The admin UI lives at **People** in the toolbar, or `/admin/people`.

## Mental model

- **User** — an account with a username, email, password and a profile (first name, last name, phone, picture, department, office, manager…).
- **Role** — a named bag of permissions assigned to one or more users. Permissions are *never* set on a user directly; you give the user a role and the role grants the permissions.
- **Permission** — a single capability such as *"Create News article"* or *"Administer menus and menu items"*. Listed at `/admin/people/permissions`.
- **Anonymous / Authenticated** — two special roles every Drupal site has. *Anonymous* applies to visitors not logged in; *Authenticated* applies to everyone who is logged in. Permissions you grant to *Authenticated* automatically apply to every user.

This means the practical workflow is always: **create a role → grant it permissions → assign it to users**. Open Intranet already ships a useful set of roles so you only need to assign them.

## User profile fields shipped with Open Intranet

The default user profile has more than the bare Drupal minimum. Out of the box every user has:

| Field | Type | Notes |
| --- | --- | --- |
| First name, Last name | Text | Used to render the display name everywhere |
| Picture | Image | Avatar shown in headers, comments, directory |
| About me | Long text | Free-form bio |
| Phone | Telephone | Click-to-call from profile and directory |
| Department | Reference to *Department* taxonomy | Used for filtering and group-style visibility |
| Office | Reference to *Office* taxonomy | City / location of the user |
| Manager | Reference to another user | Builds the org chart |
| Social links | Link list | LinkedIn, GitHub, etc. |
| Timezone, Preferred language | Standard Drupal | Used for date rendering and translations |

You can add custom fields to the user entity at **Configuration → People → Account settings → Manage fields** (`/admin/config/people/accounts/fields`). Common additions: employee ID, hire date, contract type, certifications, internal Slack handle.

These fields drive the [Employee Directory](/docs/features/) — anything you add here can be exposed in the directory's filters and cards by editing the Views display.

## Default roles

Open Intranet ships with a set of roles tailored to a typical intranet. You can rename, edit, delete or extend them at `/admin/people/roles`.

| Role machine name | Label | Intended for |
| --- | --- | --- |
| `administrator` | Administrator | Full unrestricted access to everything (bypasses content access checks). Keep on as few accounts as possible. |
| `content_editor` | Content editor | Generic content editor — can create/edit all editorial content types. |
| `content_editor_basic_page` | Content Editor – Basic Page | Scoped editor: only basic pages. |
| `content_editor_news_article` | Content Editor – News Article | Scoped editor: only news. |
| `content_editor_event` | Content Editor – Event | Scoped editor: only events. |
| `content_editor_knowledge_base` | Content Editor – Knowledge Base | Scoped editor: only KB pages. |
| `content_editor_oi_document` | Content Editor – Documents | Scoped editor: only the Documents library. |
| `content_editor_webform` | Content Editor – Webform | Form builder — can create and edit Webforms. |
| `user_accounts_manager` | User Accounts Manager | Can create / edit / block users and assign non-admin roles, without touching content or site config. |
| `rmb_room_manager` | RMB – Room Manager | Manages rooms and bookings (only relevant when the [Room Booking](/docs/features/room-booking/) recipe is applied). |
| `authenticated` | Authenticated user | Every logged-in user gets this automatically — gives baseline read access to intranet content. |
| `anonymous` | Anonymous user | Pre-login state. By default very limited; you decide whether the public sees anything. |

The "scoped editor" pattern is the recommended way to delegate content responsibilities — give the *News* team only `content_editor_news_article`, the *Knowledge Base* owners only `content_editor_knowledge_base`, etc. They each get a focused editing experience, instead of one huge editor role with everything mixed in.

## Common tasks

### Add a user manually

1. Go to **People** (`/admin/people`) and click **Add user** (top-right).
2. Fill in **Email**, **Username** and **Password** (or tick *"Notify user of new account"* to email them a one-time login link).
3. Tick the **Roles** the user should have — usually `authenticated` is enough plus one editor / manager role if relevant.
4. Optionally fill in profile fields (first/last name, department, office, manager, picture).
5. Save.

The new user can log in immediately at `/user/login` with the username and password you set, or click the link in the welcome email.

### Edit, block or cancel a user

From `/admin/people`, click **Edit** next to a row. Two important controls live on the edit form:

- **Status** — *Active* vs *Blocked*. Blocked users cannot log in but their content stays. Use this for offboarding while you still need their authored content visible.
- **Cancel account** (button at the bottom). Drupal asks how to handle the user's content:
  - *"Disable the account and keep its content"* (default in Open Intranet, safest).
  - *"Disable the account and unpublish its content"*.
  - *"Delete the account and make its content belong to the Anonymous user"*.
  - *"Delete the account and its content"* (destructive — usually wrong choice for an intranet).

For most leavers, the right answer is **Block** — keeps history intact, frees the seat, and you can unblock later if they come back.

### Bulk-update users

The People list (`/admin/people`) supports **bulk operations** via the dropdown above the table:

- Add a role to selected users
- Remove a role from selected users
- Block / unblock selected users
- Cancel selected user accounts

Tick the rows you want, pick the action, click **Apply to selected items**. Useful for rolling out a new role to a department, blocking a batch of leavers, etc.

### Bulk-import users from CSV

Drupal core does **not** ship a CSV import for users. The recommended add-on is [User CSV Import](https://www.drupal.org/project/user_csv_import) (1,700+ sites use it, security-team supported):

```bash
composer require 'drupal/user_csv_import:^2.0'
drush en user_csv_import -y
```

After enabling, **People → Import users from CSV** appears. The form lets you:

- Map any CSV column to any user field (username, email, first name, department, …).
- Pick which roles new users should get.
- Choose whether to send each user a notification email.
- Trigger one-time login emails so users can set their own password.

A typical import CSV header for Open Intranet looks like:

```
mail,name,field_first_name,field_last_name,field_phone,field_department,field_office,field_manager
```

Combined with [User CSV Import](https://www.drupal.org/project/user_csv_import), you can onboard the whole company on day one without writing a single migration script.

### Reset a forgotten password (admin)

The fastest way as an admin is **Drush**:

```bash
drush user:password username "new-strong-password"
```

Or generate a one-time login link for the user and send it to them out of band:

```bash
drush user:login username
```

From the UI, **People → Edit user → Password** also works, and the user's own *"Forgot password"* link on `/user/password` self-services them by email.

### Assign or change roles

Edit a user, tick/untick role checkboxes, save. For doing this at scale, use the **bulk operations** on `/admin/people` (see above).

To create a brand-new role: **People → Roles → Add role** (`/admin/people/roles/add`), give it a name, save. Then click **Edit permissions** to grant it specific capabilities, and assign it to users. Many small roles are usually better than a few all-encompassing ones.

### Masquerade as another user (debugging permissions)

Open Intranet ships [Masquerade](https://www.drupal.org/project/masquerade). When investigating *"User X says they cannot see Y"* problems, browsing the site as that user is much faster than reading permission tables.

1. As an administrator, open the user's profile page (`/user/<id>`).
2. Click **Masquerade as <username>**.
3. You are now logged in as that user. Browse, reproduce the problem.
4. Click **Unmasquerade** (in the user account dropdown) to return to your own session.

Permission required: *"Masquerade as any user"* (admin-only by default; consider granting it to *User Accounts Manager* if your support team needs it).

## Registration policy

By default, Open Intranet uses the most restrictive Drupal setting: **administrators only** create accounts. Self-registration from `/user/register` is closed.

To change this: **Configuration → People → Account settings** (`/admin/config/people/accounts`).

| Setting | Default | What it does |
| --- | --- | --- |
| **Who can register accounts?** | *Administrators only* | Switch to *Visitors* (open) or *Visitors, but administrator approval is required* (the usual choice for a public-facing portal). |
| **Require email verification when a visitor creates an account** | On | Sends a one-time login link instead of letting users pick a password directly. Strongly recommended. |
| **When cancelling a user account** | *Disable the account and keep its content* | The default for the **Cancel account** flow above. |

For an internal-only intranet, leave registration closed and provision users manually, via CSV, or via SSO (see below). Do **not** open self-registration on a network with public access.

## Permissions

Permissions live at `/admin/people/permissions` — one giant table, rows are permissions, columns are roles, ticks decide who has what. A few things to keep in mind:

- **Be stingy with the *Administrator* role.** It bypasses every access check, including per-entity rules. Limit it to two or three trusted accounts and use `user_accounts_manager` / scoped editor roles for everything else.
- **Test changes by masquerading.** After you tick a permission, masquerade as a normal user with that role and confirm they see what you expect.
- **Permission filter** — there is a filter box at the top of the permissions page. Type *"news"* or *"menu"* to jump to the relevant rows fast.

For the most common Open Intranet–specific permissions, see also the per-feature pages: [Engagement Analytics](/docs/features/engagement/), [Room Booking](/docs/features/room-booking/), [Block management](/docs/administration/block-management/), [Menu management](/docs/administration/menu-management/).

## Single Sign-On, LDAP and external identity

Open Intranet does **not** ship LDAP or SAML out of the box. The contrib ecosystem covers every protocol an enterprise might need; pick the one that matches your IdP:

| Protocol | Module | Notes |
| --- | --- | --- |
| OpenID Connect (OAuth2) | [OpenID Connect](https://www.drupal.org/project/openid_connect) | Best for modern IdPs — Azure AD / Entra ID, Keycloak, Okta, Google Workspace. Already present in Open Intranet's codebase, just enable and configure a client. |
| SAML 2.0 | [SAML Authentication (`samlauth`)](https://www.drupal.org/project/samlauth) | For enterprise IdPs that only speak SAML (ADFS, Shibboleth). |
| LDAP / Active Directory | [LDAP](https://www.drupal.org/project/ldap) | Direct sync with on-prem AD or other LDAP directories — provisioning, role mapping, query-based access. |
| One-tap social | [Social Auth](https://www.drupal.org/project/social_auth) | When you also want Google / Microsoft / GitHub buttons on the login form. |

In all cases the pattern is the same: the module creates a Drupal user on first login and (optionally) maps IdP groups → Drupal roles. After that everything in this page applies as normal.

## Useful contributed modules for power users

Once the basics are in place, these modules are worth knowing about:

- [User CSV Import](https://www.drupal.org/project/user_csv_import) — bulk import via spreadsheet, covered above.
- [Login Security](https://www.drupal.org/project/login_security) — rate-limit failed logins, alert on brute-force, soft-lock accounts. Pair with [Flood Control](https://www.drupal.org/project/flood_control) for a UI on Drupal core's flood limits.
- [Password Policy](https://www.drupal.org/project/password_policy) — enforce complexity, length, expiration, history.
- [Session Limit](https://www.drupal.org/project/session_limit) — cap the number of concurrent sessions per user.
- [Role Delegation](https://www.drupal.org/project/role_delegation) — let a non-admin manager assign only certain roles (e.g. an HR account that can grant *Employee* but never *Administrator*).
- [Real Name](https://www.drupal.org/project/realname) — render *"First Last"* instead of `username` everywhere with one config switch.
- [User Expire](https://www.drupal.org/project/user_expire) — auto-block accounts after N days of inactivity, perfect for contractor offboarding.

## Where to learn more

- [Managing user accounts in Drupal](https://www.drupal.org/docs/user_guide/en/user-overview.html) — official user guide chapter.
- [User module reference](https://www.drupal.org/docs/8/core/modules/user) — full mechanics of accounts, roles and permissions.
- [Permissions and roles best practices](https://www.drupal.org/docs/user_guide/en/user-permissions.html) — how to design a healthy permission scheme.
- [Drupal security best practices](https://www.drupal.org/docs/security-in-drupal) — covers password policy, account hardening and Drupal Security Team advisories.
