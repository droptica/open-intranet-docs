---
title: Consultation Process recipe — formal reviews
description: A formal consultation workflow for organisational decision-making — author submits a proposal with deadlines and reviewers, ECA automatically creates a review task per reviewer, each reviewer files an opinion, and the consultation closes Accepted or Rejected.
---

The **Consultation Process** recipe (`consultation_process`) adds a formal **organisational consultation workflow** to the intranet. Use it for the things that require more than a quick comment: policy reviews, budget approvals, document consultations, compliance sign-offs, change-management decisions.

The workflow is opinionated and relies heavily on **[ECA](./eca)** for automation: the author submits a *Consultation* with a deadline, a type, a description and a list of reviewers; ECA *automatically* creates a *Consultation Review* node for each reviewer; each reviewer files their opinion (Pending → Completed) on their assigned review; views aggregate progress; the original author marks the consultation Accepted or Rejected.

It is a recipe, so it is **opt-in** — install with `drush recipe recipes/consultation_process` when the company is ready to formalise decision-making.

## What it is

The recipe ships:

- A **Consultation** content type (`consultation`) — the proposal.
- A **Consultation Review** content type (`consultation_review`) — one per reviewer per consultation, automatically created by ECA.
- **Three ECA models** that automate the review-task lifecycle (create / delete review tasks when reviewers are added / removed).
- Two custom roles — `content_editor_consultation` and `content_editor_consultation_review` — for clean permission separation.
- Four views that surface active / closed consultations and per-user reviews.
- A *Consultations* main-menu link (and a couple of supporting menu links).
- Sample data — 9 seed consultations to demonstrate the system.

## Components

### The Consultation content type

The proposal:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | The consultation's name. |
| **Type** | List (string) | What kind of decision (policy / budget / change management / document review / …). |
| **Description** | Long text | The proposal text. CKEditor with the AI assistant available. |
| **Attachments** | File field, multi-value | Supporting documents (PDF policy draft, budget spreadsheet, …). |
| **Deadline** | Date | When reviewers must respond by. Drives the "active vs closed" filter. |
| **Reviewers** | Entity reference (User), multi-value | The list of people who must respond. |
| **Status** | List (string) — *Active* (default), *Accepted*, *Rejected* | The lifecycle state. Updated by the original author when consultation closes. |

Consultations are **revisioned** so the audit trail is preserved.

### The Consultation Review content type

The reviewer's opinion. **Created automatically** by an ECA model when a reviewer is added to a consultation:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Auto-generated from the consultation + reviewer references. |
| **Reference** | Entity reference (Consultation) | The parent consultation. |
| **Note** | Long text | The reviewer's opinion / vote / commentary. |
| **Status** | List (string) — *Pending Review* (default), *Review Completed* | The reviewer flips this to *Completed* when they file. |

A reviewer cannot create their own review record — the system creates it for them, ensuring exactly one review per (consultation, reviewer) pair.

### The ECA models

Three BPMN models drive the automation (visible at `/admin/config/workflow/eca`):

1. **On Consultation insert / reviewer added** — When a consultation is created (or when a reviewer is added to an existing consultation), iterate the reviewers list, create a *Consultation Review* node for each, set the reviewer as its author, set the status to *Pending Review*, and reference the parent consultation.
2. **On Consultation update / reviewer removed** — When a reviewer is removed from a consultation, find the corresponding *Consultation Review* node and delete it (so stale tasks do not pile up).
3. **On Consultation deadline reached** — A cron-based model that checks the deadline field; consultations past their deadline are auto-marked or auto-notified depending on configuration.

The full models are visible in the [ECA admin](./eca) and editable through the BPMN.io modeller — the recipe is essentially a *worked example* of what ECA can do.

### Views

- **Consultations** (`views.view.consultations`) — The main listing. Filterable by status / type, with the deadline displayed as a *days remaining* badge.
- **My reviews** (`views.view.my_reviews`) — *What's on my plate?* — reviews assigned to the current user, sorted by deadline. The personal task list.
- **Consultation reviews on a consultation** (embedded view) — On each consultation page, a sub-list of *who has reviewed, who is still pending, who said what*.
- **Consultation reviewers by consultation** — Internal view used by ECA to iterate the reviewer list when generating review tasks.

