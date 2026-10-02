# OFFLINE MIND — Project Handoff

Audit snapshot: 2026-10-02  
Primary app: `artifacts/offline-mind`  
Workspace: pnpm monorepo

## A. Project overview

OFFLINE MIND is a calm, Morocco-focused mental-health information and self-help website. Its audience is people who want help naming a feeling, trying a small practical step, learning general information, or considering support.

It **is** an educational, static website with feelings and situation guides, learning topics, FAQs, five client-side tools, an intentionally empty support directory, and general urgent-help guidance. It **is not** a clinic, diagnosis tool, therapist, emergency service, verified local-provider directory, user-account system, or persistent journal.

The current MVP is a client-rendered React single-page app. Content is held in TypeScript files; interactions use component-local React state. There is no app database, API dependency, login, analytics SDK, or user-data persistence. No source changes were made during this audit.

Implemented: homepage, responsive navigation, 11 feeling guides, 14 situation guides, 14 learning topics, 14 FAQ entries, five tools, find-help and urgent-help pages, about/privacy page, route-level metadata updates, and branded unknown-route handling.

Incomplete or intentionally absent: verified local support listings, reviewed/cited learning sources, automated browser/accessibility tests, static-server rendering, canonical/route-specific social metadata, and an actual persistent service layer. No separate list of planned feelings or situations exists in the source.

### Workspace boundaries

| Area | Current purpose | Relationship to OFFLINE MIND |
|---|---|---|
| `artifacts/offline-mind` | User-facing website | Primary product and only app audited visually |
| `artifacts/api-server` | Express API with a health endpoint | Separate scaffold; not called by OFFLINE MIND |
| `artifacts/mockup-sandbox` | Design/component preview app | Separate canvas tooling; not part of the site |
| `lib/api-client-react`, `lib/api-zod`, `lib/api-spec` | Generated API client, schemas, and OpenAPI/codegen | Workspace scaffolding; not imported by the active site UI |
| `lib/db` | Drizzle/PostgreSQL setup | Workspace scaffold; no app tables and no OFFLINE MIND connection |
| `scripts` | Workspace helper scripts | Includes a post-merge install and DB-push script; not a site runtime service |

## B. Tech stack and dependencies

Resolved direct OFFLINE MIND versions were read from the installed pnpm workspace on 2026-10-02. Declared version ranges and catalog aliases remain in `artifacts/offline-mind/package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`.

- React and React DOM: **19.1.0**
- TypeScript: **5.9.3**
- Vite: **7.3.6**
- Tailwind CSS: **4.3.3**, using `@tailwindcss/vite`
- React Router DOM: **7.18.4**
- Lucide React: **0.545.0**
- Node: Replit selects Node.js 24 in `.replit`; use Node 24 when reproducing this environment.
- Package manager: pnpm workspaces; the committed lockfile is `pnpm-lock.yaml`. There is no root `package-lock.json`.

React renders the UI; React Router handles client-side paths; Vite bundles and serves the SPA; Tailwind v4 is imported and configured in CSS; Lucide supplies inline icons. The app package declares many Radix/shadcn-style UI and template dependencies that the active custom pages do not import. This inventory is descriptive, not a dependency-removal recommendation.

### Direct app dependency inventory

The table below is inserted from `pnpm list --filter @workspace/offline-mind --depth 0 --json`; it lists every direct app dependency and its installed version. `dev` means `devDependencies`; `runtime` means `dependencies`.

