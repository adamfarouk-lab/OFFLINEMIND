# OFFLINE MIND — File Reference

Paths are relative to the exported workspace root. This is a source map, not an instruction to refactor or delete unused-looking scaffold.

## Workspace root

| File | Purpose / important contents | Used by / notes |
|---|---|---|
| `package.json` | Root pnpm scripts, connector SDK, TypeScript and Prettier | Root build/typecheck; `preinstall` rejects non-pnpm |
| `pnpm-lock.yaml` | Resolved workspace package graph | Use for reproducible pnpm install |
| `pnpm-workspace.yaml` | Workspace globs, dependency catalog, package-age policy, overrides | Defines `artifacts/*`, `lib/*`, `lib/integrations/*`, `scripts` |
| `.npmrc` | Peer dependency settings | pnpm |
| `tsconfig.json` | Root TS project references | References DB, API client, API Zod |
| `tsconfig.base.json` | Shared strict TS settings | Extends across packages |
| `.replit` | Node 24, deployment/autoscale, run button, post-merge hook | Replit-specific |
| `.replitignore`, `.gitignore` | Export/ignore rules | `.local` and generated outputs are not runtime app source |
| `replit.md` | Workspace operating notes | Still a generic template with placeholders and generic API/DB guidance; check before relying on it |
| `scripts/post-merge.sh` | Frozen install followed by DB push | Post-merge hook; may mutate configured database schema |

## OFFLINE MIND application

### Entry, routing, config, and assets

| File | Purpose | Used by / exports / notes |
|---|---|---|
| `artifacts/offline-mind/package.json` | App scripts and direct dependencies | `@workspace/offline-mind`; only `react-router-dom` is under `dependencies` |
| `artifacts/offline-mind/index.html` | HTML shell, initial SEO/social metadata, viewport, Google Fonts | Vite entry shell; metadata still contains generic template text |
| `artifacts/offline-mind/vite.config.ts` | Vite, React, Tailwind, aliases, required `PORT`/`BASE_PATH` | App dev/build; `@` maps to `src` |
| `artifacts/offline-mind/tsconfig.json` | App TS options and API-client project reference | Typecheck |
| `artifacts/offline-mind/.replit-artifact/artifact.toml` | Web artifact, port, dev/build/serve, SPA rewrite | Replit artifact routing |
| `artifacts/offline-mind/components.json` | shadcn-style component generator settings | Template tooling |
| `artifacts/offline-mind/src/main.tsx` | React entry and error boundary | Renders `App`; imports global CSS |
| `artifacts/offline-mind/src/App.tsx` | All route rules, page components, site shell, metadata, tools | Active application source; contains `Home`, `GridPage`, all details, FAQ, tools, support, About, and 404 |
| `artifacts/offline-mind/src/index.css` | Tailwind imports, tokens, component/page styles, responsive and reduced-motion rules | Active global stylesheet |
| `artifacts/offline-mind/src/components/Logo.tsx` | Reusable home-linked logo image | Header/footer; references `/Brand/offline-mind-black.png` |
| `artifacts/offline-mind/src/components/error-boundary.tsx` | React error boundary | App root; dev diagnostic behavior |
| `artifacts/offline-mind/src/pages/not-found.tsx` | Generic template 404 page | Not imported by active router; active 404 is inside `App.tsx` |
| `artifacts/offline-mind/src/lib/utils.ts` | Small UI utility functions | Used by template components |
| `artifacts/offline-mind/src/hooks/use-mobile.tsx` | Responsive breakpoint hook | Template UI library; not used by active custom app pages |
| `artifacts/offline-mind/src/hooks/use-toast.ts` | Toast-state helper | Template UI library; not used by active custom app pages |
| `artifacts/offline-mind/public/Brand/offline-mind-black.png` | Original 500×500 RGBA logo | Referenced by `Logo.tsx`; preserve unchanged |
| `artifacts/offline-mind/public/favicon.svg` | Favicon, currently simple orange rectangle | Linked from HTML |
| `artifacts/offline-mind/public/robots.txt` | Allows crawling | Static public asset |

### Content/data files

| File | Exports / shape | Consumed by |
|---|---|---|
| `src/data/types.ts` | `FeelingGuideData`, `Situation`, `Topic`, `Resource`; legacy `Guide` | Compile-time content types |
| `src/data/feelings.ts` | `feelings: FeelingGuideData[]`; 11 entries and tool link map | Home, listing, detail |
| `src/data/situations.ts` | `situations: Situation[]`; 14 entries | Home, listing, detail, related routes |
| `src/data/topics.ts` | `topics: Topic[]`; 14 entries, empty sources and review field | Home, listing, detail |
| `src/data/faq.ts` | `faq: FAQItem[]`; 14 question/answer items | Searchable FAQ |
| `src/data/tools.ts` | `toolCards` metadata for five tools | Imported but not used by active tool renderer |
| `src/data/resources.ts` | Seven categories; empty `resources` array | Find Help filter and empty state |

### Generic UI template files

The active `App.tsx` and `main.tsx` do not import this catalogue. It is retained in the export, and its internal cross-imports may exist. Do not delete without a workspace-wide reference check.

`artifacts/offline-mind/src/components/ui/` contains:

