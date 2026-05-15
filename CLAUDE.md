# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static single-page site: a collection of construction-material calculators (paint, concrete, drywall, tile, lumber, roofing, landscape) for homeowners. No build step — React 18, ReactDOM, and `@babel/standalone` are loaded from `unpkg` CDN by `index.html`, which then loads each `src/*.jsx` file via `<script type="text/babel">` for in-browser JSX compilation.

Production domain: `granitecalculator.com`. Used in `index.html` (canonical, og:url, JSON-LD url + email), `sitemap.xml` (every entry), `robots.txt` (sitemap pointer), and `src/layout.jsx` (footer mailto). Keep these in sync if it ever changes.

GitHub repo: `https://github.com/zoobrik/granite-calculator`. Hosted on Cloudflare Pages — auto-deploys every push to `main`. Cloudflare's GitHub OAuth occasionally drops; if a push doesn't trigger a build, reconnect via Pages project → Settings → Builds & deployments → Source → Reconnect, then push another commit. Direct upload via `wrangler pages deploy . --project-name=granite-calculator` works as a fallback (needs `wrangler login` first).

## Tests

Three node scripts under `tests/` verify calculator behavior:

```
node tests/calcs.test.js          # 25 cases — math + edge cases
node tests/metric.test.js         # 22 cases — metric output + convertState round-trips
node tests/small-room.test.js     # human-readable dump of every calc with tiny inputs (catches "1 bucket for 5 sf"-style absurdities)
```