| Package | Declared | Installed | Group |
|---|---:|---:|---|
| react-router-dom | ^7.18.4 | 7.18.4 | runtime |
| @hookform/resolvers | ^3.10.0 | 3.10.0 | dev |
| @radix-ui/react-accordion | ^1.2.4 | 1.2.20 | dev |
| @radix-ui/react-alert-dialog | ^1.1.7 | 1.1.23 | dev |
| @radix-ui/react-aspect-ratio | ^1.1.3 | 1.1.15 | dev |
| @radix-ui/react-avatar | ^1.1.4 | 1.2.6 | dev |
| @radix-ui/react-checkbox | ^1.1.5 | 1.3.11 | dev |
| @radix-ui/react-collapsible | ^1.1.4 | 1.1.20 | dev |
| @radix-ui/react-context-menu | ^2.2.7 | 2.3.7 | dev |
| @radix-ui/react-dialog | ^1.1.7 | 1.1.23 | dev |
| @radix-ui/react-dropdown-menu | ^2.1.7 | 2.1.24 | dev |
| @radix-ui/react-hover-card | ^1.1.7 | 1.1.23 | dev |
| @radix-ui/react-label | ^2.1.3 | 2.1.15 | dev |
| @radix-ui/react-menubar | ^1.1.7 | 1.1.24 | dev |
| @radix-ui/react-navigation-menu | ^1.2.6 | 1.2.22 | dev |
| @radix-ui/react-popover | ^1.1.7 | 1.1.23 | dev |
| @radix-ui/react-progress | ^1.1.3 | 1.1.16 | dev |
| @radix-ui/react-radio-group | ^1.2.4 | 1.4.7 | dev |
| @radix-ui/react-scroll-area | ^1.2.4 | 1.2.18 | dev |
| @radix-ui/react-select | ^2.1.7 | 2.3.7 | dev |
| @radix-ui/react-separator | ^1.1.3 | 1.1.15 | dev |
| @radix-ui/react-slider | ^1.2.4 | 1.4.7 | dev |
| @radix-ui/react-slot | ^1.2.0 | 1.3.3 | dev |
| @radix-ui/react-switch | ^1.1.4 | 1.3.7 | dev |
| @radix-ui/react-tabs | ^1.1.4 | 1.1.21 | dev |
| @radix-ui/react-toast | ^1.2.7 | 1.2.23 | dev |
| @radix-ui/react-toggle | ^1.1.3 | 1.1.18 | dev |
| @radix-ui/react-toggle-group | ^1.1.3 | 1.1.19 | dev |
| @radix-ui/react-tooltip | ^1.2.0 | 1.2.16 | dev |
| @replit/vite-plugin-cartographer | catalog: | 0.5.21 | dev |
| @replit/vite-plugin-dev-banner | catalog: | 0.1.2 | dev |
| @replit/vite-plugin-runtime-error-modal | catalog: | 0.0.6 | dev |
| @tailwindcss/typography | ^0.5.15 | 0.5.20 | dev |
| @tailwindcss/vite | catalog: | 4.3.3 | dev |
| @tanstack/react-query | catalog: | 5.102.8 | dev |
| @types/node | catalog: | 25.9.6 | dev |
| @types/react | catalog: | 19.3.0 | dev |
| @types/react-dom | catalog: | 19.3.0 | dev |
| @vitejs/plugin-react | catalog: | 5.2.0 | dev |
| @workspace/api-client-react | workspace:* | link:../../lib/api-client-react | dev |
| class-variance-authority | catalog: | 0.7.1 | dev |
| clsx | catalog: | 2.1.1 | dev |
| cmdk | ^1.1.1 | 1.1.1 | dev |
| date-fns | ^3.6.0 | 3.6.0 | dev |
| embla-carousel-react | ^8.6.0 | 8.6.0 | dev |
| framer-motion | catalog: | 12.43.0 | dev |
| input-otp | ^1.4.2 | 1.5.0 | dev |
| lucide-react | catalog: | 0.545.0 | dev |
| next-themes | ^0.4.6 | 0.4.6 | dev |
| react | catalog: | 19.1.0 | dev |
| react-day-picker | ^9.11.1 | 9.14.0 | dev |
| react-dom | catalog: | 19.1.0 | dev |
| react-hook-form | ^7.55.0 | 7.87.0 | dev |
| react-icons | ^5.4.0 | 5.7.0 | dev |
| react-resizable-panels | ^2.1.7 | 2.1.9 | dev |
| recharts | ^2.15.2 | 2.15.4 | dev |
| sonner | ^2.0.7 | 2.0.8 | dev |
| tailwind-merge | catalog: | 3.6.0 | dev |
| tailwindcss | catalog: | 4.3.3 | dev |
| tw-animate-css | ^1.4.0 | 1.4.0 | dev |
| vaul | ^1.1.2 | 1.1.2 | dev |
| vite | catalog: | 7.3.6 | dev |
| wouter | ^3.3.5 | 3.13.0 | dev |
| zod | catalog: | 3.25.76 | dev |

The root package separately declares `@replit/connectors-sdk` 0.4.3, Prettier 3.9.6, and TypeScript 5.9.3. Workspace packages declare their own dependencies; their manifests and lock resolutions are part of the export.

