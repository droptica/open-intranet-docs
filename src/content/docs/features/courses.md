---
title: Courses recipe — internal LMS
description: A lightweight learning-management system. Build a course of any length from individual lessons, deliver it to employees, and track who has completed which lesson with a personal "Learned" flag.
---

The **Courses** recipe (`openintranet_courses`) turns Open Intranet into a small but complete **internal LMS**. It models two content types — **courses** and **lessons** — links them with a parent-child entity reference, ships Layout Builder-driven course pages, and tracks per-user lesson completion with a *Learned* flag.

It is a recipe, so it is **opt-in** — install with `drush recipe recipes/openintranet_courses` when the company is ready to deliver onboarding, compliance training, or upskilling content directly inside the intranet.

## What it is

The recipe ships:

- A **Course** content type (`course`) — the wrapper for a series of lessons with a cover image, description and ordered lesson list.
- A **Course Lesson** content type (`course_lesson`) — the individual training unit with full CKEditor content, media library support, and a *Learned* flag for per-user progress tracking.
- A **Layout Builder** layout for both content types (the only bundle in the default install with Layout Builder enabled — see [Layout Builder & Frontend Editing](./layout-builder)).
- A **Lesson Learned** flag (Personal scope) for per-user progress tracking.
- Two views — *Courses list* (catalogue) and *Current course* (the lesson navigation block embedded inside a lesson page).
- A custom view mode for lessons that renders them inside a course page in a compact table form.

## Components

### The Course content type

A course is the wrapper:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | The course's name. |
| **Course description** | Long text | The pitch — what learners get. |
| **Course cover image** | Image (with the *course_cover* image style) | Shown in the catalogue and as the page hero. |
| **Course lessons** | Entity reference (Course Lesson, multi-value, ordered) | The ordered list of lessons that make up the course. |

The Course content type has **Layout Builder enabled** (`node.course.default` ships with Layout Builder turned on by default). That means each course page is composed visually — hero block, description, lessons table, related courses, etc. — and admins can add per-course customisations (e.g. a hero override for the flagship onboarding course).

### The Course Lesson content type

A lesson is the individual unit:

| Field | Type | Notes |
| --- | --- | --- |
| **Title** | Text | The lesson title. |
| **Body** | Long text + summary | The lesson content. CKEditor with full formatting, media library support (images / videos / audio), the AI assistant, and the standard reactions / comments. |
| **Lesson Learned** flag | Flag (rendered as a field) | The *To learn* / *Learned* button — see below. |

Lessons can be standalone (a tutorial that is not part of any course) or part of multiple courses (one *Drupal cache basics* lesson can appear in both *Drupal for editors* and *Onboarding for engineers*). The relationship is held on the *course* side — a course references its lessons; a lesson does not need to know about its courses.

### The Lesson Learned flag — per-user progress

