# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## SEO recheck command

When the user types **"recheck"**, run this sequence automatically:

1. Test deep URLs return 200 (not 404):
   ```
   curl -o /dev/null -w "%{http_code}" https://granitecalculator.com/c/paint/wall-paint
   curl -o /dev/null -w "%{http_code}" https://granitecalculator.com/category/paint
   ```
2. Check how many pages Google has indexed:
   Search `site:granitecalculator.com` and report the count.
3. Report findings and tell user what to do in GSC:
   - If deep URLs still 404 → `_redirects` broken, investigate.
   - If indexed count < 10 and it's been < 2 weeks → normal, wait.
   - If indexed count < 10 and it's been > 2 weeks → go to GSC → Indexing → Pages → check "Not indexed" reasons, report back.
   - If indexed count growing → good, note which pages are in and which aren't.

## Project

Static single-page site: a collection of construction-material calculators (paint, concrete, drywall, tile, lumber, roofing, landscape) for homeowners. React 18 (production UMD) is loaded from the `unpkg` CDN, plus 12 pre-transpiled `dist/*.js` scripts built from `src/*.jsx` via esbuild. `@babel/standalone` was removed from runtime in 2026-05 — it cost ~1 MB on download and ~3 s of main-thread parsing on slow devices. JSX now lives only in source; the browser only sees plain JS.

Production domain: `granitecalculator.com`. Used in `index.html` (canonical, og:url, JSON-LD url + email), `granitecalculator-sitemap.xml` (every entry), `robots.txt` (sitemap pointer), and `src/layout.jsx` (footer mailto). Keep these in sync if it ever changes.

GitHub repo: `https://github.com/zoobrik/granite-calculator`. Hosted on Cloudflare Pages — auto-deploys every push to `main`. Cloudflare's GitHub OAuth occasionally drops; if a push doesn't trigger a build, reconnect via Pages project → Settings → Builds & deployments → Source → Reconnect, then push another commit. Direct upload via `wrangler pages deploy . --project-name=granite-calculator` works as a fallback (needs `wrangler login` first AND a freshly-built `dist/`).

Cloudflare Pages build settings (must be set in the project dashboard, not in the repo):
- Build command: `npm install && npm run build`
- Build output directory: leave empty (or `/`) — assets ship from project root, with `dist/` populated by the build
- Root directory: leave empty
- Framework preset: None

## Tests

Three node scripts under `tests/` verify calculator behavior:

```
node tests/calcs.test.js          # 25 cases — math + edge cases
node tests/metric.test.js         # 22 cases — metric output + convertState round-trips
node tests/small-room.test.js     # human-readable dump of every calc with tiny inputs (catches "1 bucket for 5 sf"-style absurdities)
```