## C. Actual project structure

```text
workspace root
├── package.json                 # recursive typecheck/build scripts
├── pnpm-lock.yaml               # package-resolution lockfile
├── pnpm-workspace.yaml          # packages, catalog, overrides
├── tsconfig.json
├── tsconfig.base.json
├── .npmrc / .replit / .replitignore / .gitignore
├── replit.md                    # scaffold instructions; still contains placeholders
├── artifacts/
│   ├── offline-mind/            # primary web app
│   ├── api-server/              # separate Express health API
│   └── mockup-sandbox/          # design preview app
├── lib/
│   ├── api-client-react/
│   ├── api-spec/
│   ├── api-zod/
│   └── db/
└── scripts/
```

The complete, more granular map is in `FILE_REFERENCE.md`. Generated `dist` directories and `.tsbuildinfo` files are not source-of-truth files. The tracked mockup preview module is generated by its Vite plugin.

## D. Routing

`artifacts/offline-mind/src/App.tsx` declares 13 route rules: nine exact static paths, three parameterized detail paths, and one catch-all. React Router `BrowserRouter`, `Link`, `Routes`, and `Route` provide client navigation; detail routes look up exact slugs in their local arrays. Unknown slugs and unmatched URLs render the branded `NotFound` component in `App.tsx`. A second generic `src/pages/not-found.tsx` is not used by the active router.

| URL | Page/component | Route type and content | Main entry links |
|---|---|---|---|
| `/` | `Home` | Static homepage sections described below | Logo, Home nav |
| `/feelings` | `Feelings` → `GridPage` | Static listing with search | Main nav, homepage “Start here” and “See all feelings”, footer |
| `/feelings/:slug` | `FeelingDetail` → `FeelingGuide` | Dynamic guide from `feelings.ts` | Homepage choices, listing cards, related links |
| `/situations` | `Situations` → `GridPage` | Static listing with search | Main nav, homepage “All situations”, footer |
| `/situations/:slug` | `SituationDetail` | Dynamic guide from `situations.ts` | Homepage cards, listing cards, related links |
| `/learn` | `Learn` → `GridPage` | Static topic listing with search | Main nav, homepage “Explore resources” and “Browse all topics”, footer |
| `/learn/:slug` | `LearnDetail` | Dynamic educational topic from `topics.ts` | Homepage topics, listing cards, related links |
| `/faq` | `FAQPage` | Static searchable FAQ | Direct route only; currently absent from the main navigation and footer |
| `/tools` | `Tools` | Static page containing five interactive tools | Main nav, homepage tool band, guide links |
| `/find-help` | `FindHelp` | Static directory shell; data array is empty | Main nav, support section, guide links |
| `/urgent-help` | `UrgentHelp` | Static general safety guidance | Header, homepage urgent strip, applicable guides |
| `/about` | `About` | Static product/privacy explanation | Homepage mission link, footer |
| `*` | `NotFound` | Catch-all branded 404 | Any unmatched path; also used for unknown data slugs |

The actual supported detail slugs are enumerated in sections F–H. The artifact production manifest rewrites `/*` to `/index.html`, allowing the client router to receive direct paths and refreshes. During this audit, HTTP requests to all listed paths and an unknown path returned the SPA shell with status 200 from the running Vite preview. That checks server fallback, not that every React route was browser-clicked. Source inspection confirms route lookup behavior; screenshots checked the homepage at desktop/mobile sizes and a feeling guide. The app has no server-side rendering.

The mobile menu is an in-component state toggle. Its button exposes an accessible name and `aria-expanded`; the menu renders the six primary nav links plus Urgent help. Mobile screenshots confirmed the closed-menu layout; opening and keyboard-tabbing through it was not automated.

## E. Homepage

All sections are implemented by `Home` in `src/App.tsx`, using local data and shared inline components such as `LinkButton`, `PageHeading`, `Logo`, and the guide/grid renderers.

