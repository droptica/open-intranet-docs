---
title: Configuration
description: Basic configuration of your Open Intranet instance.
---

After installation, configure your intranet to match your organization's needs.

## Site settings

Navigate to **Administration → Configuration → System → Basic site settings** to configure:

- Site name
- Email address
- Default front page

## User authentication

Open Intranet supports multiple authentication methods:

### LDAP / Active Directory

Sync users and groups from your directory service. Navigate to **Administration → Configuration → People → LDAP** to configure.

### Single Sign-On (SSO)

Configure SAML 2.0 or OAuth providers under **Administration → Configuration → People → SAML Authentication**.

Supported providers:
- Microsoft Entra ID (Azure AD)
- Google Workspace
- Okta
- Any SAML 2.0 / OAuth 2.0 provider

## Content structure

Open Intranet comes with pre-configured content types. You can customize them under **Administration → Structure → Content types**.

## Permissions

Configure role-based permissions under **Administration → People → Permissions**.
