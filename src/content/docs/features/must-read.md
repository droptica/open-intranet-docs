---
title: Must Read Tracking
description: Mark content as Must Read, let users tick it off, and follow up with reminder emails to those who haven't.
---

Open Intranet ships a **Must Read** workflow that lets editors flag a content item as required reading, lets readers acknowledge it with a single click, and lets administrators see exactly who has and who hasn't read each item — and email a reminder to the laggards.

## How it works

```mermaid
flowchart LR
    Editor["Editor"] -->|"toggles Must Read on content"| Content["Content item"]
    Content -->|"shows Mark as read button"| Reader["Reader"]
    Reader -->|"clicks Mark as read"| FlagRecord["read flag stored"]
    Admin["Admin"] -->|"opens Must Read Report"| Report["/admin/dashboard/must-read-report"]
    Report -->|"Details link"| DetailsPage["Per-item details: read + not-yet lists"]
    DetailsPage -->|"Send a reminder email"| EmailForm["Bulk email form (views_send)"]
    EmailForm -->|"sends email"| Reader
```

Three pieces of Drupal configuration make this work:

- The boolean field `field_mark_as_must_read` on **News article** content — the editor-facing toggle.
- The `read` flag — the per-user, per-content acknowledgement record (Drupal Flag module).
- A pair of Views displays under `/admin/dashboard/must-read-report` — the report and the bulk-email form (powered by the `views_send` module).

There is no deadline field, no per-group targeting, and no automatic reminder — reminders are sent on demand by an administrator.

## Enabling Must Read on a content item

1. Edit a **News article** (`/node/{nid}/edit`).
2. Switch to the **TOOLS** tab.
3. Toggle **Must Read** on.
4. Click **Save**.

![News article edit form, TOOLS tab, with the Must Read toggle switched on](../../../assets/features/must-read-toggle-form.png)

The toggle's description matches what is shipped in the recipe verbatim:

> Selecting this field will add a "Mark as read" button to this content. This allows you to track on the dashboard who has read the article and who hasn't.

The toggle currently lives on the **News article** form. The underlying `read` flag is also enabled on `book`, `document`, `event`, `knowledge_base_page`, `page` and `webform` content types, so the flag mechanism is available there too — adding a Must Read toggle to one of those content types is just a matter of placing the boolean field on the form.

## Marking content as read

When a Must Read article is opened by an authenticated user, a **Mark as read** button appears in the article footer next to **Add to Bookmarks**:

![Article footer with Mark as read button shown next to Add to Bookmarks](../../../assets/features/mark-as-read-button.png)

Clicking it sends an AJAX request and the button immediately flips to **Mark as unread**, indicating the read flag is now stored for that user:

![Same article footer after clicking, button now reads Mark as unread](../../../assets/features/mark-as-unread-button.png)

A user can toggle their own state at any time. Each click writes (or removes) one row in the `flagging` table.

## The Must Read report

Administrators with the **View Must Read Report Details** permission see a **Must Read Report** tab on the dashboard at `/admin/dashboard/must-read-report`.

![Must Read Report list showing each tracked article with a count of users who have read it and a Details link](../../../assets/features/must-read-report-list.png)

The list shows three columns:

| Column | Meaning |
| --- | --- |
| **Node title** | Linked title of the content item |
| **Read by (number of users)** | Count of users who have flagged the item as read |
| **Details** | Link to the per-item breakdown |

Only content where **Must Read** is on (`field_mark_as_must_read = 1`) is listed.

## Detailed read status for one item

Click **Details** (or visit `/admin/dashboard/must-read-report/details?entity_id={nid}`) to see a per-item breakdown:

![Details view showing two tables, one of users who have read the article and one of users who haven't, with a Send a reminder email button at the bottom](../../../assets/features/must-read-report-details.png)

The page has two sections:

- **Users who marked the content as read** — Username, *Created* (when the read flag was added) and a *view user* link.
- **Users who haven't marked the content as read yet** — Username, Roles, Member for and a *view user* link. This list automatically excludes everyone already in the "read" list.

A **Send a reminder email** button at the bottom takes you to the bulk-email form prefilled with the not-yet-read audience.

## Sending a reminder

Clicking **Send a reminder email** opens a two-step bulk email form at `/admin/dashboard/must-read-report/details/send-email?entity_id={nid}`:

1. **Pick recipients** — tick the users you want to email (use the header checkbox to select all), then click **Next**.
2. **Compose the message** — fill in *Sender's name*, *Sender's email*, the **Subject** and **Message**, and choose a text format. You can use Drupal tokens in both the subject and the body.

![Bulk reminder form: Sender, Recipients, Subject and Message fields, with batch and copy-to-sender options](../../../assets/features/send-reminder-email.png)

Other options on the form:

- **Send the message directly using the Batch API** — sends in chunks rather than one big request, recommended for large recipient lists.
- **Send a copy of the message to the sender** — sends an audit copy to the sender's address.
- **Remember these values for the next time a mass mail is sent** — pre-fills the form on the next reminder.
- **Additional email options** — set message priority (low, normal, high, etc.) and other headers.

A **Back to list** link returns you to the report list. The form is provided by the [Views Send](https://www.drupal.org/project/views_send) module — there is no scheduling or cron-driven follow-up; reminders are sent on demand.

## Permissions

| Action | Permission |
| --- | --- |
| Toggle Must Read on a piece of content | Standard edit permission for that content type (e.g. *Content editor* role) |
| Click **Mark as read** / **Mark as unread** | Any authenticated user — provided by the `read` flag |
| See the **Must Read Report** and per-item details | **View Must Read Report Details** |
| Send a reminder email | **View Must Read Report Details** plus permission to use the **Views Send** bulk action on the underlying view |