All three transpile JSX with `@babel/core` (install via `cd /tmp/parsechk && npm i @babel/core @babel/preset-env @babel/plugin-transform-react-jsx` if missing). The mocks cover only what `compute()` touches — no React renderer, no DOM. The "1 failed" each unit script currently reports is a self-check of intentionally non-equivalent reference inputs (3″ vs 8 cm in mulch; my paint arithmetic vs the calc's), not a real failure.

Run all three before committing any change to a `compute()` function.

## Building and running locally

The site needs `dist/*.js` populated before it will run — those are gitignored, regenerated on every push by Cloudflare Pages, and need to be regenerated manually for local dev.

```
npm install              # one-time, installs esbuild
npm run build            # transpile src/*.jsx → dist/*.js
npm run dev              # same, plus watch src/ for changes
npm run serve            # alias for `npx serve -s .`
```

Typical local-dev loop: `npm run dev` in one terminal, `npm run serve` in another, browser refresh after each save.

The router uses HTML5 history mode, so the dev server must fall back to `index.html` for unknown paths. `npx serve -s .` enables that with the `-s` flag. `python3 -m http.server` does NOT — it returns a real 404 for deep links like `/c/paint/wall-paint`.

Opening `index.html` via `file://` will not work (browsers block fetching `dist/*.js` and `styles.css` from the filesystem in many cases, and the script load order races with the bootstrap).

### Build details

`build.js` runs `esbuild.transform` on each `src/*.jsx` with `loader: 'jsx'`, `jsxFactory: 'React.createElement'`, `minify: true`, then wraps the output in an IIFE so each file's top-level `let`/`const` stay isolated. Without that wrap, two files declaring `const useCallback = ...` would collide at the shared classic-script lexical record and the second script would throw `Identifier 'useCallback' has already been declared`. Globals each file publishes (`window.Icons`, `window.Calcs`, etc.) still escape to the global object via direct `window.X = ...` assignment.

Output goes to `dist/`. That folder is gitignored and is regenerated on every Cloudflare Pages deploy via the project's build command (`npm install && npm run build`). If you switch hosts, replicate that build command — the site will not function with `dist/` missing.

## Architecture

Everything is wired through globals on `window` because the build wraps each file in its own IIFE — that preserves the per-script scope isolation Babel-standalone gave us at runtime. The load order in `index.html` is the dependency order; do not reorder without checking which globals each file consumes.

Load order and what each file publishes (source in `src/*.jsx`, served from `dist/*.js`):

1. `icons` → `window.Icons` (SVG icon set used everywhere)
2. `viz` → `window.CalcViz` (per-calculator card visualization SVGs, keyed by slug)
3. `data` → `window.Data = { categories, calculators, homepageBlurb }` — the source of truth for what calculators exist, their slugs, category, popularity, and homepage copy
4. `primitives` → `window.Primitives` (`NumberInput`, `PillToggle`, `Slider`, `AnimatedNumber`, `useTheme`, `useLocalStorage`, `useCountUp`, `useToast`, `fmt`) and `window.SEO` (`setMeta`, `clearJsonLd`)
5. `layout` → `window.Layout = { Header, Footer }`
6. `homepage` → `window.Homepage`
7. `calculators` → defines `window.Calcs` with the first batch (paint, concrete, drywall)
8. `more-calculators` → `Object.assign(window.Calcs, { ... })` — tile, roof pitch, board feet, mulch, stair stringer, gravel, square footage
9. `extra-calculators` → `Object.assign(window.Calcs, { ... })` — footing/pier, drywall finishing, grout & thinset, shingle bundles, deck boards, sod, trim & ceiling paint
10. `calc-pages` → `window.CalcPage` (generic per-calculator page shell)
11. `category-page` → `window.CategoryPage`, `window.NotFoundPage`
12. `app` → mounts `<App>` with HTML5 history routing

Bare cross-file references (e.g. `<Icons.Plus/>` in primitives.jsx, where `Icons` was declared `const` in icons.jsx) work because each `window.X = X` assignment in a publisher file makes `X` discoverable as an unqualified global identifier in subsequent files. Don't change the publisher files to use locally-scoped names without exposing them on `window`.

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
4. **Add a `<url>` entry to `granitecalculator-sitemap.xml`** under `https://granitecalculator.com/c/<category>/<slug>` with today's `<lastmod>`. Sitemap is hand-maintained, not generated. Submitted to Google Search Console + Bing Webmaster as `https://granitecalculator.com/granitecalculator-sitemap.xml` (renamed from `sitemap.xml` 2026-05-23 — file uses unique name to avoid generic-name conflicts).
5. Optionally add a card visualization to `src/viz.jsx` keyed by slug. Without one the card renders an empty viz panel (still styled, just no SVG).

No script tag changes are needed unless you create a new `.jsx` file (in which case add it to `index.html` in the right load-order slot).

### Styling

All styles live in `styles.css`. Theme is driven by `data-theme="light|dark"` on `<html>`. Class names used by primitives (`.input-wrap`, `.pill-toggle`, `.slider`, `.toast`, `.room-preview`, etc.) are defined there — keep them in sync when renaming.

The calculator and category card grids (`.calc-grid`, `.cats`) intentionally use `grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr))` with separate borders on each card and gap-based spacing. Earlier versions used a "container background bleeds through 1px gaps" trick that left visible grey holes when the card count didn't divide evenly into the column count — don't reintroduce that pattern.

`.calc-card-cat` (the per-card category label) uses `var(--fg-muted)`, not `var(--cat-accent)`. The pastel accents (paint `#d18a6c`, drywall `#c3bdaf`, etc.) fail WCAG AA contrast on the white card background; per-card colour identity is carried by the viz top stripe (`.calc-card-viz::after`), the viz background gradient, and the hover border.

### Stylesheets and fonts in index.html

Both `styles.css` and the Google Fonts CSS load via the **preload-and-swap** pattern (`<link rel="preload" as="style" onload="...rel='stylesheet'">`) so neither blocks first paint. Each is mirrored in `<noscript>` as a normal blocking link for users without JS. Don't revert these to plain `<link rel="stylesheet">` without measuring — PageSpeed flagged them as render-blocking.

The Google Fonts URL only requests `Geist 400/500/600` + `Geist Mono 400/500`. If you reach for `font-weight: 300/700` or `Geist Mono 600` in CSS, also add the weight to the URL in `index.html`, otherwise the browser silently substitutes a fallback weight.

### Footer and disclaimers

Footer (`Footer` in `src/layout.jsx`) is intentionally minimal: a one-paragraph estimates-only disclaimer above a hairline, then `© 2026 Granite Calculator. All numbers are estimates.` on the left and `Built by WhiteCloud` (with `WhiteCloud` larger and bolder) on the right. Do not reintroduce the old four-column nav block — the user explicitly stripped it. The header nav already covers categories.

Each calculator page also renders a `.disclaimer` callout (in `src/calc-pages.jsx`'s "How this works" section) repeating the warning at higher emphasis. Both blocks exist deliberately — the user wants visitors to know the numbers can sometimes be significantly off and that they must verify before spending money.

### SEO

Per-route SEO is wired through `window.SEO.setMeta({ description, canonical, jsonLd })` from `src/primitives.jsx`. It sets/replaces `<meta name="description">`, `<link rel="canonical">`, and a `<script id="route-jsonld" type="application/ld+json">` block in `<head>`.

Each page sets its own SEO in a `useEffect`:
- `Homepage` → `WebSite` + `ItemList` (every calculator).
- `CategoryPage` → `CollectionPage` (whose `mainEntity` is an `ItemList` of calcs in that category) + `BreadcrumbList`.
- `CalcPage` → `SoftwareApplication` + `HowTo` (steps generated from the `formula` array; `totalTime` from `meta.time`) + `BreadcrumbList`. The `HowTo` is rich-result eligible.

Static SEO baseline lives in `index.html`: meta description, OpenGraph, Twitter card, default `WebSite` + `Organization` JSON-LD graph, inline SVG favicon + `apple-touch-icon`, `og:image` (inline SVG data URL), and a `<noscript>` block that lists every calculator as real anchor links so non-JS crawlers see the full nav.

`robots.txt` points at `granitecalculator-sitemap.xml`; both reference the absolute domain and need to be kept in sync with any domain change.

`site.webmanifest` enables install-as-app on mobile.

## Things to know before editing

- The CDN script tags in `index.html` include `integrity=` SRI hashes. If you bump a CDN version, regenerate the hash or remove the attribute, otherwise the script will fail to load silently.
- `audit/`, `screenshots/`, and `uploads/` are reference images, not code.
- The site has no FAQ section by design — the user is not a construction professional and explicitly does not want to surface advice beyond the published formulas. Don't reintroduce FAQ copy.
- The site has no About page by design — removed because the user prefers to keep the site focused on the calculators.
- Don't change the math constants listed above without an industry source — the user previously caught a 10× error in grout density, a 4× error in drywall screw count, a 3.5× error in drywall mud, and a ~2× error in deck-board count from ignoring off-cut reuse. All four came from defaults that "looked reasonable" but weren't backed by manufacturer data.
- Cloudflare Pages rejects ANY `_redirects` rule whose destination ends in `.html` (e.g. `/index.html`) — it flags them all as "infinite loop" due to `.html` extension stripping. The `_redirects` uses `/c/*  /  200` and `/category/*  /  200` (destination `/`, not `/index.html`) — CF Pages serves `index.html` as the default document for `/`. If you add new top-level routes, add a matching rule here. For Workers fallback deploy, `wrangler.jsonc` uses `assets.not_found_handling: "single-page-application"` instead. Keep both unless you commit to one host permanently.
- Cloudflare Pages can keep serving an old build after a successful push if its GitHub OAuth has dropped silently. If the live site doesn't reflect a recent commit, verify what's actually deployed with `curl -s https://granitecalculator.com/dist/calculators.js | head -c 400` and compare against your local `dist/`. To recover: reconnect the git source in the Pages project, then push another commit — "Retry deployment" replays the OLD commit and won't help. (Note: `src/` is no longer served — `.assetsignore` excludes it from the deployed asset set.)
- React + ReactDOM are loaded as `production.min.js` UMD builds. Don't switch back to `.development.js` for "easier debugging" — they're 10× larger and parse 10× slower. If you need React DevTools / dev warnings while debugging, do it in the browser locally via the React DevTools extension, which works against production builds too.
