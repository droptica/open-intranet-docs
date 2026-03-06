---
title: REST API
description: Integrate Open Intranet with external systems via the REST API.
---

Open Intranet exposes a full REST API for integration with HRIS, ERP, CRM, and other enterprise systems.

## Authentication

The API supports:
- **Basic Auth** — for development and testing
- **OAuth 2.0** — for production integrations

## Endpoints

All content types are available via REST endpoints:

```
GET    /api/v1/news
POST   /api/v1/news
GET    /api/v1/news/{id}
PATCH  /api/v1/news/{id}
DELETE /api/v1/news/{id}
```

Similar endpoints exist for:
- `/api/v1/users`
- `/api/v1/groups`
- `/api/v1/documents`
- `/api/v1/events`
- `/api/v1/forms`

## Example: Fetch news articles

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-intranet.com/api/v1/news
```

## Pagination

All list endpoints support pagination:

```
GET /api/v1/news?page=1&limit=25
```

## Webhooks

Configure webhooks under **Administration → Configuration → Web services → Webhooks** to notify external systems when content is created, updated, or deleted.
