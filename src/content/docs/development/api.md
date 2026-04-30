---
title: REST API
description: Read and write Open Intranet content from external systems via Drupal core's JSON:API module.
---

Open Intranet uses Drupal core's **JSON:API** module to expose every content type, user, file, taxonomy term and other entity as a fully featured REST API — without writing a single line of code.

JSON:API is a Drupal core module shipped with every site. Once enabled, every entity that exists in Drupal becomes available at a predictable URL conforming to the [JSON:API specification](https://jsonapi.org/), with built-in support for filtering, sorting, pagination, sparse fieldsets and relationship inclusion.

## Enabling the API

JSON:API is shipped with Drupal core but turned off by default. Enable it once per site:

```bash
ddev drush en jsonapi -y
```

After install, every non-internal entity is reachable under `/jsonapi/...`. A configuration page is available at **Configuration → Web services → JSON:API** (`/admin/config/services/jsonapi`).

By default JSON:API is in **read-only mode** — POST/PATCH/DELETE return `405 Method Not Allowed`. Switch to *Accept all JSON:API create, read, update, and delete operations* on the same configuration page if you need write access. See the [JSON:API security considerations](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations) before enabling writes.

## Authentication

JSON:API does not provide authentication of its own — it reuses Drupal's authentication providers. Pick one or more depending on the integration:

| Provider | Module | Best for |
| --- | --- | --- |
| **Cookie / session** | Core | Same-domain SPAs, browser-based clients |
| **HTTP Basic** | `basic_auth` (core) | Server-to-server, scripting, dev/test |
| **OAuth 2.0** | [`simple_oauth`](https://www.drupal.org/project/simple_oauth) | Third-party clients, mobile apps, production integrations |
| **JWT, API key, LDAP, etc.** | [REST API Authentication](https://www.drupal.org/project/rest_api_authentication) | Enterprise SSO, API gateways, mixed scenarios |

Enable HTTP Basic for quick testing:

```bash
ddev drush en basic_auth -y
```

For a complete catalogue of authentication methods supported by Drupal — including JWT, API keys, LDAP, OAuth, miniOrange and many others — see the [REST API Authentication module](https://www.drupal.org/project/rest_api_authentication).

## Why this is great: Drupal-native security

A request to JSON:API is authenticated as a Drupal user. **Every existing Drupal permission, every entity access rule and every field-level access check applies automatically**:

- Users see only the nodes / users / files they are allowed to see.
- Restricted fields (e.g. private profile data) are stripped from the response.
- Group / department membership, content moderation states, publishing status — all respected.
- Validation constraints fire on POST and PATCH, just like in the admin UI.

In other words, the API is as secure as the website itself, and you do not need to re-implement permissions in the client.

You can additionally lock down the surface from the [JSON:API security guide](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations):

- Keep **read-only mode** on if the API only reads data
- Use a **secret base path** (e.g. `/hidden/abc123/jsonapi`) to reduce drive-by scanning
- Restrict create/update/delete to a **whitelist of bundles** via a route subscriber
- Add a custom permission required to access any JSON:API route

## Endpoint catalogue

URL pattern: `/jsonapi/{entity_type}/{bundle}` for collections, `/jsonapi/{entity_type}/{bundle}/{uuid}` for a single resource. The full, always up-to-date list of resources for your site is at `/jsonapi`.

A few of the most commonly used Open Intranet endpoints:

| Resource | Endpoint |
| --- | --- |
| News articles | `/jsonapi/node/article` |
| Events | `/jsonapi/node/event` |
| Knowledge Base pages | `/jsonapi/node/knowledge_base_page` |
| Basic pages | `/jsonapi/node/page` |
| Book pages | `/jsonapi/node/book` |
| Documents | `/jsonapi/media/document` |
| Images | `/jsonapi/media/image` |
| Files | `/jsonapi/file/file` |
| Users | `/jsonapi/user/user` |
| Departments | `/jsonapi/taxonomy_term/department` |
| Offices | `/jsonapi/taxonomy_term/office` |

This list is **not exhaustive** — it just shows the most frequently used resources. **Every entity in Drupal automatically gets its own endpoint**:

- Every content type, taxonomy vocabulary, media bundle, custom block type or paragraph type you create in the UI immediately becomes available at `/jsonapi/{entity_type}/{your_machine_name}`.
- Every recipe you enable (e.g. **Room Booking**, **Courses**, custom recipes from your team) brings its own content types and instantly exposes them via JSON:API — no extra wiring needed.
- Every custom entity type defined in a contrib or custom module is exposed the same way.

To discover what is actually available on a given site, visit `/jsonapi` — you will see a complete list of resources with their links.

## Examples

The examples below assume HTTP Basic with `admin:admin` against a local DDEV site. Replace with your own credentials and host.

### List all news articles I am allowed to see

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/node/article?page[limit]=10"
```

### Fetch a single article by UUID

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/node/article/cab70fbe-e2bf-4b67-8281-c5822bbbbe47"
```

### Filter by status

Return only published articles:

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/node/article?filter[status]=1&sort=-created&page[limit]=10"
```

### Filter by creation date

The `created` and `changed` fields are stored as **Unix timestamps**, so filter values must also be Unix timestamps (seconds since epoch). ISO date strings are silently ignored.

Return articles created on or after `2026-01-01T00:00:00 UTC` (= `1767225600`):

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/node/article?filter[created][operator]=>=&filter[created][value]=1767225600&sort=-created"
```

Generate the timestamp on the fly with `date -u -d '2026-01-01' +%s` (GNU) or `date -u -j -f '%Y-%m-%d' '2026-01-01' +%s` (macOS).

For ISO-string filtering, use a `datetime` field on the entity (e.g. `field_publication_date` if you add one) — those accept ISO 8601 values directly.

### Sparse fieldset and includes

Fetch only title and image for the listing, and embed the image media entity:

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/node/article?fields[node--article]=title,field_image&include=field_image"
```

### Create a new document

Documents in Open Intranet are media entities of bundle `document`, each pointing at a `file` entity. The two `curl` calls below are the exact API equivalent of the **Add Document** form at `/media/add/document` in the admin UI — the fields map 1:1 (Name → `name`, File → `field_media_document`, Published → `status`, Authored on → `created`, URL alias → `path`, Revision log → `revision_log_message`).

Creating one is a two-step flow: first upload the binary, then create the media wrapper. Write mode must be enabled at `/admin/config/services/jsonapi`.

#### Step 1 — Upload the binary file

```bash
curl -u admin:admin \
  -X POST \
  -H "Content-Type: application/octet-stream" \
  -H "Accept: application/vnd.api+json" \
  -H 'Content-Disposition: file; filename="q1-report.pdf"' \
  --data-binary @./q1-report.pdf \
  "https://your-intranet.com/jsonapi/media/document/field_media_document"
```

The response contains the new file's UUID (`data.id`). Capture it for the next call:

```json
{
  "data": {
    "type": "file--file",
    "id": "6955302f-3352-4739-8148-daefd8be3e10",
    "attributes": { "filename": "q1-report.pdf", "uri": { "url": "/sites/default/files/2026-04/q1-report.pdf" } }
  }
}
```

#### Step 2 — Create the media document

```bash
curl -u admin:admin \
  -X POST \
  -H "Content-Type: application/vnd.api+json" \
  -H "Accept: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "media--document",
      "attributes": {
        "name": "Q1 financial report"
      },
      "relationships": {
        "field_media_document": {
          "data": { "type": "file--file", "id": "6955302f-3352-4739-8148-daefd8be3e10" }
        }
      }
    }
  }' \
  "https://your-intranet.com/jsonapi/media/document"
```

The new document is now visible in the Documents listing in the UI and via `GET /jsonapi/media/document`.

#### Optional fields

The full mapping for the **Add Document** form, including fields exposed under *Advanced* / sidebar options:

```json
{
  "data": {
    "type": "media--document",
    "attributes": {
      "name": "Q1 financial report",
      "status": true,
      "created": "2026-01-15T09:00:00+00:00",
      "path": { "alias": "/documents/finance/q1-report" },
      "revision_log_message": "Imported via API"
    },
    "relationships": {
      "field_media_document": {
        "data": { "type": "file--file", "id": "6955302f-3352-4739-8148-daefd8be3e10" }
      },
      "uid": {
        "data": { "type": "user--user", "id": "{author-uuid}" }
      }
    }
  }
}
```

- Set `status` to `false` to save as **unpublished** (draft).
- Override `created` to backdate the document.
- Provide `path.alias` to set a clean URL.
- Set `uid` to assign authorship to a specific user (otherwise the authenticated user becomes the owner).

See [JSON:API file uploads](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/file-uploads) for advanced upload options (chunked uploads, alternative `Content-Disposition` formats, etc.).

### List users

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/user/user?filter[status]=1&fields[user--user]=display_name,mail,user_picture"
```

### Fetch a single user by UUID

```bash
curl -u admin:admin \
  -H "Accept: application/vnd.api+json" \
  "https://your-intranet.com/jsonapi/user/user/{user-uuid}"
```

The currently logged-in user is also available at `/jsonapi/user/user/?filter[uid]=current` or via the standard Drupal `/user` route.

## Going further

JSON:API in core is intentionally minimal but the ecosystem around it is rich:

- **[JSON:API Extras](https://www.drupal.org/project/jsonapi_extras)** — UI to disable resources, rename paths (e.g. `/api/articles` instead of `/jsonapi/node/article`), alias fields (`tags` instead of `field_tags`), apply field enhancers (date formats, UUID/URL conversions). Recommended for most public-facing APIs.
- **[REST API Authentication](https://www.drupal.org/project/rest_api_authentication)** — adds JWT, OAuth, API key, LDAP, miniOrange SSO and many more authentication methods.
- **[Simple OAuth](https://www.drupal.org/project/simple_oauth)** — full OAuth 2.0 server with client credentials, password grant, refresh tokens.
- **[Decoupled Router](https://www.drupal.org/project/decoupled_router)** — resolve any front-end URL to its underlying entity (used by headless front-ends).
- **[Subrequests](https://www.drupal.org/project/subrequests)** — batch many JSON:API calls into a single round-trip.
- **[GraphQL](https://www.drupal.org/project/graphql)** — alternative to JSON:API if your client prefers GraphQL over REST.
- **Webhooks** — there is no built-in webhooks UI; combine [`webhooks`](https://www.drupal.org/project/webhooks) or a custom event subscriber on `hook_entity_insert/update/delete` to push events outwards.

## Building custom endpoints

When entity-based JSON:API resources are not enough — for example, you need a domain-specific operation (`/api/teams/{id}/sync-from-hr`), a heavily aggregated payload, or a different response shape — Drupal lets you ship your own endpoints from a custom module.

Common ways to add custom endpoints:

- **Drupal routes + Controllers** — declare a route in `your_module.routing.yml` pointing at a controller method that returns a `JsonResponse`. Same-domain auth, full Drupal services available, full control over the response. The simplest path for a one-off business endpoint.
- **REST resource plugins** — annotate a class with `@RestResource` to expose it through the core `rest` module at a path of your choice. You get authentication, serialization and the standard HTTP method dispatch for free. Good for resource-style endpoints that don't fit the entity model.
- **Views REST export display** — build a Views query in the UI and add a *REST export* display. Choose path, format (JSON / XML / HAL), filters, contextual filters, fields and access. Excellent for read-only feeds (e.g. *"top 10 most-read articles for mobile app"*) without writing code.
- **JSON:API custom resource types** — extend JSON:API itself with a custom resource type plugin. Useful when you want a non-entity resource to play nicely with JSON:API filters / includes / pagination.

All of these run inside the same Drupal application as JSON:API, so they reuse the same authentication providers, the same permission system and the same entity / field access checks — keeping the security story consistent across the whole API surface.

For Open Intranet-specific guidance on building modules, see [Drupal developer guide](https://www.drupal.org/docs/develop).

## References

- [JSON:API module documentation](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module) on drupal.org
- [JSON:API specification](https://jsonapi.org/format/) — filtering, sorting, includes, pagination
- [JSON:API security considerations](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations)
- [REST API Authentication](https://www.drupal.org/project/rest_api_authentication) — comprehensive auth catalogue
- [JSON:API Extras](https://www.drupal.org/project/jsonapi_extras) — customising the API surface