### Custom roles

The recipe provisions two task-specific roles:

- **`content_editor_consultation`** — Can create / edit / delete consultations (the *consultation initiator* role).
- **`content_editor_consultation_review`** — Can edit reviews assigned to them (the *reviewer* role — assigned alongside the user's other roles).

Roles are intentionally narrow — separation of duties between *initiating a consultation* and *responding to one* is a standard governance requirement.

## Workflow

The full lifecycle, end-to-end:

1. **Initiator** opens *Add Consultation* — fills in title, type, description, attachments, deadline, ticks the reviewers from the user list.
2. **Save**. ECA fires: one *Consultation Review* node is created per reviewer, in *Pending Review* state, owned by the reviewer.
3. **Each reviewer** sees the new task in **My reviews** (and optionally gets a Messenger / email notification — easy to wire through ECA).
4. **Each reviewer** opens their review, writes their opinion in *Note*, flips status to *Review Completed*. Their task disappears from *My reviews*.
5. **The initiator** monitors progress on the consultation page (the embedded *Consultation reviews* view shows pending vs completed reviewers in real time).
6. **Once the deadline passes** (or all reviewers have responded), the initiator updates the consultation **Status** to *Accepted* or *Rejected*. The consultation is closed.

If the initiator **adds a new reviewer mid-flight**, ECA creates the new review task automatically. If they **remove** one, ECA deletes the corresponding review task.

## Integration with other features

- **ECA — no-code workflows** — Consultation Process is the canonical *complex ECA workflow* shipped in the platform. It is also a great learning tool: open the three models in the BPMN modeller to see real-world ECA patterns.
- **Messenger** — Add a custom ECA action to the *Consultation insert* model to send a Messenger broadcast to each newly assigned reviewer.
- **Search** — Both bundles are indexed by *DB Index Content* automatically.
- **Multilingual** — Consultations and reviews opt into per-language content; pair with the AI assistant for fast translation.
- **Access Control & Groups** — Sensitive consultations (e.g. a board-level decision) can be restricted per group.
- **AI assistant** — Use the AI button to draft consultation descriptions or summarise long reviewer notes.
- **Engagement scoring** — Reviewing consultations contributes to the user's engagement signal.

## Permissions

Granted by the recipe (in addition to the two custom roles):

| Permission | Default role(s) |
| --- | --- |
| Create / edit / delete consultation | `content_editor_consultation` + Administrator |
| Create / edit / delete consultation_review | (Created by ECA — humans only edit existing reviews assigned to them) |
| Edit own consultation_review | `content_editor_consultation_review` (assigned per reviewer) |
| View published consultation / consultation_review | Authenticated user |
| Bypass and edit any consultation_review | Administrator |

## Installing the recipe

```bash
cd web
drush recipe recipes/consultation_process
drush cr
```

Important: the recipe **depends on ECA, BPMN.io, and Page Manager** — make sure those are installed (the recipe declares them in its `install` list).

After applying:

- `/node/add/consultation` is the proposal form.
- `/consultations` is the listing.
- `/my-reviews` is the personal task list.
- A *Consultations* main-menu link is added.

## Modules behind it

- `node`, `datetime`, `options`, `text`, `user` — Drupal core
- [ECA](https://www.drupal.org/project/eca) and the sub-modules `eca_base`, `eca_content`, `eca_log`, `eca_ui`, `eca_user`, `eca_views` — automation
- [BPMN.io](https://www.drupal.org/project/bpmn_io) — graphical model editor
- [Page Manager](https://www.drupal.org/project/page_manager) and [Page Manager UI](https://www.drupal.org/project/page_manager) — custom landing-page composition for the *Consultations* page

## Learn more

- [ECA — no-code workflows](./eca) — the engine behind the automation, with the three Consultation models as worked examples
- [Messenger](./messenger) — broadcast on review-task creation
- [Search](./search) — find consultations by keyword, type, status
- [AI Assistant in CKEditor](./ai-assistant) — draft proposals and summarise reviews
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
