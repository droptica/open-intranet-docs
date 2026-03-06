---
title: User Management
description: Managing users, roles, and permissions.
---

Open Intranet provides flexible user management with LDAP sync, role-based access, and group permissions.

## User accounts

Manage users under **Administration → People**.

### Adding users manually

1. Go to **Administration → People → Add user**
2. Fill in username, email, and password
3. Assign roles and groups
4. Save

### LDAP synchronization

When LDAP is configured, users are automatically provisioned and deprovisioned based on your directory service. See [Configuration](/docs/getting-started/configuration/) for setup.

## Roles

Default roles include:
- **Administrator** — Full access
- **Editor** — Content creation and management
- **Manager** — Department-level oversight and reporting
- **Employee** — Standard access

## Groups

Groups provide granular access control:
- Unlimited nested groups
- Smart access inheritance
- Per-group content visibility
- Combined group-based and individual permissions