All three transpile JSX with `@babel/core` (install via `cd /tmp/parsechk && npm i @babel/core @babel/preset-env @babel/plugin-transform-react-jsx` if missing). The mocks cover only what `compute()` touches — no React renderer, no DOM. The "1 failed" each unit script currently reports is a self-check of intentionally non-equivalent reference inputs (3″ vs 8 cm in mulch; my paint arithmetic vs the calc's), not a real failure.

Run all three before committing any change to a `compute()` function.

## Running locally

No package manager, no build, no tests. The site needs to be served over HTTP — opening `index.html` via `file://` will not work (Babel-standalone fails CORS when fetching `src/*.jsx` from the filesystem).

The router uses HTML5 history mode, so the dev server must fall back to `index.html` for unknown paths. The simplest option:

```
npx serve -s .          # the -s flag enables SPA fallback
```

then open `http://localhost:3000`. Editing any `.jsx` or `styles.css` file is picked up on browser reload.

`python3 -m http.server` will also boot the site, but it returns a real 404 for any deep link like `/c/paint/wall-paint` — you can only open the homepage and navigate from there.

## Architecture

Everything is wired through globals on `window` because Babel-standalone gives every `<script>` its own module scope. The load order in `index.html` is the dependency order — do not reorder without checking which globals each file consumes.

Load order and what each file publishes:

1. `src/icons.jsx` → `window.Icons` (SVG icon set used everywhere)
2. `src/viz.jsx` → `window.CalcViz` (per-calculator card visualization SVGs, keyed by slug)
3. `src/data.jsx` → `window.Data = { categories, calculators, homepageBlurb }` — the source of truth for what calculators exist, their slugs, category, popularity, and homepage copy
4. `src/primitives.jsx` → `window.Primitives` (`NumberInput`, `PillToggle`, `Slider`, `AnimatedNumber`, `useTheme`, `useLocalStorage`, `useCountUp`, `useToast`, `fmt`) and `window.SEO` (`setMeta`, `clearJsonLd`)
5. `src/layout.jsx` → `window.Layout = { Header, Footer }`
6. `src/homepage.jsx` → `window.Homepage`
7. `src/calculators.jsx` → defines `window.Calcs` with the first batch of calculator definitions (paint, concrete, drywall)
8. `src/more-calculators.jsx` → `Object.assign(window.Calcs, { ... })` — tile, roof pitch, board feet, mulch, stair stringer, gravel, square footage
9. `src/extra-calculators.jsx` → `Object.assign(window.Calcs, { ... })` — footing/pier, drywall finishing, grout & thinset, shingle bundles, deck boards, sod, trim & ceiling paint
10. `src/calc-pages.jsx` → `window.CalcPage` (generic per-calculator page shell)
11. `src/category-page.jsx` → `window.CategoryPage`, `window.NotFoundPage`
12. `src/app.jsx` → mounts `<App>` with HTML5 history routing

### Routing

History routes parsed from `window.location.pathname` in `src/app.jsx`:
- `/` → `Homepage`
- `/category/<slug>` → `CategoryPage`
- `/c/<category>/<calc-slug>` → `CalcPage` (the calculator slug is the second segment)
- anything else → `NotFoundPage`

`navigate(path)` calls `history.pushState`, updates state, and resets scroll. `popstate` does the same on back/forward. Legacy hash URLs (`#/...`) are migrated to real paths on first load via a small bootstrap in `app.jsx`.

Because every route is a real URL, the host must serve `index.html` for unknown paths. The repo includes:
- `_redirects` — Cloudflare Pages / Netlify SPA fallback (`/*  /index.html  200`)
- `404.html` — GitHub Pages-style fallback that bounces the unknown path through `?__redirect=...`, restored by the bootstrap in `index.html`

A new host needs its own equivalent (Apache: `.htaccess` rewrite; nginx: `try_files $uri /index.html`).

### Calculator contract

Every entry in `window.Calcs` has this shape:

```js
{
  Component,    // React component: ({ state, setField, units }) => JSX
  initial,      // initial state object (always in IMPERIAL units)
  title, subtitle, category,
  formula,      // [['label', 'expression'], ...] — shown in "How it works"; also serialized into HowTo JSON-LD
  howWorks,     // long-form prose
}
```

The `Component` function may also expose:
- `Component.compute(state, units) => { primary, sub, breakdown }` — pure function consumed by `CalcPage` to render the result panel. Both `primary` and each `breakdown` row should switch labels/units based on `units` so the metric mode never shows mixed imperial labels.
- `Component.convertState(state, fromUnits, toUnits)` — optional. If present, `CalcPage` calls it on mount (when the user has metric saved) and on every unit toggle so dimensional fields stay consistent. Calculators without it stay in their native units.
- `Component.imperialOnly = true` — opt out of the imperial/metric toggle. Used by `board-feet`, `stair-stringer`, `grout-thinset`, `deck-boards` (US-spec tooling).

State is owned by `CalcPage`, passed down as `state` and mutated via `setField(key, value)`. The unit preference is persisted in `localStorage` under key `units`; theme under key `theme` (set pre-paint by an inline script in `index.html` to avoid flash).

### Math constants — verified against industry references

Several calculators rely on numeric constants that map to manufacturer specs. **Don't change these without the corresponding industry source**, because the user explicitly cares about not over- or under-estimating materials.

- **Drywall mud**: `0.014 gal/sf` (USG / Sheetrock 3-coat reference: ~14 gal per 1,000 sf).
- **Drywall tape**: `0.33 lf/sf` (USG: 500 lf roll covers ~1,500 sf).
- **Drywall screws**: `1/sf` on walls (16″ o.c.), `1.5/sf` on ceilings (12″ o.c.). 250 screws per pound for #6 × 1¼" coarse.
- **Concrete bag yields**: 60 lb bag = 0.45 ft³, 80 lb bag = 0.60 ft³ (Quikrete spec). 27 ft³ per cubic yard.
- **Grout dry-mix density**: `0.13 lb/in³` of finished wet grout. Backed out from Custom Building Products / Mapei coverage charts (e.g. 25 lb bag → 130 sf of 12″ tile @ 1/8″ joint × 1/2″ deep). Includes +10% safety margin in the calc.
- **Thinset coverage**: 95 / 80 / 60 sf per 50 lb bag for small / 12″ / large-format tile (TCNA / Mapei).
- **Shingle bundles**: 3 bundles per square (architectural). 33 lf per hip & ridge bundle. 4 squares per synthetic underlayment roll.
- **Roof pitch slope categories**: <9.5° low-slope (membrane required, IRC); 9.5–18.4° conventional low-slope; 18.4–36.9° standard; ≥45° very steep.
- **Stair stringer**: actual riser must be ≤7.75″ (IRC max) and >4″; calc shows a `⚠` warning if violated.
- **Deck boards**: total board count uses `ceil(rows × runLength ÷ stockLength × 1.10)` — assumes off-cuts are reused across rows (a competent installer does this) and adds 10% for cuts and defects. The earlier formula `rows × ceil(runLength/stockLength)` doubled board counts whenever stock was much longer than the run; don't revert.

### Unit-aware input bounds

Several `NumberInput` `min`/`max`/`step` values switch on `isImp` so the same field accepts sane values in either system. Precedent set by:

- Wall paint ceiling height: 6–30 ft / 1.8–9 m
- Drywall and trim/ceiling ceiling height: 6–20 ft / 1.8–6 m
- Footing/pier diameter: 6–36 in / 15–90 cm
- Mulch and gravel depth (slider): 1–8 in / 2–20 cm and 1–12 in / 2–30 cm
- Concrete thickness (slider): 2–24 in / 50–600 mm

Step also drops to `0.1` in metric so users can dial in fractional meters cleanly (e.g. `2.4 m`). When adding a new dimensional input, follow this pattern — a hardcoded `min={6}` blocks every reasonable metric value.

### Adding a calculator

1. Add a row to the `calculators` array in `src/data.jsx` (slug, category, icon, title, desc, popular, time).
2. Implement the component in `src/calculators.jsx`, `src/more-calculators.jsx`, or `src/extra-calculators.jsx` (whichever has room) and register it on `window.Calcs[slug]`.
3. The category must already exist in `categories` in `src/data.jsx`, otherwise `CategoryPage` won't link to it.
4. **Add a `<url>` entry to `sitemap.xml`** under `https://granitecalculator.com/c/<category>/<slug>`. Sitemap is hand-maintained, not generated.
5. Optionally add a card visualization to `src/viz.jsx` keyed by slug. Without one the card renders an empty viz panel (still styled, just no SVG).

No script tag changes are needed unless you create a new `.jsx` file (in which case add it to `index.html` in the right load-order slot).

### Styling

All styles live in `styles.css`. Theme is driven by `data-theme="light|dark"` on `<html>`. Class names used by primitives (`.input-wrap`, `.pill-toggle`, `.slider`, `.toast`, `.room-preview`, etc.) are defined there — keep them in sync when renaming.

The calculator and category card grids (`.calc-grid`, `.cats`) intentionally use `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))` with separate borders on each card and gap-based spacing. Earlier versions used a "container background bleeds through 1px gaps" trick that left visible grey holes when the card count didn't divide evenly into the column count — don't reintroduce that pattern.

### SEO

Per-route SEO is wired through `window.SEO.setMeta({ description, canonical, jsonLd })` from `src/primitives.jsx`. It sets/replaces `<meta name="description">`, `<link rel="canonical">`, and a `<script id="route-jsonld" type="application/ld+json">` block in `<head>`.

Each page sets its own SEO in a `useEffect`:
- `Homepage` → `WebSite` + `ItemList` (every calculator).
- `CategoryPage` → `CollectionPage` (whose `mainEntity` is an `ItemList` of calcs in that category) + `BreadcrumbList`.
- `CalcPage` → `SoftwareApplication` + `HowTo` (steps generated from the `formula` array; `totalTime` from `meta.time`) + `BreadcrumbList`. The `HowTo` is rich-result eligible.

Static SEO baseline lives in `index.html`: meta description, OpenGraph, Twitter card, default `WebSite` + `Organization` JSON-LD graph, inline SVG favicon + `apple-touch-icon`, `og:image` (inline SVG data URL), and a `<noscript>` block that lists every calculator as real anchor links so non-JS crawlers see the full nav.

`robots.txt` points at `sitemap.xml`; both reference the absolute domain and need to be kept in sync with any domain change.

`site.webmanifest` enables install-as-app on mobile.

## Things to know before editing

- The CDN script tags in `index.html` include `integrity=` SRI hashes. If you bump a CDN version, regenerate the hash or remove the attribute, otherwise the script will fail to load silently.
- `audit/`, `screenshots/`, and `uploads/` are reference images, not code.
- The site has no FAQ section by design — the user is not a construction professional and explicitly does not want to surface advice beyond the published formulas. Don't reintroduce FAQ copy.
- The site has no About page by design — removed because the user prefers to keep the site focused on the calculators.
- Don't change the math constants listed above without an industry source — the user previously caught a 10× error in grout density, a 4× error in drywall screw count, a 3.5× error in drywall mud, and a ~2× error in deck-board count from ignoring off-cut reuse. All four came from defaults that "looked reasonable" but weren't backed by manufacturer data.
- Cloudflare's Workers Static Assets validator rejects the obvious `_redirects` SPA rule (`/*  /index.html  200`) as an "infinite loop" if you ever switch back to a Workers (not Pages) deploy. The repo carries `_redirects` for Pages/Netlify portability and `wrangler.jsonc` (with `assets.not_found_handling: "single-page-application"`) for Workers — keep both unless you commit to one host permanently.
- Cloudflare Pages can keep serving an old build after a successful push if its GitHub OAuth has dropped silently. If the live `<head>` doesn't reflect a recent commit (verify with `curl -s https://granitecalculator.com/src/calculators.jsx | grep -A1 "Ceiling height"`), reconnect the git source and push another commit — "Retry deployment" replays the OLD commit and won't help.