1. **Hero:** headline, introduction, Start here → `/feelings`, Explore resources → `/learn`, privacy claim, and native anchor `#begin`.
2. **Feeling chooser:** all 11 records from `feelings.ts` link to `/feelings/<slug>`; See all feelings → `/feelings`.
3. **Situation chooser:** first six `situations` records link to `/situations/<slug>`; All situations → `/situations`.
4. **Tool promotion:** OFFLINE MOMENT copy and Explore the tools → `/tools`.
5. **Learning topics:** first seven `topics` records link to `/learn/<slug>`; Browse all topics → `/learn`.
6. **Support section:** Find support → `/find-help`; explanatory directory status, not local listings.
7. **Urgent strip:** general immediate-danger text and I need help right now → `/urgent-help`.
8. **Mission section:** product purpose and A little more about us → `/about`.
9. **Footer:** links to feelings, situations, learn, tools, find help, urgent help, and about/privacy.

The homepage uses data arrays for the feeling, situation, and learning cards. Other page copy is in JSX. It does not link to `/faq`.

## F. Feelings system

`src/data/feelings.ts` exports `feelings: FeelingGuideData[]`; `src/data/types.ts` defines the type. Each record contains `slug`, `label`, `title`, `shortDescription`, `introduction`, `whatMightBeHappening`, `thingsToTry[]`, `nextFewDays[]`, `professionalHelp`, `relatedSituations[]`, `relatedTools[]`, `urgentHelpRelevant`, and optional `startingPoints[]`.

The listing maps records into `/feelings/<slug>` links. The detail component finds an exact slug, then `FeelingGuide` displays a non-diagnostic note, optional starting words, explanatory copy, practical steps for now and the next few days, professional-help guidance, optional urgent-help link, and related situations/tools. Situation associations are resolved against the situation array; related tools store label and href.

| Route | Homepage/listing label |
|---|---|
| `/feelings/anxiety` | I feel anxious |
| `/feelings/feeling-down` | I feel really down |
| `/feelings/emptiness` | I feel empty |
| `/feelings/loneliness` | I feel alone |
| `/feelings/overthinking` | I can't stop overthinking |
| `/feelings/low-motivation` | I have no motivation |
| `/feelings/overwhelm` | I feel overwhelmed |
| `/feelings/anger` | I feel angry |
| `/feelings/fear` | I feel scared |
| `/feelings/sleep-problems` | I can't sleep |
| `/feelings/dont-know` | I don't know |

The “I don't know” guide has a list of possible starting words, explicitly described as optional starting points, not a test or result. To add a feeling, add a fully typed object to `feelings.ts` with a unique slug, label/title, prose and steps, existing related situation slugs, and existing tool URLs. Then verify the homepage and listing mappings, detail page, and invalid-slug behavior. Do not add diagnostic claims or unverified Morocco-specific support facts.

## G. Situations

`src/data/situations.ts` exports 14 `Situation` records. `/situations` uses the shared searchable `GridPage`; `/situations/:slug` renders `SituationDetail`. A helper builds common fields, including a short description, “might” text, steps, a “try this” item, common questions, professional guidance, and optional urgent flag.

Current routes/titles:

| Slug | Title |
|---|---|
| `cant-stop-crying` | I can't stop crying |
| `cant-sleep-tonight` | I can't sleep tonight |
| `cant-concentrate` | I can't concentrate |
| `feel-completely-alone` | I feel completely alone |
| `breakup` | I just had a breakup |
| `fight` | I had a fight with someone |
| `too-much-pressure` | I'm under too much pressure |
| `overthinking-situation` | I can't stop thinking about something |
| `school-pressure` | I'm overwhelmed by school |
| `work-pressure` | I'm overwhelmed by work |
| `losing-control` | I feel like I am losing control |
| `someone-i-love-struggling` | Someone I love is struggling |
| `asking-for-help` | I don't know how to ask for help |
| `need-professional-help` | I think I need professional help |

Urgent guidance is marked on `losing-control` and `someone-i-love-struggling`. No separate planned-situation registry exists. Add entries in the existing data format and verify each referenced slug and any optional urgent path.

## H. Learn

`/learn` is the searchable `GridPage`; `/learn/:slug` uses `LearnDetail` and `Topic` records from `src/data/topics.ts`.

| Slug | Topic |
|---|---|
| `anxiety` | Anxiety |
| `depression` | Depression |
| `loneliness` | Loneliness |
| `stress` | Stress |
| `burnout` | Burnout |
| `grief` | Grief |
| `sleep` | Sleep |
| `relationships` | Relationships |
| `addiction-recovery` | Addiction and recovery |
| `academic-pressure` | Academic pressure |
| `work-stress` | Work stress |
| `emotional-regulation` | Emotional regulation |
| `self-esteem` | Self-esteem |
| `overthinking` | Overthinking |

