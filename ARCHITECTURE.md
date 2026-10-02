# OFFLINE MIND — Architecture

## Scope and workspace

This workspace is a pnpm monorepo. The product documented here is `artifacts/offline-mind`, a static React SPA. The sibling Express API, PostgreSQL/Drizzle package, OpenAPI-generated libraries, and mockup sandbox are independent workspace scaffolding; the website does not call them.

## Entry point

`artifacts/offline-mind/index.html` provides the root element and Vite entry `src/main.tsx`. `main.tsx` imports global `index.css`, creates a React root, and wraps `App` in `ErrorBoundary`. `App.tsx` owns `BrowserRouter`, shell, route table, page components, metadata helper, and tool interactions.

## Routing

`App.tsx` declares these paths: `/`, `/feelings`, `/feelings/:slug`, `/situations`, `/situations/:slug`, `/learn`, `/learn/:slug`, `/faq`, `/tools`, `/find-help`, `/urgent-help`, `/about`, and `*`. Detail components resolve exact slugs from local arrays; missing records return the app's branded `NotFound`. Production artifact configuration rewrites all paths to `index.html` for client-side route resolution. There is no SSR.

## Page/component architecture

- `Shell`: sticky site header, desktop/mobile nav, route tree, footer.
- `Home`: editorial sections and links to existing routes.
- `GridPage`: shared searchable list for feelings, situations, topics.
- `FeelingDetail`/`FeelingGuide`: typed feeling guide and optional starting words.
- `SituationDetail`, `LearnDetail`, `FAQPage`, `Tools`, `FindHelp`, `UrgentHelp`, `About`, `NotFound`: page components in `App.tsx`.
- `GuideSection`, `ListSection`, `PageHeading`, `LinkButton`, `RelatedLinks`: local reusable render helpers.
- `Logo`: only app-specific extracted UI component; reuses the existing PNG.
- Generic `components/ui` files are template primitives and are not imported by active app pages.

The app's main UI and routes live in one large `App.tsx`; no page-per-file architecture exists. Keep this in mind when mapping changes. The separate `src/pages/not-found.tsx` is unused.

## Data architecture

Static TypeScript data under `src/data` is the source of truth:

- `feelings.ts` → `FeelingGuideData[]`, used by homepage, list, detail.
- `situations.ts` → `Situation[]`, used by homepage, list, detail, relationships.
- `topics.ts` → `Topic[]`, used by homepage, list, detail.
- `faq.ts` → FAQ question/answer array.
- `tools.ts` → metadata for five tools; active tool panel implementations remain inline in `App.tsx`.
- `resources.ts` → seven categories plus an intentionally empty resource array.
- `types.ts` → shared interfaces/types; `Guide` is legacy and not used in active views.

Relationships use slugs/hrefs rather than database IDs. The UI uses `.find()` to resolve related situations and hides missing situation references; adding data therefore requires checking every relation.

## How to add content safely

### Feeling

Add an object to `src/data/feelings.ts` conforming to `FeelingGuideData`: unique slug, display text, general introduction, possible experiences, `thingsToTry`, `nextFewDays`, professional guidance, related situation slugs, tool label/hrefs, and `urgentHelpRelevant`. Use `startingPoints` only for optional “I don't know”-style vocabulary, never as a screening test. Verify `/feelings/<slug>`, the home choice, listing card, relationships, and invalid slug.

### Situation

Add to `src/data/situations.ts` using its current builder and `Situation` shape. Verify slug uniqueness, displayed title/short copy, question content, professional guidance, optional urgent flag, and all links.

### Article/topic

Add a `Topic` in `src/data/topics.ts` with sections and explicit review/source fields. The current items have no sources and are marked not reviewed; do not imply review until it happens.

### FAQ

Add `{ question, answer }` to `src/data/faq.ts`; the existing search covers both fields.

### Tool

The actual `Tools` components are in `App.tsx`; `data/tools.ts` is only metadata today. Decide whether to keep the existing inline pattern or intentionally connect metadata before introducing a new tool. Current state is local-only.

### Verified help resource

The UI/data shape is not a verification mechanism. Verify source, details, service scope, location, contact, languages, and review date before publishing a real record. Never create a plausible-looking placeholder as a recommendation.

## State, storage, and external services

All interactive state uses local React `useState`. No active page uses Context, localStorage, sessionStorage, IndexedDB, cookies, fetch, or the shared API client. Tool input is not persisted. The page loads Inter from Google Fonts; this is the only evident external browser request in the app source.

The `About` and home copy say no account/no tracking; source contains no analytics SDK, analytics events, or account system. That does not establish what hosting access logs retain.

## Design system

`src/index.css` imports Tailwind v4 and typography plugin, defines palette tokens, responsive rules, focus styling, hover transitions, and reduced-motion handling. Main colors are `#234C6A`, `#1B3C53`, `#456882`, and `#D2C1B6`; copy is primarily `#F7F4EE`/`#D9E2E6`. Warm-neutral art and surfaces remain. CSS names DM Sans/Avenir Next while HTML imports Inter, an unresolved mismatch. The original `public/Brand/offline-mind-black.png` asset is used by `Logo`.

## Build, environment, and export

Root scripts:

- `pnpm run typecheck`
- `pnpm run build` (typecheck plus recursive builds)
- `pnpm run typecheck:libs`

OFFLINE MIND package scripts: `dev`, `build`, `serve`, `typecheck`. Vite requires `PORT` and `BASE_PATH` during config loading. The root build also evaluates sibling Vite configs, so from the root use `PORT=5000 BASE_PATH=/ npm run build`. For local app dev, use `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/offline-mind run dev`.

Install with `pnpm install --frozen-lockfile`. The root preinstall script removes npm/yarn lockfiles and rejects non-pnpm installs. Replit selects Node.js 24. The production artifact serves `dist/public` and rewrites unknown server paths to `index.html`.

## Separate workspace services

- `artifacts/api-server`: Express, Pino logging, `/api/healthz` only, unrestricted CORS, no auth/database usage.
- `lib/db`: Drizzle/Postgres client with empty schema; config requires `DATABASE_URL`.
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react`: generated API scaffolding.
- `artifacts/mockup-sandbox`: independent Vite preview artifact; its plugin generates a module from mockup component files.
- `scripts/post-merge.sh`: frozen install then DB push; not part of the OFFLINE MIND build/runtime.

## Known technical limitations

- No tests or browser automation are configured.
- Direct route HTTP requests return the SPA shell; route lookup is client-side. The production rewrite exists, but every route was not manually clicked in a browser.
- React `Meta` updates title and description after client render; initial/social metadata is generic and no canonical URLs exist.
- There is no explicit React Router hash-scroll restoration for tool links such as `/tools#grounding`; verify fragment scroll before relying on it.
- `maximum-scale=1` in viewport metadata can block pinch zoom; some ARIA progress/art labels and focus contrast need review.
- Learning sources/review status are incomplete; help listings are empty by design.
- Template components/dependencies and `toolCards` are not used by the visible app.

## Handoff rules

Preserve the app's identity, existing logo, route slugs, non-diagnostic language, and rule against inventing Morocco-specific help information. Do not connect the separate API/database scaffolding to this frontend without an explicit product decision and privacy review.