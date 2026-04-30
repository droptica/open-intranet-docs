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

URL pattern: `/jsonapi/{entity_type}/{bundle}` for collections, `/jsonapi/{entity_type}/{bundle}/{uuid}` for a single resource. The full list of resources for your site is at `/jsonapi`.

Common Open Intranet endpoints out of the box:

| Resource | Endpoint |
| --- | --- |
| News articles | `/jsonapi/node/article` |
| Events | `/jsonapi/node/event` |
| Knowledge Base pages | `/jsonapi/node/knowledge_base_page` |
| Basic pages | `/jsonapi/node/page` |
| Book pages | `/jsonapi/node/book` |
| Courses / lessons | `/jsonapi/node/course`, `/jsonapi/node/course_lesson` |
| Rooms / Bookings (recipe) | `/jsonapi/node/rmb_room`, `/jsonapi/node/rmb_booking` |
| Documents | `/jsonapi/media/document` |
| Images | `/jsonapi/media/image` |
| Files | `/jsonapi/file/file` |
| Users | `/jsonapi/user/user` |
| Departments | `/jsonapi/taxonomy_term/department` |
| Offices | `/jsonapi/taxonomy_term/office` |

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

Documents in Open Intranet are media entities of bundle `document`, each pointing at a `file` entity. Creating one is a two-step flow: first upload the binary, then create the media wrapper. Write mode must be enabled at `/admin/config/services/jsonapi`.

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

The new document is now visible in the Documents listing in the UI and via `GET /jsonapi/media/document`. See [JSON:API file uploads](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/file-uploads) for advanced options (chunked uploads, alternative `Content-Disposition` formats, etc.).

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

## References

- [JSON:API module documentation](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module) on drupal.org
- [JSON:API specification](https://jsonapi.org/format/) — filtering, sorting, includes, pagination
- [JSON:API security considerations](https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/security-considerations)
- [REST API Authentication](https://www.drupal.org/project/rest_api_authentication) — comprehensive auth catalogue
- [JSON:API Extras](https://www.drupal.org/project/jsonapi_extras) — customising the API surface
