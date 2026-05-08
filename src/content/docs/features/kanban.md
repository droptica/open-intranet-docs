---
title: Kanban Board recipe (experimental)
description: An experimental task tracker with a Trello-style kanban board view. Tasks have a status field with TODO / IN PROGRESS / REVIEW / DONE columns, drag-and-drop reordering, plus assignors, priority, story points and a history log.
---

The **Kanban Board** recipe (`openintranet_kanban`) is an **experimental** task-tracking module built around two contrib modules — [Field States](https://www.drupal.org/project/field_states) (a state-list field type) and [Views Kanban](https://www.drupal.org/project/views_kanban) (a kanban-board Views display). It adds a **Task** content type with the fields you would expect on a Trello card or a Jira issue, and a **Kanban** view that renders tasks as cards on columns by status with drag-and-drop reordering between columns.

It is marked **experimental** because the underlying `views_kanban` module is itself in early development and the experience is not as polished as the rest of the platform. For most teams a dedicated tool (Jira, Linear, Trello) is still the better answer — but for a small intranet team that wants their backlog *inside* the company portal, this recipe is an option.

## What it is

The recipe ships:

- A **Task** content type (`task`) with fields for status, priority, progress %, story points, assignors and a history log.
- A **Kanban** view that renders tasks as a board with one column per status value, drag-and-drop sorting between columns.
- A *Kanban* main-menu link.

That's it — deliberately small, optimised for the simplest possible task-board use-case.

## Components

### The Task content type

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | Task summary. |
| **Body** | Long text + summary | The full description. CKEditor with the AI assistant. |
| **Status** | List (states — *Field States* type) — *TODO*, *IN PROGRESS*, *REVIEW*, *DONE* | Drives the kanban columns. Drag-and-drop on the board updates this field. |
| **Priority** | List (integer) — *Low* (1), *Medium* (2), *High* (3), *Urgent* (4) | Used for sort and visual highlight. |
| **Progress** | List (string) | Per-task progress percentage (0% / 25% / 50% / 75% / 100%). |
| **Story points** | List (integer) | Estimation values (1 / 2 / 3 / 5 / 8 / 13 — Fibonacci). |
| **Assignors** | Entity reference (User), multi-value | The people responsible. |
| **Task history** | Long text, multi-value | A free-form changelog the owner appends to as the task evolves. |

The Task type has *Promote to front page* disabled by default so tasks stay on the board, not in the news feed.

### The Field States module

The `Status` field uses a special field type from the [Field States](https://www.drupal.org/project/field_states) module (`list_states`). This type is essentially a *list_string* with awareness of being used as a *kanban column source* — `views_kanban` reads its allowed values to decide how many columns to render.

The four default values — *TODO*, *IN PROGRESS*, *REVIEW*, *DONE* — can be edited / extended from Field UI. Reorder them to change the column order on the board.

### The Kanban view

`views.view.kanban` is a Views display backed by `views_kanban`. It pulls every published *Task*, groups them by their *Status* value, and renders each group as a column with the tasks as cards underneath:

```
┌─ TODO ────┐ ┌─ IN PROGRESS ─┐ ┌─ REVIEW ──┐ ┌─ DONE ────┐
│ Task A    │ │ Task C        │ │ Task E    │ │ Task G    │
│ Task B    │ │ Task D        │ │ Task F    │ │ Task H    │
└───────────┘ └───────────────┘ └───────────┘ └───────────┘
```

Cards can be **dragged** between columns — the drop fires an AJAX update that changes the task's *Status* field. Cards can also be **reordered within a column** to set priority order.

### Status, priority, progress

Three list fields combine to give the team a richer view than just *which column*:

- **Status** — *where* the task is (TODO / IN PROGRESS / REVIEW / DONE).
- **Priority** — *how important* (Low / Medium / High / Urgent). Used to colour-code or sort cards.
- **Progress** — *how far along* (0–100%). Useful when tasks linger in IN PROGRESS for days.

### Assignors and task history

- **Assignors** — A multi-value user reference for shared ownership (a task can be on more than one person's list).
- **Task history** — A multi-value long-text field where the owner appends short status updates as the task evolves ("*Spoke to Alice — needs the Berlin spec by Friday*"). This lives *on the task* rather than in comments because it is intended as an internal log, not a discussion.

## Workflow

The day-to-day flow:

1. **Create a task** from `/node/add/task`. Fill in title, body, set initial status (usually *TODO*), priority and assignors.
2. **Open the kanban board** from the *Kanban* main-menu link.
3. **Drag the card** to *IN PROGRESS* when work starts.
4. **Append to history** as the task evolves.
5. **Drag to *REVIEW*** when ready for review, then to *DONE*.

Drag-and-drop changes the *Status* field through an AJAX call — no page reload, no edit form.

## Experimental status

The recipe is labelled **(experimental)** in its name for two reasons:

1. The [Views Kanban](https://www.drupal.org/project/views_kanban) module is still in alpha — the drag-and-drop has rough edges, mobile support is limited, and customisation options are minimal.
2. The [Field States](https://www.drupal.org/project/field_states) module is a small contrib that has not been widely battle-tested.

For production task-tracking with multiple teams, integrations with email / Slack / Jira, time tracking, etc., a dedicated tool is the better answer. The recipe is here for teams who:

- Have a *very small* backlog (< 50 active tasks).
- Want everything *inside* the intranet (single-sign-on, single login, single inbox).
- Are happy to live with the experimental polish for the convenience.

## Integration with other features

- **Search** — Tasks are indexed by *DB Index Content* if added; a search for *"Berlin migration"* surfaces the related tasks.
- **Engagement scoring** — Creating / completing tasks contributes to engagement signals.
- **Multilingual** — The bundle opts into Content language settings; column labels translate.
- **AI assistant** — Use the AI button in the body field to draft task descriptions or summarise long history logs.
- **ECA — no-code workflows** — A model can fire on *Task status changed to DONE* to send a Messenger notification, archive the task, or trigger a follow-up workflow.
- **Access Control & Groups** — Tasks can be restricted per group (e.g. each team only sees its own board).

## Permissions

Standard Drupal node permissions:

| Permission | Default role(s) |
| --- | --- |
| Create / edit / delete task | Authenticated user |
| View published task | Authenticated user |
| Drag task between columns (view = `kanban`) | Authenticated user |

## Installing the recipe

```bash
cd web
drush recipe recipes/openintranet_kanban
drush cr
```

After applying:

- `/node/add/task` is the task-creation form.
- `/kanban` (the configured view path) is the board.
- A *Kanban* main-menu link is added.

## Modules behind it

- `node`, `text`, `user`, `views`, `options` — Drupal core
- [Field States](https://www.drupal.org/project/field_states) — the `list_states` field type used for the *Status* column
- [Views Kanban](https://www.drupal.org/project/views_kanban) — the kanban Views display plugin

## Learn more

- [Search](./search) — find tasks by keyword
- [Multilingual](./multilingual) — translate column labels
- [ECA — no-code workflows](./eca) — automate follow-ups when a task moves to DONE
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
- [Views Kanban project page](https://www.drupal.org/project/views_kanban)
- [Field States project page](https://www.drupal.org/project/field_states)
