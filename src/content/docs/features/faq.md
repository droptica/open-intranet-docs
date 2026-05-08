---
title: FAQ recipe — frequently asked questions
description: A simple Q&A content type with categories and a category-grouped listing. Use it to centralise the answers HR / IT / facilities give over and over again.
---

The **FAQ** recipe (`openintranet_faq`) adds a deliberately small Q&A content type to the intranet. It is the answer to *"please stop emailing me about this — there is a FAQ"*. Each FAQ entry is a question + answer + category, and the bundled view groups them on a single page.

## What it is

The recipe ships:

- A new **FAQ Question** content type (`faq_question`) — title is the *question*, body is the *answer*, plus a single-select **Category** field.
- Two seed categories — *Human resources* and *Intranet features* — that the admin extends to fit their organisation.
- An **FAQ** view that lists every entry grouped by category.
- Default-content sample entries that demonstrate the system.

It is opt-in — install with `drush recipe recipes/openintranet_faq` when the support team wants a single place for the standard questions.

## Components

### The FAQ Question content type

Each entry has:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | The question — phrased as the user would ask it. |
| **Body** | Long text + summary | The answer — full CKEditor with the AI assistant available. Include images, lists, links to relevant KB pages or documents. |
| **Category** | List (string) — *Human resources*, *Intranet features* (extendable) | Single-select. Drives the grouping on the FAQ landing page. |

The bundle is **revisioned**, **translatable** (per-language Q&A), and uses the standard menu / pathauto behaviour.

### The categories

Categories ship as a list-string field with two seed values, but the admin can add as many as needed by editing the field's *Allowed values* list at `/admin/structure/types/manage/faq_question/fields/node.faq_question.field_faq_category`.

Typical custom categories: *IT support*, *Facilities*, *Travel*, *Onboarding*, *Benefits*, *Compliance*. Each addition extends the dropdown on the edit form and shows up automatically as a group on the FAQ landing page.

### The FAQ landing page

`view.faq` renders every published FAQ entry **grouped by category** — a single scrollable page where each category is a heading and each entry inside is a collapsible question + answer. The page is the natural target for *Help → FAQ* in the main menu.

The view supports:

- Search (over question + answer text).
- Filter by category.
- Sort by category (default), title, or date created.

### Translation

The recipe enables per-language content for `faq_question`, so an entry can be translated into every language the site speaks. Categories are stored as a translatable list field, so the *Human resources* label can become *Ressources humaines* in the French version while keeping the same machine value.

## Integration with other features

- **Knowledge Base** — FAQ is the *short answer* surface; KB is the *long article* surface. A FAQ answer often links to a KB page for the full story.
- **Search** — FAQ entries are indexed by *DB Index Content* automatically. A search for *"vacation policy"* surfaces the FAQ alongside the KB page, with the FAQ usually appearing higher because the question matches.
- **Engagement scoring** — Reading and reacting to FAQ entries contributes to the user's engagement signal.
- **Multilingual** — Per-language FAQ entries; per-language category labels.
- **AI assistant** — Use the AI button to draft / improve / translate answers.
- **Access Control & Groups** — When the FAQ Question type is opted into the per-item Access tab, sensitive FAQs (e.g. internal tooling) can be restricted to specific groups.

## Permissions

The recipe relies on standard Drupal node permissions. The default install grants:

| Permission | Default role(s) |
| --- | --- |
| Create faq_question content | Content editor + Administrator |
| Edit any faq_question content | Content editor + Administrator |
| Delete any faq_question content | Administrator |
| View published faq_question | Authenticated user (configurable to anonymous) |

## Installing the recipe

```bash
cd web
drush recipe recipes/openintranet_faq
drush cr
```

After applying:

- `/node/add/faq_question` is the entry-creation form.
- `/faq` (the configured view path) is the landing page.
- A *FAQ* main-menu link is typically added by hand from `/admin/structure/menu/manage/main`.

## Modules behind it

- `node`, `text`, `user`, `views`, `views_ui`, `options` — Drupal core
- [Default Content](https://www.drupal.org/project/default_content) — sample FAQ entries to seed the page

## Learn more

- [Knowledge Base](./knowledge-base) — the long-form companion to short Q&A
- [Search](./search) — FAQ entries are indexed alongside everything else
- [Multilingual](./multilingual) — translate per-language Q&A
- [AI Assistant in CKEditor](./ai-assistant) — draft answers fast
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
