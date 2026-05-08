---
title: SSO with Keycloak recipe
description: Single Sign-On with a Keycloak identity provider via OpenID Connect. Authenticate users against your existing IdP, auto-provision Drupal accounts on first login, and stop maintaining a second user list.
---

The **SSO Keycloak** recipe (`openintranet_sso_keycloak`) wires Open Intranet up to a [Keycloak](https://www.keycloak.org/) identity provider over **OpenID Connect**. After applying the recipe and filling in three Keycloak endpoints, employees authenticate against the company's existing IdP — no second password, no second user list, no second offboarding workflow.

It is a recipe, so it is **opt-in** — install with `drush recipe recipes/openintranet_sso_keycloak` when the company has Keycloak (or any other OIDC-compatible IdP — Auth0, Okta, Azure AD, AWS Cognito, Google Workspace, …) and wants to consolidate login.

## What it is

The recipe ships:

- An installed and configured [OpenID Connect](https://www.drupal.org/project/openid_connect) module.
- A pre-created **Keycloak** OIDC client (`openid_connect.client.keycloak`) with the standard scopes (`openid`, `email`, `profile`) and empty endpoint fields you fill in once.
- Sensible defaults — auto-create accounts on first login, auto-link to existing accounts by e-mail, allow registration even if site-wide registration is disabled, render the *Login with …* button **above** the standard username/password form.
- A permission tweak — *openid connect set own password* — so users authenticated via SSO can still set a fallback password if they ever need it.
- A safety carve-out for `anonymous_redirect` so that `/openid-connect/*` callback URLs always resolve, even on intranets that redirect anonymous users to a landing page.

## Components

### The OpenID Connect client

The `keycloak` client uses OpenID Connect's *generic* plugin (no provider-specific quirks). Its configuration form at `/admin/config/services/openid-connect/keycloak` exposes:

| Field | Purpose |
| --- | --- |
| **Client ID** | The Keycloak client identifier you created in the Keycloak admin console. |
| **Client Secret** | The shared secret. |
| **Issuer URL** | The Keycloak realm's issuer URL (e.g. `https://sso.example.com/realms/intranet`). |
| **Authorization endpoint** | The realm's `/protocol/openid-connect/auth` URL. |
| **Token endpoint** | The realm's `/protocol/openid-connect/token` URL. |
| **Userinfo endpoint** | The realm's `/protocol/openid-connect/userinfo` URL. |
| **End-session endpoint** | The realm's `/protocol/openid-connect/logout` URL. |
| **Scopes** | `openid`, `email`, `profile` (extendable). |

The full Keycloak setup-on-the-IdP-side is described in the [Open Intranet README](https://www.drupal.org/project/openintranet) and on the project's drupal.org documentation pages.

### Auto-provisioning rules

The recipe sets four `openid_connect.settings` flags:

- **`always_save_userinfo: true`** — Every login refreshes the local Drupal account from Keycloak's userinfo response (e-mail, name, profile fields). The IdP is the source of truth.
- **`connect_existing_users: true`** — When a user logs in for the first time and a local Drupal account with the same e-mail already exists, *link* them rather than fail. Migrations from a username-password world to SSO are smooth.
- **`override_registration_settings: true`** — A new account is auto-created on first login even if the site has *Account creation* set to *Administrators only*. The IdP decides who can sign up; Drupal just trusts it.
- **`user_login_display: above`** — The *Log in with Keycloak* button appears **above** the standard username/password form on `/user/login`, making SSO the default path while keeping the local form as a fallback for the `admin` account.

### Local password

The recipe also grants every authenticated user the `openid connect set own password` permission. Even when SSO is the canonical login path, users can set / change a local password — useful when:

- The IdP is temporarily unreachable (allows local fallback authentication).
- A user wants to use the standard username/password form for offline-style usage.

### Anonymous redirect carve-out

If the site uses the [Anonymous Redirect](https://www.drupal.org/project/anonymous_redirect) module to send unauthenticated visitors to a landing page, the OIDC callback URL **must** still resolve — otherwise the round-trip from Keycloak to Drupal fails. The recipe ensures `/openid-connect/*` is in the redirect-exception list (alongside `/user/reset/*` and the public CSS / JS aggregates).

## Workflow

1. **Configure Keycloak** — Create a new client of type *OpenID Connect / Confidential* in your Keycloak realm. Set the Valid Redirect URIs to `https://your-intranet.example.com/openid-connect/keycloak`. Generate a client secret.
2. **Apply the recipe** in Drupal — `drush recipe recipes/openintranet_sso_keycloak`.
3. **Fill in the endpoints** at `/admin/config/services/openid-connect/keycloak` — client ID, client secret, issuer URL, the four endpoint URLs.
4. **Test** — Visit `/user/login` — a *Log in with Keycloak* button is now visible above the form. Click it. Authenticate against Keycloak. You land back on the intranet, logged in.
5. **Verify** — Visit `/admin/people` — the new user is in the list, with the e-mail / name pulled from Keycloak.

For an existing intranet with local accounts, all the e-mails that match an existing Drupal account get auto-linked on first SSO login (thanks to `connect_existing_users`).

## Other identity providers

The `generic` OIDC plugin works with **any** OpenID Connect provider that exposes the standard endpoints. The recipe is named *Keycloak* because that is the most common self-hosted choice, but the same configuration works with:

- **Auth0**
- **Okta**
- **Microsoft Entra ID** (formerly Azure AD)
- **AWS Cognito**
- **Google Workspace**
- **Authentik** (self-hosted)
- **Authelia** (self-hosted)

For each provider, the four endpoint URLs differ — but the rest of the configuration (scopes, auto-provision flags, login-display) stays the same.

## Integration with other features

- **Employee Directory & User Profiles** — User profile fields (first / last name, e-mail, language preference) auto-populate from the IdP's userinfo claims. Department / office / phone can be added by extending the OIDC userinfo claim mapping.
- **Access Control & Groups** — A custom hook (or an ECA model) can read the IdP's `groups` claim and add the Drupal user to the matching OI Groups on every login — a *single source of truth* for org structure.
- **Auto Logout** — Pairs naturally with SSO: when the IdP session expires, Drupal's autologout sends the user back to the IdP for re-authentication.
- **Multilingual** — The `locale` claim from Keycloak can drive Drupal's per-user language preference.
- **Engagement scoring** — Engagement events are correctly attributed to the SSO-provisioned account (no double-attribution).

## Permissions

| Permission | Default role(s) |
| --- | --- |
| Set own password (when SSO is in use) | Authenticated user |
| Administer OpenID Connect clients | Administrator |

## Installing the recipe

```bash
cd web
drush recipe recipes/openintranet_sso_keycloak
drush cr
```

Then configure the endpoints at `/admin/config/services/openid-connect/keycloak`.

## Modules behind it

- [OpenID Connect](https://www.drupal.org/project/openid_connect) — the OIDC client framework
- The `openid_connect` *generic* plugin — used here for Keycloak
- Drupal core: `user`

## Learn more

- [Employee Directory & User Profiles](./employee-directory) — the user-profile fields populated from IdP claims
- [Access Control & Groups](./access) — combine SSO group claims with OI Groups for unified org structure
- [Keycloak documentation](https://www.keycloak.org/documentation)
- [OpenID Connect module on drupal.org](https://www.drupal.org/project/openid_connect)
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
