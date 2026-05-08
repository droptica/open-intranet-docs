---
title: Ideas recipe — submission and voting
description: A lightweight idea-management workflow. Employees submit ideas, vote them up using the Flag module, comment in dedicated idea-comment threads, and see the idea move through Proposed → Selected → Implemented (or Rejected).
---

The **Ideas** recipe (`openintranet_ideas`) adds an idea-submission and voting system to the intranet. Anyone can post a new idea, every authenticated user gets one upvote per idea, ideas stream into a dedicated *Ideas* listing, and the admin (or a designated *Innovation manager*) progresses each idea through a four-state lifecycle — *Proposed* → *Selected* → *Implemented* (or *Rejected*).

It is a recipe, so it is **opt-in** — install with `drush recipe recipes/openintranet_ideas` when the company is ready to ask for input from the floor.

## What it is

The recipe ships:

- A new **Idea** content type (`oi_idea`) with body, file attachments, dedicated comment thread and a status field.
- A **vote flag** that lets any authenticated user cast a single upvote per idea.
- A **dedicated comment bundle** — *Idea comments* — separate from the site-wide comment thread (so ideas have their own focused discussion).
- A **status workflow** — Proposed / Selected / Implemented / Rejected — driven by a simple list field that the admin updates as the idea progresses.
- An **Ideas** view that lists everything published, sorted by vote count, with status as a facet.
- Permissions tuned for *anyone can submit and vote, the original author can edit their own*.

## Components

### The Idea content type

Each idea is an entity with:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | The one-line summary. |
| **Body** | Long text + summary | The full pitch — *what* are you proposing, *why*, *what's the impact*. CKEditor with the AI assistant available. |
| **Files** | File field, multi-value | Attach diagrams, mockups, supporting documents. |
| **Status** | List (string) — *Proposed* (default), *Selected*, *Implemented*, *Rejected* | The lifecycle state. Updated by an admin. |
| **Comments** | Dedicated *Idea comments* bundle | Threaded discussion specifically for this idea. |
| **Author / Created** | User reference / timestamp | The submitter and submission time. |

Ideas are **revisioned** so the edit history is auditable.

### The vote flag

The recipe configures a [Flag module](https://www.drupal.org/project/flag) flag called **Idea vote** with:

- **Scope**: Global flag = false ⇒ *Personal* — every user has their own one-vote tally.
- **Bundles**: `oi_idea` only.
- **Show as field**: Yes — the *Vote for this* button is rendered as part of the idea's display.
- **Link type**: AJAX — voting does not reload the page.
- **Flag short text**: *Vote for this*. **Unflag short text**: *You voted for this*.
- **Messages**: *You cast your vote for this* / *You retracted your vote*.

Each user can vote once per idea; clicking again retracts the vote. Vote counts are visible on the listing and are the default sort order.

### The Ideas listing

`view.ideas` is a Drupal view that renders every published idea with:

- Title, summary, vote count, status badge.
- Filters: status, author, time range.
- Sort: vote count desc (the default), or *most recent*.
- Status facet: pick *Proposed* to see the active backlog, *Selected* to see what's planned, *Implemented* to see what shipped, *Rejected* to learn from past decisions.

### Idea comments

Ideas have a **dedicated comment bundle** (`idea_comments`) — separate from the main *Comment* bundle used by News / KB / Pages. This keeps idea discussions self-contained and lets the admin apply a different display, different moderation rules, and different notifications without affecting the rest of the site.

### Status lifecycle

The status field is a plain list-string field with four values:

```
proposed   ← default for every new idea
selected   ← admin marks as chosen for implementation
implemented ← admin marks as shipped
rejected   ← admin marks as not pursuing (with rationale in a comment)
```

The lifecycle is intentionally *light* — there is no required workflow plugin, no moderation states, no gated transitions. An admin (or a custom role with *edit any oi_idea content* permission) just picks a new value from a dropdown when the status changes. This is by design — innovation programmes work best with low ceremony.

If a more formal workflow is needed (with transitions, approvals, automatic notifications), pair the recipe with **[ECA](./eca)**: a 4-node BPMN model can fire on each status change to broadcast a notification, lock further edits, or require approval.

### Files attachment

The *Files* field lets submitters attach supporting material — a slide deck explaining the idea, a wireframe of a proposed UI, a spreadsheet showing the financial impact. Attachments are private to authenticated users by default; admins can adjust the field's *file directory* and *upload destination* from Field UI.

## Integration with other features

- **Social interactions** — Idea votes and idea comments are the same Flag and Comment infrastructure used by [Bookmarks / Reactions / Comments](./social), so editors work with one mental model across the site.
- **Search** — Ideas are indexed by *DB Index Content* automatically; a search for *"onboarding"* surfaces ideas alongside News and KB.
- **Engagement scoring** — Submitting / voting / commenting on an idea contributes to the user's engagement score on their profile.
- **Messenger** — A custom ECA model can fire a Messenger broadcast when an idea reaches *Selected* state ("*The idea X has been selected for implementation*").
- **Multilingual** — The recipe enables `language.content_settings` for `oi_idea` and `idea_comments`, so ideas can be submitted and translated per language.
- **AI assistant** — CKEditor's AI button is available in the body field — submitters can polish their pitch before posting.

## Permissions

Granted by the recipe to **Authenticated user**:

| Permission | Default role(s) |
| --- | --- |
| Create oi_idea content | Authenticated user |
| Edit own oi_idea content | Authenticated user |
| Delete own oi_idea content | Authenticated user |
| View oi_idea revisions | Authenticated user |
| Flag idea_vote (cast a vote) | Authenticated user |
| Unflag idea_vote (retract a vote) | Authenticated user |
| Edit any oi_idea content (change status) | Administrator + custom *Innovation manager* role |
| Delete any oi_idea content | Administrator |

## Installing the recipe

```bash
cd web
drush recipe recipes/openintranet_ideas
drush cr
```

After applying:

- `/node/add/oi_idea` is the submission form.
- `/ideas` (the configured view path) is the listing.
- The *Ideas* main-menu link is added.

## Modules behind it

- `node`, `text`, `user`, `views`, `views_ui`, `options`, `comment`, `file` — Drupal core
- [Flag](https://www.drupal.org/project/flag) — the vote flag (Personal scope)
- [Default Content](https://www.drupal.org/project/default_content) — sample ideas to seed the system

## Learn more

- [Social interactions](./social) — same Flag / Comment foundations
- [ECA — no-code workflows](./eca) — to add transition automation on top of the lightweight status field
- [Messenger](./messenger) — broadcast on status change
- [AI Assistant in CKEditor](./ai-assistant) — polish the pitch before submitting
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