Each topic stores `slug`, `title`, `summary`, `sections[]`, `sources[]`, `lastReviewed`, and related topic/tool/situation arrays. The current data has no populated sources and identifies topics as not yet reviewed by a subject-matter reviewer. The UI explicitly says it is general information and not diagnosis; article rendering says sources are not yet listed. Editorial/clinical review and real citations are outstanding; do not treat the generic sections as reviewed advice.

## I. FAQ

`src/data/faq.ts` exports 14 `{ question, answer }` records. `/faq` filters question and answer text by case-insensitive substring and renders each answer in native `<details>/<summary>`. There are no categories.

Current questions:

1. Why do I overthink everything at night?
2. Why do I feel lonely even when I'm around people?
3. Why don't I feel anything anymore?
4. Why can’t I motivate myself?
5. Can stress affect my sleep?
6. Can anxiety cause physical symptoms?
7. How do I know if I should see a psychologist?
8. What happens during a first appointment with a psychologist?
9. How can I help someone who is struggling?
10. What should I do if someone tells me they want to die?
11. Is it normal to feel overwhelmed?
12. What can I do when I can't sleep?
13. How can I stop overthinking?
14. How do I deal with a breakup?

Add a typed item to `faq.ts`; there is no category or server-side FAQ store.

## J. Tools

`/tools` renders five tools with local React state in `src/App.tsx`:

| Tool | Current behavior and state |
|---|---|
| Breathing exercise | User starts/pauses a 10-second cycle: 4 seconds in, 2 pause, 4 out; reset clears elapsed seconds |
| Grounding exercise | Five optional checkable prompts, with completion feedback and reset |
| OFFLINE MOMENT | Seven short steps; previous/next; final step loops to the beginning |
| Private journaling | Prompt rotates among four prompts; text area is memory-only while mounted; clear button |
| Mood check-in | Five choices; optional note; reflection and clear action |

The tools do not save to browser storage or send data to a service. Component state is lost on navigation/remount. `src/data/tools.ts` contains card metadata but is not used by the active `Tools` renderer; the actual panels are hard-coded in `App.tsx`. No external API is involved.

## K. Find Help

`/find-help` renders directory guidance, a type selector, empty state, and verification caveats. `src/data/resources.ts` exports seven intended resource categories and an empty `resources` array. Therefore the selector currently produces an empty state for every selection; there is no search, published professional, organization, address, phone number, or verification mechanism.

`Resource` in `src/data/types.ts` sketches name/type/city/address/phone/website/services/languages and placeholder verification fields (`Unverified placeholder`, `lastVerified: null`, `source: null`). It is a shape, not verified content. The UI says entries should be added only once their details and source can be checked. Do not add invented local resource information.

## L. Urgent Help

`/urgent-help` provides general guidance to seek urgent in-person support if someone may be in immediate danger. The homepage urgent strip and selected feeling/situation guides link to it. There are no verified Morocco-specific emergency numbers or service listings; the page says the site is not monitored and does not invent contacts. This is informational guidance, not an emergency-response service.

## M. About and privacy

`/about` explains the product, limits, next steps, and privacy claims. The client does not require an account and the source contains no analytics SDK/events, tracking pixels, local/session storage, IndexedDB, network API calls, or persistence for tool inputs. Journal content is held in React state only.

The HTML imports Inter from Google Fonts. A page visit can therefore make a third-party font request and expose ordinary network request metadata to that provider. Hosting/access logs are outside the frontend source and cannot be assessed here. The claim “no account, no tracking” is accurate as a description of app code checked for analytics, but should not be read as proof of zero third-party network requests or zero hosting logs.

## N. Design system

The CSS theme defines the intended colors:

| Role | Color |
|---|---|
| Main background / secondary blue | `#234C6A` |
| Darker surfaces | `#1B3C53` |
| Supporting blue | `#456882` |
| Warm accent | `#D2C1B6` |
| Main light text | `#F7F4EE` |
| Supporting copy | `#D9E2E6` |

Desktop and mobile screenshots show a dark-blue base, blue supporting sections, navy bands, light copy, and a warm accent. The original logo is displayed on a warm plate. The stylesheet also retains warm-neutral artwork/surface values and older HSL tokens in `:root`; the later `@theme inline` and palette overrides provide the active dark-blue surfaces. Keep these styles intact during export unless a separately scoped visual change is requested.

