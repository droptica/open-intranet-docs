# Open Intranet Documentation

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Official documentation for [Open Intranet](https://www.drupal.org/project/openintranet) — a free, open-source intranet platform built on Drupal by [Droptica](https://www.droptica.com).

**Live site:** [www.open-intranet.com/docs](https://www.open-intranet.com/docs/)

## What is Open Intranet?

Open Intranet is a ready-to-use company intranet distribution for Drupal 11. It provides news publishing, events with calendar and maps, a hierarchical knowledge base, document management, employee directory with organization chart, user profiles, full-text search, social features (comments, likes, bookmarks), and more — all out of the box.

## Documentation sections

| Section | Description |
| :--- | :--- |
| **Getting Started** | Installation guide and post-install configuration |
| **User Guide** | End-user documentation for every feature — homepage, news, events, knowledge base, documents, employee directory, user profiles, search, social features, and content creation |
| **Features** | In-depth feature descriptions |
| **Administration** | User and role management |
| **Development** | API reference and developer resources |

## Local development

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:4321/docs/`.

## Project structure

```
src/
├── assets/              # Images and screenshots
│   ├── getting-started/
│   └── user-guide/
├── content/
│   └── docs/            # Markdown documentation pages
│       ├── getting-started/
│       ├── user-guide/
│       ├── features/
│       ├── administration/
│       └── development/
└── components/          # Custom Astro/Starlight components
```

Documentation pages are Markdown files in `src/content/docs/`. Each file becomes a route based on its path. Screenshots live in `src/assets/` and are referenced with relative links.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Deployment

The site is deployed to Cloudflare Workers via [Wrangler](https://developers.cloudflare.com/workers/wrangler/). The `dist/` directory is served as static assets.

## Contributing

1. Create a branch from `main`
2. Add or edit Markdown files in `src/content/docs/`
3. Place screenshots in the matching `src/assets/` subdirectory
4. Submit a pull request

## Links

- **Open Intranet project:** https://www.drupal.org/project/openintranet
- **Issue queue:** https://www.drupal.org/project/issues/openintranet
- **Droptica:** https://www.droptica.com
- **Starlight docs:** https://starlight.astro.build
