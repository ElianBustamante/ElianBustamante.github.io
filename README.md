# Elian Bustamante | Portfolio

[![Deploy to GitHub Pages](https://github.com/ElianBustamante/ElianBustamante.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/ElianBustamante/ElianBustamante.github.io/actions/workflows/deploy.yml)

**Live site: <https://elianbustamante.github.io/>**

Personal portfolio with software projects (bots, data and web) and landscape photography from southern Chile. Bilingual: Spanish and English.

## Features

- Single page with slide-style sections (Home, Projects, Photography, About, Contact), navigable by mouse wheel, keyboard and touch, with deep links per section and previous/next arrows.
- Project carousel.
- Photo gallery with a lightbox (zoom, keyboard navigation and camera data).
- Spanish / English with `react-i18next`.
- Accessible and responsive, including landscape phones and `prefers-reduced-motion`.

## Tech stack

React 19  Vite 8  Tailwind CSS v4  react-i18next  Vitest + Testing Library  Playwright + axe  oxlint  Python 3 + Pillow (photo processing)  GitHub Actions + GitHub Pages

## Commands

Requires Node.js 22 or newer.

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run check` | Runs oxlint, the tests and the build (same as CI) |
| `npm run test:e2e` | Runs the Playwright end-to-end tests (on demand, not in CI) |
| `npm run photos` | Processes the photos (see below) |
| `pytest scripts/tests` | Runs the Python tests |

## Photos

1. Put the originals in `photos-originals/`. It is git-ignored on purpose: originals can carry GPS and other metadata and must never be committed.
2. Install the Python dependencies once: `pip install -r requirements-dev.txt`.
3. Run `npm run photos`. It writes thumbnails and large WebP versions to `public/photos/` (without EXIF or GPS) and generates `src/data/photos.json` (generated, never edited by hand).
4. Fill in `src/data/captions.json` with each photo's title and alt text in both languages and, if needed, an `exif` object to correct camera data. The script adds empty entries for new photos and lists the ones still missing a Spanish title.

## Structure

```text
src/components/   UI (sections, navigation, lightbox, ...)
src/data/         site data, photos.json (generated) and captions.json (hand-written)
src/i18n/         es.json and en.json translations
src/lib/          pure helpers (sections, scrolling, photos, ...)
src/test/         Vitest tests
e2e/              Playwright tests (planned)
scripts/          Python photo pipeline and its tests
```

## Deployment

Work happens on `dev`. Pushing to `main` makes GitHub Actions run `npm run check`, build the site and publish it to GitHub Pages. Pull requests into `main` run the same checks without publishing, and the Python tests run in a separate job. Dependabot proposes updates weekly.

When changing the domain, update the absolute URLs for `canonical`, `og:url`, `og:image`, and `twitter:image` in `index.html` (all must share the same origin, enforced by automated tests).