Typography uses a DM Sans/Avenir Next/sans-serif CSS stack, while `index.html` imports Inter from Google Fonts. Confirm which is intended before changing it. Headings use fluid `clamp()` sizes; body copy uses a sans-serif stack. The general radius token is `0.75rem`, although most custom panels/cards use square corners; shadows are not a defining part of the current visual language. Borders and dividers are frequent, and hover/focus transitions are modest.

Responsive rules include 960px, 760px, 640px, and 520px cutoffs. At 760px the desktop navigation hides and the mobile menu button appears; grids collapse progressively. `prefers-reduced-motion` disables/reduces animation and transitions. The site header is sticky.

## O. Logo and assets

- Logo: `artifacts/offline-mind/public/Brand/offline-mind-black.png`, PNG, 500×500 RGBA. It is referenced by reusable `src/components/Logo.tsx`, used in header and footer. There is one logo version in `public`; the asset itself was not altered.
- Favicon: `artifacts/offline-mind/public/favicon.svg`; currently a simple orange rectangle, not the logo.
- `artifacts/offline-mind/public/robots.txt`: permits crawling.
- Lucide icons are React components, not separate image files.
- Font: external Google Fonts Inter reference in `index.html`.

## P. Component architecture

`App.tsx` is a large single module containing routing, shell, page components, guide sections, tool widgets, and metadata logic. `Logo` is the notable reusable project component. `main.tsx` wraps `App` in `ErrorBoundary`. The active app does not import its `components/ui` catalogue; that directory is template-style Radix/shadcn UI code. `src/pages/not-found.tsx` is a duplicate generic 404 and is unused by the active router. `src/data/types.ts` includes a legacy `Guide` type not used by the active feelings/situation/topic models. `toolCards` is imported but unused by the current page renderer.

The code is functional, but `App.tsx` is a broad maintenance hotspot. This audit did not refactor it. Any future refactor should preserve the current route/data behavior and must not replace the app identity or copy.

## Q. Data architecture

All site content is local TypeScript:

| File | Export | Consumer |
|---|---|---|
| `src/data/feelings.ts` | `feelings` | Homepage chooser, feelings listing, dynamic details |
| `src/data/situations.ts` | `situations` | Homepage cards, listing, situation detail, guide relations |
| `src/data/topics.ts` | `topics` | Homepage topics, learn listing/detail |
| `src/data/faq.ts` | `faq` | FAQ search page |
| `src/data/tools.ts` | `toolCards` | Metadata exists; not used by current `Tools` UI |
| `src/data/resources.ts` | categories and empty resources | Find Help filter/empty state |
| `src/data/types.ts` | shared shapes | Compile-time models; includes an unused legacy `Guide` |

New records belong in the relevant array and must use existing referenced slugs. There is no CMS, admin UI, database mapping, fetch layer, or schema validation at runtime.

## R. State and storage

React `useState` is the only active app state system. It covers mobile menu visibility, listing/FAQ queries, timer, grounding steps, moment index, journal prompt/text, mood selection/note, and directory filter. There is no app Context, external state library, URL-backed search state, or persistence. No localStorage/sessionStorage/IndexedDB/cookie use is in the active app. The template `components/ui/sidebar.tsx` writes a cookie but is not imported by active pages.

## S. Backend and services

OFFLINE MIND is static frontend code. It does not import/call the shared API client, API server, or database package. `@workspace/api-client-react` appears in the manifest, but not in active app source.

Other workspace services are separate:

- `artifacts/api-server`: Express app with `/api/healthz` returning `{ status: "ok" }`; currently no business API or database connection. CORS is unrestricted and no auth middleware is present, so add restrictions/auth before using it for protected data.
- `lib/db`: Drizzle/PostgreSQL client and empty schema; `DATABASE_URL` is required when DB config/client is invoked.
- `lib/api-spec`, `lib/api-zod`, and `lib/api-client-react`: OpenAPI and generated scaffolding.
- `artifacts/mockup-sandbox`: independent Vite design preview service; its plugin generates a mockup manifest from preview files.

## T. Environment variables

No `.env` file was found. This inventory lists names only; it does not expose secret values.