Progress tracking is implemented with a [Flag module](https://www.drupal.org/project/flag) flag (Personal scope, AJAX link type, rendered as a field):

- **Default state** — *To learn* button on every lesson the user has not yet flagged.
- **After click** — Button switches to *Learned* with a green confirmation: *"Marked as Learned"*.
- **Click again** — Switches back to *To learn*: *"Marked as 'To learn'"*.
- **Per-user** — Each user has their own progress; no global counter.
- **AJAX** — No page reload, no scroll jump.

### Course page layout

The course page (the bundle's Layout Builder layout) shows:

- **Hero** — the cover image, the title, the description.
- **Lessons table** — each lesson rendered in the *course_lessons_table_display* compact view mode (title + a *To learn* / *Learned* button), so the learner sees the full progress at a glance.
- **Optional sidebars** — per-course related material, instructor info, etc., added through Layout Builder.

### The lesson page layout

A lesson page renders the body content full-width with the *Current course* navigation block (the second view shipped by the recipe) showing where the learner is in the course — *previous lesson*, *current lesson*, *next lesson* — for one-click navigation through the material.

### Views

- **Courses list** (`views.view.courses_list`) — The catalogue. Title, cover image, description, lesson count. Sortable / filterable.
- **Current course** (`views.view.current_course`) — Navigation block embedded in lesson pages — previous / current / next lesson links plus a progress indicator.

### Media support

The recipe enables `media`, `media_library` and `image` modules — lessons can embed images, videos, audio and any other media library asset (PDF handouts, slide decks). The CKEditor *Insert media* button (the standard Drupal one) lets editors pick from the media library or upload new files.

### Translation

Both content types opt into `language.content_settings`, so courses and lessons can be translated per language for a multilingual workforce.

## Workflow

The day-to-day flow:

1. **Build lessons** — author each one individually with rich content.
2. **Build the course** — create a course node, fill in title / description / cover image, then drag lessons into the *Course lessons* field in the order learners should take them.
3. **(Optional) Customise the layout** with Layout Builder for that one course (e.g. add a hero override or an instructor block).
4. **Publish**. The course appears in the catalogue.
5. **Learners** open the course, work through the lessons, click *Mark as learned* on each one. The *Current course* block guides them lesson by lesson.
6. **Reporting** — A simple Drupal view filtered by the *Lesson Learned* flag answers *"who has completed Lesson X?"* and *"what's our overall completion rate for the Compliance course?"*.

## Integration with other features

- **Layout Builder & Frontend Editing** — Both course and lesson types ship with Layout Builder enabled; the default course page layout is the canonical Layout Builder example in the platform.
- **Social interactions** — Lessons can be liked and commented on like any other content. Comments are great for *learner Q&A* under each lesson.
- **Engagement scoring** — Reading lessons and clicking *Learned* are recorded in the engagement signal on the user's profile.
- **Search** — Both bundles are indexed by *DB Index Content* automatically.
- **Multilingual** — Per-language courses and lessons; pair with the [AI assistant](./ai-assistant) for fast translation.
- **Access Control & Groups** — Sensitive courses (e.g. an *Executive onboarding* programme) can be restricted to specific groups.
- **Recently Read** — The *Recently read* block shows the last lessons the user opened, so they can resume where they left off.
- **ECA — no-code workflows** — A model can fire on a *Lesson Learned* flag event to record completion in another system (e.g. write to an external HRIS via HTTP).

## Permissions

The recipe relies on standard Drupal node permissions plus the Flag permissions. Common defaults:

| Permission | Default role(s) |
| --- | --- |
| Create / edit / delete course | Trainer + Administrator |
| Create / edit / delete course_lesson | Trainer + Administrator |
| View published course / course_lesson | Authenticated user |
| Use Lesson Learned flag | Authenticated user |
| Configure Layout Builder layouts (course / lesson) | Administrator |

## Installing the recipe

```bash
cd web
drush recipe recipes/openintranet_courses
drush cr
```

After applying:

- `/node/add/course`, `/node/add/course_lesson` are the creation forms.
- `/courses` (the configured catalogue path) is the catalogue.
- A *Courses* main-menu link is typically added by hand from `/admin/structure/menu/manage/main`.

## Modules behind it

- `node`, `datetime`, `options`, `text`, `user`, `file`, `image`, `media`, `media_library`, `views`, `views_ui`, `block` — Drupal core
- `layout_builder`, `layout_discovery` — Drupal core (the default course / lesson layouts use Layout Builder)
- [Flag](https://www.drupal.org/project/flag) — the *Lesson Learned* per-user progress flag
- [Default Content](https://www.drupal.org/project/default_content) — sample courses and lessons to seed the system

## Learn more

- [Layout Builder & Frontend Editing](./layout-builder) — the canonical Layout Builder use-case in the platform
- [Social interactions](./social) — same Flag + Comment foundations as bookmarks / reactions
- [Search](./search) — courses and lessons indexed alongside everything else
- [AI Assistant in CKEditor](./ai-assistant) — draft and translate lesson content fast
- [Drupal recipes documentation](https://www.drupal.org/docs/extending-drupal/drupal-recipes)