`accordion.tsx`, `alert-dialog.tsx`, `alert.tsx`, `aspect-ratio.tsx`, `avatar.tsx`, `badge.tsx`, `breadcrumb.tsx`, `button-group.tsx`, `button.tsx`, `calendar.tsx`, `card.tsx`, `carousel.tsx`, `chart.tsx`, `checkbox.tsx`, `collapsible.tsx`, `command.tsx`, `context-menu.tsx`, `dialog.tsx`, `drawer.tsx`, `dropdown-menu.tsx`, `empty.tsx`, `field.tsx`, `form.tsx`, `hover-card.tsx`, `input-group.tsx`, `input-otp.tsx`, `input.tsx`, `item.tsx`, `kbd.tsx`, `label.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `pagination.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `resizable.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `skeleton.tsx`, `slider.tsx`, `sonner.tsx`, `spinner.tsx`, `switch.tsx`, `table.tsx`, `tabs.tsx`, `textarea.tsx`, `toaster.tsx`, `toast.tsx`, `toggle-group.tsx`, `toggle.tsx`, and `tooltip.tsx`.

`chart.tsx` uses `dangerouslySetInnerHTML` for chart styles; it is not used by active pages. `sidebar.tsx` writes a cookie when used; it is also not used by active pages.

## Other workspace artifacts

### API Server

| File | Purpose |
|---|---|
| `artifacts/api-server/package.json` | Express API dependencies and scripts |
| `artifacts/api-server/.replit-artifact/artifact.toml` | API artifact, port 8080, run/build and `/api/healthz` health check |
| `artifacts/api-server/src/index.ts` | Server startup; requires `PORT` |
| `artifacts/api-server/src/app.ts` | Express app, CORS, parsers, request logging, `/api` router |
| `artifacts/api-server/src/routes/index.ts` | API router |
| `artifacts/api-server/src/routes/health.ts` | Only current API endpoint |
| `artifacts/api-server/src/lib/logger.ts` | Pino configuration |
| `artifacts/api-server/build.mjs` | Build script; recreates output directory |
| `artifacts/api-server/tsconfig.json` | TypeScript config |

This API is independent of OFFLINE MIND and currently has no business data, authentication, or DB call.

### Mockup sandbox

| File | Purpose |
|---|---|
| `artifacts/mockup-sandbox/package.json` | Vite preview package |
| `artifacts/mockup-sandbox/.replit-artifact/artifact.toml` | Design artifact and preview service |
| `artifacts/mockup-sandbox/vite.config.ts` | Vite config and preview plugin registration |
| `artifacts/mockup-sandbox/mockupPreviewPlugin.ts` | Generates preview component registry |
| `artifacts/mockup-sandbox/index.html` | Preview HTML shell |
| `artifacts/mockup-sandbox/src/App.tsx` | Preview component host |
| `artifacts/mockup-sandbox/src/main.tsx` | React entry |
| `artifacts/mockup-sandbox/src/index.css` | Preview styles |
| `artifacts/mockup-sandbox/src/hooks/*`, `src/lib/utils.ts` | Template hooks and helpers |
| `artifacts/mockup-sandbox/src/.generated/mockup-components.ts` | Generated preview registry |
| `artifacts/mockup-sandbox/components.json` | UI generator config |

No checked-in `src/components/mockups` directory was found during the audit; the preview plugin can generate an empty registry.

## Shared libraries and scripts

| Path | Purpose / important exports |
|---|---|
| `lib/api-spec/openapi.yaml` | OpenAPI health contract |
| `lib/api-spec/orval.config.ts` | Orval generation settings |
| `lib/api-spec/package.json` | Spec/codegen package |
| `lib/api-client-react/src/index.ts` | Generated React Query API exports |
| `lib/api-client-react/src/custom-fetch.ts` | Generated-client fetch/auth-token support |
| `lib/api-client-react/src/generated/*` | Generated API and schemas |
| `lib/api-client-react/package.json`, `tsconfig.json` | Package scripts/dependencies/project config |
| `lib/api-zod/src/index.ts`, `src/generated/*` | Generated Zod/API schema exports |
| `lib/api-zod/package.json`, `tsconfig.json` | Package config |
| `lib/db/src/index.ts` | PostgreSQL pool; requires `DATABASE_URL` |
| `lib/db/src/schema/index.ts` | Drizzle schema, currently empty |
| `lib/db/drizzle.config.ts` | Drizzle configuration; requires `DATABASE_URL` |
| `lib/db/package.json`, `tsconfig.json` | DB package config |
| `scripts/src/hello.ts` | Script-package sample |
| `scripts/package.json`, `scripts/tsconfig.json` | Script package config |
| `scripts/post-merge.sh` | Frozen install and DB push hook |

## Generated, binary, and environment files

The export contains `pnpm-lock.yaml`, which is the authoritative dependency lock. Binary logo image data is not embedded in `CODEBASE_SNAPSHOT.md`; the exact asset is listed above and should remain in the project export. Build `dist` output, `node_modules`, caches, and TypeScript build-info files are generated/ignored. No `.env` file was found. Environment variable names and references are documented in `PROJECT_HANDOFF.md`; no secret values are included.