| Variable | References | Purpose |
|---|---|---|
| `PORT` | App/sandbox Vite configs; API server | Required listen/preview port |
| `BASE_PATH` | App/sandbox Vite configs | Vite base URL; `/` for OFFLINE MIND and `/__mockup` for canvas artifact config |
| `NODE_ENV` | Vite configs, API logger | Plugin selection and production logging behavior |
| `REPL_ID` | Vite configs | Enables Replit development plugins when present |
| `LOG_LEVEL` | API logger | Pino level; defaults to `info` |
| `DATABASE_URL` | `lib/db/src/index.ts`, `lib/db/drizzle.config.ts` | PostgreSQL connection for the separate DB package |
| `import.meta.env.DEV` | OFFLINE MIND error boundary | Vite development-only diagnostic UI |
| `import.meta.env.BASE_URL` | mockup sandbox | Base URL for that separate preview app |

`PORT` and `BASE_PATH` are mandatory in Vite config evaluation, including root recursive builds. Artifact workflows inject service-specific values. `SESSION_SECRET` has no source reference in the audited tree.

## U. Accessibility

Already present: semantic sections/headings, skip link, named navigation landmarks, mobile-menu `aria-label`/`aria-expanded`, labels or screen-reader labels for fields, button `aria-pressed`, live feedback, native `details/summary`, visible focus styling, reduced-motion CSS, and a 44px mobile-menu target.

Potential issues: viewport metadata sets `maximum-scale=1`, which may prevent user zoom; the focus outline uses supporting blue on blue backgrounds and may not meet non-text contrast; the hero art uses `aria-label` on a plain `div` without an image role; the moment progress uses an `aria-label` on a `div` without progressbar semantics. Contrast and assistive-technology behavior were not measured with automated tools. No automated accessibility suite is configured.

## V. SEO

The HTML has `lang`, viewport, robots directive, title, description, Open Graph, and Twitter fields. The initial description and social descriptions are still generic Replit template text. React `Meta` changes document title and the standard description after client render, but does not update OG/Twitter tags. There are no canonical URLs, sitemap, or server-rendered route metadata. `robots.txt` allows all crawling. Dynamic route content may not be visible to crawlers that do not run the client JavaScript.

## W. Performance

Static Vite SPA, small local logo, and no visible dynamic imports/code splitting or list virtualization. There is a Google Fonts network dependency. Runtime/bundle performance was not profiled. The active app appears to carry unused UI, charting, form, animation, and API-client dependencies; do not remove them without a verified dependency/import audit. No optimization refactor was performed.

## X. Security

Manual source review found no client-side secrets, dangerous HTML rendering in active pages, user-controlled external URLs, or persistent sensitive input. The unused generic `src/components/ui/chart.tsx` uses `dangerouslySetInnerHTML` to set chart styles; inspect its inputs before using it with untrusted configuration. The separate health-only API uses unrestricted CORS; there is no protected API today. No production security headers or CSP are declared in the inspected app config; hosting behavior is outside this source audit. This was not a formal dependency or penetration test.

## Y. Content and safety

Feeling and situation pages state they are not diagnosis and do not replace professional care. The content uses general support language and a generic urgent-help path. No Morocco-specific emergency numbers, organizations, professionals, addresses, or medical sources are fabricated. Learning topics have empty source arrays and a “not yet reviewed” status; they need qualified editorial review and citations before being presented as reviewed material. This audit did not rewrite content.

## Z. Known problems and limitations

### Critical

- None found that prevents the site from building or serving in the configured workspace.

### Important

- `index.html` still has generic Replit description/OG/Twitter copy; route-specific React metadata does not update social tags.
- Topics are explicitly unreviewed and contain no listed sources; the help directory has no verified records by design.
- The app loads Google Fonts while its privacy copy says “no tracking”; no analytics/tracking SDK was found, but the font request is third-party.
- Root recursive build needs `PORT` and `BASE_PATH` because sibling Vite configs require them.

### Minor

- `maximum-scale=1` can block pinch zoom.
- `/faq` is implemented but not discoverable from main nav/footer.
- CSS imports Inter but its font stack names DM Sans/Avenir Next; clarify the intended font.
- Router links with `/tools#...` have no explicit hash-scroll handler; verify anchor scrolling in a browser before relying on it.
- Some ARIA labeling and focus-contrast details need testing.
- `toolCards`, the generic 404 component, a legacy `Guide` type, and the generic UI catalogue are unused by active site routes.
- No automated browser, accessibility, or unit test script is configured.

### Optional

- Add verified support listings only after source-checking every record.
- Review/cite learning content with qualified subject-matter input.
- Add minimal route/accessibility tests using an explicitly chosen test setup.
- Consider static/route-specific metadata once a canonical URL is known.

## AA. Unused and duplicated code

- Active pages are in `src/App.tsx`; `src/pages/not-found.tsx` is a separate generic 404 not connected to routing.
- `toolCards` is imported from `src/data/tools.ts`, but tool panels are hard-coded in `App.tsx`.
- `Guide` in `src/data/types.ts` is not used by active pages; current guides use `FeelingGuideData`, `Situation`, and `Topic`.
- `src/components/ui/*.tsx` is a large generated/template component library and is not imported by `App.tsx` or `main.tsx`. Do not delete without a workspace-wide import check.
- App manifest includes `@workspace/api-client-react` and multiple UI libraries that are not used by the current visible app code.

## AB. Current implementation status

| Feature | Status | Main files | Notes |
|---|---|---|---|
| Homepage | Implemented | `src/App.tsx`, data files | Links into current routes |
| Feelings listing | Implemented | `src/App.tsx`, `data/feelings.ts` | Search and 11 options |
| Feeling details | Implemented | `src/App.tsx`, `data/feelings.ts` | 11 guides; non-diagnostic |
| Situations | Implemented | `src/App.tsx`, `data/situations.ts` | 14 guides |
| Learn/topics | Partially implemented | `src/App.tsx`, `data/topics.ts` | 14 topics; sources empty and review pending |
| FAQ | Implemented | `src/App.tsx`, `data/faq.ts` | 14 searchable questions; not in main nav |
| Tools | Implemented | `src/App.tsx`, `data/tools.ts` | Five in-memory interactive tools |
| Find Help | Placeholder/partially implemented | `src/App.tsx`, `data/resources.ts` | Empty verified directory |
| Urgent Help | Implemented, general only | `src/App.tsx` | No verified local emergency numbers |
| About/privacy | Implemented | `src/App.tsx` | Code has no analytics; font is external |
| Navigation | Implemented | `src/App.tsx` | Desktop and mobile variants |
| Responsive design | Implemented | `src/index.css` | Desktop and mobile screenshots checked |
| Accessibility | Partially implemented | `src/App.tsx`, `src/index.css` | Good basics; noted issues are untested |
| SEO | Partially implemented | `index.html`, `src/App.tsx`, `public/robots.txt` | Initial/social metadata generic |
| Backend | Not used by OFFLINE MIND | separate `artifacts/api-server` | Health-only scaffold |
| Authentication | Not implemented | — | No accounts |
| Analytics/tracking | Not implemented in app code | — | Third-party font request remains |
| Database | Not used by OFFLINE MIND | separate `lib/db` | Empty schema scaffold |

## AC. Future development and export steps

### Next

1. Export the whole workspace rather than only `artifacts/offline-mind` if the developer needs the API, shared libraries, or canvas tooling.
2. Install with pnpm and run the root typecheck/build; do not use npm install.
3. Confirm the intended font and address initial/social SEO metadata.
4. Add automated route and keyboard/mobile-nav tests only after choosing a lightweight test setup.

### Later

- Review and cite learning topics.
- Establish a verification workflow before populating local support resources.
- Reassess app dependencies and generic template components with import-aware tooling.

### Future

- Any backend, account, analytics, or persistence feature would change the current privacy/storage model; it is not present or assumed here.

### Recommended first steps in VS Code

1. Open the exported workspace root. Use Node.js 24 and pnpm.
2. Run `pnpm install --frozen-lockfile`. The root `preinstall` script removes `package-lock.json` and `yarn.lock` and rejects non-pnpm installs.
3. Run `pnpm run typecheck`.
4. For the full workspace build, set the required Vite variables and run `PORT=5000 BASE_PATH=/ npm run build` from the root. Root `npm run build` invokes pnpm recursively; without the variables, sibling Vite configs fail before the app build.
5. For only the site, use `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/offline-mind run dev`.
6. Do not run `scripts/post-merge.sh` casually in an exported workspace: it runs `pnpm --filter db push` and may apply a database schema operation when configured.

The required final build is run after these documentation files are written; the final chat report records its result.