# Codebase Snapshot

Audit snapshot: 2026-10-02. This file contains the exact text read from the workspace for the primary app and its surrounding pnpm monorepo. Paths in headings are workspace-relative.

All text sources under the active artifact, separate workspace services, shared libraries, and scripts are included, as are package/config files and the pnpm lockfile. Generated build output, `node_modules`, `.tsbuildinfo`, caches, Replit-local `.local`/`.agents` data, the attached task instructions, and binary logo image bytes are not embedded. The original logo remains at `artifacts/offline-mind/public/Brand/offline-mind-black.png` in the project; see `FILE_REFERENCE.md`.

## Root and workspace source files
## ```.gitignore```

```text
# See https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files for more about ignoring files.

# compiled output
dist
tmp
out-tsc
*.tsbuildinfo
.expo
.expo-shared

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

.cursor/rules/nx-rules.mdc
.github/instructions/nx.instructions.md

# Replit
.cache/
.local/
```

## ```.npmrc```

```text
auto-install-peers=false
strict-peer-dependencies=false
```

## ```.replit```

```text
modules = ["nodejs-24"]

[deployment]
router = "application"
deploymentTarget = "autoscale"

[deployment.postBuild]
args = ["pnpm", "store", "prune"]
env = { "CI" = "true" }

[workflows]
runButton = "Project"

[agent]
stack = "PNPM_WORKSPACE"
expertMode = true

[postMerge]
path = "scripts/post-merge.sh"
timeoutMs = 20000

[nix]
channel = "stable-25_05"
```

## ```.replitignore```

```text
# The format of this file is identical to `.dockerignore`.
# It is used to reduce the size of deployed images to make the process of publishing faster.

# No need to store the pnpm store twice.
.local
```

## ```artifacts/api-server/.replit-artifact/artifact.toml```

```toml
kind = "api"
previewPath = "/api" # TODO - should be excluded from preview in the first place
title = "API Server"
version = "1.0.0"
id = "3B4_FFSkEVBkAeYMFRJ2e"

[[services]]
localPort = 8080
name = "API Server"
paths = ["/api"]

[services.development]
run = "pnpm --filter @workspace/api-server run dev"

[services.production]

[services.production.build]
args = ["pnpm", "--filter", "@workspace/api-server", "run", "build"]

[services.production.build.env]
NODE_ENV = "production"

[services.production.run]
# we don't run through pnpm to make startup faster in production
args = ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

[services.production.run.env]
PORT = "8080"
NODE_ENV = "production"

[services.production.health.startup]
path = "/api/healthz"
```

## ```artifacts/api-server/build.mjs```

```js
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// Plugins (e.g. 'esbuild-plugin-pino') may use `require` to resolve dependencies
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    // Some packages may not be bundleable, so we externalize them, we can add more here as needed.
    // Some of the packages below may not be imported or installed, but we're adding them in case they are in the future.
    // Examples of unbundleable packages:
    // - uses native modules and loads them dynamically (e.g. sharp)
    // - use path traversal to read files (e.g. @google-cloud/secret-manager loads sibling .proto files)
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on workers to handle logging, instead of externalizing it we use a plugin to handle it
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],
    // Make sure packages that are cjs only (e.g. express) but are bundled continue to work in our esm output file
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## ```artifacts/api-server/package.json```

```json
{
  "name": "@workspace/api-server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "export NODE_ENV=development && pnpm run build && pnpm run start",
    "build": "node ./build.mjs",
    "start": "node --enable-source-maps ./dist/index.mjs",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@workspace/api-zod": "workspace:*",
    "@workspace/db": "workspace:*",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "drizzle-orm": "catalog:",
    "express": "^5.2.1",
    "pino": "^9.14.0",
    "pino-http": "^10.5.0"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "catalog:",
    "esbuild": "0.28.2",
    "esbuild-plugin-pino": "^2.3.3",
    "pino-pretty": "^13.1.3",
    "thread-stream": "3.1.0"
  }
}
```

## ```artifacts/api-server/src/app.ts```

```ts
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
```

## ```artifacts/api-server/src/index.ts```

```ts
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
```

## ```artifacts/api-server/src/lib/logger.ts```

```ts
import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
```

## ```artifacts/api-server/src/routes/health.ts```

```ts
import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
```

## ```artifacts/api-server/src/routes/index.ts```

```ts
import { Router, type IRouter } from "express";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);

export default router;
```

## ```artifacts/api-server/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"],
  "references": [
    {
      "path": "../../lib/db"
    },
    {
      "path": "../../lib/api-zod"
    }
  ]
}
```

## ```artifacts/mockup-sandbox/.replit-artifact/artifact.toml```

```toml
kind = "design"
previewPath = "/__mockup"
title = "Canvas"
version = "1.0.0"
id = "XegfDyZt7HqfW2Bb8Ghoy"

[[services]]
localPort = 8081
name = "Component Preview Server"
paths = ["/__mockup"]

[services.env]
PORT = "8081"
BASE_PATH = "/__mockup"

[services.development]
run = "pnpm --filter @workspace/mockup-sandbox run dev"
```

## ```artifacts/mockup-sandbox/components.json```

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## ```artifacts/mockup-sandbox/index.html```

```html
<!DOCTYPE html>
<!--
  This file is the entry for ALL routes, including /preview/* canvas iframes.
  Fonts are loaded here as non-blocking <link> tags (not CSS @import, which is render-blocking).
-->
<html lang="en" style="height: 100%">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />

    <meta property="og:title" content="Mockup Canvas" />
    <meta property="og:description" content="UI prototyping sandbox with infinite canvas" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Mockup Canvas" />
    <meta name="twitter:description" content="UI prototyping sandbox with infinite canvas" />

    <title>Mockup Canvas</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>">
    <!-- Non-blocking font bundle: renders with fallback fonts immediately, swaps in when loaded -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" media="print" onload="this.media='all'"
          href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fira+Code:wght@300..700&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&family=Oxanium:wght@200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fira+Code:wght@300..700&family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@100..900&family=Oxanium:wght@200..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"></noscript>
  </head>
  <body style="height: 100%; margin: 0">
    <div id="root" style="height: 100%"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## ```artifacts/mockup-sandbox/mockupPreviewPlugin.ts```

```ts
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import glob from "fast-glob";
import chokidar from "chokidar";
import type { FSWatcher } from "chokidar";
import type { Plugin } from "vite";

const MOCKUPS_DIR = "src/components/mockups";
const GENERATED_MODULE = "src/.generated/mockup-components.ts";

interface DiscoveredComponent {
  globKey: string;
  importPath: string;
}

export function mockupPreviewPlugin(): Plugin {
  let root = "";
  let currentSource = "";
  let watcher: FSWatcher | null = null;

  function getMockupsAbsDir(): string {
    return path.join(root, MOCKUPS_DIR);
  }

  function getGeneratedModuleAbsPath(): string {
    return path.join(root, GENERATED_MODULE);
  }

  function isMockupFile(absolutePath: string): boolean {
    const rel = path.relative(getMockupsAbsDir(), absolutePath);
    return (
      !rel.startsWith("..") && !path.isAbsolute(rel) && rel.endsWith(".tsx")
    );
  }

  function isPreviewTarget(relativeToMockups: string): boolean {
    return relativeToMockups
      .split(path.sep)
      .every((segment) => !segment.startsWith("_"));
  }

  async function discoverComponents(): Promise<Array<DiscoveredComponent>> {
    const files = await glob(`${MOCKUPS_DIR}/**/*.tsx`, {
      cwd: root,
      ignore: ["**/_*/**", "**/_*.tsx"],
    });

    return files.map((f) => ({
      globKey: "./" + f.slice("src/".length),
      importPath: path.posix.relative("src/.generated", f),
    }));
  }

  function generateSource(components: Array<DiscoveredComponent>): string {
    const entries = components
      .map(
        (c) =>
          `  ${JSON.stringify(c.globKey)}: () => import(${JSON.stringify(c.importPath)})`,
      )
      .join(",\n");

    return [
      "// This file is auto-generated by mockupPreviewPlugin.ts.",
      "type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;",
      "export const modules: ModuleMap = {",
      entries,
      "};",
      "",
    ].join("\n");
  }

  function shouldAutoRescan(pathname: string): boolean {
    return (
      pathname.includes("/components/mockups/") ||
      pathname.includes("/.generated/mockup-components")
    );
  }

  let refreshInFlight = false;
  let refreshQueued = false;

  async function refresh(): Promise<boolean> {
    if (refreshInFlight) {
      refreshQueued = true;
      return false;
    }

    refreshInFlight = true;
    let changed = false;
    try {
      const components = await discoverComponents();
      const newSource = generateSource(components);
      if (newSource !== currentSource) {
        currentSource = newSource;
        const generatedModuleAbsPath = getGeneratedModuleAbsPath();
        mkdirSync(path.dirname(generatedModuleAbsPath), { recursive: true });
        writeFileSync(generatedModuleAbsPath, currentSource);
        changed = true;
      }
    } finally {
      refreshInFlight = false;
    }

    if (refreshQueued) {
      refreshQueued = false;
      const followUp = await refresh();
      return changed || followUp;
    }

    return changed;
  }

  async function onFileAddedOrRemoved(): Promise<void> {
    await refresh();
  }

  return {
    name: "mockup-preview",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
    },

    async buildStart() {
      await refresh();
    },

    async configureServer(viteServer) {
      await refresh();

      const mockupsAbsDir = getMockupsAbsDir();
      mkdirSync(mockupsAbsDir, { recursive: true });

      watcher = chokidar.watch(mockupsAbsDir, {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      watcher.on("add", (file) => {
        if (
          isMockupFile(file) &&
          isPreviewTarget(path.relative(mockupsAbsDir, file))
        ) {
          void onFileAddedOrRemoved();
        }
      });

      watcher.on("unlink", (file) => {
        if (isMockupFile(file)) {
          void onFileAddedOrRemoved();
        }
      });

      viteServer.middlewares.use((req, res, next) => {
        const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
        const pathname = requestUrl.pathname;
        const originalEnd = res.end.bind(res);

        res.end = ((...args: Parameters<typeof originalEnd>) => {
          if (res.statusCode === 404 && shouldAutoRescan(pathname)) {
            void refresh();
          }
          return originalEnd(...args);
        }) as typeof res.end;

        next();
      });
    },

    async closeWatcher() {
      if (watcher) {
        await watcher.close();
      }
    },
  };
}
```

## ```artifacts/mockup-sandbox/package.json```

```json
{
  "name": "@workspace/mockup-sandbox",
  "version": "2.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.20",
    "@radix-ui/react-alert-dialog": "^1.1.23",
    "@radix-ui/react-aspect-ratio": "^1.1.15",
    "@radix-ui/react-avatar": "^1.2.6",
    "@radix-ui/react-checkbox": "^1.3.11",
    "@radix-ui/react-collapsible": "^1.1.20",
    "@radix-ui/react-context-menu": "^2.3.7",
    "@radix-ui/react-dialog": "^1.1.23",
    "@radix-ui/react-dropdown-menu": "^2.1.24",
    "@radix-ui/react-hover-card": "^1.1.23",
    "@radix-ui/react-label": "^2.1.15",
    "@radix-ui/react-menubar": "^1.1.24",
    "@radix-ui/react-navigation-menu": "^1.2.22",
    "@radix-ui/react-popover": "^1.1.23",
    "@radix-ui/react-progress": "^1.1.16",
    "@radix-ui/react-radio-group": "^1.4.7",
    "@radix-ui/react-scroll-area": "^1.2.18",
    "@radix-ui/react-select": "^2.3.7",
    "@radix-ui/react-separator": "^1.1.15",
    "@radix-ui/react-slider": "^1.4.7",
    "@radix-ui/react-slot": "^1.3.3",
    "@radix-ui/react-switch": "^1.3.7",
    "@radix-ui/react-tabs": "^1.1.21",
    "@radix-ui/react-toast": "^1.2.23",
    "@radix-ui/react-toggle": "^1.1.18",
    "@radix-ui/react-toggle-group": "^1.1.19",
    "@radix-ui/react-tooltip": "^1.2.16",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/vite": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "chokidar": "^4.0.3",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "fast-glob": "^3.3.3",
    "framer-motion": "catalog:",
    "input-otp": "^1.5.0",
    "lucide-react": "catalog:",
    "next-themes": "^0.4.6",
    "react": "catalog:",
    "react-day-picker": "^9.14.0",
    "react-dom": "catalog:",
    "react-hook-form": "^7.87.0",
    "react-resizable-panels": "^2.1.9",
    "recharts": "^2.15.4",
    "sonner": "^2.0.8",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tailwindcss-animate": "^1.0.7",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "vite": "catalog:",
    "zod": "catalog:"
  }
}
```

## ```artifacts/mockup-sandbox/src/.generated/mockup-components.ts```

```ts
// This file is auto-generated by mockupPreviewPlugin.ts.
type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;
export const modules: ModuleMap = {

};
```

## ```artifacts/mockup-sandbox/src/App.tsx```

```tsx
import { useEffect, useState, type ComponentType } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}

function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-4">
          This server renders individual components for the workspace canvas.
        </p>
        <p className="text-sm text-gray-400">
          Access component previews at{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
            {getPreviewExamplePath()}
          </code>
        </p>
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <Gallery />;
}

export default App;
```

## ```artifacts/mockup-sandbox/src/components/ui/accordion.tsx```

```tsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

## ```artifacts/mockup-sandbox/src/components/ui/alert-dialog.tsx```

```tsx
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/alert.tsx```

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
```

## ```artifacts/mockup-sandbox/src/components/ui/aspect-ratio.tsx```

```tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

const AspectRatio = AspectRatioPrimitive.Root

export { AspectRatio }
```

## ```artifacts/mockup-sandbox/src/components/ui/avatar.tsx```

```tsx
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
```

## ```artifacts/mockup-sandbox/src/components/ui/badge.tsx```

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" +
  " hover-elevate ",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-xs",
        outline: "text-foreground border [border-color:var(--badge-outline)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

## ```artifacts/mockup-sandbox/src/components/ui/breadcrumb.tsx```

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/button-group.tsx```

```tsx
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const buttonGroupVariants = cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      className={cn(
        "bg-muted shadow-xs flex items-center gap-2 rounded-md border px-4 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/button.tsx```

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline:
          "border [border-color:var(--button-outline)] shadow-xs active:shadow-none",
        secondary:
          "border bg-secondary text-secondary-foreground border border-secondary-border",
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## ```artifacts/mockup-sandbox/src/components/ui/calendar.tsx```

```tsx
"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "bg-popover absolute inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
```

## ```artifacts/mockup-sandbox/src/components/ui/card.tsx```

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

## ```artifacts/mockup-sandbox/src/components/ui/carousel.tsx```

```tsx
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return
      }

      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on("reInit", onSelect)
      api.on("select", onSelect)

      return () => {
        api?.off("select", onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute  h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/chart.tsx```

```tsx
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== "none")
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || "value"}`
              const itemConfig = getPayloadConfigFromPayload(config, item, key)
              const indicatorColor = color || item.payload.fill || item.color

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                    indicator === "dot" && "items-center"
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                              {
                                "h-2.5 w-2.5": indicator === "dot",
                                "w-1": indicator === "line",
                                "w-0 border-[1.5px] border-dashed bg-transparent":
                                  indicator === "dashed",
                                "my-0.5": nestLabel && indicator === "dashed",
                              }
                            )}
                            style={
                              {
                                "--color-bg": indicatorColor,
                                "--color-border": indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          "flex flex-1 justify-between leading-none",
                          nestLabel ? "items-end" : "items-center"
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload
          .filter((item) => item.type !== "none")
          .map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)

            return (
              <div
                key={item.value}
                className={cn(
                  "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                {itemConfig?.label}
              </div>
            )
          })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/checkbox.tsx```

```tsx
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

## ```artifacts/mockup-sandbox/src/components/ui/collapsible.tsx```

```tsx
"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

## ```artifacts/mockup-sandbox/src/components/ui/command.tsx```

```tsx
"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/context-menu.tsx```

```tsx
import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const ContextMenu = ContextMenuPrimitive.Root

const ContextMenuTrigger = ContextMenuPrimitive.Trigger

const ContextMenuGroup = ContextMenuPrimitive.Group

const ContextMenuPortal = ContextMenuPrimitive.Portal

const ContextMenuSub = ContextMenuPrimitive.Sub

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
))
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "z-50 max-h-[--radix-context-menu-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
))
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
))
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
))
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />
))
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/dialog.tsx```

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/drawer.tsx```

```tsx
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/80", className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/dropdown-menu.tsx```

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/empty.tsx```

```tsx
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/field.tsx```

```tsx
"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field data-[invalid=true]:text-destructive flex w-full gap-3",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start",
        ],
        responsive: [
          "@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4",
        "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-sm font-normal leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance",
        "nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors) {
      return null
    }

    if (errors?.length === 1 && errors[0]?.message) {
      return errors[0].message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive text-sm font-normal", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/form.tsx```

```tsx
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/hover-card.tsx```

```tsx
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]",
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
```

## ```artifacts/mockup-sandbox/src/components/ui/input-group.tsx```

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]",
        "h-9 has-[>textarea]:h-auto",

        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        "has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1",

        "has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/input-otp.tsx```

```tsx
import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```

## ```artifacts/mockup-sandbox/src/components/ui/input.tsx```

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## ```artifacts/mockup-sandbox/src/components/ui/item.tsx```

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item [a]:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 [a]:transition-colors flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
      },
      size: {
        default: "gap-4 p-4 ",
        sm: "gap-2.5 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium leading-snug",
        className
      )}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/kbd.tsx```

```tsx
import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    />
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
```

## ```artifacts/mockup-sandbox/src/components/ui/label.tsx```

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

## ```artifacts/mockup-sandbox/src/components/ui/menubar.tsx```

```tsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
      className
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/navigation-menu.tsx```

```tsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
))
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/pagination.tsx```

```tsx
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/popover.tsx```

```tsx
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

## ```artifacts/mockup-sandbox/src/components/ui/progress.tsx```

```tsx
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

## ```artifacts/mockup-sandbox/src/components/ui/radio-group.tsx```

```tsx
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
```

## ```artifacts/mockup-sandbox/src/components/ui/resizable.tsx```

```tsx
"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

## ```artifacts/mockup-sandbox/src/components/ui/scroll-area.tsx```

```tsx
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
```

## ```artifacts/mockup-sandbox/src/components/ui/select.tsx```

```tsx
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/separator.tsx```

```tsx
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

## ```artifacts/mockup-sandbox/src/components/ui/sheet.tsx```

```tsx
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/sidebar.tsx```

```tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4))]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4)+2px)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:h-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[var(--skeleton-width)] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "md"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline outline-2 outline-transparent outline-offset-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/skeleton.tsx```

```tsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

## ```artifacts/mockup-sandbox/src/components/ui/slider.tsx```

```tsx
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
```

## ```artifacts/mockup-sandbox/src/components/ui/sonner.tsx```

```tsx
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```

## ```artifacts/mockup-sandbox/src/components/ui/spinner.tsx```

```tsx
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
```

## ```artifacts/mockup-sandbox/src/components/ui/switch.tsx```

```tsx
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

## ```artifacts/mockup-sandbox/src/components/ui/table.tsx```

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/tabs.tsx```

```tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

## ```artifacts/mockup-sandbox/src/components/ui/textarea.tsx```

```tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
```

## ```artifacts/mockup-sandbox/src/components/ui/toast.tsx```

```tsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
```

## ```artifacts/mockup-sandbox/src/components/ui/toaster.tsx```

```tsx
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```

## ```artifacts/mockup-sandbox/src/components/ui/toggle-group.tsx```

```tsx
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
```

## ```artifacts/mockup-sandbox/src/components/ui/toggle.tsx```

```tsx
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
```

## ```artifacts/mockup-sandbox/src/components/ui/tooltip.tsx```

```tsx
"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

## ```artifacts/mockup-sandbox/src/hooks/use-mobile.tsx```

```tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

## ```artifacts/mockup-sandbox/src/hooks/use-toast.ts```

```ts
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

## ```artifacts/mockup-sandbox/src/index.css```

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));
  --color-sidebar: hsl(var(--sidebar));
  --color-sidebar-foreground: hsl(var(--sidebar-foreground));
  --color-sidebar-primary: hsl(var(--sidebar-primary));
  --color-sidebar-primary-foreground: hsl(var(--sidebar-primary-foreground));
  --color-sidebar-accent: hsl(var(--sidebar-accent));
  --color-sidebar-accent-foreground: hsl(var(--sidebar-accent-foreground));
  --color-sidebar-border: hsl(var(--sidebar-border));
  --color-sidebar-ring: hsl(var(--sidebar-ring));

  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --text-2xl: 1.5rem;
  --text-2xl--line-height: calc(2 / 1.5);
  --text-3xl: 1.875rem;
  --text-3xl--line-height: calc(2.25 / 1.875);
  --text-4xl: 2.25rem;
  --text-4xl--line-height: calc(2.5 / 2.25);
  --text-5xl: 3rem;
  --text-5xl--line-height: 1;
  --text-6xl: 3.75rem;
  --text-6xl--line-height: 1;
  --text-7xl: 4.5rem;
  --text-7xl--line-height: 1;
  --text-8xl: 6rem;
  --text-8xl--line-height: 1;
  --text-9xl: 8rem;
  --text-9xl--line-height: 1;
}

/* LIGHT MODE - Default theme with placeholder values */
:root {
  --button-outline: rgba(0,0,0, .10);
  --badge-outline: rgba(0,0,0, .05);
  --opaque-button-border-intensity: -8;

  --elevate-1: rgba(0,0,0, .03);
  --elevate-2: rgba(0,0,0, .08);

  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  --sidebar: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-primary: 240 5.9% 10%;
  --sidebar-primary-foreground: 0 0% 98%;
  --sidebar-accent: 240 4.8% 95.9%;
  --sidebar-accent-foreground: 240 5.9% 10%;
  --sidebar-border: 220 13% 91%;
  --sidebar-ring: 240 5.9% 10%;

  --font-sans: 'Inter', sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: Menlo, monospace;
  --radius: .5rem;
  --spacing: 0.25rem;
}

/* DARK MODE */
.dark {
  --button-outline: rgba(255,255,255, .10);
  --badge-outline: rgba(255,255,255, .05);
  --opaque-button-border-intensity: 9;

  --elevate-1: rgba(255,255,255, .04);
  --elevate-2: rgba(255,255,255, .09);

  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
  --chart-1: 220 70% 50%;
  --chart-2: 160 60% 45%;
  --chart-3: 30 80% 55%;
  --chart-4: 280 65% 60%;
  --chart-5: 340 75% 55%;
  --sidebar: 240 5.9% 10%;
  --sidebar-foreground: 240 4.8% 95.9%;
  --sidebar-primary: 224.3 76.3% 48%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 240 3.7% 15.9%;
  --sidebar-accent-foreground: 240 4.8% 95.9%;
  --sidebar-border: 240 3.7% 15.9%;
  --sidebar-ring: 240 4.9% 83.9%;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
}

@layer utilities {
  /* Hide ugly search cancel button in Chrome */
  input[type="search"]::-webkit-search-cancel-button {
    @apply hidden;
  }

  /* Placeholder styling for contentEditable div */
  [contenteditable][data-placeholder]:empty::before {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
  }
}
```

## ```artifacts/mockup-sandbox/src/lib/utils.ts```

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## ```artifacts/mockup-sandbox/src/main.tsx```

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

## ```artifacts/mockup-sandbox/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*", "mockupPreviewPlugin.ts", "vite.config.ts"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "noEmit": true,
    "lib": ["es2022", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## ```artifacts/mockup-sandbox/vite.config.ts```

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    mockupPreviewPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
```

## ```artifacts/offline-mind/.replit-artifact/artifact.toml```

```toml
kind = "web"
previewPath = "/"
title = "OFFLINE MIND"
description = "A calm, privacy-conscious mental-health information and self-help resource for people in Morocco, with practical guides, tools, and clear next steps."
version = "1.0.0"
id = "artifacts/offline-mind"
router = "path"

[[services]]
name = "web"
paths = [ "/" ]
localPort = 21949

[services.development]
run = "pnpm --filter @workspace/offline-mind run dev"

[services.production]
build = [ "pnpm", "--filter", "@workspace/offline-mind", "run", "build" ]
serve = "static"
publicDir = "artifacts/offline-mind/dist/public"

[[services.production.rewrites]]
from = "/*"
to = "/index.html"

[services.env]
PORT = "21949"
BASE_PATH = "/"
```

## ```artifacts/offline-mind/components.json```

```json
{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "",
      "css": "src/index.css",
      "baseColor": "neutral",
      "cssVariables": true,
      "prefix": ""
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils",
      "ui": "@/components/ui",
      "lib": "@/lib",
      "hooks": "@/hooks"
    }
}
```

## ```artifacts/offline-mind/index.html```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>OFFLINE MIND</title>
    <meta name="description" content="OFFLINE MIND — built on Replit. Update this description to reflect the app." />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="OFFLINE MIND" />
    <meta property="og:description" content="OFFLINE MIND — built on Replit. Update this description to reflect the app." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="OFFLINE MIND" />
    <meta name="twitter:description" content="OFFLINE MIND — built on Replit. Update this description to reflect the app." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## ```artifacts/offline-mind/package.json```

```json
{
  "name": "@workspace/offline-mind",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-aspect-ratio": "^1.1.3",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-collapsible": "^1.1.4",
    "@radix-ui/react-context-menu": "^2.2.7",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-hover-card": "^1.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-menubar": "^1.1.7",
    "@radix-ui/react-navigation-menu": "^1.2.6",
    "@radix-ui/react-popover": "^1.1.7",
    "@radix-ui/react-progress": "^1.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-separator": "^1.1.3",
    "@radix-ui/react-slider": "^1.2.4",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.4",
    "@radix-ui/react-tabs": "^1.1.4",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-toggle": "^1.1.3",
    "@radix-ui/react-toggle-group": "^1.1.3",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "@workspace/api-client-react": "workspace:*",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "catalog:",
    "input-otp": "^1.4.2",
    "lucide-react": "catalog:",
    "next-themes": "^0.4.6",
    "react": "catalog:",
    "react-day-picker": "^9.11.1",
    "react-dom": "catalog:",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.2",
    "sonner": "^2.0.7",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "vite": "catalog:",
    "wouter": "^3.3.5",
    "zod": "catalog:"
  },
  "dependencies": {
    "react-router-dom": "^7.18.4"
  }
}
```

## ```artifacts/offline-mind/public/favicon.svg```

```svg
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="180" height="180" rx="36" fill="#FF3C00"/>
</svg>
```

## ```artifacts/offline-mind/public/robots.txt```

```text
User-agent: *
Allow: /
```

## ```artifacts/offline-mind/src/App.tsx```

```tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, Clock3, Compass, HeartHandshake, Menu, Pause, Play, RotateCcw, Search, ShieldCheck, X } from 'lucide-react';
import { Logo } from './components/Logo';
import { feelings } from './data/feelings';
import type { FeelingGuideData } from './data/types';
import { situations } from './data/situations';
import { topics } from './data/topics';
import { faq } from './data/faq';
import { toolCards } from './data/tools';
import { resourceCategories, resources } from './data/resources';

const nav = [{label:'Home',to:'/'},{label:"What I'm Feeling",to:'/feelings'},{label:'Situations',to:'/situations'},{label:'Learn',to:'/learn'},{label:'Tools',to:'/tools'},{label:'Find Help',to:'/find-help'}];

function Meta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} — OFFLINE MIND`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.append(meta); }
    meta.setAttribute('content', description);
  }, [title, description]);
  return null;
}
function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return <><a className="skip-link" href="#main">Skip to content</a><header className="site-header">
    <div className="page-wrap header-inner"><div className="logo-plate"><Logo /></div>
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(item => <Link key={item.to} to={item.to} data-testid={`nav-${item.label.toLowerCase().replaceAll(/[^a-z]+/g,'-')}`} className={location.pathname===item.to?'nav-link active':'nav-link'}>{item.label}</Link>)}</nav>
      <Link to="/urgent-help" className="urgent-nav" data-testid="nav-urgent-help"><HeartHandshake size={16}/> Urgent help</Link>
      <button className="menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)} data-testid="button-mobile-menu">{open?<X/>:<Menu/>}</button>
    </div>
    {open && <nav className="mobile-nav page-wrap" aria-label="Mobile navigation">{nav.map(item=><Link key={item.to} to={item.to} className="mobile-nav-link" data-testid={`mobile-${item.label.toLowerCase().replaceAll(/[^a-z]+/g,'-')}`}>{item.label}<ArrowRight size={16}/></Link>)}<Link to="/urgent-help" className="mobile-nav-link urgent-mobile" data-testid="mobile-urgent-help">Urgent help<ArrowRight size={16}/></Link></nav>}
  </header><main id="main"><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/feelings" element={<Feelings/>}/><Route path="/feelings/:slug" element={<FeelingDetail/>}/>
    <Route path="/situations" element={<Situations/>}/><Route path="/situations/:slug" element={<SituationDetail/>}/>
    <Route path="/learn" element={<Learn/>}/><Route path="/learn/:slug" element={<LearnDetail/>}/>
    <Route path="/faq" element={<FAQPage/>}/><Route path="/tools" element={<Tools/>}/>
    <Route path="/find-help" element={<FindHelp/>}/><Route path="/urgent-help" element={<UrgentHelp/>}/>
    <Route path="/about" element={<About/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></main><Footer/></>;
}
function Footer(){return <footer className="footer"><div className="page-wrap footer-grid"><div><div className="logo-plate"><Logo/></div><p>A quiet place to understand what you're going through.</p><small>Information and self-help, not a substitute for professional care.</small></div><div><b>Explore</b><Link to="/feelings">What I'm feeling</Link><Link to="/situations">Situations</Link><Link to="/learn">Learn</Link></div><div><b>Next steps</b><Link to="/tools">Tools</Link><Link to="/find-help">Find help</Link><Link to="/urgent-help">Urgent help</Link><Link to="/about">About & privacy</Link></div></div><div className="page-wrap footer-bottom"><span>OFFLINE MIND</span><span>Made for a quieter next step.</span></div></footer>}
function LinkButton({to,children,light=false}: {to:string;children:React.ReactNode;light?:boolean}) {return <Link to={to} className={`button ${light?'button-light':''}`} data-testid={`link-cta-${to.replaceAll('/','-')}`}>{children}<ArrowRight size={17}/></Link>}
function PageHeading({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}){return <div className="page-heading fade-up"><span className="eyebrow">{eyebrow}</span><h1 className="section-title">{title}</h1><p>{copy}</p></div>}
function Home(){return <><Meta title="A quiet place to begin" description="Understand what you may be feeling, try a practical step, and find support. A private, calm resource for people in Morocco."/>
  <section className="hero"><div className="page-wrap hero-grid"><div className="hero-copy fade-up"><span className="eyebrow">A quieter place to begin</span><h1 className="display">You don't have to have the words <i>for it.</i></h1><p>A quiet place to understand what you're feeling, find something that can help, and know what to do next.</p><div className="hero-actions"><LinkButton to="/feelings">Start here</LinkButton><Link to="/learn" className="text-link" data-testid="link-explore-resources">Explore resources <ArrowRight size={16}/></Link></div><div className="privacy-note"><ShieldCheck size={16}/> Private by design. No account, no tracking.</div></div><div className="hero-art" aria-label="An open, calm space"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="sun-disc"></div><div className="art-caption">A pause is a place<br/>you can return to.</div><span className="art-index">01 / BEGIN ANYWHERE</span></div></div><a className="scroll-cue page-wrap" href="#begin">Scroll to explore <ArrowDown size={15}/></a></section>
  <section className="section section-soft" id="begin"><div className="page-wrap"><div className="split-heading"><div><span className="eyebrow">You can start without a label</span><h2 className="section-title">What are you<br/>going through?</h2></div><p>Choose what feels closest. Or choose “I don't know.” You don't need the perfect words.</p></div><div className="feeling-links">{feelings.map((feeling,i)=><Link to={`/feelings/${feeling.slug}`} key={feeling.slug} className={`feeling-link ${feeling.slug==='dont-know'?'feeling-unsure':''}`} data-testid={feeling.slug==='dont-know'?'feeling-home-unsure':`feeling-home-${feeling.slug}`}><span className="feeling-num">{String(i+1).padStart(2,'0')}</span><span>{feeling.label}</span><ArrowRight size={17}/></Link>)}</div><Link to="/feelings" className="underlined-link">See all feelings <ArrowRight size={16}/></Link></div></section>
  <section className="section"><div className="page-wrap"><div className="section-topline"><span className="eyebrow">Life, as it is</span><Link to="/situations" className="underlined-link">All situations <ArrowRight size={16}/></Link></div><h2 className="section-title max-w-[650px]">Sometimes the situation<br/>is easier to name.</h2><div className="situation-grid">{situations.slice(0,6).map((s,i)=><Link key={s.slug} to={`/situations/${s.slug}`} className="situation-item" data-testid={`situation-home-${s.slug}`}><span>0{i+1}</span><h3>{s.title}</h3><ArrowRight size={17}/></Link>)}</div></div></section>
  <section className="offline-band"><div className="page-wrap offline-band-inner"><div><span className="eyebrow">A small pause, right here</span><h2 className="section-title">One moment.<br/><i>One next step.</i></h2><p>Try a gentle breathing pause, find your bearings, or take five minutes without needing to achieve anything.</p><LinkButton to="/tools" light>Explore the tools</LinkButton></div><div className="breath-mark" aria-hidden="true"><div/><span>IN<br/>OUT</span></div></div></section>
  <section className="section section-soft"><div className="page-wrap"><div className="split-heading"><div><span className="eyebrow">Understand at your own pace</span><h2 className="section-title">A little more<br/>understanding.</h2></div><p>Clear, careful introductions to feelings and experiences. These are educational guides, not diagnoses.</p></div><div className="topic-row">{topics.slice(0,7).map((t,i)=><Link to={`/learn/${t.slug}`} key={t.slug} className="topic-link" data-testid={`topic-home-${t.slug}`}><span>0{i+1}</span>{t.title}<ArrowRight size={16}/></Link>)}</div><Link to="/learn" className="underlined-link">Browse all topics <ArrowRight size={16}/></Link></div></section>
  <section className="support-section"><div className="page-wrap support-grid"><div><span className="eyebrow">You don't have to work it out alone</span><h2 className="section-title">Finding support<br/>is a good next step.</h2><p>Explore what different kinds of support can mean, and what questions you might ask when looking for care in Morocco.</p><LinkButton to="/find-help" light>Find support</LinkButton></div><div className="support-note"><span className="note-mark"><Compass/></span><h3>Built for real support.</h3><p>Our directory is being prepared carefully. Records will appear only after their details can be checked.</p><span className="note-status"><span/> No unverified listings shown as recommendations</span></div></div></section>
  <section className="urgent-strip"><div className="page-wrap urgent-inner"><div><span className="eyebrow">If this cannot wait</span><h2>Do you need help right now?</h2><p>If you or someone else may be in immediate danger, seek urgent in-person support.</p></div><Link to="/urgent-help" className="urgent-button" data-testid="link-urgent-home">I need help right now <ArrowRight size={17}/></Link></div></section>
  <section className="section mission"><div className="reading-width"><span className="eyebrow">Why OFFLINE MIND exists</span><h2 className="section-title">Some days, the first step is finding a word.</h2><p>People do not always have language for what they are carrying. OFFLINE MIND is here to make it easier to understand a little, try one practical thing, recognize when professional care may help, and find real support.</p><Link to="/about" className="underlined-link">A little more about us <ArrowRight size={16}/></Link></div></section>
</>}

function SearchInput({value,onChange,placeholder='Search'}:{value:string;onChange:(value:string)=>void;placeholder?:string}){return <label className="search-field"><Search size={18}/><span className="sr-only">{placeholder}</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} data-testid="input-search"/>{value&&<button type="button" onClick={()=>onChange('')} aria-label="Clear search" data-testid="button-clear-search"><X size={16}/></button>}</label>}
function GridPage({kind}:{kind:'feelings'|'situations'|'learn'}) {
 const [query,setQuery]=useState('');
  const configs={feelings:{title:'What are you feeling?',eyebrow:'Start with what feels closest',copy:"You don't need the perfect words. Start with whatever feels closest.",items:feelings,href:'/feelings',desc:'Feeling guides'},situations:{title:'Situations',eyebrow:'A moment, a problem, a next step',copy:'Find a guide for something happening in your life right now. You can start exactly where you are.',items:situations,href:'/situations',desc:'Situation guides'},learn:{title:'Learn',eyebrow:'Clear, careful introductions',copy:'Explore topics at your own pace. These pages offer general information, not diagnosis or individual medical advice.',items:topics,href:'/learn',desc:'Learning topics'}} as const;
 const c=configs[kind];
 const all = kind==='feelings'
   ? feelings.map(item=>({slug:item.slug,title:item.label,description:item.shortDescription}))
  : kind==='situations'
   ? situations.map(item=>({slug:item.slug,title:item.title,description:item.short}))
   : topics.map(item=>({slug:item.slug,title:item.title,description:item.summary}));
 const filtered=all.filter(item=>`${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
 return <><Meta title={c.title} description={c.copy}/><section className="section listing-page"><div className="page-wrap"><PageHeading eyebrow={c.eyebrow} title={c.title} copy={c.copy}/><div className="listing-controls"><SearchInput value={query} onChange={setQuery} placeholder={`Search ${c.desc.toLowerCase()}`}/><span data-testid="text-result-count">{filtered.length} {filtered.length===1?'guide':'guides'}</span></div>{filtered.length?<div className="listing-grid">{filtered.map((item,i)=><Link to={`${c.href}/${item.slug}`} key={item.slug} className="listing-card" data-testid={`card-${kind}-${item.slug}`}><span className="card-index">{String(i+1).padStart(2,'0')}</span><h2>{item.title}</h2><p>{item.description}</p><span className="card-action">Open guide <ArrowRight size={16}/></span></Link>)}</div>:<div className="empty-state" data-testid="status-no-results"><span className="eyebrow">Nothing found yet</span><h2>Try another word.</h2><p>Search with a shorter phrase, or clear your search to see every guide.</p><button className="text-link" onClick={()=>setQuery('')} data-testid="button-reset-search">Clear search</button></div>}</div></section><section className="next-strip"><div className="page-wrap"><p>Not sure where to begin? “I don't know” is a place to start, too.</p><Link to="/tools" className="underlined-link">Try a practical tool <ArrowRight size={16}/></Link></div></section></>;
}
function Feelings(){return <GridPage kind="feelings"/>} function Situations(){return <GridPage kind="situations"/>} function Learn(){return <GridPage kind="learn"/>}
function RelatedLinks({items,base}:{items:string[];base:string}) {return <div className="related-links">{items.map((s,i)=><Link key={`${s}-${i}`} to={s==='Find support'?'/find-help':s==='Learn'?'/learn':s==='Grounding exercise'?'/tools#grounding':s==='Private journaling prompts'?'/tools#journal':s==='OFFLINE MOMENT'?'/tools#offline-moment':`${base}/${s}`} data-testid={`link-related-${i}`}>{s}<ArrowRight size={15}/></Link>)}</div>}
function FeelingDetail(){const {slug=''}=useParams();const feeling=feelings.find(item=>item.slug===slug);if(!feeling)return <NotFound/>;return <FeelingGuide feeling={feeling}/>}
function FeelingGuide({feeling}:{feeling:FeelingGuideData}){return <><Meta title={feeling.title} description={feeling.introduction}/><article className="article-page"><div className="reading-width"><Link to="/feelings" className="back-link"><ArrowLeft size={16}/> All feelings</Link><span className="eyebrow">A feeling guide</span><h1 className="article-title">{feeling.title}</h1><p className="article-lede">{feeling.introduction}</p><div className="gentle-note"><ShieldCheck size={18}/><p>This guide offers general information, not diagnosis. A feeling on its own cannot tell you what condition someone has.</p></div>{feeling.startingPoints&&<section className="article-section feeling-starting-points"><span className="eyebrow">A place to begin</span><h2>Words that might feel close</h2><ul className="starting-point-list">{feeling.startingPoints.map(point=><li key={point}>{point}</li>)}</ul><p>These are only starting words, not a test or a result. You can skip them or choose none.</p></section>}<GuideSection n="01" title="What might be happening" body={feeling.whatMightBeHappening}/><ListSection n="02" title="What you can try right now" items={feeling.thingsToTry}/><ListSection n="03" title="What may help over the next few days" items={feeling.nextFewDays}/><GuideSection n="04" title="When professional help may be useful" body={feeling.professionalHelp}/>{feeling.urgentHelpRelevant&&<div className="article-urgent"><b>If safety cannot wait</b><p>If you or someone else may be in immediate danger, seek urgent in-person support now.</p><Link to="/urgent-help" className="underlined-link">Urgent help information <ArrowRight size={15}/></Link></div>}<GuideSection n="05" title="Related situations" body="You might find a practical guide for one of these moments."/><div className="related-links">{feeling.relatedSituations.map(slug=>{const situation=situations.find(item=>item.slug===slug);return situation?<Link to={`/situations/${situation.slug}`} key={situation.slug}>{situation.title}<ArrowRight size={15}/></Link>:null})}</div><GuideSection n="06" title="Related tools" body="Optional tools for a small, practical next step."/><div className="related-links">{feeling.relatedTools.map(tool=><Link to={tool.href} key={tool.href}>{tool.label}<ArrowRight size={15}/></Link>)}</div></div></article></>}
function SituationDetail(){const {slug=''}=useParams();const item=situations.find(s=>s.slug===slug);if(!item)return <NotFound/>;return <><Meta title={item.title} description={item.might}/><article className="article-page"><div className="reading-width"><Link to="/situations" className="back-link"><ArrowLeft size={16}/> All situations</Link><span className="eyebrow">A situation guide</span><h1 className="article-title">{item.title}</h1><p className="article-lede">You can take this one moment at a time. You do not have to solve the whole situation today.</p><GuideSection n="01" title="What might be happening?" body={item.might}/><ListSection n="02" title="What can I do right now?" items={item.now}/><GuideSection n="03" title="Try this" body={item.tryThis}/><section className="article-section"><span className="eyebrow">04 / Common questions</span><h2>Common questions</h2>{item.questions.map((q,i)=><details className="accordion-item" key={q.question}><summary>{q.question}<ChevronDown size={18}/></summary><p>{q.answer}</p></details>)}</section><GuideSection n="05" title="When should I seek professional help?" body={item.professional}/>{item.urgent&&<div className="article-urgent"><b>Immediate safety matters.</b><p>If anyone may be in immediate danger, seek urgent in-person support.</p><Link to="/urgent-help" className="underlined-link">Urgent help <ArrowRight size={15}/></Link></div>}<GuideSection n="06" title="Related resources" body="Understanding a feeling can sometimes make the next step clearer."/><RelatedLinks items={['Find support','Grounding exercise','Learn']} base="/learn"/></div></article></>}
function LearnDetail(){const {slug=''}=useParams();const topic=topics.find(t=>t.slug===slug);if(!topic)return <NotFound/>;return <><Meta title={topic.title} description={topic.summary}/><article className="article-page"><div className="reading-width"><Link to="/learn" className="back-link"><ArrowLeft size={16}/> All topics</Link><span className="eyebrow">Learning, not diagnosis</span><h1 className="article-title">{topic.title}</h1><p className="article-lede">{topic.summary}</p><div className="gentle-note"><ShieldCheck size={18}/><p>Educational information only. It cannot determine what is happening for you or replace professional care.</p></div>{topic.sections.map((section,i)=><GuideSection key={section.heading} n={`0${i+1}`} title={section.heading} body={section.body}/>)}<div className="review-note"><Clock3 size={17}/><span>{topic.lastReviewed}. Sources are not yet listed; this page is a general introduction.</span></div><GuideSection n="04" title="Related tools" body="Try one small, optional exercise."/><RelatedLinks items={['Grounding exercise','OFFLINE MOMENT']} base="/tools"/><GuideSection n="05" title="Related situations" body="A practical guide for a difficult moment."/><RelatedLinks items={['too-much-pressure','asking-for-help']} base="/situations"/></div></article></>}
function GuideSection({n,title,body}:{n:string;title:string;body:string}){return <section className="article-section"><span className="eyebrow">{n} / A place to begin</span><h2>{title}</h2><p>{body}</p></section>}
function ListSection({n,title,items}:{n:string;title:string;items:string[]}){return <section className="article-section"><span className="eyebrow">{n} / Choose what fits</span><h2>{title}</h2><ol className="step-list">{items.map((item,i)=><li key={item}><span>{String(i+1).padStart(2,'0')}</span><p>{item}</p></li>)}</ol></section>}
function FAQPage(){const [query,setQuery]=useState('');const shown=faq.filter(f=>`${f.question} ${f.answer}`.toLowerCase().includes(query.toLowerCase()));return <><Meta title="Frequently asked questions" description="Search thoughtful, non-judgmental answers to common questions about feelings, support, and next steps."/><section className="section faq-page"><div className="reading-width"><PageHeading eyebrow="A few clear answers" title="Questions, met gently." copy="Search for a question, or browse them all. These general answers cannot replace care tailored to you."/><SearchInput value={query} onChange={setQuery} placeholder="Search questions"/><div className="faq-list" data-testid="faq-results">{shown.map((item,i)=><details className="accordion-item" key={item.question}><summary data-testid={`faq-question-${i}`}>{item.question}<ChevronDown size={18}/></summary><p>{item.answer}</p></details>)}</div>{!shown.length&&<div className="empty-state"><h2>No answer found for that phrase.</h2><p>Try another search, or clear the field to browse the questions.</p><button className="text-link" onClick={()=>setQuery('')} data-testid="button-faq-clear">Clear search</button></div>}<p className="faq-footnote">If you think you may be in immediate danger, visit <Link to="/urgent-help">Urgent Help</Link>.</p></div></section></>}

function Tools(){return <><Meta title="Practical tools" description="Try a breathing exercise, grounding, a five-minute reset, private journaling prompts, or a gentle mood check-in."/><section className="section tools-page"><div className="page-wrap"><PageHeading eyebrow="Small steps, when they help" title="Tools for this moment." copy="These are invitations, not tasks. Choose one that feels okay; you can stop at any time."/><div className="tool-layout"><aside className="tool-aside"><span className="eyebrow">A note on privacy</span><p>Journal writing stays in this page's memory only. It is not saved in your browser or sent anywhere.</p><p>Nothing here scores, diagnoses, or tracks you.</p><div className="tool-aside-mark"><span></span><span></span><span></span><span></span></div></aside><div className="tool-stack"><BreathingTool/><GroundingTool/><OfflineMoment/><JournalTool/><MoodTool/></div></div></div></section></>}
function ToolHeader({number,title,description}:{number:string;title:string;description:string}){return <div className="tool-heading"><span className="tool-number">{number}</span><div><h2>{title}</h2><p>{description}</p></div></div>}
function BreathingTool(){const [running,setRunning]=useState(false);const [seconds,setSeconds]=useState(0);useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(s=>s+1),1000);return()=>window.clearInterval(id)},[running]);const phase=seconds%10<4?'Breathe in':seconds%10<6?'Pause':'Breathe out';return <section className="tool-panel" id="breathing"><ToolHeader number="01" title="Breathing exercise" description="A gentle rhythm: in for four, pause for two, out for four. Keep your breath comfortable."/><div className="breathing-content"><div className={`breath-circle ${running?'breath-active':''}`} aria-live="polite"><span>{running?phase:'Ready when you are'}</span><small>{running?`${seconds%10<4?4-seconds%10:seconds%10<6?6-seconds%10:10-seconds%10}s`: 'No need to change your breath'}</small></div><div className="tool-controls"><button className="button" onClick={()=>setRunning(!running)} data-testid="button-breath-toggle">{running?<><Pause size={16}/> Pause</>:<><Play size={16}/> Begin</>}</button>{seconds>0&&<button className="icon-button" onClick={()=>{setRunning(false);setSeconds(0)}} aria-label="Reset breathing exercise" data-testid="button-breath-reset"><RotateCcw size={17}/></button>}</div></div></section>}
const groundingSteps=['Name five things you can see.','Notice four things you can feel against your body.','Listen for three sounds.','Notice two scents, or two things you like the smell of.','Name one thing you can taste, or one taste you remember.'];
function GroundingTool(){const [checked,setChecked]=useState<number[]>([]);return <section className="tool-panel" id="grounding"><ToolHeader number="02" title="Grounding exercise" description="Take your time. If any step is not comfortable, skip it."/><div className="check-steps">{groundingSteps.map((step,i)=><button key={step} className={`check-step ${checked.includes(i)?'checked':''}`} onClick={()=>setChecked(checked.includes(i)?checked.filter(x=>x!==i):[...checked,i])} aria-pressed={checked.includes(i)} data-testid={`button-grounding-step-${i+1}`}><span>{checked.includes(i)?<Check size={16}/>:String(i+1).padStart(2,'0')}</span>{step}</button>)}</div><button className="quiet-button" onClick={()=>setChecked([])} data-testid="button-grounding-reset">Start again <RotateCcw size={14}/></button><p className="tool-feedback" aria-live="polite">{checked.length===5?'You made it through the five steps. Take whatever pause you need.':`${checked.length} of 5 steps, at your own pace.`}</p></section>}
const momentSteps=['Take a slow breath.','Put both feet on the floor.','Look around you.','Relax your shoulders.','Take a sip of water if you have some.','Write down one thought.','Decide on one small next step.'];
function OfflineMoment(){const [step,setStep]=useState(0);return <section className="tool-panel moment-panel" id="offline-moment"><ToolHeader number="03" title="OFFLINE MOMENT" description="Five minutes to pause. No score, no streak, no need to finish."/><div className="moment-card"><span className="eyebrow">STEP {String(step+1).padStart(2,'0')} OF 07</span><p>{momentSteps[step]}</p><div className="moment-progress" aria-label={`${step+1} of 7 steps`}><span style={{width:`${((step+1)/7)*100}%`}}/></div><div className="moment-controls"><button className="quiet-button" disabled={step===0} onClick={()=>setStep(Math.max(0,step-1))} data-testid="button-moment-back"><ArrowLeft size={15}/> Previous</button><button className="button" onClick={()=>setStep(step===6?0:step+1)} data-testid="button-moment-next">{step===6?'Begin again':'Next step'} <ArrowRight size={16}/></button></div></div></section>}
const prompts=['What feels most present for me right now?','What is one thing I wish someone understood?','What is within my control today, even in a small way?','What would feel kind to myself in this moment?'];
function JournalTool(){const [text,setText]=useState('');const [prompt,setPrompt]=useState(0);return <section className="tool-panel" id="journal"><ToolHeader number="04" title="Private journaling" description="A prompt can offer a place to start. Keep it brief, or write as much as you like."/><div className="prompt-box"><span className="eyebrow">A prompt to begin</span><p>{prompts[prompt]}</p><button className="text-link" onClick={()=>setPrompt((prompt+1)%prompts.length)} data-testid="button-journal-prompt">Another prompt <RotateCcw size={14}/></button></div><label className="sr-only" htmlFor="journal-entry">Your private writing</label><textarea id="journal-entry" value={text} onChange={e=>setText(e.target.value)} placeholder="Write here, just for yourself…" rows={6} data-testid="input-journal"/><div className="journal-footer"><span><ShieldCheck size={15}/> Only held in this page while it is open</span><button className="quiet-button" onClick={()=>setText('')} disabled={!text} data-testid="button-journal-clear">Clear writing <X size={14}/></button></div></section>}
function MoodTool(){const [mood,setMood]=useState('');const [note,setNote]=useState('');const options=['Very hard','Hard','In between','Okay','Good'];return <section className="tool-panel" id="mood"><ToolHeader number="05" title="Mood check-in" description="A moment of noticing, not a test. There are no right answers."/><p className="mood-question">How does this moment feel to you?</p><div className="mood-options" role="group" aria-label="Choose how this moment feels">{options.map((label,i)=><button key={label} onClick={()=>setMood(label)} aria-pressed={mood===label} className={`mood-option ${mood===label?'selected':''}`} data-testid={`button-mood-${i+1}`}><span>{String(i+1).padStart(2,'0')}</span>{label}</button>)}</div>{mood&&<div className="mood-reflection" data-testid="mood-reflection"><b>You noticed: {mood.toLowerCase()}.</b><p>Would it help to name one thing you need right now?</p><label className="sr-only" htmlFor="mood-note">One thing you need</label><input id="mood-note" value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional, just for you" data-testid="input-mood-note"/><button className="quiet-button" onClick={()=>{setMood('');setNote('')}} data-testid="button-mood-reset">Clear check-in <X size={14}/></button></div>}</section>}
function FindHelp(){const [category,setCategory]=useState('All types');const cats=['All types',...resourceCategories];const visible=resources.filter(r=>category==='All types'||r.type===category);return <><Meta title="Find support" description="Learn about the kinds of support to consider in Morocco. The directory is awaiting verified local resource information."/><section className="section help-page"><div className="page-wrap"><PageHeading eyebrow="Support in Morocco" title="Finding the right support." copy="You deserve clear information when looking for support. This directory is being prepared carefully; no local records are published until they can be checked."/><div className="help-banner"><ShieldCheck/><div><b>Directory status: preparing verified listings</b><p>No professionals or organizations are currently listed. We will not invent names, phone numbers, addresses, or services.</p></div></div><div className="directory-layout"><div className="directory-main"><label className="filter-label" htmlFor="resource-category">Explore by type</label><select id="resource-category" value={category} onChange={e=>setCategory(e.target.value)} data-testid="select-resource-category">{cats.map(c=><option key={c}>{c}</option>)}</select>{visible.length?visible.map((r,i)=><article className="resource-card" key={r.name}><span className="eyebrow">{r.type}</span><h2>{r.name}</h2><span className="status-pill">Unverified placeholder</span><p>{r.city}</p></article>):<div className="empty-directory" data-testid="resource-empty"><Compass size={26}/><h2>{category==='All types'?'A careful directory takes time.':'No listings in this category yet.'}</h2><p>Resource records will be added only when names, services, location, contact details, and source information can be verified.</p><span>All future records will be clearly labelled until verification is complete.</span></div>}</div><aside className="directory-aside"><span className="eyebrow">Types we aim to include</span>{resourceCategories.map(c=><span key={c} className="category-row">{c}<ArrowRight size={14}/></span>)}<p>Resource fields are structured for name, type, city, address, phone, website, services, languages, verification status, date checked, and source.</p></aside></div><div className="help-caveat"><b>Need immediate support?</b><p>There is no verified Morocco-specific emergency information on this page. If you or someone else may be in immediate danger, seek urgent in-person support from a trusted person or appropriate local service.</p><Link to="/urgent-help" className="underlined-link">Read urgent help guidance <ArrowRight size={16}/></Link></div></div></section></>}
function UrgentHelp(){return <><Meta title="Urgent help" description="Clear, careful next steps when someone may be in immediate danger or unable to stay safe."/><section className="urgent-page"><div className="page-wrap"><div className="urgent-page-head"><span className="eyebrow">For a moment that cannot wait</span><h1 className="section-title">Your safety comes first.</h1><p>If you are in immediate danger, fear you may hurt yourself or someone else, or cannot keep yourself safe, seek urgent in-person support now.</p></div><div className="urgent-columns"><div className="urgent-actions"><h2>What you can do now</h2><ol className="step-list"><li><span>01</span><p>Move toward a safer place with another person, if you can.</p></li><li><span>02</span><p>Tell someone you trust clearly: “I don't feel safe being alone right now.”</p></li><li><span>03</span><p>Ask them to stay with you and help you reach urgent in-person support.</p></li><li><span>04</span><p>If someone else is at risk, stay with them if it is safe and involve a trusted adult or support person.</p></li></ol></div><aside className="urgent-warning"><HeartHandshake size={26}/><h2>Local details are not verified here.</h2><p>We do not publish guessed emergency numbers or unverified crisis contacts. If you are in immediate danger, contact a trusted person nearby and go to an appropriate local urgent service.</p><p>If making the call or journey feels difficult, ask someone to help you do it.</p></aside></div><div className="urgent-bottom"><b>You deserve help with this moment.</b><p>This website is not monitored and cannot provide emergency care.</p><Link to="/find-help" className="underlined-link">View directory status <ArrowRight size={15}/></Link></div></div></section></>}
function About(){return <><Meta title="About OFFLINE MIND" description="Why OFFLINE MIND exists, what it can offer, and how it treats privacy and professional care."/><section className="section about-page"><div className="reading-width"><PageHeading eyebrow="A little about us" title="Words for the days that don't have them." copy="OFFLINE MIND is a calm information and self-help resource, made with people in Morocco in mind."/><GuideSection n="01" title="What it is" body="A place to explore what you may be feeling, find practical ways to steady a moment, learn about experiences, and understand possible next steps toward support."/><GuideSection n="02" title="Why it exists" body="People do not always have the words to explain how they feel. We want the first step to feel possible, even when the feeling is difficult to name."/><GuideSection n="03" title="What it can help with" body="Our guides can help you reflect, try a small practical action, think about when professional care might be useful, and prepare to find real support."/><GuideSection n="04" title="What it is not" body="OFFLINE MIND is not a clinic, a diagnosis tool, a therapist, or a replacement for professional care. The information here is general and cannot tell you what is happening for you personally."/><GuideSection n="05" title="Privacy, by default" body="No account is needed. This frontend does not send journal entries anywhere or save them to browser storage. The site is designed without advertising, analytics, or tracking."/><GuideSection n="06" title="Why practical next steps matter" body="Understanding matters, and so does what comes next. Sometimes the useful next step is a breath, a conversation, a boundary, or professional support."/><div className="about-next"><Link to="/tools" className="underlined-link">Try a tool <ArrowRight size={15}/></Link><Link to="/find-help" className="underlined-link">Find support <ArrowRight size={15}/></Link></div></div></section></>}
function NotFound(){return <><Meta title="Page not found" description="This page is not here. Find your way back to OFFLINE MIND resources."/><section className="not-found"><div className="page-wrap"><span className="eyebrow">404 / A quiet wrong turn</span><h1 className="display">This page<br/>isn't here.</h1><p>It may have moved, or the address may not be quite right. You can begin again from here.</p><div className="hero-actions"><LinkButton to="/">Go to home</LinkButton><Link to="/feelings" className="text-link">Browse feelings <ArrowRight size={16}/></Link></div></div></section></>}
function App(){return <BrowserRouter><Shell/></BrowserRouter>}
export default App;
```

## ```artifacts/offline-mind/src/components/Logo.tsx```

```tsx
import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return <Link to="/" aria-label="OFFLINE MIND home" data-testid="link-logo" className={`inline-flex items-center ${className}`}>
    <img src="/Brand/offline-mind-black.png" alt="OFFLINE MIND" className="block w-[118px] h-auto object-contain" />
  </Link>;
}
```

## ```artifacts/offline-mind/src/components/error-boundary.tsx```

```tsx
import {
  Component,
  type ComponentType,
  type ErrorInfo,
  type ReactNode,
} from 'react';

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  /** Changing this clears a caught error. Pass the route to recover on navigation. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  try {
    return new Error(JSON.stringify(value));
  } catch {
    return new Error(String(value));
  }
}

function DefaultFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          This part of the app hit an error. The rest of the app is still
          running.
        </p>
        {/* Dev only: messages can carry API responses and other internals. */}
        {import.meta.env.DEV ? (
          <pre className="mt-4 overflow-x-auto rounded bg-gray-100 p-3 text-left text-xs text-gray-800">
            {error.message || String(error)}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={resetError}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error: toError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error(
      'ErrorBoundary caught an error:',
      toError(error),
      info.componentStack,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.error !== null &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.resetError();
    }
  }

  resetError = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) {
      return this.props.children;
    }
    const Fallback = this.props.FallbackComponent ?? DefaultFallback;
    return <Fallback error={error} resetError={this.resetError} />;
  }
}
```

## ```artifacts/offline-mind/src/components/ui/accordion.tsx```

```tsx
import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

## ```artifacts/offline-mind/src/components/ui/alert-dialog.tsx```

```tsx
import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: 'outline' }),
      'mt-2 sm:mt-0',
      className,
    )}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
```

## ```artifacts/offline-mind/src/components/ui/alert.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
```

## ```artifacts/offline-mind/src/components/ui/aspect-ratio.tsx```

```tsx
import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };
```

## ```artifacts/offline-mind/src/components/ui/avatar.tsx```

```tsx
'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
```

## ```artifacts/offline-mind/src/components/ui/badge.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  // @replit
  // Whitespace-nowrap: Badges should never wrap.
  'whitespace-nowrap inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2' +
    ' hover-elevate ',
  {
    variants: {
      variant: {
        default:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-primary text-primary-foreground shadow-xs',
        secondary:
          // @replit no hover because we use hover-elevate
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          // @replit shadow-xs instead of shadow, no hover because we use hover-elevate
          'border-transparent bg-destructive text-destructive-foreground shadow-xs',
        // @replit shadow-xs" - use badge outline variable
        outline: 'text-foreground border [border-color:var(--badge-outline)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

## ```artifacts/offline-mind/src/components/ui/breadcrumb.tsx```

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { ChevronRight, MoreHorizontal } from 'lucide-react';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className,
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:w-3.5 [&>svg]:h-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
```

## ```artifacts/offline-mind/src/components/ui/button-group.tsx```

```tsx
import { Slot } from '@radix-ui/react-slot';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonGroupVariants = cva(
  "flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none',
        vertical:
          'flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  );
}

function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(
        "bg-muted shadow-xs flex items-center gap-2 rounded-md border px-4 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        'bg-input relative !m-0 self-stretch data-[orientation=vertical]:h-auto',
        className,
      )}
      {...props}
    />
  );
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
};
```

## ```artifacts/offline-mind/src/components/ui/button.tsx```

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0' +
    ' hover-elevate active-elevate-2',
  {
    variants: {
      variant: {
        default:
          // @replit: no hover, and add primary border
          'bg-primary text-primary-foreground border border-primary-border',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm border-destructive-border',
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          ' border [border-color:var(--button-outline)] shadow-xs active:shadow-none ',
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          'border bg-secondary text-secondary-foreground border border-secondary-border ',
        // @replit no hover, transparent border
        ghost: 'border border-transparent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // @replit changed sizes
        default: 'min-h-9 px-4 py-2',
        sm: 'min-h-8 rounded-md px-3 text-xs',
        lg: 'min-h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

## ```artifacts/offline-mind/src/components/ui/calendar.tsx```

```tsx
'use client';

import * as React from 'react';
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months,
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),
        month_caption: cn(
          'flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'bg-popover absolute inset-0 opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : '[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5',
          defaultClassNames.caption_label,
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-[--cell-size] select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          'text-muted-foreground select-none text-[0.8rem]',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day,
        ),
        range_start: cn(
          'bg-accent rounded-l-md',
          defaultClassNames.range_start,
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('bg-accent rounded-r-md', defaultClassNames.range_end),
        today: cn(
          'bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon className={cn('size-4', className)} {...props} />
            );
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon className={cn('size-4', className)} {...props} />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] [&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
```

## ```artifacts/offline-mind/src/components/ui/card.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
```

## ```artifacts/offline-mind/src/components/ui/carousel.tsx```

```tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = 'horizontal',
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
      },
      plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api) {
        return;
      }

      onSelect(api);
      api.on('reInit', onSelect);
      api.on('select', onSelect);

      return () => {
        api?.off('select', onSelect);
      };
    }, [api, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation:
            orientation || (opts?.axis === 'y' ? 'vertical' : 'horizontal'),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className,
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className,
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute  h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        'absolute h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? '-right-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
```

## ```artifacts/offline-mind/src/components/ui/chart.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import * as RechartsPrimitive from 'recharts';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: 'line' | 'dot' | 'dashed';
      nameKey?: string;
      labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn('font-medium', labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>;
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config,
      labelKey,
    ]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload
            .filter((item) => item.type !== 'none')
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || 'value'}`;
              const itemConfig = getPayloadConfigFromPayload(config, item, key);
              const indicatorColor = color || item.payload.fill || item.color;

              return (
                <div
                  key={item.dataKey}
                  className={cn(
                    'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                    indicator === 'dot' && 'items-center',
                  )}
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <div
                            className={cn(
                              'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                              {
                                'h-2.5 w-2.5': indicator === 'dot',
                                'w-1': indicator === 'line',
                                'w-0 border-[1.5px] border-dashed bg-transparent':
                                  indicator === 'dashed',
                                'my-0.5': nestLabel && indicator === 'dashed',
                              },
                            )}
                            style={
                              {
                                '--color-bg': indicatorColor,
                                '--color-border': indicatorColor,
                              } as React.CSSProperties
                            }
                          />
                        )
                      )}
                      <div
                        className={cn(
                          'flex flex-1 justify-between leading-none',
                          nestLabel ? 'items-end' : 'items-center',
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {item.value && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {item.value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center gap-4',
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className,
        )}
      >
        {payload
          .filter((item) => item.type !== 'none')
          .map((item) => {
            const key = `${nameKey || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            return (
              <div
                key={item.value}
                className={cn(
                  'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
                )}
              >
                {itemConfig?.icon && !hideIcon ? (
                  <itemConfig.icon />
                ) : (
                  <div
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                )}
                {itemConfig?.label}
              </div>
            );
          })}
      </div>
    );
  },
);
ChartLegendContent.displayName = 'ChartLegend';

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
```

## ```artifacts/offline-mind/src/components/ui/checkbox.tsx```

```tsx
import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('grid place-content-center text-current')}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
```

## ```artifacts/offline-mind/src/components/ui/collapsible.tsx```

```tsx
'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

## ```artifacts/offline-mind/src/components/ui/command.tsx```

```tsx
'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
```

## ```artifacts/offline-mind/src/components/ui/context-menu.tsx```

```tsx
import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        'z-50 max-h-[--radix-context-menu-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-context-menu-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ElementRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
```

## ```artifacts/offline-mind/src/components/ui/dialog.tsx```

```tsx
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg max-h-[85vh] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

## ```artifacts/offline-mind/src/components/ui/drawer.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Drawer as DrawerPrimitive } from 'vaul';

const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Drawer.displayName = 'Drawer';

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
    {...props}
  />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
```

## ```artifacts/offline-mind/src/components/ui/dropdown-menu.tsx```

```tsx
'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
```

## ```artifacts/offline-mind/src/components/ui/empty.tsx```

```tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance rounded-lg border-dashed p-6 text-center md:p-12',
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className,
      )}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm',
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
```

## ```artifacts/offline-mind/src/components/ui/field.tsx```

```tsx
'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-6',
        'has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-3 font-medium',
        'data-[variant=legend]:text-base',
        'data-[variant=label]:text-sm',
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4',
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  'group/field data-[invalid=true]:text-destructive flex w-full gap-3',
  {
    variants: {
      orientation: {
        vertical: ['flex-col [&>*]:w-full [&>.sr-only]:w-auto'],
        horizontal: [
          'flex-row items-center',
          '[&>[data-slot=field-label]]:flex-auto',
          'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start',
        ],
        responsive: [
          '@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto',
          '@md/field-group:[&>[data-slot=field-label]]:flex-auto',
          '@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
);

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'group/field-content flex flex-1 flex-col gap-1.5 leading-snug',
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>[data-slot=field]]:p-4',
        'has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10',
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium leading-snug group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-muted-foreground text-sm font-normal leading-normal group-has-[[data-orientation=horizontal]]/field:text-balance',
        'nth-last-2:-mt-1 last:mt-0 [[data-variant=legend]+&]:-mt-1.5',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-background text-muted-foreground relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors) {
      return null;
    }

    if (errors?.length === 1 && errors[0]?.message) {
      return errors[0].message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
```

## ```artifacts/offline-mind/src/components/ui/form.tsx```

```tsx
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
```

## ```artifacts/offline-mind/src/components/ui/hover-card.tsx```

```tsx
import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { cn } from '@/lib/utils';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-hover-card-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
```

## ```artifacts/offline-mind/src/components/ui/input-group.tsx```

```tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group border-input dark:bg-input/30 shadow-xs relative flex w-full items-center rounded-md border outline-none transition-[color,box-shadow]',
        'h-9 has-[>textarea]:h-auto',

        // Variants based on alignment.
        'has-[>[data-align=inline-start]]:[&>input]:pl-2',
        'has-[>[data-align=inline-end]]:[&>input]:pr-2',
        'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
        'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

        // Focus state.
        'has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot=input-group-control]:focus-visible]:ring-1',

        // Error state.
        'has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        'inline-start':
          'order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]',
        'inline-end':
          'order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]',
        'block-start':
          '[.border-b]:pb-3 order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5',
        'block-end':
          '[.border-t]:pt-3 order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'flex items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
        'icon-xs':
          'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
```

## ```artifacts/offline-mind/src/components/ui/input-otp.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-1 ring-ring',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
```

## ```artifacts/offline-mind/src/components/ui/input.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
```

## ```artifacts/offline-mind/src/components/ui/item.tsx```

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

function ItemGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  'group/item [a]:hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 [a]:transition-colors flex flex-wrap items-center rounded-md border border-transparent text-sm outline-none transition-colors duration-100 focus-visible:ring-[3px]',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border-border',
        muted: 'bg-muted/50',
      },
      size: {
        default: 'gap-4 p-4 ',
        sm: 'gap-2.5 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Item({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  );
}

const itemMediaVariants = cva(
  'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted size-8 rounded-sm border [&_svg:not([class*='size-'])]:size-4",
        image:
          'size-10 overflow-hidden rounded-sm [&_img]:size-full [&_img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function ItemMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        'flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none',
        className,
      )}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium leading-snug',
        className,
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground line-clamp-2 text-balance text-sm font-normal leading-normal',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        'flex basis-full items-center justify-between gap-2',
        className,
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
```

## ```artifacts/offline-mind/src/components/ui/kbd.tsx```

```tsx
import { cn } from '@/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium',
        "[&_svg:not([class*='size-'])]:size-3",
        '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
```

## ```artifacts/offline-mind/src/components/ui/label.tsx```

```tsx
'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

## ```artifacts/offline-mind/src/components/ui/menubar.tsx```

```tsx
import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm',
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]',
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref,
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-menubar-content-transform-origin]',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-4 w-4 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayname = 'MenubarShortcut';

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
```

## ```artifacts/offline-mind/src/components/ui/navigation-menu.tsx```

```tsx
import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      'relative z-10 flex max-w-max flex-1 items-center justify-center',
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      'group flex flex-1 list-none items-center justify-center space-x-1',
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent',
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ',
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in',
      className,
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
```

## ```artifacts/offline-mind/src/components/ui/pagination.tsx```

```tsx
import * as React from 'react';
import { ButtonProps, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
```

## ```artifacts/offline-mind/src/components/ui/popover.tsx```

```tsx
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
```

## ```artifacts/offline-mind/src/components/ui/progress.tsx```

```tsx
'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
```

## ```artifacts/offline-mind/src/components/ui/radio-group.tsx```

```tsx
import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn('grid gap-2', className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-3.5 w-3.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
```

## ```artifacts/offline-mind/src/components/ui/resizable.tsx```

```tsx
'use client';

import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className,
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
```

## ```artifacts/offline-mind/src/components/ui/scroll-area.tsx```

```tsx
import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
```

## ```artifacts/offline-mind/src/components/ui/select.tsx```

```tsx
'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1',
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
```

## ```artifacts/offline-mind/src/components/ui/separator.tsx```

```tsx
import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
```

## ```artifacts/offline-mind/src/components/ui/sheet.tsx```

```tsx
'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
```

## ```artifacts/offline-mind/src/components/ui/sidebar.tsx```

```tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { PanelLeftIcon } from 'lucide-react';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4))]'
            : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          // Adjust the padding for floating and inset variants.
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--spacing-4)+2px)]'
            : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<'button'>) {
  const { toggleSidebar } = useSidebar();

  // Note: Tailwind v3.4 doesn't support "in-" selectors. So the rail won't work perfectly.
  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'bg-background relative flex w-full flex-1 flex-col',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn('bg-background h-8 w-full shadow-none', className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('bg-sidebar-border mx-2 w-auto', className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'div'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:w-8! group-data-[collapsible=icon]:h-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === 'string') {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none',
        'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<'div'> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-[var(--skeleton-width)] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn('group/menu-sub-item relative', className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = 'md',
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline outline-2 outline-transparent outline-offset-2 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
```

## ```artifacts/offline-mind/src/components/ui/skeleton.tsx```

```tsx
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      {...props}
    />
  );
}

export { Skeleton };
```

## ```artifacts/offline-mind/src/components/ui/slider.tsx```

```tsx
import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
```

## ```artifacts/offline-mind/src/components/ui/sonner.tsx```

```tsx
'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
```

## ```artifacts/offline-mind/src/components/ui/spinner.tsx```

```tsx
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
```

## ```artifacts/offline-mind/src/components/ui/switch.tsx```

```tsx
import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
```

## ```artifacts/offline-mind/src/components/ui/table.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
      className,
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
```

## ```artifacts/offline-mind/src/components/ui/tabs.tsx```

```tsx
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

## ```artifacts/offline-mind/src/components/ui/textarea.tsx```

```tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
```

## ```artifacts/offline-mind/src/components/ui/toast.tsx```

```tsx
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive:
          'destructive group border-destructive bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
```

## ```artifacts/offline-mind/src/components/ui/toaster.tsx```

```tsx
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
```

## ```artifacts/offline-mind/src/components/ui/toggle-group.tsx```

```tsx
'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { toggleVariants } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn('flex items-center justify-center gap-1', className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
```

## ```artifacts/offline-mind/src/components/ui/toggle.tsx```

```tsx
import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline:
          'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-2 min-w-9',
        sm: 'h-8 px-1.5 min-w-8',
        lg: 'h-10 px-2.5 min-w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
```

## ```artifacts/offline-mind/src/components/ui/tooltip.tsx```

```tsx
'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]',
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

## ```artifacts/offline-mind/src/data/faq.ts```

```ts
export type FAQItem = { question: string; answer: string };
export const faq: FAQItem[] = [
 {question:'Why do I overthink everything at night?',answer:'Quiet moments can leave more room for thoughts to repeat. That does not tell you what is wrong. You could write the thought down, return to a low-pressure activity, or talk it through with someone you trust.'},
 {question:"Why do I feel lonely even when I'm around people?",answer:'Being physically near others does not always mean feeling understood or connected. Consider what kind of connection you are missing, and whether there is one person you could be more open with.'},
 {question:"Why don't I feel anything anymore?",answer:'Feeling numb or distant can have many possible reasons. You do not need to figure it out alone; if it persists or worries you, consider talking with a qualified professional.'},
 {question:'Why can’t I motivate myself?',answer:'Motivation can shift with stress, rest, health, and circumstances. Try making a task very small and consider whether you need support or a pause rather than more pressure.'},
 {question:'Can stress affect my sleep?',answer:'Stress and sleep can influence one another for some people. If sleep difficulty is persistent or affecting your days, consider discussing it with a qualified professional.'},
 {question:'Can anxiety cause physical symptoms?',answer:'Worry and intense feelings may be accompanied by physical sensations, but physical symptoms can have many causes. New, severe, or concerning symptoms should be discussed with a qualified health professional.'},
 {question:'How do I know if I should see a psychologist?',answer:'You can seek support whenever you want help understanding what you are experiencing or it is affecting your life. You do not need to wait until things feel unbearable.'},
 {question:'What happens during a first appointment with a psychologist?',answer:'It can vary. You might ask about the professional’s approach, confidentiality, cost, and what to expect. You can share at a pace that feels manageable.'},
 {question:'How can I help someone who is struggling?',answer:'Listen, show care without judgment, ask what would help, and encourage them to connect with qualified support. If there is immediate danger, seek urgent in-person help.'},
 {question:'What should I do if someone tells me they want to die?',answer:'Take them seriously, listen without judgment, and ask whether they are in immediate danger. Stay with them if it is safe and seek urgent in-person support. Do not promise to keep immediate danger secret.'},
 {question:'Is it normal to feel overwhelmed?',answer:'Many people feel overwhelmed at times. The feeling is real, and it can help to focus on one small step and ask for support.'},
 {question:"What can I do when I can't sleep?",answer:'Try lowering the pressure to sleep, and consider a quiet activity for a while. If the difficulty continues, a health professional can help explore it.'},
 {question:'How can I stop overthinking?',answer:'You may not be able to switch thoughts off instantly. Writing them down, grounding in the present, or choosing a time to revisit a concern can sometimes make it easier to shift attention.'},
 {question:'How do I deal with a breakup?',answer:'Give yourself time, reach out to someone you trust, and focus on basic care. If you feel unsafe or unable to cope, seek support from a qualified professional.'}
];
```

## ```artifacts/offline-mind/src/data/feelings.ts```

```ts
import type { FeelingGuideData } from './types';

const tools = {
  breathing: { label: 'Breathing exercise', href: '/tools#breathing' },
  grounding: { label: 'Grounding exercise', href: '/tools#grounding' },
  moment: { label: 'OFFLINE MOMENT', href: '/tools#offline-moment' },
  journaling: { label: 'Private journaling', href: '/tools#journal' },
};

export const feelings: FeelingGuideData[] = [
  {
    slug: 'anxiety',
    label: 'I feel anxious',
    title: 'Feeling anxious',
    shortDescription: 'A sense of worry, unease, or being on alert.',
    introduction: 'Anxiety can show up as worry, tension, restlessness, or a sense that something might go wrong. You do not need to know exactly why you feel this way to begin.',
    whatMightBeHappening: 'You might notice thoughts returning to what could happen, feel keyed up, or find it difficult to settle. These experiences can have many causes; they do not, by themselves, tell you that you have a disorder.',
    thingsToTry: ['Look around and name a few things you can see, without rushing.', 'Let your feet meet the floor and allow your next breath to be comfortable, not forced.', 'If it feels helpful, tell someone you trust that this is a difficult moment.'],
    nextFewDays: ['Write down what is within your control today and what can wait.', 'Keep one familiar part of your routine, while making room for rest.', 'Notice whether sharing the worry with someone supportive feels useful.'],
    professionalHelp: 'If worry is difficult to manage, continues to affect daily life, or you would like help making sense of it, talking with a qualified health professional may be useful.',
    relatedSituations: ['too-much-pressure', 'cant-sleep-tonight'],
    relatedTools: [tools.grounding, tools.breathing],
    urgentHelpRelevant: false,
  },
  {
    slug: 'feeling-down',
    label: 'I feel really down',
    title: 'Feeling very low',
    shortDescription: 'Feeling low, tender, or weighed down.',
    introduction: 'Feeling very low can happen for many different reasons. You deserve care and patience, even if it is hard to explain what is going on.',
    whatMightBeHappening: 'You might have less energy, feel more sensitive, or find ordinary tasks harder than usual. There is no single explanation for feeling low, and this feeling alone cannot diagnose anything.',
    thingsToTry: ['Give the feeling a little space without asking yourself to solve everything now.', 'Try one kind basic thing: water, food, fresh air, or a message to someone safe.', 'If being alone feels difficult, consider asking someone you trust to sit with you.'],
    nextFewDays: ['Keep expectations small while you find your footing.', 'Notice whether quiet, company, or practical help feels most useful.', 'If this continues or makes daily life difficult, consider speaking with a qualified professional.'],
    professionalHelp: 'A conversation with a qualified professional may help if feeling low persists, is hard to manage, or interferes with things that matter to you. You do not have to wait until things feel unbearable to ask for support.',
    relatedSituations: ['cant-stop-crying', 'asking-for-help'],
    relatedTools: [tools.moment, tools.journaling],
    urgentHelpRelevant: true,
  },
  {
    slug: 'emptiness',
    label: 'I feel empty',
    title: 'Feeling empty or numb',
    shortDescription: 'Feeling numb, distant, or not quite connected.',
    introduction: 'Feeling empty or numb can be difficult to put into words. You do not have to know where it came from before you can look for support.',
    whatMightBeHappening: 'You might feel distant from things around you, notice less of an emotional response, or feel unsure what you need. Experiences vary, and this feeling on its own does not explain what is causing it.',
    thingsToTry: ['Notice a simple sensation, such as the temperature of the room or the feel of your feet on the floor.', 'Choose one gentle action that asks very little of you.', 'If words are difficult, you could tell someone you trust, “I feel disconnected and could use company.”'],
    nextFewDays: ['Notice whether the feeling changes in different places or with different people.', 'Keep one basic routine or point of contact if you can.', 'You deserve support even when the feeling is hard to describe.'],
    professionalHelp: 'If numbness or emptiness continues, worries you, or affects daily life, a qualified professional can help you explore it without needing a perfect explanation.',
    relatedSituations: ['feel-completely-alone', 'asking-for-help'],
    relatedTools: [tools.grounding, tools.journaling],
    urgentHelpRelevant: false,
  },
  {
    slug: 'loneliness',
    label: 'I feel alone',
    title: 'Feeling alone',
    shortDescription: 'Feeling separate, unseen, or disconnected.',
    introduction: 'Feeling alone can happen even when other people are nearby. It can be hard to know how to reach out, but you do not have to explain everything at once.',
    whatMightBeHappening: 'You might wish for more understanding or company, or feel unsure whether anyone would want to hear from you. These feelings are real, but they do not mean you are a burden.',
    thingsToTry: ['Think of one person you could send a low-pressure message to.', 'If direct contact feels hard, consider spending time in a shared place that feels comfortable.', 'You can ask for company without explaining the whole feeling.'],
    nextFewDays: ['Look for small, repeatable chances to connect.', 'Consider saying what kind of support would feel helpful: listening, company, or practical help.', 'Give yourself time to find people and places that feel safe enough.'],
    professionalHelp: 'If loneliness is persistent or affecting your wellbeing, a qualified professional may offer a supportive place to talk it through.',
    relatedSituations: ['feel-completely-alone', 'breakup'],
    relatedTools: [tools.moment, tools.journaling],
    urgentHelpRelevant: false,
  },
  {
    slug: 'overthinking',
    label: "I can't stop overthinking",
    title: 'When thoughts keep looping',
    shortDescription: 'Thoughts looping or difficult to set aside.',
    introduction: 'When a thought keeps returning, it can be tiring and difficult to focus elsewhere. You do not need to settle every question right now.',
    whatMightBeHappening: 'You might replay a conversation, imagine different outcomes, or find it hard to switch attention. Many things can contribute to this; the experience itself is not a diagnosis.',
    thingsToTry: ['Write the thought down in one sentence; you do not have to resolve it now.', 'Bring your attention to one sound or object in the room.', 'Ask yourself whether there is one small action to take now, or whether this can wait.'],
    nextFewDays: ['Set aside a short time to revisit the concern, then return to one present task.', 'Notice what tends to make the loop stronger or softer without judging yourself.', 'Consider talking it through with someone you trust.'],
    professionalHelp: 'If looping thoughts are hard to manage, interfere with rest or daily life, or cause ongoing distress, a qualified professional may help you explore possible next steps.',
    relatedSituations: ['cant-sleep-tonight', 'cant-concentrate'],
    relatedTools: [tools.journaling, tools.grounding],
    urgentHelpRelevant: false,
  },
  {
    slug: 'low-motivation',
    label: 'I have no motivation',
    title: 'When motivation feels low',
    shortDescription: 'Finding it difficult to begin or care about tasks.',
    introduction: 'Starting can feel difficult when motivation is low. That does not make you lazy or mean you have failed.',
    whatMightBeHappening: 'You might find it harder to begin, decide what matters, or keep going. Rest, pressure, changes, and many other parts of life can affect how much energy you have.',
    thingsToTry: ['Make the first step smaller than seems necessary.', 'Try two minutes, then decide whether to continue or stop.', 'If a task feels too large, write down only the very next action.'],
    nextFewDays: ['Choose one priority and let other tasks wait where possible.', 'Notice whether rest, company, or practical support might help more than self-criticism.', 'A small routine can offer a starting point without needing to fix everything.'],
    professionalHelp: 'If low motivation continues, affects daily life, or comes with distress you are finding difficult to manage, consider talking with a qualified professional.',
    relatedSituations: ['cant-concentrate', 'too-much-pressure'],
    relatedTools: [tools.moment, tools.grounding],
    urgentHelpRelevant: false,
  },
  {
    slug: 'overwhelm',
    label: 'I feel overwhelmed',
    title: 'Feeling overwhelmed',
    shortDescription: 'Feeling like too much is happening at once.',
    introduction: 'When several things feel urgent at the same time, it can be hard to see where to begin. You can take this one moment at a time.',
    whatMightBeHappening: 'You might feel pulled in several directions, find it hard to focus, or feel unsure what to do first. This can happen for many reasons and is not, by itself, a diagnosis.',
    thingsToTry: ['Name one thing that needs your attention now; let the rest wait for a moment.', 'Take a slow look around and notice where you are.', 'Ask what can be paused, shared, or made smaller.'],
    nextFewDays: ['Choose one small next step, then reassess.', 'Consider asking someone for one specific kind of help.', 'Make room for basic needs and rest as you can.'],
    professionalHelp: 'If feeling overwhelmed keeps returning, is difficult to manage, or interferes with daily life, a qualified professional may help you think through support and options.',
    relatedSituations: ['too-much-pressure', 'school-pressure'],
    relatedTools: [tools.grounding, tools.moment],
    urgentHelpRelevant: false,
  },
  {
    slug: 'anger',
    label: 'I feel angry',
    title: 'Feeling angry',
    shortDescription: 'Feeling heated, frustrated, or close to reacting.',
    introduction: 'Anger can feel intense. You can pause before deciding what to do, and you deserve space to understand what is happening.',
    whatMightBeHappening: 'You might notice frustration, tension, or an urge to respond quickly. Anger can arise in many situations; it does not by itself explain what you need or what happened.',
    thingsToTry: ['Create a little space before responding, if you can.', 'Notice whether stillness, a walk, or a comfortable slower breath would help you pause.', 'If someone may be unsafe, move away and seek immediate in-person support.'],
    nextFewDays: ['When you feel ready, describe what happened and what boundary or need matters.', 'Consider talking it through with someone you trust.', 'If anger is affecting relationships or daily life, professional support may be useful.'],
    professionalHelp: 'A qualified professional may help if anger feels difficult to manage, causes distress, or affects your relationships or daily life.',
    relatedSituations: ['fight', 'losing-control'],
    relatedTools: [tools.breathing, tools.moment],
    urgentHelpRelevant: true,
  },
  {
    slug: 'fear',
    label: 'I feel scared',
    title: 'Feeling scared',
    shortDescription: 'Feeling threatened, uncertain, or on guard.',
    introduction: 'Fear can make it difficult to know what to do next. First, notice whether there is immediate danger around you.',
    whatMightBeHappening: 'You might feel on guard, uncertain, or focused on what could go wrong. Fear can arise in many circumstances; the feeling alone does not explain its cause.',
    thingsToTry: ['Look around and notice whether there is an immediate danger.', 'Move toward a safer, more supported place if possible.', 'If it feels safe, tell someone you trust what is worrying you.'],
    nextFewDays: ['Talk through the concern with someone supportive.', 'Notice what helps you feel safer without pressuring yourself to feel differently.', 'If the fear continues to affect daily life, consider speaking with a qualified professional.'],
    professionalHelp: 'A qualified professional may be useful if fear is persistent, difficult to manage, or limiting your daily life.',
    relatedSituations: ['losing-control', 'asking-for-help'],
    relatedTools: [tools.grounding, tools.breathing],
    urgentHelpRelevant: true,
  },
  {
    slug: 'sleep-problems',
    label: "I can't sleep",
    title: 'When sleep is difficult',
    shortDescription: 'Having difficulty resting or feeling rested.',
    introduction: 'A difficult night can feel frustrating. You do not have to force sleep; a quiet pause can still be a form of rest.',
    whatMightBeHappening: 'Worry, change, discomfort, or an unsettled day can make rest feel difficult. Sleep experiences have many possible causes, and this page cannot tell you why it is happening.',
    thingsToTry: ['If you are awake, try a quiet, low-pressure activity for a little while.', 'Let go of the need to force sleep; focus on making the next few minutes comfortable.', 'If a thought is keeping you alert, write it down to return to later.'],
    nextFewDays: ['Notice patterns without judging yourself.', 'Keep a gentle, familiar wind-down routine if one is available to you.', 'If sleep difficulty persists or affects your days, consider discussing it with a qualified professional.'],
    professionalHelp: 'If sleep problems continue, affect your daily life, or concern you, a qualified health professional can help you consider possible causes and next steps.',
    relatedSituations: ['cant-sleep-tonight', 'work-pressure'],
    relatedTools: [tools.breathing, tools.journaling],
    urgentHelpRelevant: false,
  },
  {
    slug: 'dont-know',
    label: "I don't know",
    title: "I don't know",
    shortDescription: 'Not sure how to name what is happening.',
    introduction: "You don't need to know exactly what you're feeling before you start. You can begin with a word that feels close, or with no word at all.",
    whatMightBeHappening: 'Feelings can be mixed, unclear, or difficult to notice, especially when a lot is happening. You do not have to identify a cause or reach a conclusion here.',
    thingsToTry: ['Notice one thing in your surroundings, such as a sound or a point of support beneath you.', 'Try one basic, gentle action: a sip of water, a pause, or sitting somewhere comfortable.', 'If it helps, tell someone you trust, “I am not sure what I feel, but I could use some company.”'],
    nextFewDays: ['Give yourself time; clarity does not have to come all at once.', 'Notice whether any word or situation feels a little closer, without treating it as a result.', 'You can ask for support even when you do not know how to explain what is wrong.'],
    professionalHelp: 'If uncertainty about how you feel is worrying you, continues over time, or makes daily life difficult, talking with a qualified professional may help.',
    relatedSituations: ['asking-for-help', 'cant-stop-crying'],
    relatedTools: [tools.grounding, tools.moment],
    urgentHelpRelevant: true,
    startingPoints: ['Heavy', 'Numb', 'Restless', 'Scared', 'Alone', 'Angry', 'Lost', 'Exhausted', 'Overwhelmed', "I don't know"],
  },
];
```

## ```artifacts/offline-mind/src/data/resources.ts```

```ts
import type { Resource } from './types';
export const resourceCategories = ['Psychologists','Psychiatrists','Mental-health organizations','Associations','Public resources','Support organizations','Crisis resources'];
// Intentionally empty until Morocco-specific records are researched and verified.
export const resources: Resource[] = [];
```

## ```artifacts/offline-mind/src/data/situations.ts```

```ts
import type { Situation } from './types';
const build = (slug: string, title: string, might: string, now: string[], tryThis: string, urgent = false): Situation => ({
  slug,title,short:title,might,
  now,tryThis,
  questions:[{question:'Do I have to fix everything right now?',answer:'No. For this moment, one small safe step is enough.'},{question:'What if I do not know what I need?',answer:'That is okay. Start with something basic, or ask someone trusted to sit with you while you work it out.'}],
  professional:'If this situation keeps affecting your wellbeing or feels too hard to manage alone, a qualified professional may be able to help. You deserve support before things reach a crisis.',
  urgent
});
export const situations: Situation[] = [
 build('cant-stop-crying',"I can't stop crying",'Strong feelings may be finding a way out, especially after strain or a difficult event.', ['Find a place that feels a little more private or safe.','Let your breathing settle naturally; sip water if you have it.','If you can, contact someone you trust and say you could use company.'],'Put both feet down and notice the support beneath you.'),
 build('cant-sleep-tonight',"I can't sleep tonight",'Worry, change, discomfort, or an unsettled day can make rest difficult.', ['Lower the pressure to fall asleep immediately.','Try a quiet activity in dim light if lying there feels frustrating.'],'Let your next few minutes be restful even if sleep does not arrive.'),
 build('cant-concentrate',"I can't concentrate",'Attention can be harder when there is a lot to hold in mind or when you are tired.', ['Write down the next single task.','Move distractions aside for a few minutes.'],'Choose a task that can be started in under five minutes.'),
 build('feel-completely-alone','I feel completely alone','Feeling alone can happen even when people are nearby; it can be hard to know how to reach out.', ['Send one simple message to a person you trust.','If direct contact feels hard, spend time in a shared safe space.'],'You can ask for company without having to explain the whole feeling.'),
 build('breakup','I just had a breakup','A relationship ending can bring many feelings at once and disrupt familiar routines.', ['Give yourself time before sending a message or making a major decision.','Reach out to someone who can listen without taking sides.'],'For today, focus on a basic need and one thing that feels steady.'),
 build('fight','I had a fight with someone','Conflict can leave people upset, confused, or unsure what to do next.', ['Take space if either of you needs to cool down.','Avoid continuing the conversation if it feels unsafe.'],'When ready, name what you need and what you want to understand.'),
 build('too-much-pressure',"I'm under too much pressure",'Several demands may have accumulated beyond what feels manageable.', ['List what is urgent and what can wait.','Ask for one specific kind of help.'],'Pick the smallest next step and make room for recovery.'),
 build('overthinking-situation',"I can't stop thinking about something",'A concern may keep returning because it feels unresolved or important.', ['Write the thought down and label it as a thought, not a task.','Bring your attention to one detail in the room.'],'Choose a time to revisit it rather than carrying it every minute.'),
 build('school-pressure',"I'm overwhelmed by school",'Deadlines, expectations, or uncertainty can make school feel like too much.', ['Identify the next deadline and what its smallest first step is.','Consider contacting a teacher or trusted person for practical support.'],'A plan can be simple: one task, one break, one check-in.'),
 build('work-pressure',"I'm overwhelmed by work",'Work demands and boundaries can be difficult to balance.', ['Step away briefly if possible.','Write down what must happen today and what can be renegotiated.'],'Consider asking for clarity or support around workload.'),
 build('losing-control','I feel like I am losing control','A moment of intense emotion can feel frightening; it does not mean you have to handle it alone.', ['Move away from anything that could make the situation less safe.','Go to a place with another trusted person if possible.'],'Name five things you see and ask someone to stay with you.',true),
 build('someone-i-love-struggling','Someone I love is struggling','It can be hard to know how to support someone without taking everything on yourself.', ['Listen without rushing to fix it.','Ask directly what kind of support would help today.'],'If there is immediate danger, stay with them if safe and seek urgent in-person support.',true),
 build('asking-for-help',"I don't know how to ask for help",'Finding the words can feel like its own challenge.', ['Try: “I am having a hard time and could use someone to listen.”','You can share only what feels okay.'],'Choose one trusted person or a qualified professional to contact.'),
 build('need-professional-help','I think I need professional help','Wanting professional support is a valid reason to look for it; you do not need to prove that things are “bad enough.”', ['Think about what you would like help with.','Ask about qualifications, confidentiality, cost, and language before deciding.'],'Explore the Find Help page for a clearly marked directory placeholder.')
];
```

## ```artifacts/offline-mind/src/data/tools.ts```

```ts
export const toolCards = [
 {id:'breathing',title:'Breathing exercise',text:'A simple paced-breathing pause. Follow your comfort; stop if it feels uncomfortable.'},
 {id:'grounding',title:'Grounding exercise',text:'Reconnect with the room around you through your senses.'},
 {id:'offline-moment',title:'OFFLINE MOMENT',text:'Seven unhurried steps to make a little space for the next thing.'},
 {id:'journal',title:'Private journaling',text:'A few prompts for your own thoughts. Nothing is saved or sent.'},
 {id:'mood',title:'Mood check-in',text:'Notice how this moment feels. This is not an assessment or diagnosis.'}
];
```

## ```artifacts/offline-mind/src/data/topics.ts```

```ts
import type { Topic } from './types';
const entries = [
 ['anxiety','Anxiety','Anxiety is a word people use for worry, unease, or feeling on alert. Experiences differ, and the word alone is not a diagnosis.'],
 ['depression','Depression','Low mood and loss of interest can be difficult experiences with many possible contexts. Only a qualified professional can assess a person’s situation.'],
 ['loneliness','Loneliness','Loneliness is a personal sense of disconnection, and it can happen in many different circumstances.'],
 ['stress','Stress','Stress can describe feeling pressure when demands seem greater than the resources or time available.'],
 ['burnout','Burnout','Burnout is often used to describe feeling depleted after prolonged demands. It is not a character flaw.'],
 ['grief','Grief','Grief can follow a loss and may shift over time. There is no single correct way to experience it.'],
 ['sleep','Sleep','Sleep is affected by many parts of life. Difficult nights happen; persistent disruption may be worth discussing with a professional.'],
 ['relationships','Relationships','Relationships can offer care and can also involve tension, boundaries, and change.'],
 ['addiction-recovery','Addiction and recovery','People use different words for experiences with substances or behaviours. Support and change can look different for each person.'],
 ['academic-pressure','Academic pressure','School expectations and deadlines can feel heavy. Support, pacing, and clear priorities may make the next step easier.'],
 ['work-stress','Work stress','Work stress can come from workload, uncertainty, relationships, or limited control. Small boundaries and practical support can matter.'],
 ['emotional-regulation','Emotional regulation','Emotional regulation can mean noticing feelings and choosing how to respond, rather than never feeling intensely.'],
 ['self-esteem','Self-esteem','Self-esteem includes how someone sees and values themselves; it can shift with experiences and relationships.'],
 ['overthinking','Overthinking','Repeated thoughts can feel tiring. Not every thought needs an immediate answer or action.']
] as const;
export const topics: Topic[] = entries.map(([slug,title,summary]) => ({
 slug,title,summary,
 sections:[
  {heading:'A way to understand it',body:summary},
  {heading:'People experience this differently',body:'A word can be a starting point for curiosity, not a label that explains everything. Your context matters, and there is no single experience that fits everyone.'},
  {heading:'A small next step',body:'Notice what feels most difficult today. A practical step could be taking a pause, writing down a concern, talking with someone you trust, or seeking professional support.'}
 ],
 sources:[], lastReviewed:'Not yet reviewed by a subject-matter reviewer',
 relatedTopics:[], relatedTools:['grounding','offline-moment'], relatedSituations:['too-much-pressure','asking-for-help']
}));
```

## ```artifacts/offline-mind/src/data/types.ts```

```ts
export type Guide = {
  slug: string;
  title: string;
  short: string;
  intro: string;
  experiencing: string;
  might: string;
  now: string[];
  days: string[];
  professional: string;
  urgent?: boolean;
  relatedSituations: string[];
  relatedResources: string[];
};

export type FeelingGuideData = {
  slug: string;
  label: string;
  title: string;
  shortDescription: string;
  introduction: string;
  whatMightBeHappening: string;
  thingsToTry: string[];
  nextFewDays: string[];
  professionalHelp: string;
  relatedSituations: string[];
  relatedTools: { label: string; href: string }[];
  urgentHelpRelevant: boolean;
  startingPoints?: string[];
};

export type Situation = {
  slug: string;
  title: string;
  short: string;
  might: string;
  now: string[];
  tryThis: string;
  questions: { question: string; answer: string }[];
  professional: string;
  urgent?: boolean;
};

export type Topic = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
  sources: string[];
  lastReviewed: string;
  relatedTopics: string[];
  relatedTools: string[];
  relatedSituations: string[];
};

export type Resource = {
  name: string;
  type: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  services: string[];
  languages: string[];
  verificationStatus: 'Unverified placeholder';
  lastVerified: null;
  source: null;
};
```

## ```artifacts/offline-mind/src/hooks/use-mobile.tsx```

```tsx
import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}
```

## ```artifacts/offline-mind/src/hooks/use-toast.ts```

```ts
import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
```

## ```artifacts/offline-mind/src/index.css```

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@plugin "@tailwindcss/typography";

:root {
  --background: 39 35% 96%;
  --foreground: 205 36% 21%;
  --card: 40 32% 98%;
  --card-foreground: 205 36% 21%;
  --popover: 40 32% 98%;
  --popover-foreground: 205 36% 21%;
  --primary: 205 51% 22%;
  --primary-foreground: 39 35% 96%;
  --secondary: 204 49% 28%;
  --secondary-foreground: 39 35% 96%;
  --muted: 37 23% 91%;
  --muted-foreground: 205 18% 42%;
  --accent: 23 25% 78%;
  --accent-foreground: 205 36% 21%;
  --destructive: 0 62% 40%;
  --destructive-foreground: 0 0% 98%;
  --border: 35 20% 84%;
  --input: 35 20% 84%;
  --ring: 204 49% 28%;
  --radius: 0.75rem;
  --app-font-sans: 'DM Sans', 'Avenir Next', sans-serif;
  --app-font-serif: 'DM Sans', sans-serif;
  --app-font-mono: 'SFMono-Regular', monospace;
}
@theme inline {
  --color-background: #234c6a;
  --color-foreground: #f7f4ee;
  --color-card: #456882;
  --color-card-foreground: #f7f4ee;
  --color-popover: #1b3c53;
  --color-popover-foreground: #f7f4ee;
  --color-primary: #1b3c53;
  --color-primary-foreground: #f7f4ee;
  --color-secondary: #234c6a;
  --color-secondary-foreground: #f7f4ee;
  --color-supporting: #456882;
  --color-muted: #456882;
  --color-muted-foreground: #d9e2e6;
  --color-accent: #d2c1b6;
  --color-accent-foreground: #1b3c53;
  --color-border: rgb(210 193 182 / 38%);
  --color-input: rgb(210 193 182 / 48%);
  --color-ring: #d2c1b6;
  --color-copy: #d9e2e6;
  --color-rule: rgb(210 193 182 / 38%);
  --color-rule-soft: rgb(210 193 182 / 24%);
  --color-paper: #f7f4ee;
  --color-warm-paper: #f7f3ec;
  --font-sans: var(--app-font-sans);
}
@layer base {
  * { @apply border-border; }
  html { scroll-behavior: smooth; }
  body { @apply bg-background text-foreground font-sans antialiased; margin: 0; }
  button, a, input, textarea { -webkit-tap-highlight-color: transparent; }
  :focus-visible { outline: 3px solid #456882; outline-offset: 3px; }
  ::selection { background: #d2c1b6; color: #1b3c53; }
}
.page-wrap { width: min(1160px, calc(100% - 48px)); margin-inline: auto; }
.reading-width { width: min(740px, calc(100% - 40px)); margin-inline: auto; }
.eyebrow { color: #456882; font-size: .75rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.display { font-size: clamp(2.65rem, 6.3vw, 5.2rem); line-height: .99; letter-spacing: -.055em; font-weight: 500; }
.section-title { font-size: clamp(2rem, 4vw, 3.25rem); line-height: 1.05; letter-spacing: -.045em; font-weight: 500; }
.fade-up { animation: rise-in .55s ease both; }
@keyframes rise-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media (max-width: 640px) {
 .page-wrap { width: min(100% - 32px, 1160px); }
}
.site-header { position: sticky; top: 0; z-index: 30; background: hsl(39 35% 96% / .96); backdrop-filter: blur(12px); border-bottom: 1px solid hsl(205 36% 21% / .1); }
.header-inner { min-height: 80px; display: flex; align-items: center; gap: 26px; }
.desktop-nav { display:flex; align-items:center; gap:clamp(13px,2vw,27px); margin-left:auto; }
.nav-link { text-decoration:none; font-size:.83rem; color:#456882; transition:color .2s; white-space:nowrap; }
.nav-link:hover,.nav-link.active { color:#1b3c53; }
.urgent-nav { display:flex; gap:8px; align-items:center; border:1px solid #d2c1b6; color:#1b3c53; padding:10px 13px; font-size:.82rem; text-decoration:none; white-space:nowrap; transition:background .2s; }
.urgent-nav:hover { background:#eee4dc; }
.menu-toggle { display:none; border:1px solid #d2c1b6; color:#1b3c53; background:transparent; width:44px;height:44px; align-items:center;justify-content:center; }
.mobile-nav { display:none; }
.skip-link { position:absolute;top:-100px;left:16px;background:#1b3c53;color:#fff;padding:12px;z-index:50; }
.skip-link:focus { top:10px; }
.hero { padding:86px 0 30px; }
.hero-grid { display:grid;grid-template-columns:1.12fr .88fr;gap:4rem;align-items:center;min-height:470px; }
.hero-copy .eyebrow { display:block;margin-bottom:24px; }
.hero-copy h1 { margin:0;color:#1b3c53;max-width:730px;font-size:clamp(2.65rem,5.3vw,4rem); }
.hero-copy h1 i,.offline-band h2 i { font-style:normal;color:#456882; }
.hero-copy>p { font-size:1.1rem;line-height:1.75;color:#456882;max-width:490px;margin:26px 0 28px; }
.hero-actions { display:flex;align-items:center;gap:26px;flex-wrap:wrap; }
.button { display:inline-flex;align-items:center;justify-content:center;gap:18px;background:#1b3c53;color:#f8f5ef;text-decoration:none;border:1px solid #1b3c53;padding:15px 19px;min-height:52px;font-weight:600;font-size:.91rem;transition:background .2s,transform .2s; cursor:pointer; }
.button:hover { background:#234c6a;transform:translateY(-1px); }
.button-light { background:#f7f3ec;color:#1b3c53;border-color:#f7f3ec; }
.button-light:hover { background:#e6ddd2;color:#1b3c53; }
.text-link,.underlined-link { display:inline-flex;align-items:center;gap:8px;color:#234c6a;text-decoration:none;font-weight:600;font-size:.9rem;background:none;border:0;padding:0;cursor:pointer; }
.text-link:hover,.underlined-link:hover { color:#1b3c53; }
.underlined-link { border-bottom:1px solid #9babb4;padding-bottom:4px; }
.privacy-note { display:flex;gap:8px;align-items:center;margin-top:36px;color:#456882;font-size:.79rem; }
.hero-art { position:relative;height:430px;background:#e9e3d9;overflow:hidden;isolation:isolate; }
.hero-art:before,.hero-art:after { content:"";position:absolute;inset:0;pointer-events:none; }
.hero-art:before { background:linear-gradient(145deg,transparent 45%,hsl(205 36% 21% / .08)); }
.hero-art:after { inset:auto 0 0;height:1px;background:#456882; }
.orbit { position:absolute;border:1px solid #456882; width:480px;height:480px;border-radius:50%;top:-70px;left:50%;transform:translateX(-50%); }
.orbit-two { width:340px;height:340px;top:0;border-color:#d2c1b6; }
.sun-disc { position:absolute;width:196px;height:196px;border-radius:50%;background:#d2c1b6;left:50%;top:78px;transform:translateX(-50%); }
.hero-art .art-caption { position:absolute;top:238px;left:50%;transform:translateX(-50%);font-size:1.3rem;line-height:1.25;text-align:center;color:#1b3c53;white-space:nowrap; }
.art-index { position:absolute;bottom:20px;left:22px;font-size:.65rem;letter-spacing:.13em;color:#456882;font-weight:700; }
.scroll-cue { display:flex;gap:10px;align-items:center;justify-content:flex-end;color:#456882;text-decoration:none;font-size:.72rem;letter-spacing:.06em;padding-top:20px; }
.section { padding:100px 0; }
.section-soft { background:#eeeae2; }
.split-heading { display:grid;grid-template-columns:1fr .7fr;gap:3rem;align-items:end;margin-bottom:44px; }
.split-heading .eyebrow { display:block;margin-bottom:18px; }
.split-heading>p { color:#456882;line-height:1.75;max-width:390px;margin:0 0 4px; }
.feeling-links { display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #c8c5bd; }
.feeling-link { min-height:70px;display:flex;align-items:center;gap:18px;border-bottom:1px solid #c8c5bd;text-decoration:none;color:#1b3c53;padding:14px 8px;transition:padding .2s,color .2s; }
.feeling-link:nth-child(odd) { padding-right:26px; }
.feeling-link:nth-child(even) { padding-left:25px;border-left:1px solid #c8c5bd; }
.feeling-link:hover { color:#234c6a;padding-left:15px; }
.feeling-link>span:nth-child(2) { font-size:1rem;flex:1; }
.feeling-num,.situation-item>span,.topic-link>span { color:#7890a0;font-size:.68rem;letter-spacing:.1em; }
.feeling-unsure { background:#e7ded5; }
.section>.page-wrap>.underlined-link { margin-top:28px; }
.section-topline { display:flex;justify-content:space-between;align-items:center;margin-bottom:25px; }
.situation-grid { margin-top:36px;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #c8c5bd; }
.situation-item { min-height:148px;position:relative;border-bottom:1px solid #c8c5bd;padding:22px 24px 20px 0;text-decoration:none;color:#1b3c53;transition:background .2s,padding .2s; }
.situation-item:not(:nth-child(3n+1)) { border-left:1px solid #c8c5bd;padding-left:24px; }
.situation-item>span { display:block; }
.situation-item h3 { font-size:1.12rem;font-weight:500;margin:26px 0 0;max-width:230px; }
.situation-item svg { position:absolute;right:17px;bottom:22px;opacity:.6; }
.situation-item:hover { background:#f1eee8;padding-top:26px; }
.offline-band { background:#1b3c53;color:#f6f3ec;padding:82px 0; }
.offline-band-inner { display:flex;justify-content:space-between;align-items:center;gap:50px; }
.offline-band .eyebrow { color:#d2c1b6;display:block;margin-bottom:20px; }
.offline-band h2 { max-width:540px; }
.offline-band h2 i { color:#d2c1b6; }
.offline-band p { color:#d1dce0;max-width:460px;line-height:1.7;margin:22px 0 26px; }
.breath-mark { width:230px;height:230px;border:1px solid #7890a0;border-radius:50%;position:relative;display:grid;place-items:center;flex:none; }
.breath-mark:before,.breath-mark:after { content:"";position:absolute;inset:23px;border:1px solid #456882;border-radius:50%; }
.breath-mark:after { inset:48px;border-color:#d2c1b6; }
.breath-mark>div { width:15px;height:15px;background:#d2c1b6;border-radius:50%;z-index:1; }
.breath-mark>span { position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;color:#c6d2d8;font-size:.6rem;letter-spacing:.13em;line-height:1.5; }
.topic-row { display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #c8c5bd; }
.topic-link { display:flex;align-items:center;gap:11px;min-height:65px;border-bottom:1px solid #c8c5bd;color:#1b3c53;text-decoration:none;padding:12px 8px; }
.topic-link:nth-child(4n+2),.topic-link:nth-child(4n+3),.topic-link:nth-child(4n+4) { border-left:1px solid #c8c5bd;padding-left:17px; }
.topic-link svg { margin-left:auto;opacity:.6; }
.topic-link:hover { background:#e6e0d7; }
.support-section { background:#234c6a;color:#f7f4ee;padding:86px 0; }
.support-grid { display:grid;grid-template-columns:1fr .7fr;gap:7rem;align-items:center; }
.support-grid .eyebrow { color:#d2c1b6;display:block;margin-bottom:20px; }
.support-grid h2 { max-width:510px; }
.support-grid>div>p { color:#d5dee2;line-height:1.75;max-width:450px;margin:22px 0 26px; }
.support-note { border-left:1px solid #7890a0;padding:25px 0 25px 28px; }
.note-mark { width:42px;height:42px;border:1px solid #9aafbb;display:grid;place-items:center;color:#d2c1b6; }
.support-note h3 { font-size:1.2rem;font-weight:500;margin:23px 0 8px; }
.support-note p { color:#d5dee2;line-height:1.65;font-size:.9rem; }
.note-status { display:flex;align-items:center;gap:8px;color:#d2c1b6;font-size:.72rem;margin-top:26px; }
.note-status span { width:6px;height:6px;border-radius:50%;background:#d2c1b6; }
.urgent-strip { background:#e8e0d6;padding:35px 0; }
.urgent-inner { display:flex;align-items:center;justify-content:space-between;gap:24px; }
.urgent-inner .eyebrow { display:block;margin-bottom:6px; }
.urgent-inner h2 { font-size:1.35rem;font-weight:500;margin:0; }
.urgent-inner p { color:#456882;margin:7px 0 0;font-size:.87rem; }
.urgent-button { display:flex;align-items:center;gap:16px;background:#1b3c53;color:#f8f5ef;text-decoration:none;padding:16px 18px;white-space:nowrap; }
.mission .reading-width { border-left:2px solid #d2c1b6;padding-left:32px; }
.mission .eyebrow { display:block;margin-bottom:18px; }
.mission p { color:#456882;line-height:1.85;font-size:1.02rem;max-width:630px;margin:22px 0; }
.footer { background:#e8e5dd;padding:56px 0 24px; }
.footer-grid { display:grid;grid-template-columns:2fr 1fr 1fr;gap:4rem;padding-bottom:46px; }
.footer-grid>div { display:flex;flex-direction:column;align-items:flex-start;gap:12px; }
.footer-grid>div:first-child p { color:#456882;font-size:.9rem;margin:7px 0 0; }
.footer-grid small { max-width:300px;color:#71818a;line-height:1.6; }
.footer-grid b { font-size:.77rem;letter-spacing:.1em;text-transform:uppercase;color:#456882;margin-bottom:4px; }
.footer-grid a:not(:first-child) { text-decoration:none;color:#1b3c53;font-size:.88rem; }
.footer-grid a:hover { text-decoration:underline; }
.footer-bottom { border-top:1px solid #c8c5bd;padding-top:18px;display:flex;justify-content:space-between;color:#71818a;font-size:.68rem;letter-spacing:.1em; }
.page-heading { max-width:720px;margin:0 auto 48px; }
.page-heading .eyebrow { display:block;margin-bottom:18px; }
.page-heading h1 { margin:0;color:#1b3c53; }
.page-heading>p { font-size:1.05rem;line-height:1.75;color:#456882;max-width:630px;margin:20px 0 0; }
.listing-page { padding-top:88px; }
.listing-controls { display:flex;justify-content:space-between;align-items:center;gap:22px;border-bottom:1px solid #c8c5bd;padding-bottom:17px;margin-bottom:0; }
.listing-controls>span { color:#71818a;font-size:.78rem; }
.search-field { display:flex;align-items:center;gap:12px;width:min(420px,100%);height:48px;border-bottom:1px solid #9aabb2;color:#456882; }
.search-field input { border:0;outline:none;background:transparent;flex:1;min-width:0;height:100%;color:#1b3c53;font:inherit;font-size:.9rem; }
.search-field input::placeholder { color:#71818a; }
.search-field button { border:0;background:transparent;color:#456882;display:grid;place-items:center;cursor:pointer; }
.listing-grid { display:grid;grid-template-columns:repeat(3,1fr); }
.listing-card { min-height:235px;border-bottom:1px solid #c8c5bd;padding:24px 25px 23px 0;text-decoration:none;color:#1b3c53;display:flex;flex-direction:column;align-items:flex-start;transition:background .2s,padding .2s; }
.listing-card:not(:nth-child(3n+1)) { border-left:1px solid #c8c5bd;padding-left:24px; }
.listing-card:hover { background:#eeebe4;padding-top:29px; }
.card-index { color:#7890a0;font-size:.69rem;letter-spacing:.12em; }
.listing-card h2 { font-size:1.3rem;font-weight:500;letter-spacing:-.03em;margin:25px 0 8px; }
.listing-card p { color:#607c8e;line-height:1.6;font-size:.88rem;margin:0; }
.card-action { display:flex;align-items:center;gap:8px;color:#234c6a;font-weight:600;font-size:.8rem;margin-top:auto;padding-top:20px; }
.empty-state { padding:60px 20px;text-align:center;border-bottom:1px solid #c8c5bd; }
.empty-state h2 { font-weight:500;font-size:1.5rem; }
.empty-state p { color:#456882;line-height:1.6; }
.next-strip { padding:25px 0;background:#eeeae2; }
.next-strip>.page-wrap { display:flex;justify-content:space-between;align-items:center;gap:20px; }
.next-strip p { color:#456882;margin:0; }
.article-page { padding:52px 0 100px; }
.back-link { display:flex;align-items:center;gap:7px;text-decoration:none;color:#456882;font-size:.84rem;margin-bottom:45px; }
.back-link:hover { color:#1b3c53; }
.article-page .reading-width>.eyebrow { display:block;margin-bottom:16px; }
.article-title { font-size:clamp(2.8rem,7vw,5.2rem);line-height:.98;letter-spacing:-.055em;font-weight:500;color:#1b3c53;margin:0; }
.article-lede { color:#456882;font-size:1.22rem;line-height:1.65;max-width:650px;margin:25px 0 34px; }
.gentle-note { display:flex;align-items:flex-start;gap:13px;padding:17px 18px;background:#eeeae2;color:#456882;margin:25px 0 52px; }
.gentle-note svg { flex:none;margin-top:2px; }
.gentle-note p { margin:0;line-height:1.6;font-size:.87rem; }
.article-section { padding:27px 0 35px;border-top:1px solid #d2d0c8; }
.article-section .eyebrow { display:block;margin-bottom:14px; }
.article-section h2 { font-size:1.75rem;line-height:1.2;font-weight:500;letter-spacing:-.035em;color:#1b3c53;margin:0 0 13px; }
.article-section>p { color:#456882;font-size:1rem;line-height:1.8;margin:0; }
.step-list { list-style:none;padding:0;margin:22px 0 0; }
.step-list li { display:flex;gap:18px;align-items:flex-start;padding:14px 0;border-bottom:1px solid #e0ddd5; }
.step-list li span { color:#7890a0;font-size:.68rem;letter-spacing:.1em;padding-top:4px; }
.step-list li p { margin:0;color:#456882;line-height:1.65; }
.related-links { display:grid;grid-template-columns:1fr 1fr;margin:-12px 0 36px; }
.related-links a { display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 12px 14px 0;color:#234c6a;text-decoration:none;border-bottom:1px solid #d2d0c8; }
.related-links a:nth-child(even) { padding-left:15px;border-left:1px solid #d2d0c8; }
.related-links a:hover { color:#1b3c53;background:#eeeae2; }
.article-urgent { margin:15px 0 35px;padding:24px;background:#e8e0d6;border-left:2px solid #456882; }
.article-urgent b { color:#1b3c53; }
.article-urgent p { color:#456882;line-height:1.6; }
.review-note { display:flex;align-items:center;gap:10px;color:#71818a;font-size:.78rem;margin:0 0 30px; }
.accordion-item { border-bottom:1px solid #d2d0c8; }
.accordion-item:first-child { border-top:1px solid #d2d0c8; }
.accordion-item summary { cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 2px;color:#1b3c53;font-size:1.03rem; }
.accordion-item summary::-webkit-details-marker { display:none; }
.accordion-item summary svg { flex:none;color:#456882;transition:transform .2s; }
.accordion-item[open] summary svg { transform:rotate(180deg); }
.accordion-item>p { margin:0;padding:0 35px 20px 2px;color:#456882;line-height:1.75; }
.faq-page .search-field { width:100%;margin:40px 0 22px; }
.faq-footnote { color:#71818a;font-size:.86rem;margin-top:30px; }
.faq-footnote a { color:#234c6a; }
.faq-page { padding-bottom:110px; }
.tool-layout { display:grid;grid-template-columns:240px 1fr;gap:60px;align-items:start; }
.tool-aside { position:sticky;top:115px;border-top:2px solid #d2c1b6;padding-top:17px; }
.tool-aside p { color:#607c8e;line-height:1.7;font-size:.86rem; }
.tool-aside-mark { height:72px;display:flex;align-items:center;gap:8px;margin-top:30px; }
.tool-aside-mark span { width:28px;height:28px;border:1px solid #456882;border-radius:50%; }
.tool-aside-mark span:nth-child(2) { width:46px;height:46px;border-color:#d2c1b6;margin-left:-20px; }
.tool-aside-mark span:nth-child(3) { width:15px;height:15px;background:#456882;border:0;margin-left:3px; }
.tool-aside-mark span:nth-child(4) { width:38px;height:38px;margin-left:-1px;border-color:#d2c1b6; }
.tool-stack { border-top:1px solid #c8c5bd; }
.tool-panel { padding:33px 0 37px;border-bottom:1px solid #c8c5bd; }
.tool-heading { display:flex;gap:22px;align-items:flex-start; }
.tool-number { color:#7890a0;font-size:.7rem;letter-spacing:.13em;padding-top:8px; }
.tool-heading h2 { font-size:1.45rem;font-weight:500;letter-spacing:-.03em;margin:0;color:#1b3c53; }
.tool-heading p { color:#607c8e;line-height:1.6;font-size:.88rem;margin:7px 0 0;max-width:570px; }
.breathing-content { display:flex;align-items:center;gap:35px;margin:34px 0 0 47px; }
.breath-circle { width:170px;height:170px;border:1px solid #7890a0;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:7px;background:#eeeae2;transition:transform 4s ease-in-out,background .4s; }
.breath-circle span { font-size:.95rem;color:#1b3c53; }
.breath-circle small { font-size:.68rem;color:#607c8e;max-width:125px; }
.breath-circle.breath-active { transform:scale(1.09);background:#e7ded5; }
.tool-controls { display:flex;gap:10px;align-items:center; }
.icon-button { display:grid;place-items:center;width:48px;height:48px;border:1px solid #c8c5bd;color:#234c6a;background:transparent;cursor:pointer; }
.check-steps { margin:25px 0 15px 47px;display:grid;grid-template-columns:1fr 1fr;gap:8px 24px; }
.check-step { display:flex;gap:13px;align-items:center;text-align:left;border:0;border-bottom:1px solid #dedbd3;background:transparent;padding:12px 0;min-height:50px;color:#456882;cursor:pointer; }
.check-step>span { width:25px;height:25px;border:1px solid #9caeb6;border-radius:50%;display:grid;place-items:center;font-size:.63rem;flex:none; }
.check-step.checked>span { background:#234c6a;color:#f8f5ef;border-color:#234c6a; }
.quiet-button { display:inline-flex;align-items:center;gap:7px;background:none;border:0;padding:7px 0;color:#456882;font-size:.8rem;cursor:pointer; }
.quiet-button:disabled { opacity:.4;cursor:not-allowed; }
.tool-panel>.quiet-button { margin-left:47px; }
.tool-feedback { margin:9px 0 0 47px;font-size:.78rem;color:#71818a; }
.moment-panel { background:#f0ede6;margin:0 -22px;padding:34px 22px 38px; }
.moment-card { background:#e6e1d8;margin:26px 0 0 47px;padding:25px 28px; }
.moment-card .eyebrow { font-size:.65rem; }
.moment-card>p { font-size:1.35rem;color:#1b3c53;min-height:54px;line-height:1.4;margin:18px 0 22px; }
.moment-progress { height:2px;background:#c8c5bd; }
.moment-progress span { display:block;height:100%;background:#456882;transition:width .3s ease; }
.moment-controls { display:flex;align-items:center;justify-content:space-between;margin-top:20px; }
.moment-controls .button { min-height:44px;padding:10px 14px; }
.prompt-box { margin:26px 0 15px 47px;padding:19px 20px;background:#eeeae2; }
.prompt-box .eyebrow { font-size:.65rem; }
.prompt-box p { color:#1b3c53;font-size:1.1rem;line-height:1.5;margin:10px 0 12px; }
.prompt-box .text-link { font-size:.8rem; }
.tool-panel textarea,.tool-panel input { width:calc(100% - 47px);margin-left:47px;background:#f8f5ef;border:1px solid #d2d0c8;padding:14px;color:#1b3c53;resize:vertical;line-height:1.6; }
.tool-panel textarea::placeholder,.tool-panel input::placeholder { color:#8b9ba1; }
.journal-footer { display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0 0 47px; }
.journal-footer>span { display:flex;gap:7px;align-items:center;color:#71818a;font-size:.73rem; }
.mood-question { margin:26px 0 11px 47px;color:#1b3c53; }
.mood-options { margin-left:47px;display:flex;flex-wrap:wrap;gap:8px; }
.mood-option { border:1px solid #c8c5bd;background:transparent;color:#456882;padding:10px 13px;display:flex;gap:10px;align-items:center;cursor:pointer; }
.mood-option span { color:#7890a0;font-size:.64rem; }
.mood-option.selected { background:#234c6a;border-color:#234c6a;color:#f8f5ef; }
.mood-option.selected span { color:#d2c1b6; }
.mood-reflection { margin:18px 0 0 47px;padding:18px;background:#eeeae2; }
.mood-reflection b { color:#1b3c53;font-weight:500; }
.mood-reflection p { color:#607c8e;font-size:.85rem; }
.mood-reflection input { width:100%;margin:0 0 8px;background:#f8f5ef; }
.help-banner { display:flex;align-items:flex-start;gap:17px;padding:22px;background:#eeeae2;border-left:2px solid #d2c1b6;margin-bottom:52px;color:#456882; }
.help-banner svg { flex:none;color:#234c6a; }
.help-banner b { color:#1b3c53; }
.help-banner p { margin:6px 0 0;line-height:1.6;font-size:.88rem; }
.directory-layout { display:grid;grid-template-columns:1fr 290px;gap:60px;align-items:start; }
.filter-label { display:block;color:#456882;font-size:.78rem;margin-bottom:8px; }
.directory-main select { background:#f8f5ef;border:1px solid #c8c5bd;color:#1b3c53;padding:13px 14px;min-width:260px;font:inherit; }
.empty-directory { margin-top:25px;padding:38px 28px;border:1px solid #d2d0c8;background:#f0ede6; }
.empty-directory svg { color:#456882; }
.empty-directory h2 { font-size:1.35rem;font-weight:500;color:#1b3c53; }
.empty-directory p { color:#607c8e;line-height:1.7;max-width:550px; }
.empty-directory>span { color:#456882;font-size:.78rem; }
.directory-aside { border-top:2px solid #d2c1b6;padding-top:17px; }
.category-row { display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #d2d0c8;color:#456882;font-size:.86rem; }
.directory-aside>p { color:#71818a;line-height:1.65;font-size:.75rem;margin-top:19px; }
.resource-card { margin-top:20px;border:1px solid #d2d0c8;padding:22px; }
.resource-card h2 { font-weight:500; }
.status-pill { display:inline-block;padding:5px 8px;background:#eeeae2;color:#456882;font-size:.72rem; }
.help-caveat { margin-top:70px;border-top:1px solid #c8c5bd;padding-top:23px;max-width:760px; }
.help-caveat b { color:#1b3c53; }
.help-caveat p { color:#607c8e;line-height:1.7; }
.urgent-page { padding:88px 0 100px;background:#e9e4dc; }
.urgent-page-head { max-width:760px;margin:0 auto 58px; }
.urgent-page-head .eyebrow { display:block;margin-bottom:18px; }
.urgent-page-head h1 { color:#1b3c53; }
.urgent-page-head>p { color:#456882;font-size:1.1rem;line-height:1.75;max-width:680px;margin:22px 0 0; }
.urgent-columns { display:grid;grid-template-columns:1.1fr .8fr;gap:8%;align-items:start;border-top:1px solid #c7c2b8;padding-top:30px; }
.urgent-actions h2 { font-size:1.45rem;font-weight:500;color:#1b3c53; }
.urgent-actions .step-list li { border-color:#d1ccc4; }
.urgent-warning { background:#1b3c53;color:#f7f4ee;padding:28px; }
.urgent-warning>svg { color:#d2c1b6; }
.urgent-warning h2 { font-size:1.3rem;line-height:1.3;font-weight:500;margin:20px 0 12px; }
.urgent-warning p { color:#d5dee2;font-size:.88rem;line-height:1.7; }
.urgent-bottom { border-top:1px solid #c7c2b8;margin-top:58px;padding-top:22px; }
.urgent-bottom b { color:#1b3c53; }
.urgent-bottom p { color:#607c8e;font-size:.85rem; }
.about-page .article-section:first-of-type { margin-top:55px; }
.about-next { display:flex;gap:25px;padding-top:17px; }
.not-found { padding:130px 0 150px;min-height:60vh; }
.not-found h1 { color:#1b3c53;margin:20px 0; }
.not-found p { color:#456882;max-width:450px;line-height:1.7;margin-bottom:30px; }
.sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }

@media (max-width: 960px) {
 .desktop-nav { gap:12px; }
 .nav-link { font-size:.76rem; }
 .urgent-nav { padding:9px; }
 .hero-grid { gap:2.4rem; }
 .hero-copy h1 { font-size:clamp(2.65rem,5vw,3.6rem); }
 .support-grid { gap:4rem; }
 .tool-layout { grid-template-columns:190px 1fr;gap:36px; }
 .directory-layout { gap:32px; }
}
@media (max-width: 760px) {
 .header-inner { min-height:70px; }
 .header-inner>.desktop-nav,.header-inner>.urgent-nav { display:none; }
 .header-inner { justify-content:space-between; }
 .menu-toggle { display:flex; }
 .mobile-nav { display:flex;flex-direction:column;padding-top:3px;padding-bottom:16px; }
 .mobile-nav-link { display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:#1b3c53;padding:14px 3px;border-top:1px solid #d2d0c8; }
 .urgent-mobile { color:#234c6a;font-weight:600; }
 .hero { padding-top:48px; }
 .hero-grid { grid-template-columns:1fr;gap:35px; }
 .hero-copy h1 { font-size:clamp(3rem,12vw,4.7rem); }
 .hero-art { height:320px; }
 .orbit { width:390px;height:390px;top:-74px; }
 .orbit-two { width:280px;height:280px;top:-15px; }
 .sun-disc { width:145px;height:145px;top:50px; }
 .hero-art .art-caption { top:180px;font-size:1.1rem; }
 .scroll-cue { justify-content:flex-start; }
 .section { padding:70px 0; }
 .split-heading { grid-template-columns:1fr;gap:15px;margin-bottom:31px; }
 .split-heading>p { max-width:520px; }
 .feeling-links { grid-template-columns:1fr; }
 .feeling-link:nth-child(even) { border-left:0;padding-left:8px; }
 .feeling-link:nth-child(odd) { padding-right:8px; }
 .feeling-link { min-height:62px; }
 .situation-grid { grid-template-columns:1fr 1fr; }
 .situation-item:not(:nth-child(3n+1)) { border-left:0;padding-left:0; }
 .situation-item:nth-child(even) { border-left:1px solid #c8c5bd;padding-left:17px; }
 .situation-item { min-height:130px;padding-right:14px; }
 .situation-item h3 { font-size:1.02rem; }
 .offline-band { padding:65px 0; }
 .offline-band-inner { align-items:flex-start; }
 .breath-mark { width:155px;height:155px;margin-top:20px; }
 .breath-mark:before { inset:16px; }
 .breath-mark:after { inset:34px; }
 .breath-mark>span { padding:0 16px;font-size:.52rem; }
 .topic-row { grid-template-columns:1fr 1fr; }
 .topic-link:nth-child(n) { border-left:0;padding-left:8px; }
 .topic-link:nth-child(even) { border-left:1px solid #c8c5bd;padding-left:15px; }
 .support-grid { grid-template-columns:1fr;gap:38px; }
 .support-note { max-width:500px; }
 .urgent-inner { align-items:flex-start;flex-direction:column; }
 .footer-grid { grid-template-columns:1fr 1fr;gap:32px; }
 .footer-grid>div:first-child { grid-column:1/-1; }
 .listing-page { padding-top:62px; }
 .page-heading { margin-bottom:34px; }
 .listing-grid { grid-template-columns:1fr 1fr; }
 .listing-card:not(:nth-child(3n+1)) { border-left:0;padding-left:0; }
 .listing-card:nth-child(even) { border-left:1px solid #c8c5bd;padding-left:18px; }
 .listing-card { min-height:220px;padding-right:14px; }
 .article-page { padding-top:35px; }
 .back-link { margin-bottom:36px; }
 .tool-layout { grid-template-columns:1fr;gap:24px; }
 .tool-aside { position:static; }
 .tool-aside p { max-width:540px; }
 .tool-aside-mark { display:none; }
 .directory-layout { grid-template-columns:1fr; }
 .directory-aside { max-width:500px; }
 .urgent-columns { grid-template-columns:1fr;gap:30px; }
 .urgent-page { padding:65px 0; }
}
@media (max-width: 520px) {
 .page-wrap { width:calc(100% - 32px); }
 .hero-copy>p { font-size:1rem; }
 .hero-actions { gap:17px; }
 .hero-art { height:280px; }
 .orbit { width:340px;height:340px; }
 .orbit-two { width:245px;height:245px; }
 .sun-disc { width:125px;height:125px;top:45px; }
 .hero-art .art-caption { top:157px; }
 .situation-grid { grid-template-columns:1fr; }
 .situation-item:nth-child(even) { border-left:0;padding-left:0; }
 .situation-item { min-height:100px; }
 .situation-item h3 { margin-top:14px; }
 .offline-band-inner { display:block; }
 .breath-mark { margin:38px auto 0; }
 .topic-link { font-size:.88rem;gap:8px; }
 .topic-link:nth-child(even) { padding-left:9px; }
 .support-note { padding-left:19px; }
 .urgent-inner h2 { font-size:1.2rem; }
 .footer-grid { gap:25px 16px; }
 .footer-grid>div:first-child { grid-column:1/-1; }
 .footer-bottom { font-size:.58rem;letter-spacing:.06em; }
 .listing-grid { grid-template-columns:1fr; }
 .listing-card:nth-child(even) { border-left:0;padding-left:0; }
 .listing-card { min-height:190px; }
 .listing-controls { align-items:flex-end; }
 .listing-controls>span { white-space:nowrap;padding-bottom:12px; }
 .next-strip>.page-wrap { align-items:flex-start;flex-direction:column; }
 .article-title { font-size:3rem; }
 .article-lede { font-size:1.08rem; }
 .related-links { grid-template-columns:1fr; }
 .related-links a:nth-child(even) { border-left:0;padding-left:0; }
 .breathing-content { margin-left:0;gap:20px;flex-wrap:wrap; }
 .breath-circle { width:145px;height:145px; }
 .check-steps { margin-left:0;grid-template-columns:1fr; }
 .tool-panel>.quiet-button,.tool-feedback,.mood-question,.mood-options,.mood-reflection,.prompt-box { margin-left:0; }
 .tool-panel textarea,.tool-panel input { width:100%;margin-left:0; }
 .moment-card { margin-left:0;padding:20px 16px; }
 .journal-footer { margin-left:0;align-items:flex-start;flex-direction:column; }
 .moment-panel { margin-inline:-12px;padding-inline:12px; }
 .tool-heading { gap:13px; }
 .tool-number { padding-top:6px; }
 .directory-main select { width:100%;min-width:0; }
 .help-banner { padding:17px; }
 .urgent-page-head h1 { font-size:2.7rem; }
 .about-next { flex-direction:column; }
}

/* OFFLINE MIND's dark editorial palette. The homepage layout and copy remain unchanged. */
html, body, #root { min-height: 100%; background: var(--color-background); }
body { color: var(--color-paper); }
a { color: inherit; }
:focus-visible { outline-color: var(--color-accent); }
.site-header { background: var(--color-primary); border-bottom-color: var(--color-rule-soft); }
.logo-plate { display: inline-flex; align-items: center; padding: 7px 9px; background: var(--color-accent); }
.nav-link { color: var(--color-copy); }
.nav-link:hover, .nav-link.active { color: var(--color-accent); }
.urgent-nav { border-color: var(--color-accent); color: var(--color-paper); }
.urgent-nav:hover { background: var(--color-secondary); }
.menu-toggle { border-color: var(--color-accent); color: var(--color-paper); }
.mobile-nav-link { color: var(--color-paper); border-top-color: var(--color-rule-soft); }
.urgent-mobile { color: var(--color-accent); }
.eyebrow { color: var(--color-accent); }
.hero-copy h1, .page-heading h1, .article-title, .article-section h2,
.urgent-page-head h1, .urgent-actions h2, .not-found h1 { color: var(--color-paper); }
.hero-copy h1 i, .offline-band h2 i { color: var(--color-accent); }
.hero-copy > p, .split-heading > p, .page-heading > p, .article-lede,
.article-section > p, .step-list li p, .article-urgent p, .faq-footnote,
.accordion-item > p, .tool-aside p, .tool-heading p, .help-caveat p,
.urgent-page-head > p, .urgent-bottom p, .mission p, .footer-grid small,
.footer-grid > div:first-child p, .urgent-inner p, .empty-state p {
  color: var(--color-copy);
}
.button { background: var(--color-accent); color: var(--color-primary); border-color: var(--color-accent); }
.button:hover { background: var(--color-paper); color: var(--color-primary); }
.button-light { background: var(--color-accent); color: var(--color-primary); border-color: var(--color-accent); }
.button-light:hover { background: var(--color-paper); color: var(--color-primary); }
.text-link, .underlined-link { color: var(--color-accent); }
.text-link:hover, .underlined-link:hover { color: var(--color-paper); }
.underlined-link { border-bottom-color: var(--color-rule); }
.privacy-note, .scroll-cue { color: var(--color-copy); }
.hero-art { background: #e9e3d9; }
.section-soft { background: var(--color-supporting); color: var(--color-paper); }
.feeling-links, .situation-grid, .topic-row, .listing-grid, .tool-stack {
  border-color: var(--color-rule);
}
.feeling-link, .situation-item, .topic-link, .listing-card {
  color: var(--color-paper);
  border-color: var(--color-rule);
}
.feeling-link:hover, .situation-item:hover, .topic-link:hover, .listing-card:hover {
  background: var(--color-primary);
  color: var(--color-paper);
}
.feeling-unsure { background: var(--color-accent); color: var(--color-primary); }
.feeling-unsure:hover { background: var(--color-paper); color: var(--color-primary); }
.feeling-num, .situation-item > span, .topic-link > span, .card-index, .tool-number,
.step-list li span { color: var(--color-accent); }
.offline-band, .urgent-strip, .footer, .urgent-page { background: var(--color-primary); color: var(--color-paper); }
.support-section { background: var(--color-supporting); color: var(--color-paper); }
.urgent-inner h2, .footer-grid b, .footer-grid a:not(:first-child), .footer-bottom,
.article-urgent b, .help-caveat b, .urgent-bottom b { color: var(--color-paper); }
.offline-band p, .support-grid > div > p, .support-note p, .urgent-warning p {
  color: var(--color-copy);
}
.note-mark { border-color: var(--color-rule); }
.note-status, .offline-band .eyebrow, .support-grid .eyebrow { color: var(--color-accent); }
.urgent-button { background: var(--color-accent); color: var(--color-primary); }
.urgent-button:hover { background: var(--color-paper); }
.footer-grid b { color: var(--color-accent); }
.footer-bottom { border-top-color: var(--color-rule-soft); color: var(--color-copy); }
.page-heading > p, .listing-controls > span, .search-field,
.search-field button, .back-link, .review-note { color: var(--color-copy); }
.listing-controls, .search-field, .accordion-item, .article-section,
.step-list li, .related-links a, .help-caveat {
  border-color: var(--color-rule);
}
.search-field input { color: var(--color-paper); }
.search-field input::placeholder { color: var(--color-copy); }
.card-index, .listing-card p, .card-action { color: var(--color-copy); }
.empty-state { border-color: var(--color-rule); }
.next-strip { background: var(--color-primary); }
.next-strip p { color: var(--color-copy); }
.back-link:hover { color: var(--color-accent); }
.gentle-note, .help-banner, .empty-directory, .moment-panel, .prompt-box,
.mood-reflection, .breath-circle {
  background: var(--color-supporting);
  color: var(--color-paper);
}
.gentle-note svg, .help-banner svg { color: var(--color-accent); }
.gentle-note p, .help-banner p, .empty-directory p, .empty-directory > span,
.directory-aside > p, .tool-feedback, .journal-footer > span,
.mood-reflection p, .category-row { color: var(--color-copy); }
.article-urgent { background: var(--color-primary); border-left-color: var(--color-accent); }
.related-links a { color: var(--color-paper); }
.related-links a:hover { color: var(--color-accent); background: var(--color-primary); }
.accordion-item summary { color: var(--color-paper); }
.accordion-item summary svg { color: var(--color-accent); }
.faq-footnote a { color: var(--color-accent); }
.tool-aside { border-top-color: var(--color-accent); }
.tool-stack { border-top-color: var(--color-rule); }
.tool-panel { border-bottom-color: var(--color-rule); }
.tool-heading h2, .moment-card > p, .prompt-box p, .mood-question,
.mood-reflection b { color: var(--color-paper); }
.breath-circle { border-color: var(--color-rule); }
.breath-circle span, .breath-circle small { color: var(--color-paper); }
.breath-circle.breath-active { background: var(--color-primary); }
.check-step { color: var(--color-copy); border-bottom-color: var(--color-rule-soft); }
.check-step > span { border-color: var(--color-accent); }
.check-step.checked > span { background: var(--color-accent); color: var(--color-primary); border-color: var(--color-accent); }
.quiet-button { color: var(--color-accent); }
.tool-feedback, .journal-footer > span { color: var(--color-copy); }
.moment-card { background: var(--color-primary); }
.moment-card .eyebrow { color: var(--color-accent); }
.moment-progress { background: var(--color-rule-soft); }
.moment-progress span { background: var(--color-accent); }
.prompt-box .eyebrow { color: var(--color-accent); }
.tool-panel textarea, .tool-panel input, .directory-main select {
  background: var(--color-primary);
  border-color: var(--color-rule);
  color: var(--color-paper);
}
.tool-panel textarea::placeholder, .tool-panel input::placeholder { color: var(--color-copy); }
.mood-option { border-color: var(--color-rule); color: var(--color-paper); }
.mood-option span { color: var(--color-accent); }
.mood-option.selected { background: var(--color-accent); border-color: var(--color-accent); color: var(--color-primary); }
.mood-option.selected span { color: var(--color-primary); }
.directory-main select option { background: var(--color-primary); color: var(--color-paper); }
.help-banner { border-left-color: var(--color-accent); }
.help-banner b, .empty-directory h2 { color: var(--color-paper); }
.directory-aside { border-top-color: var(--color-accent); }
.category-row { border-bottom-color: var(--color-rule-soft); }
.resource-card { border-color: var(--color-rule); }
.status-pill { background: var(--color-primary); color: var(--color-copy); }
.urgent-page-head > p, .urgent-actions .step-list li p, .urgent-bottom p { color: var(--color-copy); }
.urgent-columns, .urgent-actions .step-list li, .urgent-bottom { border-color: var(--color-rule); }
.urgent-warning { background: var(--color-supporting); color: var(--color-paper); }
.urgent-warning > svg { color: var(--color-accent); }
.not-found p { color: var(--color-copy); }
.feeling-starting-points { margin-top: 12px; }
.starting-point-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); list-style: none; padding: 0; margin: 20px 0 16px; border-top: 1px solid var(--color-rule); }
.starting-point-list li { padding: 13px 10px 13px 0; border-bottom: 1px solid var(--color-rule); color: var(--color-paper); }
.starting-point-list li:nth-child(even) { padding-left: 16px; border-left: 1px solid var(--color-rule); }
.feeling-starting-points > p { color: var(--color-copy); font-size: .88rem; }

@media (max-width: 520px) {
  .starting-point-list { grid-template-columns: 1fr; }
  .starting-point-list li:nth-child(even) { padding-left: 0; border-left: 0; }
}
```

## ```artifacts/offline-mind/src/lib/utils.ts```

```ts
import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## ```artifacts/offline-mind/src/main.tsx```

```tsx
import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
```

## ```artifacts/offline-mind/src/pages/not-found.tsx```

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## ```artifacts/offline-mind/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "noEmit": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom", "dom.iterable"],
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "references": [
    {
      "path": "../../lib/api-client-react"
    }
  ]
}
```

## ```artifacts/offline-mind/vite.config.ts```

```ts
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
```

## ```lib/api-client-react/package.json```

```json
{
  "name": "@workspace/api-client-react",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@tanstack/react-query": "catalog:"
  },
  "peerDependencies": {
    "react": ">=18"
  }
}
```

## ```lib/api-client-react/src/custom-fetch.ts```

```ts
export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// ---------------------------------------------------------------------------
// Module-level configuration
// ---------------------------------------------------------------------------

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer <token>` header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 *
 * NOTE: This function should never be used in web applications where session
 * token cookies are automatically associated with API calls by the browser.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

// Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
// differently, so `instanceof URL` can fail.
function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
      (mediaType.startsWith("text/") ||
        mediaType === "application/xml" ||
        mediaType === "text/xml" ||
        mediaType.endsWith("+xml") ||
        mediaType === "application/x-www-form-urlencoded"),
  );
}

// Use strict equality: in browsers, `response.body` is `null` when the
// response genuinely has no content.  In React Native, `response.body` is
// always `undefined` because the ReadableStream API is not implemented —
// even when the response carries a full payload readable via `.text()` or
// `.json()`.  Loose equality (`== null`) matches both `null` and `undefined`,
// which causes every React Native response to be treated as empty.
function hasNoBody(response: Response, method: string): boolean {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function getStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const candidate = (value as Record<string, unknown>)[key];
  if (typeof candidate !== "string") return undefined;

  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
}

function truncate(text: string, maxLength = 300): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }

  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message =
    getStringField(data, "message") ??
    getStringField(data, "error_description") ??
    getStringField(data, "error");

  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;

  return prefix;
}

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(
    response: Response,
    data: T | null,
    requestInfo: { method: string; url: string },
  ) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

export class ResponseParseError extends Error {
  readonly name = "ResponseParseError";
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;
  readonly rawBody: string;
  readonly cause: unknown;

  constructor(
    response: Response,
    rawBody: string,
    cause: unknown,
    requestInfo: { method: string; url: string },
  ) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} ` +
        `(${response.status} ${response.statusText}) as JSON`,
    );
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}

async function parseJsonBody(
  response: Response,
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  const raw = await response.text();
  const normalized = stripBom(raw);

  if (normalized.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}

async function parseErrorBody(response: Response, method: string): Promise<unknown> {
  if (hasNoBody(response, method)) {
    return null;
  }

  const mediaType = getMediaType(response.headers);

  // Fall back to text when blob() is unavailable (e.g. some React Native builds).
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }

  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();

  if (trimmed === "") {
    return null;
  }

  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }

  return raw;
}

function inferResponseType(response: Response): "json" | "text" | "blob" {
  const mediaType = getMediaType(response.headers);

  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}

async function parseSuccessBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }

  const effectiveType =
    responseType === "auto" ? inferResponseType(response) : responseType;

  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);

    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }

    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          "Blob responses are not supported in this runtime. " +
            "Use responseType \"json\" or \"text\" instead.",
        );
      }
      return response.blob();
  }
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  const headers = mergeHeaders(isRequest(input) ? input.headers : undefined, headersInit);

  if (
    typeof init.body === "string" &&
    !headers.has("content-type") &&
    looksLikeJson(init.body)
  ) {
    headers.set("content-type", "application/json");
  }

  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  const response = await fetch(input, { ...init, method, headers });

  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }

  return (await parseSuccessBody(response, responseType, requestInfo)) as T;
}
```

## ```lib/api-client-react/src/generated/api.schemas.ts```

```ts
/**
 * Generated by orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * API specification
 * OpenAPI spec version: 0.1.0
 */
export interface HealthStatus {
  status: string;
}
```

## ```lib/api-client-react/src/generated/api.ts```

```ts
/**
 * Generated by orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * API specification
 * OpenAPI spec version: 0.1.0
 */
import { useQuery } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type { HealthStatus } from "./api.schemas";

import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;

type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

/**
 * Returns server health status
 * @summary Health check
 */
export const getHealthCheckUrl = () => {
  return `/api/healthz`;
};

export const healthCheck = async (
  options?: RequestInit,
): Promise<HealthStatus> => {
  return customFetch<HealthStatus>(getHealthCheckUrl(), {
    ...options,
    method: "GET",
  });
};

export const getHealthCheckQueryKey = () => {
  return [`/api/healthz`] as const;
};

export const getHealthCheckQueryOptions = <
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({
    signal,
  }) => healthCheck({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type HealthCheckQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthCheck>>
>;
export type HealthCheckQueryError = ErrorType<unknown>;

/**
 * @summary Health check
 */

export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}
```

## ```lib/api-client-react/src/index.ts```

```ts
export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";
```

## ```lib/api-client-react/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["dom", "es2022"]
  },
  "include": ["src"]
}
```

## ```lib/api-spec/openapi.yaml```

```yaml
openapi: 3.1.0
info:
  # Do not change the title, if the title changes, the import paths will be broken
  title: Api
  version: 0.1.0
  description: API specification
servers:
  - url: /api
    description: Base API path
tags:
  - name: health
    description: Health operations
paths:
  /healthz:
    get:
      operationId: healthCheck
      tags: [health]
      summary: Health check
      description: Returns server health status
      responses:
        "200":
          description: Healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthStatus"
components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
      required:
        - status

```

## ```lib/api-spec/orval.config.ts```

```ts
import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

// Our exports make assumptions about the title of the API being "Api" (i.e. generated output is `api.ts`).
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

export default defineConfig({
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          // Orval resolves `auto` from lib/api-spec/package.json, which has no
          // zod dependency, so orval >= 8.23 falls back to Zod 4 syntax while
          // the catalog installs zod 3. Pin to match the catalog.
          version: 3,
          coerce: {
            query: ['boolean', 'number', 'string'],
            param: ['boolean', 'number', 'string'],
            body: ['bigint', 'date'],
            response: ['bigint', 'date'],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
```

## ```lib/api-spec/package.json```

```json
{
  "name": "@workspace/api-spec",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "codegen": "orval --config ./orval.config.ts && pnpm -w run typecheck:libs"
  },
  "devDependencies": {
    "orval": "^8.30.0"
  }
}
```

## ```lib/api-zod/package.json```

```json
{
  "name": "@workspace/api-zod",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "catalog:"
  }
}
```

## ```lib/api-zod/src/generated/api.ts```

```ts
/**
 * Generated by orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * API specification
 * OpenAPI spec version: 0.1.0
 */
import * as zod from "zod";

/**
 * Returns server health status
 * @summary Health check
 */
export const HealthCheckResponse = zod.object({
  status: zod.string(),
});
```

## ```lib/api-zod/src/generated/types/healthStatus.ts```

```ts
/**
 * Generated by orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * API specification
 * OpenAPI spec version: 0.1.0
 */

export interface HealthStatus {
  status: string;
}
```

## ```lib/api-zod/src/generated/types/index.ts```

```ts
/**
 * Generated by orval v8.5.3 🍺
 * Do not edit manually.
 * Api
 * API specification
 * OpenAPI spec version: 0.1.0
 */

export * from "./healthStatus";
```

## ```lib/api-zod/src/index.ts```

```ts
export * from "./generated/api";
export * from "./generated/types";
```

## ```lib/api-zod/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## ```lib/db/drizzle.config.ts```

```ts
import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

## ```lib/db/package.json```

```json
{
  "name": "@workspace/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./schema": "./src/schema/index.ts"
  },
  "scripts": {
    "push": "drizzle-kit push --config ./drizzle.config.ts",
    "push-force": "drizzle-kit push --force --config ./drizzle.config.ts"
  },
  "dependencies": {
    "drizzle-orm": "catalog:",
    "drizzle-zod": "^0.8.3",
    "pg": "^8.23.0",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/pg": "^8.23.1",
    "drizzle-kit": "^0.31.10"
  }
}
```

## ```lib/db/src/index.ts```

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
```

## ```lib/db/src/schema/index.ts```

```ts
// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

export {}
```

## ```lib/db/tsconfig.json```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

## ```package.json```

```json
{
  "name": "workspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "preinstall": "sh -c 'rm -f package-lock.json yarn.lock; case \"$npm_config_user_agent\" in pnpm/*) ;; *) echo \"Use pnpm instead\" >&2; exit 1 ;; esac'",
    "build": "pnpm run typecheck && pnpm -r --if-present run build",
    "typecheck:libs": "tsc --build",
    "typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
  },
  "private": true,
  "dependencies": {
    "@replit/connectors-sdk": "^0.4.3"
  },
  "devDependencies": {
    "prettier": "^3.9.6",
    "typescript": "~5.9.3"
  }
}
```

## ```pnpm-lock.yaml```

```yaml
lockfileVersion: '9.0'

settings:
  autoInstallPeers: false
  excludeLinksFromLockfile: false

catalogs:
  default:
    '@replit/vite-plugin-cartographer':
      specifier: ^0.5.21
      version: 0.5.21
    '@replit/vite-plugin-dev-banner':
      specifier: ^0.1.1
      version: 0.1.2
    '@replit/vite-plugin-runtime-error-modal':
      specifier: ^0.0.6
      version: 0.0.6
    '@tailwindcss/vite':
      specifier: ^4.1.14
      version: 4.3.3
    '@tanstack/react-query':
      specifier: ^5.90.21
      version: 5.102.8
    '@types/node':
      specifier: ^25.3.3
      version: 25.9.6
    '@types/react':
      specifier: ^19.2.0
      version: 19.3.0
    '@types/react-dom':
      specifier: ^19.2.0
      version: 19.3.0
    '@vitejs/plugin-react':
      specifier: ^5.0.4
      version: 5.2.0
    class-variance-authority:
      specifier: ^0.7.1
      version: 0.7.1
    clsx:
      specifier: ^2.1.1
      version: 2.1.1
    drizzle-orm:
      specifier: ^0.45.2
      version: 0.45.2
    framer-motion:
      specifier: ^12.23.24
      version: 12.43.0
    lucide-react:
      specifier: ^0.545.0
      version: 0.545.0
    react:
      specifier: 19.1.0
      version: 19.1.0
    react-dom:
      specifier: 19.1.0
      version: 19.1.0
    tailwind-merge:
      specifier: ^3.3.1
      version: 3.6.0
    tailwindcss:
      specifier: ^4.1.14
      version: 4.3.3
    tsx:
      specifier: ^4.21.0
      version: 4.23.13
    vite:
      specifier: ^7.3.2
      version: 7.3.6
    zod:
      specifier: ^3.25.76
      version: 3.25.76

overrides:
  esbuild>@esbuild/darwin-arm64: '-'
  esbuild>@esbuild/darwin-x64: '-'
  esbuild>@esbuild/freebsd-arm64: '-'
  esbuild>@esbuild/freebsd-x64: '-'
  esbuild>@esbuild/linux-arm: '-'
  esbuild>@esbuild/linux-arm64: '-'
  esbuild>@esbuild/linux-ia32: '-'
  esbuild>@esbuild/linux-loong64: '-'
  esbuild>@esbuild/linux-mips64el: '-'
  esbuild>@esbuild/linux-ppc64: '-'
  esbuild>@esbuild/linux-riscv64: '-'
  esbuild>@esbuild/linux-s390x: '-'
  esbuild>@esbuild/netbsd-arm64: '-'
  esbuild>@esbuild/netbsd-x64: '-'
  esbuild>@esbuild/openbsd-arm64: '-'
  esbuild>@esbuild/openbsd-x64: '-'
  esbuild>@esbuild/sunos-x64: '-'
  esbuild>@esbuild/win32-arm64: '-'
  esbuild>@esbuild/win32-ia32: '-'
  esbuild>@esbuild/win32-x64: '-'
  esbuild>@esbuild/aix-ppc64: '-'
  esbuild>@esbuild/android-arm: '-'
  esbuild>@esbuild/android-arm64: '-'
  esbuild>@esbuild/android-x64: '-'
  esbuild>@esbuild/openharmony-arm64: '-'
  lightningcss>lightningcss-android-arm64: '-'
  lightningcss>lightningcss-darwin-arm64: '-'
  lightningcss>lightningcss-darwin-x64: '-'
  lightningcss>lightningcss-freebsd-x64: '-'
  lightningcss>lightningcss-linux-arm-gnueabihf: '-'
  lightningcss>lightningcss-linux-arm64-gnu: '-'
  lightningcss>lightningcss-linux-arm64-musl: '-'
  lightningcss>lightningcss-linux-x64-musl: '-'
  lightningcss>lightningcss-win32-arm64-msvc: '-'
  lightningcss>lightningcss-win32-x64-msvc: '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-android-arm64': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-darwin-arm64': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-darwin-x64': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-freebsd-x64': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-linux-arm-gnueabihf': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-gnu': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-musl': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-win32-arm64-msvc': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-win32-x64-msvc': '-'
  '@tailwindcss/oxide>@tailwindcss/oxide-linux-x64-musl': '-'
  rollup>@rollup/rollup-android-arm-eabi: '-'
  rollup>@rollup/rollup-android-arm64: '-'
  rollup>@rollup/rollup-darwin-arm64: '-'
  rollup>@rollup/rollup-darwin-x64: '-'
  rollup>@rollup/rollup-freebsd-arm64: '-'
  rollup>@rollup/rollup-freebsd-x64: '-'
  rollup>@rollup/rollup-linux-arm-gnueabihf: '-'
  rollup>@rollup/rollup-linux-arm-musleabihf: '-'
  rollup>@rollup/rollup-linux-arm64-gnu: '-'
  rollup>@rollup/rollup-linux-arm64-musl: '-'
  rollup>@rollup/rollup-linux-loong64-gnu: '-'
  rollup>@rollup/rollup-linux-loong64-musl: '-'
  rollup>@rollup/rollup-linux-ppc64-gnu: '-'
  rollup>@rollup/rollup-linux-ppc64-musl: '-'
  rollup>@rollup/rollup-linux-riscv64-gnu: '-'
  rollup>@rollup/rollup-linux-riscv64-musl: '-'
  rollup>@rollup/rollup-linux-s390x-gnu: '-'
  rollup>@rollup/rollup-linux-x64-musl: '-'
  rollup>@rollup/rollup-openbsd-x64: '-'
  rollup>@rollup/rollup-openharmony-arm64: '-'
  rollup>@rollup/rollup-win32-arm64-msvc: '-'
  rollup>@rollup/rollup-win32-ia32-msvc: '-'
  rollup>@rollup/rollup-win32-x64-gnu: '-'
  rollup>@rollup/rollup-win32-x64-msvc: '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-darwin-arm64': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-darwin-x64': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-freebsd-ia32': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-freebsd-x64': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-linux-arm64': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-linux-arm': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-linux-ia32': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-sunos-x64': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-win32-ia32': '-'
  '@expo/ngrok-bin>@expo/ngrok-bin-win32-x64': '-'
  '@esbuild-kit/esm-loader': npm:tsx@^4.21.0
  esbuild: 0.28.2
  js-yaml: 4.3.2

importers:

  .:
    dependencies:
      '@replit/connectors-sdk':
        specifier: ^0.4.3
        version: 0.4.3
    devDependencies:
      prettier:
        specifier: ^3.9.6
        version: 3.9.6
      typescript:
        specifier: ~5.9.3
        version: 5.9.3

  artifacts/api-server:
    dependencies:
      '@workspace/api-zod':
        specifier: workspace:*
        version: link:../../lib/api-zod
      '@workspace/db':
        specifier: workspace:*
        version: link:../../lib/db
      cookie-parser:
        specifier: ^1.4.7
        version: 1.4.7
      cors:
        specifier: ^2.8.6
        version: 2.8.6
      drizzle-orm:
        specifier: 'catalog:'
        version: 0.45.2(@types/pg@8.23.1)(pg@8.23.0)
      express:
        specifier: ^5.2.1
        version: 5.2.1
      pino:
        specifier: ^9.14.0
        version: 9.14.0
      pino-http:
        specifier: ^10.5.0
        version: 10.5.0
    devDependencies:
      '@types/cookie-parser':
        specifier: ^1.4.10
        version: 1.4.10(@types/express@5.0.6)
      '@types/cors':
        specifier: ^2.8.19
        version: 2.8.19
      '@types/express':
        specifier: ^5.0.6
        version: 5.0.6
      '@types/node':
        specifier: 'catalog:'
        version: 25.9.6
      esbuild:
        specifier: 0.28.2
        version: 0.28.2
      esbuild-plugin-pino:
        specifier: ^2.3.3
        version: 2.3.3(esbuild@0.28.2)(pino-pretty@13.1.3)(pino@9.14.0)(thread-stream@3.1.0)
      pino-pretty:
        specifier: ^13.1.3
        version: 13.1.3
      thread-stream:
        specifier: 3.1.0
        version: 3.1.0

  artifacts/mockup-sandbox:
    devDependencies:
      '@hookform/resolvers':
        specifier: ^3.10.0
        version: 3.10.0(react-hook-form@7.87.0(react@19.1.0))
      '@radix-ui/react-accordion':
        specifier: ^1.2.20
        version: 1.2.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-alert-dialog':
        specifier: ^1.1.23
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-aspect-ratio':
        specifier: ^1.1.15
        version: 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-avatar':
        specifier: ^1.2.6
        version: 1.2.6(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-checkbox':
        specifier: ^1.3.11
        version: 1.3.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-collapsible':
        specifier: ^1.1.20
        version: 1.1.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-context-menu':
        specifier: ^2.3.7
        version: 2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-dialog':
        specifier: ^1.1.23
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-dropdown-menu':
        specifier: ^2.1.24
        version: 2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-hover-card':
        specifier: ^1.1.23
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-label':
        specifier: ^2.1.15
        version: 2.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-menubar':
        specifier: ^1.1.24
        version: 1.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-navigation-menu':
        specifier: ^1.2.22
        version: 1.2.22(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-popover':
        specifier: ^1.1.23
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-progress':
        specifier: ^1.1.16
        version: 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-radio-group':
        specifier: ^1.4.7
        version: 1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-scroll-area':
        specifier: ^1.2.18
        version: 1.2.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-select':
        specifier: ^2.3.7
        version: 2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-separator':
        specifier: ^1.1.15
        version: 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slider':
        specifier: ^1.4.7
        version: 1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot':
        specifier: ^1.3.3
        version: 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-switch':
        specifier: ^1.3.7
        version: 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-tabs':
        specifier: ^1.1.21
        version: 1.1.21(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toast':
        specifier: ^1.2.23
        version: 1.2.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toggle':
        specifier: ^1.1.18
        version: 1.1.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toggle-group':
        specifier: ^1.1.19
        version: 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-tooltip':
        specifier: ^1.2.16
        version: 1.2.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@replit/vite-plugin-cartographer':
        specifier: 'catalog:'
        version: 0.5.21
      '@replit/vite-plugin-runtime-error-modal':
        specifier: 'catalog:'
        version: 0.0.6
      '@tailwindcss/vite':
        specifier: 'catalog:'
        version: 4.3.3(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))
      '@types/node':
        specifier: 'catalog:'
        version: 25.9.6
      '@types/react':
        specifier: 'catalog:'
        version: 19.3.0
      '@types/react-dom':
        specifier: 'catalog:'
        version: 19.3.0(@types/react@19.3.0)
      '@vitejs/plugin-react':
        specifier: 'catalog:'
        version: 5.2.0(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))
      chokidar:
        specifier: ^4.0.3
        version: 4.0.3
      class-variance-authority:
        specifier: 'catalog:'
        version: 0.7.1
      clsx:
        specifier: 'catalog:'
        version: 2.1.1
      cmdk:
        specifier: ^1.1.1
        version: 1.1.1(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      date-fns:
        specifier: ^3.6.0
        version: 3.6.0
      embla-carousel-react:
        specifier: ^8.6.0
        version: 8.6.0(react@19.1.0)
      fast-glob:
        specifier: ^3.3.3
        version: 3.3.3
      framer-motion:
        specifier: 'catalog:'
        version: 12.43.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      input-otp:
        specifier: ^1.5.0
        version: 1.5.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      lucide-react:
        specifier: 'catalog:'
        version: 0.545.0(react@19.1.0)
      next-themes:
        specifier: ^0.4.6
        version: 0.4.6(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react:
        specifier: 'catalog:'
        version: 19.1.0
      react-day-picker:
        specifier: ^9.14.0
        version: 9.14.0(react@19.1.0)
      react-dom:
        specifier: 'catalog:'
        version: 19.1.0(react@19.1.0)
      react-hook-form:
        specifier: ^7.87.0
        version: 7.87.0(react@19.1.0)
      react-resizable-panels:
        specifier: ^2.1.9
        version: 2.1.9(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      recharts:
        specifier: ^2.15.4
        version: 2.15.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      sonner:
        specifier: ^2.0.8
        version: 2.0.8(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      tailwind-merge:
        specifier: 'catalog:'
        version: 3.6.0
      tailwindcss:
        specifier: 'catalog:'
        version: 4.3.3
      tailwindcss-animate:
        specifier: ^1.0.7
        version: 1.0.7(tailwindcss@4.3.3)
      tw-animate-css:
        specifier: ^1.4.0
        version: 1.4.0
      vaul:
        specifier: ^1.1.2
        version: 1.1.2(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      vite:
        specifier: 'catalog:'
        version: 7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0)
      zod:
        specifier: 'catalog:'
        version: 3.25.76

  artifacts/offline-mind:
    dependencies:
      react-router-dom:
        specifier: ^7.18.4
        version: 7.18.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
    devDependencies:
      '@hookform/resolvers':
        specifier: ^3.10.0
        version: 3.10.0(react-hook-form@7.87.0(react@19.1.0))
      '@radix-ui/react-accordion':
        specifier: ^1.2.4
        version: 1.2.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-alert-dialog':
        specifier: ^1.1.7
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-aspect-ratio':
        specifier: ^1.1.3
        version: 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-avatar':
        specifier: ^1.1.4
        version: 1.2.6(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-checkbox':
        specifier: ^1.1.5
        version: 1.3.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-collapsible':
        specifier: ^1.1.4
        version: 1.1.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-context-menu':
        specifier: ^2.2.7
        version: 2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-dialog':
        specifier: ^1.1.7
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-dropdown-menu':
        specifier: ^2.1.7
        version: 2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-hover-card':
        specifier: ^1.1.7
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-label':
        specifier: ^2.1.3
        version: 2.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-menubar':
        specifier: ^1.1.7
        version: 1.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-navigation-menu':
        specifier: ^1.2.6
        version: 1.2.22(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-popover':
        specifier: ^1.1.7
        version: 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-progress':
        specifier: ^1.1.3
        version: 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-radio-group':
        specifier: ^1.2.4
        version: 1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-scroll-area':
        specifier: ^1.2.4
        version: 1.2.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-select':
        specifier: ^2.1.7
        version: 2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-separator':
        specifier: ^1.1.3
        version: 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slider':
        specifier: ^1.2.4
        version: 1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot':
        specifier: ^1.2.0
        version: 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-switch':
        specifier: ^1.1.4
        version: 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-tabs':
        specifier: ^1.1.4
        version: 1.1.21(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toast':
        specifier: ^1.2.7
        version: 1.2.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toggle':
        specifier: ^1.1.3
        version: 1.1.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toggle-group':
        specifier: ^1.1.3
        version: 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-tooltip':
        specifier: ^1.2.0
        version: 1.2.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@replit/vite-plugin-cartographer':
        specifier: 'catalog:'
        version: 0.5.21
      '@replit/vite-plugin-dev-banner':
        specifier: 'catalog:'
        version: 0.1.2
      '@replit/vite-plugin-runtime-error-modal':
        specifier: 'catalog:'
        version: 0.0.6
      '@tailwindcss/typography':
        specifier: ^0.5.15
        version: 0.5.20(tailwindcss@4.3.3)
      '@tailwindcss/vite':
        specifier: 'catalog:'
        version: 4.3.3(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))
      '@tanstack/react-query':
        specifier: 'catalog:'
        version: 5.102.8(react@19.1.0)
      '@types/node':
        specifier: 'catalog:'
        version: 25.9.6
      '@types/react':
        specifier: 'catalog:'
        version: 19.3.0
      '@types/react-dom':
        specifier: 'catalog:'
        version: 19.3.0(@types/react@19.3.0)
      '@vitejs/plugin-react':
        specifier: 'catalog:'
        version: 5.2.0(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))
      '@workspace/api-client-react':
        specifier: workspace:*
        version: link:../../lib/api-client-react
      class-variance-authority:
        specifier: 'catalog:'
        version: 0.7.1
      clsx:
        specifier: 'catalog:'
        version: 2.1.1
      cmdk:
        specifier: ^1.1.1
        version: 1.1.1(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      date-fns:
        specifier: ^3.6.0
        version: 3.6.0
      embla-carousel-react:
        specifier: ^8.6.0
        version: 8.6.0(react@19.1.0)
      framer-motion:
        specifier: 'catalog:'
        version: 12.43.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      input-otp:
        specifier: ^1.4.2
        version: 1.5.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      lucide-react:
        specifier: 'catalog:'
        version: 0.545.0(react@19.1.0)
      next-themes:
        specifier: ^0.4.6
        version: 0.4.6(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react:
        specifier: 'catalog:'
        version: 19.1.0
      react-day-picker:
        specifier: ^9.11.1
        version: 9.14.0(react@19.1.0)
      react-dom:
        specifier: 'catalog:'
        version: 19.1.0(react@19.1.0)
      react-hook-form:
        specifier: ^7.55.0
        version: 7.87.0(react@19.1.0)
      react-icons:
        specifier: ^5.4.0
        version: 5.7.0(react@19.1.0)
      react-resizable-panels:
        specifier: ^2.1.7
        version: 2.1.9(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      recharts:
        specifier: ^2.15.2
        version: 2.15.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      sonner:
        specifier: ^2.0.7
        version: 2.0.8(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      tailwind-merge:
        specifier: 'catalog:'
        version: 3.6.0
      tailwindcss:
        specifier: 'catalog:'
        version: 4.3.3
      tw-animate-css:
        specifier: ^1.4.0
        version: 1.4.0
      vaul:
        specifier: ^1.1.2
        version: 1.1.2(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      vite:
        specifier: 'catalog:'
        version: 7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0)
      wouter:
        specifier: ^3.3.5
        version: 3.13.0(react@19.1.0)
      zod:
        specifier: 'catalog:'
        version: 3.25.76

  lib/api-client-react:
    dependencies:
      '@tanstack/react-query':
        specifier: 'catalog:'
        version: 5.102.8(react@19.1.0)

  lib/api-spec:
    devDependencies:
      orval:
        specifier: ^8.30.0
        version: 8.30.0(prettier@3.9.6)(typescript@5.9.3)

  lib/api-zod:
    dependencies:
      zod:
        specifier: 'catalog:'
        version: 3.25.76

  lib/db:
    dependencies:
      drizzle-orm:
        specifier: 'catalog:'
        version: 0.45.2(@types/pg@8.23.1)(pg@8.23.0)
      drizzle-zod:
        specifier: ^0.8.3
        version: 0.8.3(drizzle-orm@0.45.2(@types/pg@8.23.1)(pg@8.23.0))(zod@3.25.76)
      pg:
        specifier: ^8.23.0
        version: 8.23.0
      zod:
        specifier: 'catalog:'
        version: 3.25.76
    devDependencies:
      '@types/node':
        specifier: 'catalog:'
        version: 25.9.6
      '@types/pg':
        specifier: ^8.23.1
        version: 8.23.1
      drizzle-kit:
        specifier: ^0.31.10
        version: 0.31.10

  scripts:
    devDependencies:
      '@types/node':
        specifier: 'catalog:'
        version: 25.9.6
      tsx:
        specifier: 'catalog:'
        version: 4.23.13

packages:

  '@babel/code-frame@7.29.7':
    resolution: {integrity: sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==}
    engines: {node: '>=6.9.0'}

  '@babel/compat-data@7.29.7':
    resolution: {integrity: sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==}
    engines: {node: '>=6.9.0'}

  '@babel/core@7.29.7':
    resolution: {integrity: sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==}
    engines: {node: '>=6.9.0'}

  '@babel/generator@7.29.8':
    resolution: {integrity: sha512-gZbepsdh3WDtgZKWL+vTPh71LSBrm/Y4/QDZBVCcYfmeTEEuoOYwlSy+G1StfJg+/Zy550u/3TATbm7qDbbMtg==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-compilation-targets@7.29.7':
    resolution: {integrity: sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-globals@7.29.7':
    resolution: {integrity: sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-module-imports@7.29.7':
    resolution: {integrity: sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-module-transforms@7.29.7':
    resolution: {integrity: sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==}
    engines: {node: '>=6.9.0'}
    peerDependencies:
      '@babel/core': ^7.0.0

  '@babel/helper-plugin-utils@7.29.7':
    resolution: {integrity: sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-string-parser@7.29.7':
    resolution: {integrity: sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-validator-identifier@7.29.7':
    resolution: {integrity: sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==}
    engines: {node: '>=6.9.0'}

  '@babel/helper-validator-option@7.29.7':
    resolution: {integrity: sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==}
    engines: {node: '>=6.9.0'}

  '@babel/helpers@7.29.7':
    resolution: {integrity: sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==}
    engines: {node: '>=6.9.0'}

  '@babel/parser@7.29.8':
    resolution: {integrity: sha512-E8lTAYNB1KW+FH+VGJuZM1ioAx2E6oVlvQFRrf5P8ZZmsiJXYAD9vTFV7yyEURNzgh1dFqMZuO6tUwcARbqFCA==}
    engines: {node: '>=6.0.0'}
    hasBin: true

  '@babel/plugin-transform-react-jsx-self@7.29.7':
    resolution: {integrity: sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==}
    engines: {node: '>=6.9.0'}
    peerDependencies:
      '@babel/core': ^7.0.0-0

  '@babel/plugin-transform-react-jsx-source@7.29.7':
    resolution: {integrity: sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==}
    engines: {node: '>=6.9.0'}
    peerDependencies:
      '@babel/core': ^7.0.0-0

  '@babel/runtime@7.29.7':
    resolution: {integrity: sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==}
    engines: {node: '>=6.9.0'}

  '@babel/template@7.29.7':
    resolution: {integrity: sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==}
    engines: {node: '>=6.9.0'}

  '@babel/traverse@7.29.8':
    resolution: {integrity: sha512-I5z7H3bf/41ktsNVLtpN0wAa336HkqIHQ5BuPLEhTkt1jVSyZpeNKIzTgEWmlxjdg81R0IgUCcaE+Ok3NvrfZg==}
    engines: {node: '>=6.9.0'}

  '@babel/types@7.29.8':
    resolution: {integrity: sha512-Vj1jF3cPfxg7OAfoI7QnVKLoILlm2JF9pnVHrX8qx7AHMiYWT+NDAA7jChlNgRS4WTLc/fD1lXLmPixluj+3Gg==}
    engines: {node: '>=6.9.0'}

  '@commander-js/extra-typings@15.0.0':
    resolution: {integrity: sha512-yeJlba62xqmkgELUsn7356MEnzLLu/fw2x4lofFqGnXh6YysRdEs2BaLeLtg1+KU0AXvMeqQvTTp+3hBEBK+EA==}
    peerDependencies:
      commander: ~15.0.0

  '@date-fns/tz@1.5.0':
    resolution: {integrity: sha512-lwYN/vDPeNRULcepoE/LO2Pgx+7/RV+S9ARfbc9lr2DtGkOD7pAiruHvbR1RX3Qyf6ja47EWJDMsNK5vK08DJg==}

  '@drizzle-team/brocli@0.10.2':
    resolution: {integrity: sha512-z33Il7l5dKjUgGULTqBsQBQwckHh5AbIuxhdsIxDDiZAzBOrZO6q9ogcWC65kU382AfynTfgNumVcNIjuIua6w==}

  '@esbuild/linux-x64@0.28.2':
    resolution: {integrity: sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==}
    engines: {node: '>=18'}
    cpu: [x64]
    os: [linux]

  '@floating-ui/core@1.8.0':
    resolution: {integrity: sha512-0CIZ5itps/8x7BG8dEIhs53BvCUH2PCoogtakwRTut+Arm58sJooJ0AuZhLw2HJYIR5cMLNPBSS728sPho2khQ==}

  '@floating-ui/dom@1.8.0':
    resolution: {integrity: sha512-yXSrzeHZBTZadLOlfyhCkJHNeLJnHRnRInwdZ40L7ZiaAtrBwoYlsDrX3v5zB1Utk7CLfzcOVnVVWoXEky7Ceg==}

  '@floating-ui/react-dom@2.1.9':
    resolution: {integrity: sha512-JDjEFGCpImxDCA7JJKviA0M9+RtmJdj0m/NVU5IMgBK+AmZouAQQ7/+2GLH0GXXY0YMw9oXPB8hKdbPYg5QLYg==}
    peerDependencies:
      react: '>=16.8.0'
      react-dom: '>=16.8.0'

  '@floating-ui/utils@0.2.12':
    resolution: {integrity: sha512-HpCo8tmWzLVad5s2d19EhAz5zqrrQ6s69qd6moPMQvkOuSwDT1YgRfWSVuc4ennqrgv3OHppiOGMQ7oC13yIww==}

  '@gerrit0/mini-shiki@3.23.0':
    resolution: {integrity: sha512-bEMORlG0cqdjVyCEuU0cDQbORWX+kYCeo0kV1lbxF5bt4r7SID2l9bqsxJEM0zndaxpOUT7riCyIVEuqq/Ynxg==}

  '@hookform/resolvers@3.10.0':
    resolution: {integrity: sha512-79Dv+3mDF7i+2ajj7SkypSKHhl1cbln1OGavqrsF7p6mbUv11xpqpacPsGDCTRvCSjEEIez2ef1NveSVL3b0Ag==}
    peerDependencies:
      react-hook-form: ^7.0.0

  '@jridgewell/gen-mapping@0.3.13':
    resolution: {integrity: sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==}

  '@jridgewell/remapping@2.3.5':
    resolution: {integrity: sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==}

  '@jridgewell/resolve-uri@3.1.2':
    resolution: {integrity: sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==}
    engines: {node: '>=6.0.0'}

  '@jridgewell/sourcemap-codec@1.6.0':
    resolution: {integrity: sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==}

  '@jridgewell/trace-mapping@0.3.31':
    resolution: {integrity: sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==}

  '@napi-rs/lzma-linux-x64-gnu@1.5.1':
    resolution: {integrity: sha512-oTXEIha4SsuXdTA4Iyskj0kpdx2yVXdhd75c2v3xGrHFfVMsbhTPZU/nMPL4sWKo4pBHm3aucLaqGlF696dTyQ==}
    engines: {node: ^22.20 || ^24.12 || >=25}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@nodelib/fs.scandir@2.1.5':
    resolution: {integrity: sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==}
    engines: {node: '>= 8'}

  '@nodelib/fs.stat@2.0.5':
    resolution: {integrity: sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==}
    engines: {node: '>= 8'}

  '@nodelib/fs.walk@1.2.8':
    resolution: {integrity: sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==}
    engines: {node: '>= 8'}

  '@orval/angular@8.30.0':
    resolution: {integrity: sha512-jivzIagB/4cmsKjO6DeSeiWbxryY5gBGYo+DxpJfvJMrmKAIIEzQPmDePO5nn7whORFG9+9S4orhc+CW9Uaf4A==}

  '@orval/axios@8.30.0':
    resolution: {integrity: sha512-Y8VsMNUdd/BGzqeCDn8JoU24oSAmeHXtTfr+oiW5F0Rd8wenn/m252gwZ7OPYdcLJB8DEw47Kk5nsq69wCmWAw==}

  '@orval/core@8.30.0':
    resolution: {integrity: sha512-3ICDBJwtxOXIEMmyTvBVl99wI7plUS3j+N1TYjp6elJ9L+Z+Xc/YIGOky3mltkl2mNE98OYnBdsS9z9YBvpNmA==}
    peerDependencies:
      '@faker-js/faker': '>=10'
    peerDependenciesMeta:
      '@faker-js/faker':
        optional: true

  '@orval/effect@8.30.0':
    resolution: {integrity: sha512-r56G44tM0gG0XaAIlVm89AyZEeqOpyNikl6p4eByaTap5wGukYGgsM8kVQmqu8q8q5DN+b0bb5p+/40IB5nZ+g==}

  '@orval/fetch@8.30.0':
    resolution: {integrity: sha512-Z32mUWGNGICR9lPaNNQUBpGSxAYkYdMsmlOaZRIiGZVNJW5Awtu1EsiHKwDBzRYMVR/fRkFkTWwYp9QkFO+dhw==}

  '@orval/hono@8.30.0':
    resolution: {integrity: sha512-8ZdTBpkcvfoD9B382s+rD94QIOct/vOevfzH38OsFrxf8rd9zliRSw6CpmvXB2mVIUd9vkIuclOJgnE/4XAqVQ==}
    peerDependencies:
      typescript: '>=5'
    peerDependenciesMeta:
      typescript:
        optional: true

  '@orval/mcp@8.30.0':
    resolution: {integrity: sha512-ud6vw8t2gW2+9oAfWBb+Z1LxIzR8toGNAMCcjjaaIVy9Z+wPDRM7BxKEEpOY6uKY3KJUznde+cFzdfO6UI25Rg==}

  '@orval/mock@8.30.0':
    resolution: {integrity: sha512-m8thXWpAHhwvZoAEmUfJe7t8xEF8X/YNCLGJdeQOalHxLKS2DLV2HRGHRxPK54Ymcs4AEh2HwcfEk7xYsj9Oig==}

  '@orval/query@8.30.0':
    resolution: {integrity: sha512-6dqtvfOZNMlH+5C6zR74LjArw5wXscGz/j6Tm6eYYMOjpPAqAeeLNT71gM/wgGpxr0lFNCMr/kqquimPyBHulw==}

  '@orval/solid-start@8.30.0':
    resolution: {integrity: sha512-9KbOWmYT/fyw87qEKs9hO/reFGY9CajZyAlcJQCU5OApK8bj5WqiT4rAA2Q+vL51iKtl9qIfDm2Li6KAlspzuQ==}

  '@orval/swr@8.30.0':
    resolution: {integrity: sha512-uXW2Vkq2uCWeqo6ZbZglrn4c+siK5OWw0gdx/i+O590li+H1XTikuJw/sK7/Ar/myj1TqXhJ64J6IwfMhTNfkA==}

  '@orval/zod@8.30.0':
    resolution: {integrity: sha512-cMk1lHvveQ7sT2AfMQndBQXMw7rjgNWNE++QUCmXK14teysAPsrDSYlF27ZnCN6BEsF2jadKOeN4stFvfBfoXg==}

  '@pinojs/redact@0.4.0':
    resolution: {integrity: sha512-k2ENnmBugE/rzQfEcdWHcCY+/FM3VLzH9cYEsbdsoqrvzAKRhUZeRNhAZvB8OitQJ1TBed3yqWtdjzS6wJKBwg==}

  '@radix-ui/number@1.1.3':
    resolution: {integrity: sha512-Road2bidD0uu/1BGDOWNdPI06g0lIRy6IF9GZcIrDK2KGItfor8IQwQa+yM2ERgHM1MmHxaxpTzk0/Jp42lNfA==}

  '@radix-ui/primitive@1.1.7':
    resolution: {integrity: sha512-rqWnm76nYT8HoNNqEjpgJ7Pw/DrBj5iBTrmEPo6HTX5+VJyBNOqTdv4g89G63HuR5g0AaENoAcH7Is5fF2kZ8Q==}

  '@radix-ui/react-accordion@1.2.20':
    resolution: {integrity: sha512-jDhG9FvAEnlhnjrsINbNXcUa4G+L1KqSkJSunkbKEzFRcAb52jvM0PjPxPRvhe1HNc5F5yc0yzzWeeqlH4yBIg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-alert-dialog@1.1.23':
    resolution: {integrity: sha512-VAYOiQRqj3GPpYJE0I9J+X8Ip05cyVlNdKOFeiGS2Ou1HHGfpl0BxOyZm6nmVDyU+W+NF3/XLzmjHmVGydhwgA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-arrow@1.1.15':
    resolution: {integrity: sha512-v4zggRcjadnI+ClKDuijlQEW4tw3NoaeHc/PwpKnLoLLKNUG4InLegkstooLcRIUWCs+8L22dGURCVuFfOKfnA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-aspect-ratio@1.1.15':
    resolution: {integrity: sha512-fy+dyVR+90nelK8rqIznFlxzx7uPcGbhxH8Nfr2bHb4UfSe+e3hklOC0luK0hDwVwnRX7xTRySpsrQVeW+/oNQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-avatar@1.2.6':
    resolution: {integrity: sha512-4ULOTJ/mqy2hT9GlWa/MFHxHSvH3nJzHnZM1waNsc5Bonv7i70aNenghXmD97S6OJ81ekXONGGt4nT1r0PfEdA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-checkbox@1.3.11':
    resolution: {integrity: sha512-Gnptr9pDDQxD3hgq2dtPbtrp/c2qH1mBwIzw3X/ivrMb2e1t0jMTi606fVEqFPaQR1ggXIVQWKj3P2WW9v7zGQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collapsible@1.1.20':
    resolution: {integrity: sha512-mcGesGplBnzN2sbvJETzpCNfSMyPnb29q1GRLU+Ib7bJrpIG2ywmRoh2V5VbA2uNvKikKUlVbAPks7JDjz4A8Q==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-collection@1.1.15':
    resolution: {integrity: sha512-9W+B9NPF0NaaPh/1NJd3+KqsnlLqU9H7T2rvww+fp+T/evVXdNAyYcnfRQZFOjkR1ajQp3yORlqnI8soawLvNA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-compose-refs@1.1.5':
    resolution: {integrity: sha512-+48PbAAbq3didjJxa+OaWY2ZwgAKsNiRGyeHKszblZMQ+kcpd9pAaT11cMkGEie0vsOi3QdeTE6d5Fe3Gn61kA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-context-menu@2.3.7':
    resolution: {integrity: sha512-CtXP35dxaB5T3zXSd+E3uHe/QpXcpYnZmxp6OaIbfthtfW4wyb77M23BG+bwIJDtsMwEP/YssdsmNyZu7jhWew==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-context@1.2.2':
    resolution: {integrity: sha512-RHCUGwKHDr0hDGg4X7ma4JG4/+12qxw8rkh5QKdDldlCvtja6nUx1Ef/8HVrJze81lEsgLQlqjzjGNHantgnQA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dialog@1.1.23':
    resolution: {integrity: sha512-Ksw4WeROkO4rC9k/onilX/Ao2Cr1ku1unMNH+XSCcP4jSXYu7HDsg9n4ojMjVb22XpYjAQ9qfrFlVbru1vXDUA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-direction@1.1.4':
    resolution: {integrity: sha512-5pzg4FGQNpExhnhT2zlrP1wZFaYCd1K0nYWoFAdcYoYK868IEigqMX3B3f8yIoRlAhAeDWciLI6ZdCKHF9P4Vg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-dismissable-layer@1.1.19':
    resolution: {integrity: sha512-8g4pfOL9HoKKLWGiypT+dphVqjFfmcXO5GBnhsG6zI+lxAx/8feQpr+1LSN8Re3hiZ+XkLNS4O9ztK11/LzQ6w==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-dropdown-menu@2.1.24':
    resolution: {integrity: sha512-geq8l2rJkxvkXsT9RMgtUE3P8pITFpTsvYpbySi1IH4fZEABD/Gp85myayFgxk0ktljGMJnCbeFkyTusvSvv7g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-focus-guards@1.1.6':
    resolution: {integrity: sha512-RNOJjfZMTyBM6xYmV3IVGXkPjIhcBAuv48POevAXwrGJhkWZ9p1rFoIS1JFooPuT193AZmRsCPhpoVJxx6OPoQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-focus-scope@1.1.16':
    resolution: {integrity: sha512-wmRZ2WWLvmt6KHy2rNPOdPUjwq5xOHY02+m+udwJTn0aNIox/rkskAvJTyTLGhPK6KgrUjlJUJpgmx/+wFiFIQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-hover-card@1.1.23':
    resolution: {integrity: sha512-H8qONfZd3ltrU3+jHCIgITbWo6e1iTKvP9DHdrvYbX48ooRM5FjEDTn16AMwdfuOGkWdZEhpl3PLL/Wk/AnHDQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-id@1.1.4':
    resolution: {integrity: sha512-TMQp2llA+RYn7JcjnrMnz7wN4pcVttPZnRZo52PLQsoLVKzNlVwUeHmfePgTgRluXFvlD3GD5g5MOVVTJCO0qA==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-label@2.1.15':
    resolution: {integrity: sha512-o/rdYEwZTTo5tjknnPeyQFU45kUC4i/XyeDPP+HGyi6XqpOP6Zf5Ya5vh/Yfe9Id5JiuWnnAx2XqIeD3UYZt0g==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menu@2.1.24':
    resolution: {integrity: sha512-uW7RVuU6Lp/ZtfeY4b3kL32zccgEWvPv1+cf17ubYzHa9cL8AHokmk36cG/XEiH/smbQvumnieXX9j/e9RqJWA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-menubar@1.1.24':
    resolution: {integrity: sha512-eeVs0vf7cuqXaM0qLQCPcufImiJNVBXdJDLu7ZGYl2732UH23Qat/foNGrr6vYV3/DdTsBqASoggUFgH14OcZA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-navigation-menu@1.2.22':
    resolution: {integrity: sha512-ou7iLEJ+yrhQndkkA4U21XIdS/CS45F4iXIkTZcb6/Ne9EMsOuDudVmCwmDnfFZZ+y1FZqXRNSIgBy+YMvZVZg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popover@1.1.23':
    resolution: {integrity: sha512-mw58MrBlyHWFisTOYignD0vf/3gdcgAR+9of1s9G/38CbFiUwH1nCDkc0AUM9IrXFgN5Ue8n45j9WCgyM1sbiQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-popper@1.3.7':
    resolution: {integrity: sha512-UsJrrd7w4wuKKTdvd/DNERVlwSlUcyXzjhyDwBk+3aPOsCjOY6ZSbxuw8E6lZTjjfP8Cpd0J8VVkrYUWyGYXyg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-portal@1.1.17':
    resolution: {integrity: sha512-vKQLcWypUnwZVvfV7UkGahH2g6ySe8M8R+zYBwPrv5byZ9QAW6cQVvNKo7GgmD+p8aYb6D9JBuvy8/WhOno2wQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-presence@1.1.10':
    resolution: {integrity: sha512-3wyzCQ6+ubRA+D4uv9m95JYLXxmOHp05qjrkjeA7uKHHtjpPggQzc6DAb0URl7j67oR0K2foO4ip27TiX037Bw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-primitive@2.1.10':
    resolution: {integrity: sha512-MucOnzh6hR5mid6VpkbglRAMYMjKLqRnGBbjXkzjK52fuQDd1qbkx78a5P40mkcnVXJdEVxm26E9OPAiUq7nBg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-progress@1.1.16':
    resolution: {integrity: sha512-5XnomAsoZZCY+KNTxbIghpGqPruZvKFNlvcAljVAOdDRDsH4/OZQxhtwo5wdtoDM5R6MhJBb2sPnDuRFep3lzg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-radio-group@1.4.7':
    resolution: {integrity: sha512-cgYFEkntCxppHZgtSZ+7vh0wbZQ+IC7PPMw8DSnRG27B6kDd32/Zw0OJt7dGDigCoprMuWHjg2PvUn3PYvPFoQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-roving-focus@1.1.19':
    resolution: {integrity: sha512-V9jI6hDjT7l3jsCQD9bLNvDLM3tH/gdbOTp7Tefp3hbbgCGQoK7tUvrWiRlcoBHIZ809ElXwNQwVo0B98LuTXQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-scroll-area@1.2.18':
    resolution: {integrity: sha512-Zn5Cd171wxsO3Dfg8HaW6RifTb9CYTKQJHs/G4+LN1GfmJpaQMZQyQxMprVPHpaz7QY4l9BxK2JwQuzHsXC8nA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-select@2.3.7':
    resolution: {integrity: sha512-WFGImkmbzcfxeIwq/+4HvRN0pizBwbwQUED4I13ezQsDdfl38ZntN6TmR8XaSzPBqoCToe8rF75j6NPNDSzhbg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-separator@1.1.15':
    resolution: {integrity: sha512-jOLO4lssEzWpoDu7G+Ze4VjwMRUBt291pnZD0gmalREZipnTX3wadQo7Fy48GCTfe14/YRN6rw/rOJqrE85Wxw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slider@1.4.7':
    resolution: {integrity: sha512-mTSLf1GC/C0moWjTbvCM6Qn/gBjvlFt1azuWF2v7MN5C3Zq2U2J2lN3ZEYkpujuOU5Ro7A28wkviSxaKnG0BYg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-slot@1.3.3':
    resolution: {integrity: sha512-qx7oqnYbxnK9kYI9m317qmFmEgo6ywqWvbTogdj7cL9p3/yx4M48p7Rnw5z3H890cL/ow/EeWJsuTykeZVXP5Q==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-switch@1.3.7':
    resolution: {integrity: sha512-48tB/4dn2UVLBCYhTu9AuR63IHl73l/qLbLgxd86noTUor4/K4LFDAcYjK+isP5313qxaFpjPVogE7+Y0/V3Kw==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tabs@1.1.21':
    resolution: {integrity: sha512-UKxJlZid7FVtsk/WTxj4i4uSEgj2Au+KBbS7SQyTlzMhhn+86Cz3tISZdTa87bfEfcuvZezf2ZsxD4xuEKtkog==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toast@1.2.23':
    resolution: {integrity: sha512-ofhyAsYaocRGOs/n0XWdUOSVzEAG6BfrMVM8z0c0kLEWY38w/0WuMFPTJP/HVaZPYkMvHZoKIIhNcjbTCBILPg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle-group@1.1.19':
    resolution: {integrity: sha512-OtnwuSVjd1Ofi+AdnvhsjQdyuhCDwYs1w9RyB5BN/OavXOVQo42SYqQjwUnbPnaiPFBpQ9aX70dWeee+v2oBLA==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-toggle@1.1.18':
    resolution: {integrity: sha512-7lonPlKfSacd20GlOBx2ltuVKz9oqWYZz+oMQyOltw6t1y2nyftj2ZmwwUHYn49kqfDWcp8dNZm5NgV+5Z+mug==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-tooltip@1.2.16':
    resolution: {integrity: sha512-6EamKFRRnlpdadndbZ6LMwycfwkwPte1B42hs6QA0gYhjaOKqW4PZ4pjaW9UrlDX5eVt/OjncE7BFTPL5nmZhg==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/react-use-callback-ref@1.1.4':
    resolution: {integrity: sha512-R6OUY2e2fA6Yn6s+VSx5KBV6Nx8LQEhu+cz7LCej18rQ1HLyg9PSC9jP/ZNx0o6FAIK9c0F1kHylzSxKsdlkrQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-controllable-state@1.2.6':
    resolution: {integrity: sha512-uEQJGT97ZA/TgP/Hydw47lHu+/vQj6z/0jA+WeTbK1o9Rx45GImjpD0tc3W5ad3D6XTSR6e1yEO0FvGq6WQfVQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-effect-event@0.0.5':
    resolution: {integrity: sha512-7cshFL8HGS/7HEiHH+9kL9HBwp2sa9yX18Knwek6KYWmXwM7pegMgta2AXMQKI+rq3JnfSj9x8wYqFMTdG1Jgg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-is-hydrated@0.1.3':
    resolution: {integrity: sha512-umO/aJ+82CpOnhDZUTbILCQf7kU/g0iv+oGs/Q8jw7IkhWBzaEP4sA268PhFAJTFetbwp3ICc6ktpI4TqtxcIw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-layout-effect@1.1.4':
    resolution: {integrity: sha512-K20DkRkUwDnxEYMBPcg3Y6voLkEy5p5QQmszZgLngKKiC7dzBR/aEuK3w1qlx2JWDUNH6FluahYdgR3BP+QbYw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-previous@1.1.4':
    resolution: {integrity: sha512-XoSLhbRbqxFtgJoi2fNHA3C6pDlY34x508vUpUGoFZfvePfHXHbE1lC4FYFMnJWgiCRroSTw6fOsXQoVS9RwZg==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-rect@1.1.4':
    resolution: {integrity: sha512-cSOCh6JlkmfjLyNcLiu2nB4v+nm+dkZ+Q5KHWk/soo4U7ZLiEQFKHK9/YmtBHjfCEaU43IBKQOc4/uJmCaiCTQ==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-use-size@1.1.4':
    resolution: {integrity: sha512-D3anSY15EJoxrihpsXI6SMrmmonnQtR2ni7arO+Lfdg3O95b9hNXxONk8jA5C8ANdF/h5HMAxejgs8PWJ6rlhw==}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  '@radix-ui/react-visually-hidden@1.2.11':
    resolution: {integrity: sha512-NFS86RYYZb4/exihaESBGOpMJFz8MGLAfu3mOBSGByVnVPC9JPASfYubxd/8KbkQK0sYAv8lVQDEQukDX/qXvQ==}
    peerDependencies:
      '@types/react': '*'
      '@types/react-dom': '*'
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true
      '@types/react-dom':
        optional: true

  '@radix-ui/rect@1.1.3':
    resolution: {integrity: sha512-JtyZR+mqgBibTo8xea3B6ZRmzZiM/YeVBtUkas6zMuXjAlfIFIW2FgqeM9eLyvEaYX66vr6DJMK+4U6LV0KhNw==}

  '@replit/connectors-sdk@0.4.3':
    resolution: {integrity: sha512-7XoaRty/O6JF161UkVBI8UewZ96XCNNN1kRvT9Q41IRH3xr+6ImylvXtirIghydDd2FCQvIkY4HQscOOr45otA==}

  '@replit/vite-plugin-cartographer@0.5.21':
    resolution: {integrity: sha512-E5rco8Mov05QDfUOjoim3MVJdDX0/pBYql5Jay3w9cqmU/QOL6cEOUAjsBZPB/V8FEChsk++sZUrcWt1bHaAoQ==}

  '@replit/vite-plugin-dev-banner@0.1.2':
    resolution: {integrity: sha512-YfW3U1xKnLrqvSiTzXeEX8AG+Vpz7XwBsJHNvGbp841AE1mLvishMQi2Zw7ApyHp+9EMGthXuCjP+mLbl3IuGA==}

  '@replit/vite-plugin-runtime-error-modal@0.0.6':
    resolution: {integrity: sha512-53iuzLsrvcUnWxAo0fvNrUhOf7LYJ+3at61dZeTIrkaZD4vGNjTbvE0j50TFcjjTC9UM74uprlnQ4+L2A//Cjg==}

  '@rolldown/pluginutils@1.0.0-rc.3':
    resolution: {integrity: sha512-eybk3TjzzzV97Dlj5c+XrBFW57eTNhzod66y9HrBlzJ6NsCrWCp/2kaPS3K9wJmurBC0Tdw4yPjXKZqlznim3Q==}

  '@rollup/rollup-linux-x64-gnu@4.63.1':
    resolution: {integrity: sha512-gfI5T24WLLuFfSKw7Go/zDXjAAV0fny0swTaDv+WjK7vqcw4cRhFfdsyKL1n+ukI+ooBxn3bVQnyrn06WpI50w==}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@scalar/helpers@0.10.0':
    resolution: {integrity: sha512-IAfnpIZnXY6ni+zyFMwWHBa5b/7yr4mCSvoTGR84oS9q4Quy2wjgafnr7CyfL65ney3iilBZHigZYLYqdqCu3Q==}
    engines: {node: '>=22'}

  '@scalar/helpers@0.11.1':
    resolution: {integrity: sha512-Knwbe0IYqFk0PPDoOKLasqglBHfyf9/zwWWqFsSNi/AtdjM29wSZXN6p8DFid6iB5B9epYH9YiSgJ6tpD00TEw==}
    engines: {node: '>=22'}

  '@scalar/json-magic@0.12.20':
    resolution: {integrity: sha512-5JawJ1L3+ddDoKefkXsklKs6CmmTIcPDmkJPpAkbRi9QQiU9MUONQ4VSi2z3ij+8Ka4neNhsXBNG4itPjurBLg==}
    engines: {node: '>=22'}

  '@scalar/json-magic@0.13.2':
    resolution: {integrity: sha512-T8rQw5u7+MSTDpUcd5ShX1taOUxpZMv2b/P6xsahdlv/u68VX/Bq/+uzuAf2xW8IIOy7BEP4MBggle/vMDgAXw==}
    engines: {node: '>=22'}

  '@scalar/openapi-parser@0.28.16':
    resolution: {integrity: sha512-zHEQExXo58Nk7/Tju4y4HLVJ+B5nnDmR7vPhhHLVinL0z99aGrd6S/8HREupVpfAsim326pfzIbSM+UOvEbnOw==}
    engines: {node: '>=22'}

  '@scalar/openapi-types@0.9.4':
    resolution: {integrity: sha512-eUSIjZEBLEF2i2pvcNdzXhzlKx6qt+hZsNklLmCyzPBoXWxHcQaEClgMFavXDRRvJDdi6LkyjqGUqqf0XgRgFg==}
    engines: {node: '>=22'}

  '@scalar/openapi-types@0.9.5':
    resolution: {integrity: sha512-czrz/zkVm1oPzrpYo3hI/iymfiw1s4dgJiQtwNi2U77Sqf3EQOGKsif4VNRa5suWMYRuPaFx5EiFM1FNEV4Whg==}
    engines: {node: '>=22'}

  '@scalar/openapi-upgrader@0.2.15':
    resolution: {integrity: sha512-yqROK9U96ElasEL4Wl/+PIjQZlqrQXVUUpXk9PA6xBnrp8KdEv7at8pR5gsZkvddJfYVwLILPlctyqUg4u4YZA==}
    engines: {node: '>=22'}

  '@sec-ant/readable-stream@0.4.1':
    resolution: {integrity: sha512-831qok9r2t8AlxLko40y2ebgSDhenenCatLVeW/uBtnHPyhHOvG0C7TvfgecV+wHzIm5KUICgzmVpWS+IMEAeg==}

  '@shikijs/engine-oniguruma@3.23.0':
    resolution: {integrity: sha512-1nWINwKXxKKLqPibT5f4pAFLej9oZzQTsby8942OTlsJzOBZ0MWKiwzMsd+jhzu8YPCHAswGnnN1YtQfirL35g==}

  '@shikijs/langs@3.23.0':
    resolution: {integrity: sha512-2Ep4W3Re5aB1/62RSYQInK9mM3HsLeB91cHqznAJMuylqjzNVAVCMnNWRHFtcNHXsoNRayP9z1qj4Sq3nMqYXg==}

  '@shikijs/themes@3.23.0':
    resolution: {integrity: sha512-5qySYa1ZgAT18HR/ypENL9cUSGOeI2x+4IvYJu4JgVJdizn6kG4ia5Q1jDEOi7gTbN4RbuYtmHh0W3eccOrjMA==}

  '@shikijs/types@3.23.0':
    resolution: {integrity: sha512-3JZ5HXOZfYjsYSk0yPwBrkupyYSLpAE26Qc0HLghhZNGTZg/SKxXIIgoxOpmmeQP0RRSDJTk1/vPfw9tbw+jSQ==}

  '@shikijs/vscode-textmate@10.0.2':
    resolution: {integrity: sha512-83yeghZ2xxin3Nj8z1NMd/NCuca+gsYXswywDy5bHvwlWL8tpTQmzGeUuHd9FC3E/SBEMvzJRwWEOz5gGes9Qg==}

  '@sindresorhus/merge-streams@4.0.0':
    resolution: {integrity: sha512-tlqY9xq5ukxTUZBmoOp+m61cqwQD5pHJtFY3Mn8CA8ps6yghLH/Hw8UPdqg4OLmFW3IFlcXnQNmo/dh8HzXYIQ==}
    engines: {node: '>=18'}

  '@tabby_ai/hijri-converter@1.0.5':
    resolution: {integrity: sha512-r5bClKrcIusDoo049dSL8CawnHR6mRdDwhlQuIgZRNty68q0x8k3Lf1BtPAMxRf/GgnHBnIO4ujd3+GQdLWzxQ==}
    engines: {node: '>=16.0.0'}

  '@tailwindcss/node@4.3.3':
    resolution: {integrity: sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==}

  '@tailwindcss/oxide-linux-x64-gnu@4.3.3':
    resolution: {integrity: sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==}
    engines: {node: '>= 20'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  '@tailwindcss/oxide-wasm32-wasi@4.3.3':
    resolution: {integrity: sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==}
    engines: {node: '>=14.0.0'}
    cpu: [wasm32]
    bundledDependencies:
      - '@napi-rs/wasm-runtime'
      - '@emnapi/core'
      - '@emnapi/runtime'
      - '@tybys/wasm-util'
      - '@emnapi/wasi-threads'
      - tslib

  '@tailwindcss/oxide@4.3.3':
    resolution: {integrity: sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==}
    engines: {node: '>= 20'}

  '@tailwindcss/typography@0.5.20':
    resolution: {integrity: sha512-hwbzQuNUfcPvbegQFatVPl/MY/tcM9KLl963hQ5laJKPh81TEZ1+dNG9PirGvcaDBkp+BCshExAyKVPW91dozw==}
    peerDependencies:
      tailwindcss: '>=3.0.0 || >=4.0.0 || insiders'

  '@tailwindcss/vite@4.3.3':
    resolution: {integrity: sha512-yYU8cogLeSh/ms2jh8Fj7jaba/EWa7Ja6GoUqYZaraEuCI5YS6ms6ObZgjjedm+jm6XZjdNRWBpPP6Z86oOxcw==}
    peerDependencies:
      vite: ^5.2.0 || ^6 || ^7 || ^8

  '@tanstack/query-core@5.102.8':
    resolution: {integrity: sha512-ZNjkJ33CqvPNec/6lZBnHqLc3EVGPZ9ySLhYahU9TcuRFdmwXewuj0c4hwSWcGHqEUwcSrKeZ+oGcvPBqXcQcg==}

  '@tanstack/react-query@5.102.8':
    resolution: {integrity: sha512-TYBea4OuXWD7MhaSHq069TWbFe7rcwWN6kzT7JF0OKi1K6c1gTv2IzD6A6ExJsCMozdkqBWeuIUZmu4KQg0O5A==}
    peerDependencies:
      react: ^18 || ^19

  '@types/babel__core@7.20.5':
    resolution: {integrity: sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==}

  '@types/babel__generator@7.27.0':
    resolution: {integrity: sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==}

  '@types/babel__template@7.4.4':
    resolution: {integrity: sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==}

  '@types/babel__traverse@7.28.0':
    resolution: {integrity: sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==}

  '@types/body-parser@1.19.6':
    resolution: {integrity: sha512-HLFeCYgz89uk22N5Qg3dvGvsv46B8GLvKKo1zKG4NybA8U2DiEO3w9lqGg29t/tfLRJpJ6iQxnVw4OnB7MoM9g==}

  '@types/connect@3.4.38':
    resolution: {integrity: sha512-K6uROf1LD88uDQqJCktA4yzL1YYAK6NgfsI0v/mTgyPKWsX1CnJ0XPSDhViejru1GcRkLWb8RlzFYJRqGUbaug==}

  '@types/cookie-parser@1.4.10':
    resolution: {integrity: sha512-B4xqkqfZ8Wek+rCOeRxsjMS9OgvzebEzzLYw7NHYuvzb7IdxOkI0ZHGgeEBX4PUM7QGVvNSK60T3OvWj3YfBRg==}
    peerDependencies:
      '@types/express': '*'

  '@types/cors@2.8.19':
    resolution: {integrity: sha512-mFNylyeyqN93lfe/9CSxOGREz8cpzAhH+E93xJ4xWQf62V8sQ/24reV2nyzUWM6H6Xji+GGHpkbLe7pVoUEskg==}

  '@types/d3-array@3.2.2':
    resolution: {integrity: sha512-hOLWVbm7uRza0BYXpIIW5pxfrKe0W+D5lrFiAEYR+pb6w3N2SwSMaJbXdUfSEv+dT4MfHBLtn5js0LAWaO6otw==}

  '@types/d3-color@3.1.3':
    resolution: {integrity: sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==}

  '@types/d3-ease@3.0.2':
    resolution: {integrity: sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==}

  '@types/d3-interpolate@3.0.4':
    resolution: {integrity: sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==}

  '@types/d3-path@3.1.1':
    resolution: {integrity: sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==}

  '@types/d3-scale@4.0.9':
    resolution: {integrity: sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==}

  '@types/d3-shape@3.2.0':
    resolution: {integrity: sha512-kVd74ta9eof3eJOvbNd1vGKS/XERRyQbT26Og63hIsvDO84cjD5gEOhsXf26w3FSoNlPVz84DOFcKv/oou+fMw==}

  '@types/d3-time@3.0.4':
    resolution: {integrity: sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==}

  '@types/d3-timer@3.0.2':
    resolution: {integrity: sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==}

  '@types/estree@1.0.9':
    resolution: {integrity: sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==}

  '@types/express-serve-static-core@5.1.3':
    resolution: {integrity: sha512-dPfW8NFiOF4wOHc7+N/QSxlY9cfSsenewGbAz8C8U/MULPd/YZ27LvJUIlzaXie7e6Ove9YunJGgC9tbHD2cKw==}

  '@types/express@5.0.6':
    resolution: {integrity: sha512-sKYVuV7Sv9fbPIt/442koC7+IIwK5olP1KWeD88e/idgoJqDm3JV/YUiPwkoKK92ylff2MGxSz1CSjsXelx0YA==}

  '@types/hast@3.0.5':
    resolution: {integrity: sha512-rp/ezSWaD1m44dPKICGhiskI13nVr7qTloFwDa/IYkhhf5nzwP+zIQcIJh3WIFSBOy/H1PzB40jPjMDksN4F+g==}

  '@types/http-errors@2.0.5':
    resolution: {integrity: sha512-r8Tayk8HJnX0FztbZN7oVqGccWgw98T/0neJphO91KkmOzug1KkofZURD4UaD5uH8AqcFLfdPErnBod0u71/qg==}

  '@types/node@25.9.6':
    resolution: {integrity: sha512-JR6Q/PV5DKFvjrGFVqQJdeG0qvsqQQLDa3TzFrqVwhqRXqwNaxPo2KYCtCQXpOdIulCouKwT7a6in9nFthBAzw==}

  '@types/pg@8.23.1':
    resolution: {integrity: sha512-fKVHpikPdg4GKks3JuLEhvwSyvwzF23hnabPy6DD8ljVbC7+6J5dQzdv4arV6jqq57djnMgs1HKBxX4P8aBI3A==}

  '@types/qs@6.15.1':
    resolution: {integrity: sha512-GZHUBZR9hckSUhrxmp1nG6NwdpM9fCunJwyThLW1X3AyHgd9IlHb6VANpQQqDr2o/qQp6McZ3y/IA2rVzKzSbw==}

  '@types/range-parser@1.2.7':
    resolution: {integrity: sha512-hKormJbkJqzQGhziax5PItDUTMAM9uE2XXQmM37dyd4hVM+5aVl7oVxMVUiVQn2oCQFN/LKCZdvSM0pFRqbSmQ==}

  '@types/react-dom@19.3.0':
    resolution: {integrity: sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==}
    peerDependencies:
      '@types/react': ^19.3.0

  '@types/react@19.3.0':
    resolution: {integrity: sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==}

  '@types/send@1.2.1':
    resolution: {integrity: sha512-arsCikDvlU99zl1g69TcAB3mzZPpxgw0UQnaHeC1Nwb015xp8bknZv5rIfri9xTOcMuaVgvabfIRA7PSZVuZIQ==}

  '@types/serve-static@2.2.0':
    resolution: {integrity: sha512-8mam4H1NHLtu7nmtalF7eyBH14QyOASmcxHhSfEoRyr0nP/YdoesEtU+uSRvMe96TW/HPTtkoKqQLl53N7UXMQ==}

  '@types/unist@3.0.3':
    resolution: {integrity: sha512-ko/gIFJRv177XgZsZcBwnqJN5x/Gien8qNOn0D5bQU/zAzVf9Zt3BlcUiLqhV9y4ARk0GbT3tnUiPNgnTXzc/Q==}

  '@vitejs/plugin-react@5.2.0':
    resolution: {integrity: sha512-YmKkfhOAi3wsB1PhJq5Scj3GXMn3WvtQ/JC0xoopuHoXSdmtdStOpFrYaT1kie2YgFBcIe64ROzMYRjCrYOdYw==}
    engines: {node: ^20.19.0 || >=22.12.0}
    peerDependencies:
      vite: ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0 || ^8.0.0

  accepts@2.0.0:
    resolution: {integrity: sha512-5cvg6CtKwfgdmVqY1WIiXKc3Q1bkRqGLi+2W/6ao+6Y7gu/RCwRuAhGEzh5B4KlszSuTLgZYuqFqo5bImjNKng==}
    engines: {node: '>= 0.6'}

  acorn@8.18.0:
    resolution: {integrity: sha512-lGq+9yr1/GuAWaVYIHRjvvySG5/4VfKIvC8EWxStPdcDh/Ka7FG3twP6v4d5BkravUilhIAsG4Qj83t02LWUPQ==}
    engines: {node: '>=0.4.0'}
    hasBin: true

  ajv-draft-04@1.0.0:
    resolution: {integrity: sha512-mv00Te6nmYbRp5DCwclxtt7yV/joXJPGS7nM+97GdxvuttCOfgI3K4U25zboyeX0O+myI8ERluxQe5wljMmVIw==}
    peerDependencies:
      ajv: ^8.5.0
    peerDependenciesMeta:
      ajv:
        optional: true

  ajv-formats@3.0.1:
    resolution: {integrity: sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==}

  ajv@8.20.0:
    resolution: {integrity: sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==}

  argparse@2.0.1:
    resolution: {integrity: sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==}

  aria-hidden@1.2.6:
    resolution: {integrity: sha512-ik3ZgC9dY/lYVVM++OISsaYDeg1tb0VtP5uL3ouh1koGOaUMDPpbFIei4JkFimWUFPn90sbMNMXQAIVOlnYKJA==}
    engines: {node: '>=10'}

  atomic-sleep@1.0.0:
    resolution: {integrity: sha512-kNOjDqAh7px0XWNI+4QbzoiR/nTkHAWNud2uvnJquD1/x5a7EQZMJT0AczqK0Qn67oY/TTQ1LbUKajZpp3I9tQ==}
    engines: {node: '>=8.0.0'}

  balanced-match@4.0.4:
    resolution: {integrity: sha512-BLrgEcRTwX2o6gGxGOCNyMvGSp35YofuYzw9h1IMTRmKqttAZZVU67bdb9Pr2vUHA8+j3i2tJfjO6C6+4myGTA==}
    engines: {node: 18 || 20 || >=22}

  baseline-browser-mapping@2.11.21:
    resolution: {integrity: sha512-uh8vpY/1/YyFkunIDFH/12p7/7VdPKA1hejMVEbdkEaWnUz0Hesvx5EbiU6XxjyHZIOju+ZMbQJkRh+es3/spQ==}
    engines: {node: '>=6.0.0'}
    hasBin: true

  body-parser@2.3.0:
    resolution: {integrity: sha512-2cGmJupaNgg+QUwVLAucDuWuoMZ6EX9iHDRswZ5lsNYEmwPaRknMPCLZz07yTzVq/83p4o/wzbDZbBrTvGGTIw==}
    engines: {node: '>=18'}

  brace-expansion@5.0.9:
    resolution: {integrity: sha512-ScQ4IuvIEF1TMlP7Zt+vjJ//9zlPb2SDcxWxM3bk8s6t6GGdJ7KO1dCcTidOPJKePW30LE/2cT7wCyPho9/Wxg==}
    engines: {node: 20 || >=22}

  braces@3.0.3:
    resolution: {integrity: sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==}
    engines: {node: '>=8'}

  browserslist@4.28.9:
    resolution: {integrity: sha512-EWazOblFYUvlGZcfGhPUPmYh3nikUxBVb+y9MJun5f3hBi812X+8MSQTujLBtgK3cf51fJWbWfOjyeO954d+Eg==}
    engines: {node: ^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7}
    hasBin: true

  bytes@3.1.2:
    resolution: {integrity: sha512-/Nf7TyzTx6S3yRJObOAV7956r8cr2+Oj8AC5dt8wSP3BQAoeX58NoHyCU8P8zGkNXStjTSi6fzO6F0pBdcYbEg==}
    engines: {node: '>= 0.8'}

  call-bind-apply-helpers@1.0.2:
    resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
    engines: {node: '>= 0.4'}

  call-bound@1.0.4:
    resolution: {integrity: sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==}
    engines: {node: '>= 0.4'}

  caniuse-lite@1.0.30001810:
    resolution: {integrity: sha512-TITQPUkaz+aVk5GL6NhOdwk1aEaNTSDPsGFWrTuhKGtjTF70jL/Oht2W4c6rXUe5fu7Ie19VIahAXHIIiWWNeg==}

  chokidar@4.0.3:
    resolution: {integrity: sha512-Qgzu8kfBvo+cA4962jnP1KkS6Dop5NS6g7R5LFYJr4b8Ub94PPQXUksCw9PvXoeXPRRddRNC5C1JQUR2SMGtnA==}
    engines: {node: '>= 14.16.0'}

  chokidar@5.0.0:
    resolution: {integrity: sha512-TQMmc3w+5AxjpL8iIiwebF73dRDF4fBIieAqGn9RGCWaEVwQ6Fb2cGe31Yns0RRIzii5goJ1Y7xbMwo1TxMplw==}
    engines: {node: '>= 20.19.0'}

  class-variance-authority@0.7.1:
    resolution: {integrity: sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==}

  clsx@2.1.1:
    resolution: {integrity: sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==}
    engines: {node: '>=6'}

  cmdk@1.1.1:
    resolution: {integrity: sha512-Vsv7kFaXm+ptHDMZ7izaRsP70GgrW9NBNGswt9OZaVBLlE0SNpDq8eu/VGXyF9r7M0azK3Wy7OlYXsuyYLFzHg==}
    peerDependencies:
      react: ^18 || ^19 || ^19.0.0-rc
      react-dom: ^18 || ^19 || ^19.0.0-rc

  colorette@2.0.20:
    resolution: {integrity: sha512-IfEDxwoWIjkeXL1eXcDiow4UbKjhLdq6/EuSVR9GMN7KVH3r9gQ83e73hsz1Nd1T3ijd5xv1wcWRYO+D6kCI2w==}

  commander@15.0.0:
    resolution: {integrity: sha512-z67u4ZhzCL/Tydu1lJARtEZYWbWaN7oYLHbsuzocr6y4N6WZAagG3RQ4FW61V1/0+jImpj293XfrcYnd1qxtPg==}
    engines: {node: '>=22.12.0'}

  compare-versions@6.1.1:
    resolution: {integrity: sha512-4hm4VPpIecmlg59CHXnRDnqGplJFrbLG4aFEl5vl6cK1u76ws3LLvX7ikFnTDl5vo39sjWD6AaDPYodJp/NNHg==}

  content-disposition@1.1.0:
    resolution: {integrity: sha512-5jRCH9Z/+DRP7rkvY83B+yGIGX96OYdJmzngqnw2SBSxqCFPd0w2km3s5iawpGX8krnwSGmF0FW5Nhr0Hfai3g==}
    engines: {node: '>=18'}

  content-type@1.0.5:
    resolution: {integrity: sha512-nTjqfcBFEipKdXCv4YDQWCfmcLZKm81ldF0pAopTvyrFGVbcR6P/VAAd5G7N+0tTr8QqiU0tFadD6FK4NtJwOA==}
    engines: {node: '>= 0.6'}

  content-type@2.1.0:
    resolution: {integrity: sha512-mj7UPXE0jaqaOsukNZRUEfEi2AcL7C/vwmwcHV0O97eO1E1pxBZuyjlZrx5seTaNBg1U6+o35wpa35Qfcc+7ag==}
    engines: {node: '>=18'}

  convert-source-map@2.0.0:
    resolution: {integrity: sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==}

  cookie-parser@1.4.7:
    resolution: {integrity: sha512-nGUvgXnotP3BsjiLX2ypbQnWoGUPIIfHQNZkkC668ntrzGWEZVW70HDEB1qnNGMicPje6EttlIgzo51YSwNQGw==}
    engines: {node: '>= 0.8.0'}

  cookie-signature@1.0.6:
    resolution: {integrity: sha512-QADzlaHc8icV8I7vbaJXJwod9HWYp8uCqf1xa4OfNu1T7JVxQIrUgOWtHdNDtPiywmFbiS12VjotIXLrKM3orQ==}

  cookie-signature@1.2.2:
    resolution: {integrity: sha512-D76uU73ulSXrD1UXF4KE2TMxVVwhsnCgfAyTg9k8P6KGZjlXKrOLe4dJQKI3Bxi5wjesZoFXJWElNWBjPZMbhg==}
    engines: {node: '>=6.6.0'}

  cookie@0.7.2:
    resolution: {integrity: sha512-yki5XnKuf750l50uGTllt6kKILY4nQ1eNIQatoXEByZ5dWgnKqbnqmTrBE5B4N7lrMJKQ2ytWMiTO2o0v6Ew/w==}
    engines: {node: '>= 0.6'}

  cookie@1.1.1:
    resolution: {integrity: sha512-ei8Aos7ja0weRpFzJnEA9UHJ/7XQmqglbRwnf2ATjcB9Wq874VKH9kfjjirM6UhU2/E5fFYadylyhFldcqSidQ==}
    engines: {node: '>=18'}

  cors@2.8.6:
    resolution: {integrity: sha512-tJtZBBHA6vjIAaF6EnIaq6laBBP9aq/Y3ouVJjEfoHbRBcHBAHYcMh/w8LDrk2PvIMMq8gmopa5D4V8RmbrxGw==}
    engines: {node: '>= 0.10'}

  cross-spawn@7.0.6:
    resolution: {integrity: sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==}
    engines: {node: '>= 8'}

  cssesc@3.0.0:
    resolution: {integrity: sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==}
    engines: {node: '>=4'}
    hasBin: true

  csstype@3.2.3:
    resolution: {integrity: sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==}

  d3-array@3.2.4:
    resolution: {integrity: sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==}
    engines: {node: '>=12'}

  d3-color@3.1.0:
    resolution: {integrity: sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==}
    engines: {node: '>=12'}

  d3-ease@3.0.1:
    resolution: {integrity: sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==}
    engines: {node: '>=12'}

  d3-format@3.1.2:
    resolution: {integrity: sha512-AJDdYOdnyRDV5b6ArilzCPPwc1ejkHcoyFarqlPqT7zRYjhavcT3uSrqcMvsgh2CgoPbK3RCwyHaVyxYcP2Arg==}
    engines: {node: '>=12'}

  d3-interpolate@3.0.1:
    resolution: {integrity: sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==}
    engines: {node: '>=12'}

  d3-path@3.1.0:
    resolution: {integrity: sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==}
    engines: {node: '>=12'}

  d3-scale@4.0.2:
    resolution: {integrity: sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==}
    engines: {node: '>=12'}

  d3-shape@3.2.0:
    resolution: {integrity: sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==}
    engines: {node: '>=12'}

  d3-time-format@4.1.0:
    resolution: {integrity: sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==}
    engines: {node: '>=12'}

  d3-time@3.1.0:
    resolution: {integrity: sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==}
    engines: {node: '>=12'}

  d3-timer@3.0.1:
    resolution: {integrity: sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==}
    engines: {node: '>=12'}

  date-fns-jalali@4.1.0-0:
    resolution: {integrity: sha512-hTIP/z+t+qKwBDcmmsnmjWTduxCg+5KfdqWQvb2X/8C9+knYY6epN/pfxdDuyVlSVeFz0sM5eEfwIUQ70U4ckg==}

  date-fns@3.6.0:
    resolution: {integrity: sha512-fRHTG8g/Gif+kSh50gaGEdToemgfj74aRX3swtiouboip5JDLAyDE9F11nHMIcvOaXeOC6D7SpNhi7uFyB7Uww==}

  date-fns@4.4.0:
    resolution: {integrity: sha512-+1UMbeh68lH1SegH83CGWwpb6OHHbpSgr3+s5Eww5M4CAgswBpoWS0AjTOfEJ33HiYKz1hdj/KTFprzXHmq/6w==}

  dateformat@4.6.3:
    resolution: {integrity: sha512-2P0p0pFGzHS5EMnhdxQi7aJN+iMheud0UhG4dlE1DLAlvL8JHjJJTX/CSm4JXwV0Ka5nGk3zC5mcb5bUQUxxMA==}

  debug@4.4.3:
    resolution: {integrity: sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==}
    engines: {node: '>=6.0'}
    peerDependencies:
      supports-color: '*'
    peerDependenciesMeta:
      supports-color:
        optional: true

  decimal.js-light@2.5.1:
    resolution: {integrity: sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==}

  depd@2.0.0:
    resolution: {integrity: sha512-g7nH6P6dyDioJogAAGprGpCtVImJhpPk/roCzdb3fIh61/s/nPsfR6onyMwkCAR/OlC3yBC0lESvUoQEAssIrw==}
    engines: {node: '>= 0.8'}

  detect-libc@2.1.2:
    resolution: {integrity: sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==}
    engines: {node: '>=8'}

  detect-node-es@1.1.0:
    resolution: {integrity: sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==}

  dom-helpers@5.2.1:
    resolution: {integrity: sha512-nRCa7CK3VTrM2NmGkIy4cbK7IZlgBE/PYMn55rrXefr5xXDP0LdtfPnblFDoVdcAfslJ7or6iqAUnx0CCGIWQA==}

  drizzle-kit@0.31.10:
    resolution: {integrity: sha512-7OZcmQUrdGI+DUNNsKBn1aW8qSoKuTH7d0mYgSP8bAzdFzKoovxEFnoGQp2dVs82EOJeYycqRtciopszwUf8bw==}
    hasBin: true

  drizzle-orm@0.45.2:
    resolution: {integrity: sha512-kY0BSaTNYWnoDMVoyY8uxmyHjpJW1geOmBMdSSicKo9CIIWkSxMIj2rkeSR51b8KAPB7m+qysjuHme5nKP+E5Q==}
    peerDependencies:
      '@aws-sdk/client-rds-data': '>=3'
      '@cloudflare/workers-types': '>=4'
      '@electric-sql/pglite': '>=0.2.0'
      '@libsql/client': '>=0.10.0'
      '@libsql/client-wasm': '>=0.10.0'
      '@neondatabase/serverless': '>=0.10.0'
      '@op-engineering/op-sqlite': '>=2'
      '@opentelemetry/api': ^1.4.1
      '@planetscale/database': '>=1.13'
      '@prisma/client': '*'
      '@tidbcloud/serverless': '*'
      '@types/better-sqlite3': '*'
      '@types/pg': '*'
      '@types/sql.js': '*'
      '@upstash/redis': '>=1.34.7'
      '@vercel/postgres': '>=0.8.0'
      '@xata.io/client': '*'
      better-sqlite3: '>=7'
      bun-types: '*'
      expo-sqlite: '>=14.0.0'
      gel: '>=2'
      knex: '*'
      kysely: '*'
      mysql2: '>=2'
      pg: '>=8'
      postgres: '>=3'
      prisma: '*'
      sql.js: '>=1'
      sqlite3: '>=5'
    peerDependenciesMeta:
      '@aws-sdk/client-rds-data':
        optional: true
      '@cloudflare/workers-types':
        optional: true
      '@electric-sql/pglite':
        optional: true
      '@libsql/client':
        optional: true
      '@libsql/client-wasm':
        optional: true
      '@neondatabase/serverless':
        optional: true
      '@op-engineering/op-sqlite':
        optional: true
      '@opentelemetry/api':
        optional: true
      '@planetscale/database':
        optional: true
      '@prisma/client':
        optional: true
      '@tidbcloud/serverless':
        optional: true
      '@types/better-sqlite3':
        optional: true
      '@types/pg':
        optional: true
      '@types/sql.js':
        optional: true
      '@upstash/redis':
        optional: true
      '@vercel/postgres':
        optional: true
      '@xata.io/client':
        optional: true
      better-sqlite3:
        optional: true
      bun-types:
        optional: true
      expo-sqlite:
        optional: true
      gel:
        optional: true
      knex:
        optional: true
      kysely:
        optional: true
      mysql2:
        optional: true
      pg:
        optional: true
      postgres:
        optional: true
      prisma:
        optional: true
      sql.js:
        optional: true
      sqlite3:
        optional: true

  drizzle-zod@0.8.3:
    resolution: {integrity: sha512-66yVOuvGhKJnTdiqj1/Xaaz9/qzOdRJADpDa68enqS6g3t0kpNkwNYjUuaeXgZfO/UWuIM9HIhSlJ6C5ZraMww==}
    peerDependencies:
      drizzle-orm: '>=0.36.0'
      zod: ^3.25.0 || ^4.0.0

  dunder-proto@1.0.1:
    resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
    engines: {node: '>= 0.4'}

  ee-first@1.1.1:
    resolution: {integrity: sha512-WMwm9LhRUo+WUaRN+vRuETqG89IgZphVSNkdFgeb6sS/E4OrDIN7t48CAewSHXc6C8lefD8KKfr5vY61brQlow==}

  electron-to-chromium@1.5.425:
    resolution: {integrity: sha512-QvPtl41EUOnuT1HBvMKgxXRIaHNcagBPs50u7VULzhZXaGfqTbZyE16LQsctZ/RQHlGu+FOWeDTR4mY6YbeF1g==}

  embla-carousel-react@8.6.0:
    resolution: {integrity: sha512-0/PjqU7geVmo6F734pmPqpyHqiM99olvyecY7zdweCw+6tKEXnrE90pBiBbMMU8s5tICemzpQ3hi5EpxzGW+JA==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.1 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  embla-carousel-reactive-utils@8.6.0:
    resolution: {integrity: sha512-fMVUDUEx0/uIEDM0Mz3dHznDhfX+znCCDCeIophYb1QGVM7YThSWX+wz11zlYwWFOr74b4QLGg0hrGPJeG2s4A==}
    peerDependencies:
      embla-carousel: 8.6.0

  embla-carousel@8.6.0:
    resolution: {integrity: sha512-SjWyZBHJPbqxHOzckOfo8lHisEaJWmwd23XppYFYVh10bU66/Pn5tkVkbkCMZVdbUE5eTCI2nD8OyIP4Z+uwkA==}

  encodeurl@2.0.0:
    resolution: {integrity: sha512-Q0n9HRi4m6JuGIV1eFlmvJB7ZEVxu93IrMyiMsGC0lrMJMWzRgx6WGquyfQgZVb31vhGgXnfmPNNXmxnOkRBrg==}
    engines: {node: '>= 0.8'}

  end-of-stream@1.4.5:
    resolution: {integrity: sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==}

  enhanced-resolve@5.24.5:
    resolution: {integrity: sha512-L1l8TNvomm6UVW5B253AGxQagSQr+vGwhMlrrfRS2qmhx46AMpMVJKQYLvWYbysTMY8VoicOvzHzoHMbyzB+4A==}
    engines: {node: '>=10.13.0'}

  entities@4.5.0:
    resolution: {integrity: sha512-V0hjH4dGPh9Ao5p0MoRY6BVqtwCjhz6vI5LT8AJ55H+4g9/4vbHx1I54fS0XuclLhDHArPQCiMjDxjaL8fPxhw==}
    engines: {node: '>=0.12'}

  es-define-property@1.0.1:
    resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
    engines: {node: '>= 0.4'}

  es-errors@1.3.0:
    resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
    engines: {node: '>= 0.4'}

  es-object-atoms@1.1.2:
    resolution: {integrity: sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==}
    engines: {node: '>= 0.4'}

  esbuild-plugin-pino@2.3.3:
    resolution: {integrity: sha512-5RIsILwgqy8wIV5pVg2gb13gJlH3EKKg613Js8q25p3tFsKA8ftsgWQFdgGbIkUe77Ttjl8lctuGkchRAvXGfw==}
    peerDependencies:
      esbuild: 0.28.2
      pino: '>=7.0.0'
      pino-pretty: '*'
      thread-stream: '*'
    peerDependenciesMeta:
      pino-pretty:
        optional: true
      thread-stream:
        optional: true

  esbuild@0.28.2:
    resolution: {integrity: sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==}
    engines: {node: '>=18'}
    hasBin: true

  escalade@3.2.0:
    resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
    engines: {node: '>=6'}

  escape-html@1.0.3:
    resolution: {integrity: sha512-NiSupZ4OeuGwr68lGIeym/ksIZMJodUGOSCZ/FSnTxcrekbvqrgdUxlJOMpijaKZVjAJrWrGs/6Jy8OMuyj9ow==}

  esutils@2.0.3:
    resolution: {integrity: sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==}
    engines: {node: '>=0.10.0'}

  etag@1.8.1:
    resolution: {integrity: sha512-aIL5Fx7mawVa300al2BnEE4iNvo1qETxLrPI/o05L7z6go7fCw1J6EQmbK4FmJ2AS7kgVF/KEZWufBfdClMcPg==}
    engines: {node: '>= 0.6'}

  eventemitter3@4.0.7:
    resolution: {integrity: sha512-8guHBZCwKnFhYdHr2ysuRWErTwhoN2X8XELRlrRwpmfeY2jjuUN4taQMsULKUVo1K4DvZl+0pgfyoysHxvmvEw==}

  execa@9.6.1:
    resolution: {integrity: sha512-9Be3ZoN4LmYR90tUoVu2te2BsbzHfhJyfEiAVfz7N5/zv+jduIfLrV2xdQXOHbaD6KgpGdO9PRPM1Y4Q9QkPkA==}
    engines: {node: ^18.19.0 || >=20.5.0}

  express@5.2.1:
    resolution: {integrity: sha512-hIS4idWWai69NezIdRt2xFVofaF4j+6INOpJlVOLDO8zXGpUVEVzIYk12UUi2JzjEzWL3IOAxcTubgz9Po0yXw==}
    engines: {node: '>= 18'}

  fast-copy@4.1.1:
    resolution: {integrity: sha512-A4QTJmuiztpGtr6AMeJts9R4hbj2ZBUwtOaKrG6rw2y7t6+IaJKjz5M3XDs8BUznxDH43FVc6A0y/gWlMl4UtA==}

  fast-deep-equal@3.1.3:
    resolution: {integrity: sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==}

  fast-equals@5.4.2:
    resolution: {integrity: sha512-Ywe6jodPTWOTL9/k0bV7gdfP8twKL5Y8I8CZ933fAY5gBekICZSUQTbyH6ut2NZCNyB05mSUwAuEqdEIaOOlDQ==}
    engines: {node: '>=6.0.0'}

  fast-glob@3.3.3:
    resolution: {integrity: sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==}
    engines: {node: '>=8.6.0'}

  fast-safe-stringify@2.1.1:
    resolution: {integrity: sha512-W+KJc2dmILlPplD/H4K9l9LcAHAfPtP6BY84uVLXQ6Evcz9Lcg33Y2z1IVblT6xdY54PXYVHEv+0Wpq8Io6zkA==}

  fast-uri@3.1.7:
    resolution: {integrity: sha512-dOvZVzjdZdz7phd9v6jCbwxrBW3fK6n8Rc0CtdmM4bumzMnxywBYhuph6J819RRw/ku+rLbelwfMunktuzVVHg==}

  fastq@1.20.3:
    resolution: {integrity: sha512-XKv5nnLs6nLF71NgiKJLIZFLkPyIEuOselLG7ujZnGrRfQK8HpvY+WqKhAJUAdLomwVHErVS4LfxFlPq0/FTAw==}

  fdir@6.5.0:
    resolution: {integrity: sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==}
    engines: {node: '>=12.0.0'}
    peerDependencies:
      picomatch: ^3 || ^4
    peerDependenciesMeta:
      picomatch:
        optional: true

  figures@6.1.0:
    resolution: {integrity: sha512-d+l3qxjSesT4V7v2fh+QnmFnUWv9lSpjarhShNTgBOfA0ttejbQUAlHLitbjkoRiDulW0OPoQPYIGhIC8ohejg==}
    engines: {node: '>=18'}

  fill-range@7.1.1:
    resolution: {integrity: sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==}
    engines: {node: '>=8'}

  finalhandler@2.1.1:
    resolution: {integrity: sha512-S8KoZgRZN+a5rNwqTxlZZePjT/4cnm0ROV70LedRHZ0p8u9fRID0hJUZQpkKLzro8LfmC8sx23bY6tVNxv8pQA==}
    engines: {node: '>= 18.0.0'}

  find-up@8.0.0:
    resolution: {integrity: sha512-JGG8pvDi2C+JxidYdIwQDyS/CgcrIdh18cvgxcBge3wSHRQOrooMD3GlFBcmMJAN9M42SAZjDp5zv1dglJjwww==}
    engines: {node: '>=20'}

  forwarded@0.2.0:
    resolution: {integrity: sha512-buRG0fpBtRHSTCOASe6hD258tEubFoRLb4ZNA6NxMVHNw2gOcwHo9wyablzMzOA5z9xA9L1KNjk/Nt6MT9aYow==}
    engines: {node: '>= 0.6'}

  framer-motion@12.43.0:
    resolution: {integrity: sha512-1eaL3RvR/kAlbG7UYcpMptEyzPoENO0c6w7ZnB3/hh2vSAz/6uGAFn6fdoqTBguNstf3MsFhJHsD/0DHiclG+g==}
    peerDependencies:
      '@emotion/is-prop-valid': '*'
      react: ^18.0.0 || ^19.0.0
      react-dom: ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      '@emotion/is-prop-valid':
        optional: true
      react:
        optional: true
      react-dom:
        optional: true

  fresh@2.0.0:
    resolution: {integrity: sha512-Rx/WycZ60HOaqLKAi6cHRKKI7zxWbJ31MhntmtwMoaTeF7XFH9hhBp8vITaMidfljRQ6eYWCKkaTK+ykVJHP2A==}
    engines: {node: '>= 0.8'}

  fs-extra@11.4.0:
    resolution: {integrity: sha512-EQsFzMUJkCKGr1ePqlYADkIUmHW1s3ZXr5Yqy6wbGrfUCphpl2maM/kyOIRA2HpP3AaFQTZXD4ldjek+nccddA==}
    engines: {node: '>=14.14'}

  fsevents@2.3.3:
    resolution: {integrity: sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==}
    engines: {node: ^8.16.0 || ^10.6.0 || >=11.0.0}
    os: [darwin]

  function-bind@1.1.2:
    resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}

  gensync@1.0.0-beta.2:
    resolution: {integrity: sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==}
    engines: {node: '>=6.9.0'}

  get-caller-file@2.0.5:
    resolution: {integrity: sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==}
    engines: {node: 6.* || 8.* || >= 10.*}

  get-intrinsic@1.3.0:
    resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
    engines: {node: '>= 0.4'}

  get-nonce@1.0.1:
    resolution: {integrity: sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==}
    engines: {node: '>=6'}

  get-proto@1.0.1:
    resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
    engines: {node: '>= 0.4'}

  get-stream@9.0.1:
    resolution: {integrity: sha512-kVCxPF3vQM/N0B1PmoqVUqgHP+EeVjmZSQn+1oCRPxd2P21P2F19lIgbR3HBosbB1PUhOAoctJnfEn2GbN2eZA==}
    engines: {node: '>=18'}

  get-tsconfig@4.14.3:
    resolution: {integrity: sha512-++QEw4DIY7WGoukz+/+A/8dGYPT9l9yIadnmSgZ8Rjr3YVSVDipQSO9CdnJo9ePqFqUUqh+wk9uIaoiAwsiPkA==}

  glob-parent@5.1.2:
    resolution: {integrity: sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==}
    engines: {node: '>= 6'}

  gopd@1.2.0:
    resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
    engines: {node: '>= 0.4'}

  graceful-fs@4.2.11:
    resolution: {integrity: sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==}

  has-symbols@1.1.0:
    resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
    engines: {node: '>= 0.4'}

  hasown@2.0.4:
    resolution: {integrity: sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==}
    engines: {node: '>= 0.4'}

  help-me@5.0.0:
    resolution: {integrity: sha512-7xgomUX6ADmcYzFik0HzAxh/73YlKR9bmFzf51CZwR+b6YtzU2m0u49hQCqV6SvlqIqsaxovfwdvbnsw3b/zpg==}

  http-errors@2.0.1:
    resolution: {integrity: sha512-4FbRdAX+bSdmo4AUFuS0WNiPz8NgFt+r8ThgNWmlrjQjt1Q7ZR9+zTlce2859x4KSXrwIsaeTqDoKQmtP8pLmQ==}
    engines: {node: '>= 0.8'}

  human-signals@8.0.1:
    resolution: {integrity: sha512-eKCa6bwnJhvxj14kZk5NCPc6Hb6BdsU9DZcOnmQKSnO1VKrfV0zCvtttPZUsBvjmNDn8rpcJfpwSYnHBjc95MQ==}
    engines: {node: '>=18.18.0'}

  iconv-lite@0.7.3:
    resolution: {integrity: sha512-IKXpvIzjnC9XTAUbVBcMfGS0EPaIXtW6v+zr+RRp+hqULEpo0owZax6wyRwPOJbWbzjYspQwusTsfVr0ifh4uQ==}
    engines: {node: '>=0.10.0'}

  inherits@2.0.4:
    resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}

  input-otp@1.5.0:
    resolution: {integrity: sha512-3AcfdW1sNG0FmSA5hHMBXG7jNW5CdcdKs8ln8JOmn6S2SRkoXoJx+2UwC+ZvjflfnOdHJx0SfQ9/YjlxVYLtGQ==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc

  internmap@2.0.3:
    resolution: {integrity: sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==}
    engines: {node: '>=12'}

  ipaddr.js@1.9.1:
    resolution: {integrity: sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==}
    engines: {node: '>= 0.10'}

  is-extglob@2.1.1:
    resolution: {integrity: sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==}
    engines: {node: '>=0.10.0'}

  is-glob@4.0.3:
    resolution: {integrity: sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==}
    engines: {node: '>=0.10.0'}

  is-number@7.0.0:
    resolution: {integrity: sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==}
    engines: {node: '>=0.12.0'}

  is-plain-obj@4.1.0:
    resolution: {integrity: sha512-+Pgi+vMuUNkJyExiMBt5IlFoMyKnr5zhJ4Uspz58WOhBF5QoIZkFyNHIbBAtHwzVAgk5RtndVNsDRN61/mmDqg==}
    engines: {node: '>=12'}

  is-promise@4.0.0:
    resolution: {integrity: sha512-hvpoI6korhJMnej285dSg6nu1+e6uxs7zG3BYAm5byqDsgJNWwxzM6z6iZiAgQR4TJ30JmBTOwqZUw3WlyH3AQ==}

  is-stream@4.0.1:
    resolution: {integrity: sha512-Dnz92NInDqYckGEUJv689RbRiTSEHCQ7wOVeALbkOz999YpqT46yMRIGtSNl2iCL1waAZSx40+h59NV/EwzV/A==}
    engines: {node: '>=18'}

  is-unicode-supported@2.1.0:
    resolution: {integrity: sha512-mE00Gnza5EEB3Ds0HfMyllZzbBrmLOX3vfWoj9A9PEnTfratQ/BcaJOuMhnkhjXvb2+FkY3VuHqtAGpTPmglFQ==}
    engines: {node: '>=18'}

  isexe@2.0.0:
    resolution: {integrity: sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw==}

  jiti@2.7.0:
    resolution: {integrity: sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==}
    hasBin: true

  joycon@3.1.1:
    resolution: {integrity: sha512-34wB/Y7MW7bzjKRjUKTa46I2Z7eV62Rkhva+KkopW7Qvv/OSWBqvkSY7vusOPrNuZcUG3tApvdVgNB8POj3SPw==}
    engines: {node: '>=10'}

  js-tokens@4.0.0:
    resolution: {integrity: sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==}

  js-yaml@4.3.2:
    resolution: {integrity: sha512-SFNOvSJ+Dgf/9An904Yx+CgSlIPCkIpao4qo51lpee25TIRejdH3rhR4EZMGoNx3/TP3O+wzWuiTFl4sqbltzA==}
    hasBin: true

  jsesc@3.1.0:
    resolution: {integrity: sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==}
    engines: {node: '>=6'}
    hasBin: true

  json-schema-traverse@1.0.0:
    resolution: {integrity: sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==}

  json5@2.2.3:
    resolution: {integrity: sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==}
    engines: {node: '>=6'}
    hasBin: true

  jsonfile@6.2.1:
    resolution: {integrity: sha512-zwOTdL3rFQ/lRdBnntKVOX6k5cKJwEc1HdilT71BWEu7J41gXIB2MRp+vxduPSwZJPWBxEzv4yH1wYLJGUHX4Q==}

  jsonpointer@5.0.1:
    resolution: {integrity: sha512-p/nXbhSEcu3pZRdkW1OfJhpsVtW1gd4Wa1fnQc9YLiTfAjn0312eMKimbdIQzuZl9aa9xUGaRlP9T/CJE/ditQ==}
    engines: {node: '>=0.10.0'}

  leven@4.1.0:
    resolution: {integrity: sha512-KZ9W9nWDT7rF7Dazg8xyLHGLrmpgq2nVNFUckhqdW3szVP6YhCpp/RAnpmVExA9JvrMynjwSLVrEj3AepHR6ew==}
    engines: {node: ^12.20.0 || ^14.13.1 || >=16.0.0}

  lightningcss-linux-x64-gnu@1.32.0:
    resolution: {integrity: sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==}
    engines: {node: '>= 12.0.0'}
    cpu: [x64]
    os: [linux]
    libc: [glibc]

  lightningcss@1.32.0:
    resolution: {integrity: sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==}
    engines: {node: '>= 12.0.0'}

  linkify-it@5.0.2:
    resolution: {integrity: sha512-ONTm2jCMAVZjgQa/Fy1kScXsuOoF5NPTsoFBdE1KVIZ2vAh/r9+Bqo+0jINCBYnavTPQZz38QzFTme79ENoN3Q==}

  locate-path@8.0.0:
    resolution: {integrity: sha512-XT9ewWAC43tiAV7xDAPflMkG0qOPn2QjHqlgX8FOqmWa/rxnyYDulF9T0F7tRy1u+TVTmK/M//6VIOye+2zDXg==}
    engines: {node: '>=20'}

  lodash@4.18.1:
    resolution: {integrity: sha512-dMInicTPVE8d1e5otfwmmjlxkZoUpiVLwyeTdUsi/Caj/gfzzblBcCE5sRHV/AsjuCmxWrte2TNGSYuCeCq+0Q==}

  loose-envify@1.4.0:
    resolution: {integrity: sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==}
    hasBin: true

  lru-cache@5.1.1:
    resolution: {integrity: sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==}

  lucide-react@0.545.0:
    resolution: {integrity: sha512-7r1/yUuflQDSt4f1bpn5ZAocyIxcTyVyBBChSVtBKn5M+392cPmI5YJMWOJKk/HUWGm5wg83chlAZtCcGbEZtw==}
    peerDependencies:
      react: ^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0

  lunr@2.3.9:
    resolution: {integrity: sha512-zTU3DaZaF3Rt9rhN3uBMGQD3dD2/vFQqnvZCDv4dl5iOzq2IZQqTxu90r4E5J+nP70J3ilqVCrbho2eWaeW8Ow==}

  magic-string@0.30.21:
    resolution: {integrity: sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==}

  markdown-it@14.3.1:
    resolution: {integrity: sha512-4Ej49aYTDFIQ+uBkfX8GBvJGccoARxxPep+7aWTs55ozbjQJpW9M26Fe53vnGgvLeVzva/amzjQQaQu9w0vMhA==}
    hasBin: true

  math-intrinsics@1.1.0:
    resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
    engines: {node: '>= 0.4'}

  mdurl@2.1.0:
    resolution: {integrity: sha512-1+HBaOx0zi/dQWht8rNv9MYf9qqpqL/kxI0hXImU6Y547zM6Sni8BQibt7ifgMcYtQg41ao3Ivd6cnSM86inpg==}

  media-typer@1.1.1:
    resolution: {integrity: sha512-yz3xRaG20c6/BOzvYoDaGtPmGscs7YivItZEEqe6GbwNfHuxu9YNmvnEkMzKldAGY4/80pRcQRZSEnhquk9XuQ==}
    engines: {node: '>= 0.8'}

  merge-descriptors@2.0.0:
    resolution: {integrity: sha512-Snk314V5ayFLhp3fkUREub6WtjBfPdCPY1Ln8/8munuLuiYhsABgBVWsozAG+MWMbVEvcdcpbi9R7ww22l9Q3g==}
    engines: {node: '>=18'}

  merge2@1.4.1:
    resolution: {integrity: sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==}
    engines: {node: '>= 8'}

  micromatch@4.0.8:
    resolution: {integrity: sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==}
    engines: {node: '>=8.6'}

  mime-db@1.54.0:
    resolution: {integrity: sha512-aU5EJuIN2WDemCcAp2vFBfp/m4EAhWJnUNSSw0ixs7/kXbd6Pg64EmwJkNdFhB8aWt1sH2CTXrLxo/iAGV3oPQ==}
    engines: {node: '>= 0.6'}

  mime-types@3.0.2:
    resolution: {integrity: sha512-Lbgzdk0h4juoQ9fCKXW4by0UJqj+nOOrI9MJ1sSj4nI8aI2eo1qmvQEie4VD1glsS250n15LsWsYtCugiStS5A==}
    engines: {node: '>=18'}

  minimatch@10.2.6:
    resolution: {integrity: sha512-vpLQEs+VLCr1nU0BXS07maYoFwlDAH0gngQuuttxIwutDFEMHq2blX+8vpgxDdK3J1PwjCJiep77OitTZ4Ll1A==}
    engines: {node: 18 || 20 || >=22}

  minimist@1.2.8:
    resolution: {integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==}

  modern-screenshot@4.7.0:
    resolution: {integrity: sha512-9YxN+ddPSMMlhylOv25VHzXrl9u67QRxoh7+SEewGtgUw7t6hHTrjptSDJUSne9oG4Xk/h2cwG15nIt4Hc9ujg==}

  motion-dom@12.43.0:
    resolution: {integrity: sha512-azKON4d9S65PEoFUiQTMTgPheEmzf2QngdRc50AKfJp9Q9mmcBVw22c8eMq9k8kxOFHdL7+WZY7N/5F/lwiDag==}

  motion-utils@12.39.0:
    resolution: {integrity: sha512-8nadJAJjTtqRkmRF36FoJTrywK9nnFmnPwnSMyxaOCU7GDjN9RTMJIxx9De8ErM+vpPhMccr/6fo5WciyQLnMQ==}

  ms@2.1.3:
    resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}

  nanoid@3.3.18:
    resolution: {integrity: sha512-DTg4MJbGMWkfi6VZFdNt2/caMbQy4Ou+Op/hJQvGEWcnVfoA1QA+xzRKAzw9jD6+GVOOeYr/mIcuDSdug6F6+w==}
    engines: {node: ^10 || ^12 || ^13.7 || ^14 || >=15.0.1}
    hasBin: true

  negotiator@1.1.0:
    resolution: {integrity: sha512-NMPBRMJgiQHjbd8phG3Vebdx4kZ1H121rbl5IkMqeOsahptB9BKo/d7oJ3zTXqTgagn2bWlNSXkh0QUGM31RYg==}
    engines: {node: '>=18'}

  next-themes@0.4.6:
    resolution: {integrity: sha512-pZvgD5L0IEvX5/9GWyHMf3m8BKiVQwsCMHfoFosXtXBMnaS0ZnIJ9ST4b4NqLVKDEm8QBxoNNGNaBv2JNF6XNA==}
    peerDependencies:
      react: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc
      react-dom: ^16.8 || ^17 || ^18 || ^19 || ^19.0.0-rc

  node-releases@2.0.55:
    resolution: {integrity: sha512-mIrE/Cw9y+9Au6dS5vDKDhQza9YvG6w+ZrS6X+ZzA7yFW/soAeaups4Qzn1bL6g5FVy8WtP79+0j82oPIbqRjQ==}
    engines: {node: '>=18'}

  npm-run-path@6.0.0:
    resolution: {integrity: sha512-9qny7Z9DsQU8Ou39ERsPU4OZQlSTP47ShQzuKZ6PRXpYLtIFgl/DEBYEXKlvcEa+9tHVcK8CF81Y2V72qaZhWA==}
    engines: {node: '>=18'}

  object-assign@4.1.1:
    resolution: {integrity: sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==}
    engines: {node: '>=0.10.0'}

  object-inspect@1.13.4:
    resolution: {integrity: sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==}
    engines: {node: '>= 0.4'}

  on-exit-leak-free@2.1.2:
    resolution: {integrity: sha512-0eJJY6hXLGf1udHwfNftBqH+g73EU4B504nZeKpz1sYRKafAghwxEJunB2O7rDZkL4PGfsMVnTXZ2EjibbqcsA==}
    engines: {node: '>=14.0.0'}

  on-finished@2.4.1:
    resolution: {integrity: sha512-oVlzkg3ENAhCk2zdv7IJwd/QUD4z2RxRwpkcGY8psCVcCYZNq4wYnVWALHM+brtuJjePWiYF/ClmuDr8Ch5+kg==}
    engines: {node: '>= 0.8'}

  once@1.4.0:
    resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}

  orval@8.30.0:
    resolution: {integrity: sha512-GkB78FLgsFDMUjjKFsSMw81DlX/rewpYHCfJiiDIXoyRyZPdV/8ntwtXfc2RZwc2N0bEoNrWGsVAvxBfmRpuFQ==}
    engines: {node: '>=22.18.0'}
    hasBin: true
    peerDependencies:
      prettier: '>=3.0.0'
    peerDependenciesMeta:
      prettier:
        optional: true

  p-limit@4.0.0:
    resolution: {integrity: sha512-5b0R4txpzjPWVw/cXXUResoD4hb6U/x9BH08L7nw+GN1sezDzPdxeRvpc9c433fZhBan/wusjbCsqwqm4EIBIQ==}
    engines: {node: ^12.20.0 || ^14.13.1 || >=16.0.0}

  p-locate@6.0.0:
    resolution: {integrity: sha512-wPrq66Llhl7/4AGC6I+cqxT07LhXvWL08LNXz1fENOw0Ap4sRZZ/gZpTTJ5jpurzzzfS2W/Ge9BY3LgLjCShcw==}
    engines: {node: ^12.20.0 || ^14.13.1 || >=16.0.0}

  parse-ms@4.0.0:
    resolution: {integrity: sha512-TXfryirbmq34y8QBwgqCVLi+8oA3oWx2eAnSn62ITyEhEYaWRlVZ2DvMM9eZbMs/RfxPu/PK/aBLyGj4IrqMHw==}
    engines: {node: '>=18'}

  parseurl@1.3.3:
    resolution: {integrity: sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==}
    engines: {node: '>= 0.8'}

  path-key@3.1.1:
    resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
    engines: {node: '>=8'}

  path-key@4.0.0:
    resolution: {integrity: sha512-haREypq7xkM7ErfgIyA0z+Bj4AGKlMSdlQE2jvJo6huWD1EdkKYV+G/T4nq0YEF2vgTT8kqMFKo1uHn950r4SQ==}
    engines: {node: '>=12'}

  path-to-regexp@8.4.2:
    resolution: {integrity: sha512-qRcuIdP69NPm4qbACK+aDogI5CBDMi1jKe0ry5rSQJz8JVLsC7jV8XpiJjGRLLol3N+R5ihGYcrPLTno6pAdBA==}

  pathe@2.0.3:
    resolution: {integrity: sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==}

  pg-cloudflare@1.4.0:
    resolution: {integrity: sha512-Vo7z/6rrQYxpNRylp4Tlob2elzbh+N/MOQbxFVWCxS7oEx6jF53GTJFxK2WWpKuBRkmiin4Mt+xofFDjx09R0A==}

  pg-connection-string@2.14.0:
    resolution: {integrity: sha512-XwWDGcLRGCXAR8F/AM5bG7Q+A3Wm2s6QeEjlOKZLlH3UYcguiqCWKyWXVag5TLTIjR7oOJUY8kcADaZgWPyLeg==}

  pg-int8@1.0.1:
    resolution: {integrity: sha512-WCtabS6t3c8SkpDBUlb1kjOs7l66xsGdKpIPZsg4wR+B3+u9UAum2odSsF9tnvxg80h4ZxLWMy4pRjOsFIqQpw==}
    engines: {node: '>=4.0.0'}

  pg-pool@3.14.0:
    resolution: {integrity: sha512-gKtPkFdQPU3DksooVLi9LsjZxrsBUZIpa+7aVx+LV5pNh0KzP4Zleud2po+ConrxbuXGBJ6Hfer6hdgpIBpBaw==}
    peerDependencies:
      pg: '>=8.0'

  pg-protocol@1.16.0:
    resolution: {integrity: sha512-sILXutLVjCLjcDuOmvhX5e2Z4cS5qG/6Bu3VkpFwdf/633ElGLpEh9bgmuI5I4sqKqkifQiGyiCcx1HdtrK7tg==}

  pg-types@2.2.0:
    resolution: {integrity: sha512-qTAAlrEsl8s4OiEQY69wDvcMIdQN6wdz5ojQiOy6YRMuynxenON0O5oCpJI6lshc6scgAY8qvJ2On/p+CXY0GA==}
    engines: {node: '>=4'}

  pg@8.23.0:
    resolution: {integrity: sha512-Ip2EQCngowJLGOfCwkFhPXU7/ljlhn6Rxlmy4XYfL2Y+vyRM59+8uR2xqRWKdYmbXmxCFOAmKxBuSUCdF34qLg==}
    engines: {node: '>= 16.0.0'}
    peerDependencies:
      pg-native: '>=3.0.1'
    peerDependenciesMeta:
      pg-native:
        optional: true

  pgpass@1.0.5:
    resolution: {integrity: sha512-FdW9r/jQZhSeohs1Z3sI1yxFQNFvMcnmfuj4WBMUTxOrAyLMaTcE1aAMBiTlbMNaXvBCQuVi0R7hd8udDSP7ug==}

  picocolors@1.1.1:
    resolution: {integrity: sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==}

  picomatch@2.3.2:
    resolution: {integrity: sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==}
    engines: {node: '>=8.6'}

  picomatch@4.0.7:
    resolution: {integrity: sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==}
    engines: {node: '>=12'}

  pino-abstract-transport@2.0.0:
    resolution: {integrity: sha512-F63x5tizV6WCh4R6RHyi2Ml+M70DNRXt/+HANowMflpgGFMAym/VKm6G7ZOQRjqN7XbGxK1Lg9t6ZrtzOaivMw==}

  pino-abstract-transport@3.0.0:
    resolution: {integrity: sha512-wlfUczU+n7Hy/Ha5j9a/gZNy7We5+cXp8YL+X+PG8S0KXxw7n/JXA3c46Y0zQznIJ83URJiwy7Lh56WLokNuxg==}

  pino-http@10.5.0:
    resolution: {integrity: sha512-hD91XjgaKkSsdn8P7LaebrNzhGTdB086W3pyPihX0EzGPjq5uBJBXo4N5guqNaK6mUjg9aubMF7wDViYek9dRA==}

  pino-pretty@13.1.3:
    resolution: {integrity: sha512-ttXRkkOz6WWC95KeY9+xxWL6AtImwbyMHrL1mSwqwW9u+vLp/WIElvHvCSDg0xO/Dzrggz1zv3rN5ovTRVowKg==}
    hasBin: true

  pino-std-serializers@7.1.0:
    resolution: {integrity: sha512-BndPH67/JxGExRgiX1dX0w1FvZck5Wa4aal9198SrRhZjH3GxKQUKIBnYJTdj2HDN3UQAS06HlfcSbQj2OHmaw==}

  pino@9.14.0:
    resolution: {integrity: sha512-8OEwKp5juEvb/MjpIc4hjqfgCNysrS94RIOMXYvpYCdm/jglrKEiAYmiumbmGhCvs+IcInsphYDFwqrjr7398w==}
    hasBin: true

  postcss-selector-parser@6.0.10:
    resolution: {integrity: sha512-IQ7TZdoaqbT+LCpShg46jnZVlhWD2w6iQYAcYXfHARZ7X1t/UGhhceQDs5X0cGqKvYlHNOuv7Oa1xmb0oQuA3w==}
    engines: {node: '>=4'}

  postcss@8.5.28:
    resolution: {integrity: sha512-RRuzqDtt5Y9h3quz5hWhK+TPnsmVs6WwSU6LkJMeY4HstUEDuYTG8UJSdawMRzmzAtV+KEoG8N3Qg2qLy5vM/A==}
    engines: {node: ^10 || ^12 || >=14}

  postgres-array@2.0.0:
    resolution: {integrity: sha512-VpZrUqU5A69eQyW2c5CA1jtLecCsN2U/bD6VilrFDWq5+5UIEVO7nazS3TEcHf1zuPYO/sqGvUvW62g86RXZuA==}
    engines: {node: '>=4'}

  postgres-bytea@1.0.1:
    resolution: {integrity: sha512-5+5HqXnsZPE65IJZSMkZtURARZelel2oXUEO8rH83VS/hxH5vv1uHquPg5wZs8yMAfdv971IU+kcPUczi7NVBQ==}
    engines: {node: '>=0.10.0'}

  postgres-date@1.0.7:
    resolution: {integrity: sha512-suDmjLVQg78nMK2UZ454hAG+OAW+HQPZ6n++TNDUX+L0+uUlLywnoxJKDou51Zm+zTCjrCl0Nq6J9C5hP9vK/Q==}
    engines: {node: '>=0.10.0'}

  postgres-interval@1.2.0:
    resolution: {integrity: sha512-9ZhXKM/rw350N1ovuWHbGxnGh/SNJ4cnxHiM0rxE4VN41wsg8P8zWn9hv/buK00RP4WvlOyr/RBDiptyxVbkZQ==}
    engines: {node: '>=0.10.0'}

  prettier@3.9.6:
    resolution: {integrity: sha512-OpN0zzVdiaiAhxpuuj5efpIS4sY9j7bY6uR5mnj5yPzGkdkjNKSJeUThPb60Jw29QuAZgA4o+/iB49kFiaBX6g==}
    engines: {node: '>=14'}
    hasBin: true

  pretty-ms@9.3.1:
    resolution: {integrity: sha512-HzMy3Geq23nVALD/M2LliU+F+M+gVNsvkQWWqeBZ8HDiCgzo6YPJ/Omrmtq24EFrIsk0a3EkQGEd7bDOo+IhGA==}
    engines: {node: '>=18'}

  process-warning@5.1.0:
    resolution: {integrity: sha512-jQSaVHsPgtyw60e1rQ/A+/ArPEj/S8pS/vFnyGa/gYFXrKk/6RuDkoqVDQ5NI5MmS01698ltlAk0NoDBNLujRw==}

  prop-types@15.8.1:
    resolution: {integrity: sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==}

  proxy-addr@2.0.7:
    resolution: {integrity: sha512-llQsMLSUDUPT44jdrU/O37qlnifitDP+ZwrmmZcoSKyLKvtZxpyV0n2/bD/N4tBAAZ/gJEdZU7KMraoK1+XYAg==}
    engines: {node: '>= 0.10'}

  pump@3.0.4:
    resolution: {integrity: sha512-VS7sjc6KR7e1ukRFhQSY5LM2uBWAUPiOPa/A3mkKmiMwSmRFUITt0xuj+/lesgnCv+dPIEYlkzrcyXgquIHMcA==}

  punycode.js@2.3.1:
    resolution: {integrity: sha512-uxFIHU0YlHYhDQtV4R9J6a52SLx28BCjT+4ieh7IGbgwVJWO+km431c4yRlREUAsAmt/uMjQUyQHNEPf0M39CA==}
    engines: {node: '>=6'}

  qs@6.16.0:
    resolution: {integrity: sha512-h6fhOIaRrID2CbEY2fqs+7t+UXZo+MLAnU5gRIq85uFtdiUPCdsApMlHhXogKVM4HM2DVbIjGNTTYH2OcmP1vA==}
    engines: {node: '>=0.6'}

  queue-microtask@1.2.3:
    resolution: {integrity: sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==}

  quick-format-unescaped@4.0.4:
    resolution: {integrity: sha512-tYC1Q1hgyRuHgloV/YXs2w15unPVh8qfu/qCTfhTYamaw7fyhumKa2yGpdSo87vY32rIclj+4fWYQXUMs9EHvg==}

  range-parser@1.3.0:
    resolution: {integrity: sha512-hek2mFQpPuI4E1BBKrSto+BU3e3x4xuarsbiwr3+lf7p44juvFMV0XFWQAP3xUyqXA4RrXLIoaSUGbSt056ZMw==}
    engines: {node: '>= 0.6'}

  raw-body@3.0.2:
    resolution: {integrity: sha512-K5zQjDllxWkf7Z5xJdV0/B0WTNqx6vxG70zJE4N0kBs4LovmEYWJzQGxC9bS9RAKu3bgM40lrd5zoLJ12MQ5BA==}
    engines: {node: '>= 0.10'}

  react-day-picker@9.14.0:
    resolution: {integrity: sha512-tBaoDWjPwe0M5pGrum4H0SR6Lyk+BO9oHnp9JbKpGKW2mlraNPgP9BMfsg5pWpwrssARmeqk7YBl2oXutZTaHA==}
    engines: {node: '>=18'}
    peerDependencies:
      react: '>=16.8.0'

  react-dom@19.1.0:
    resolution: {integrity: sha512-Xs1hdnE+DyKgeHJeJznQmYMIBG3TKIHJJT95Q58nHLSrElKlGQqDTR2HQ9fx5CN/Gk6Vh/kupBTDLU11/nDk/g==}
    peerDependencies:
      react: ^19.1.0

  react-hook-form@7.87.0:
    resolution: {integrity: sha512-zhFzWvLxNHH+8839OnZcUxgMZw88ah2jZWDWvKWgF3Tpbnd0vKL+dlcuU3nZVWESZQjd81EW8K+wU+cYfYAc0w==}
    engines: {node: '>=18.0.0'}
    peerDependencies:
      react: ^16.8.0 || ^17 || ^18 || ^19

  react-icons@5.7.0:
    resolution: {integrity: sha512-LBLy340Rzqy6+/yVhZKT3B/QpP1BZaesGqasf09HPOBzRarcDIFH0WwXlXQfE7q7ipxK4MSiC5DIBWURCny6fw==}
    peerDependencies:
      react: '*'

  react-is@16.13.1:
    resolution: {integrity: sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==}

  react-is@18.3.1:
    resolution: {integrity: sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==}

  react-refresh@0.18.0:
    resolution: {integrity: sha512-QgT5//D3jfjJb6Gsjxv0Slpj23ip+HtOpnNgnb2S5zU3CB26G/IDPGoy4RJB42wzFE46DRsstbW6tKHoKbhAxw==}
    engines: {node: '>=0.10.0'}

  react-remove-scroll-bar@2.3.8:
    resolution: {integrity: sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-remove-scroll@2.7.2:
    resolution: {integrity: sha512-Iqb9NjCCTt6Hf+vOdNIZGdTiH1QSqr27H/Ek9sv/a97gfueI/5h1s3yRi1nngzMUaOOToin5dI1dXKdXiF+u0Q==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-resizable-panels@2.1.9:
    resolution: {integrity: sha512-z77+X08YDIrgAes4jl8xhnUu1LNIRp4+E7cv4xHmLOxxUPO/ML7PSrE813b90vj7xvQ1lcf7g2uA9GeMZonjhQ==}
    peerDependencies:
      react: ^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.14.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc

  react-router-dom@7.18.4:
    resolution: {integrity: sha512-yrfmJHIpDG7taCpqKjT1G5B6q3O2K+RN8/fgNf0lTjCwiPbQ0ei6vXX9ZjQR+7ld8Tr7Z5xmyMnZ8YJrphWQUw==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      react: '>=18'
      react-dom: '>=18'

  react-router@7.18.4:
    resolution: {integrity: sha512-PUPQcMhMGRAslLcvtlPz/kmzBEWPhLdgLFrL7pLNepBL6dX0lWj4WD2cUYVgYCuT3jxvghYFg81cDTj44DhetQ==}
    engines: {node: '>=20.0.0'}
    peerDependencies:
      react: '>=18'
      react-dom: '>=18'
    peerDependenciesMeta:
      react-dom:
        optional: true

  react-smooth@4.0.4:
    resolution: {integrity: sha512-gnGKTpYwqL0Iii09gHobNolvX4Kiq4PKx6eWBCYYix+8cdw+cGo3do906l1NBPKkSWx1DghC1dlWG9L2uGd61Q==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  react-style-singleton@2.2.3:
    resolution: {integrity: sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  react-transition-group@4.4.5:
    resolution: {integrity: sha512-pZcd1MCJoiKiBR2NRxeCRg13uCXbydPnmB4EOeRrY7480qNWO8IIgQG6zlDkm6uRMsURXPuKq0GWtiM59a5Q6g==}
    peerDependencies:
      react: '>=16.6.0'
      react-dom: '>=16.6.0'

  react@19.1.0:
    resolution: {integrity: sha512-FS+XFBNvn3GTAWq26joslQgWNoFu08F4kl0J4CgdNKADkdSGXQyTCnKteIAJy96Br6YbpEU1LSzV5dYtjMkMDg==}
    engines: {node: '>=0.10.0'}

  readdirp@4.1.2:
    resolution: {integrity: sha512-GDhwkLfywWL2s6vEjyhri+eXmfH6j1L7JE27WhqLeYzoh/A3DBaYGEj2H/HFZCn/kMfim73FXxEJTw06WtxQwg==}
    engines: {node: '>= 14.18.0'}

  readdirp@5.1.1:
    resolution: {integrity: sha512-Kko+Y5XQ6fM+Ce3dq3m9YGxnacYZYl9cA1wZjaF3Vbry2L3i1qVg8+CAgNPsXRArPMUMCaOR7oa9Nqntc43JKA==}
    engines: {node: '>= 20.19.0'}

  real-require@0.2.0:
    resolution: {integrity: sha512-57frrGM/OCTLqLOAh0mhVA9VBMHd+9U7Zb2THMGdBUoZVOtGbJzjxsYGDJ3A9AYYCP4hn6y1TVbaOfzWtm5GFg==}
    engines: {node: '>= 12.13.0'}

  recharts-scale@0.4.5:
    resolution: {integrity: sha512-kivNFO+0OcUNu7jQquLXAxz1FIwZj8nrj+YkOKc5694NbjCvcT6aSZiIzNzd2Kul4o4rTto8QVR9lMNtxD4G1w==}

  recharts@2.15.4:
    resolution: {integrity: sha512-UT/q6fwS3c1dHbXv2uFgYJ9BMFHu3fwnd7AYZaEQhXuYQ4hgsxLvsUXzGdKeZrW5xopzDCvuA2N41WJ88I7zIw==}
    engines: {node: '>=14'}
    deprecated: 1.x and 2.x branches are no longer active. Bump to Recharts v3 to receive latest features and bugfixes. See https://github.com/recharts/recharts/wiki/3.0-migration-guide
    peerDependencies:
      react: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0
      react-dom: ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  regexparam@3.0.0:
    resolution: {integrity: sha512-RSYAtP31mvYLkAHrOlh25pCNQ5hWnT106VukGaaFfuJrZFkGRX5GhUAdPqpSDXxOhA2c4akmRuplv1mRqnBn6Q==}
    engines: {node: '>=8'}

  remeda@2.48.0:
    resolution: {integrity: sha512-+tf74WyTpQT1lHI/zJeXOkMBqb6R9gNcd3T4DpXzjs26PdwEARCPKOjLAwJaQYrvSXS+nxsXMhEZD4NS40QuSg==}
    engines: {node: '>=18.0.0'}

  require-from-string@2.0.2:
    resolution: {integrity: sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==}
    engines: {node: '>=0.10.0'}

  resolve-pkg-maps@1.0.0:
    resolution: {integrity: sha512-seS2Tj26TBVOC2NIc2rOe2y2ZO7efxITtLZcGSOnHHNOQ7CkiUBfw0Iw2ck6xkIhPwLhKNLS8BO+hEpngQlqzw==}

  reusify@1.1.0:
    resolution: {integrity: sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==}
    engines: {iojs: '>=1.0.0', node: '>=0.10.0'}

  rollup@4.63.1:
    resolution: {integrity: sha512-3Df9jsstwhccuEfmAMi9l8XUh/GOkVObmFTU7CCVBysEbcOZLl84jCtaAZMcPiMz2EGKsATzQcU+Xr3n/wU6cg==}
    engines: {node: '>=18.0.0', npm: '>=8.0.0'}
    hasBin: true

  router@2.2.0:
    resolution: {integrity: sha512-nLTrUKm2UyiL7rlhapu/Zl45FwNgkZGaCpZbIHajDYgwlJCOzLSk+cIPAnsEqV955GjILJnKbdQC1nVPz+gAYQ==}
    engines: {node: '>= 18'}

  run-parallel@1.2.0:
    resolution: {integrity: sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==}

  safe-stable-stringify@2.5.0:
    resolution: {integrity: sha512-b3rppTKm9T+PsVCBEOUR46GWI7fdOs00VKZ1+9c1EWDaDMvjQc6tUwuFyIprgGgTcWoVHSKrU8H31ZHA2e0RHA==}
    engines: {node: '>=10'}

  safer-buffer@2.1.2:
    resolution: {integrity: sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==}

  scheduler@0.26.0:
    resolution: {integrity: sha512-NlHwttCI/l5gCPR3D1nNXtWABUmBwvZpEQiD4IXSbIDq8BzLIK/7Ir5gTFSGZDUu37K5cMNp0hFtzO38sC7gWA==}

  secure-json-parse@4.1.0:
    resolution: {integrity: sha512-l4KnYfEyqYJxDwlNVyRfO2E4NTHfMKAWdUuA8J0yve2Dz/E/PdBepY03RvyJpssIpRFwJoCD55wA+mEDs6ByWA==}

  semver@6.3.1:
    resolution: {integrity: sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==}
    hasBin: true

  send@1.2.1:
    resolution: {integrity: sha512-1gnZf7DFcoIcajTjTwjwuDjzuz4PPcY2StKPlsGAQ1+YH20IRVrBaXSWmdjowTJ6u8Rc01PoYOGHXfP1mYcZNQ==}
    engines: {node: '>= 18'}

  serve-static@2.2.1:
    resolution: {integrity: sha512-xRXBn0pPqQTVQiC8wyQrKs2MOlX24zQ0POGaj0kultvoOCstBQM5yvOhAVSUwOMjQtTvsPWoNCHfPGwaaQJhTw==}
    engines: {node: '>= 18'}

  set-cookie-parser@2.7.2:
    resolution: {integrity: sha512-oeM1lpU/UvhTxw+g3cIfxXHyJRc/uidd3yK1P242gzHds0udQBYzs3y8j4gCCW+ZJ7ad0yctld8RYO+bdurlvw==}

  setprototypeof@1.2.0:
    resolution: {integrity: sha512-E5LDX7Wrp85Kil5bhZv46j8jOeboKq5JMmYM3gVGdGH8xFpPWXUMsNrlODCrkoxMEeNi/XZIwuRvY4XNwYMJpw==}

  shebang-command@2.0.0:
    resolution: {integrity: sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==}
    engines: {node: '>=8'}

  shebang-regex@3.0.0:
    resolution: {integrity: sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==}
    engines: {node: '>=8'}

  side-channel-list@1.0.1:
    resolution: {integrity: sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==}
    engines: {node: '>= 0.4'}

  side-channel-map@1.0.1:
    resolution: {integrity: sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==}
    engines: {node: '>= 0.4'}

  side-channel-weakmap@1.0.2:
    resolution: {integrity: sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==}
    engines: {node: '>= 0.4'}

  side-channel@1.1.1:
    resolution: {integrity: sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==}
    engines: {node: '>= 0.4'}

  signal-exit@4.1.0:
    resolution: {integrity: sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==}
    engines: {node: '>=14'}

  sonic-boom@4.2.1:
    resolution: {integrity: sha512-w6AxtubXa2wTXAUsZMMWERrsIRAdrK0Sc+FUytWvYAhBJLyuI4llrMIC1DtlNSdI99EI86KZum2MMq3EAZlF9Q==}

  sonner@2.0.8:
    resolution: {integrity: sha512-UM/ByIoFra8yzV75n1o0Puu0bw5U/9UNnDacrJNspekBewIfsQ3D6ez1nvlWpt7aTsO6rujQtifBpycwIivqlg==}
    peerDependencies:
      '@types/react': ^18.0.0 || ^19.0.0
      react: ^18.0.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  source-map-js@1.2.1:
    resolution: {integrity: sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==}
    engines: {node: '>=0.10.0'}

  split2@4.2.0:
    resolution: {integrity: sha512-UcjcJOWknrNkF6PLX83qcHM6KHgVKNkV62Y8a5uYDVv9ydGQVwAHMKqHdJje1VTWpljG0WYpCDhrCdAOYH4TWg==}
    engines: {node: '>= 10.x'}

  statuses@2.0.2:
    resolution: {integrity: sha512-DvEy55V3DB7uknRo+4iOGT5fP1slR8wQohVdknigZPMpMstaKJQWhwiYBACJE3Ul2pTnATihhBYnRhZQHGBiRw==}
    engines: {node: '>= 0.8'}

  string-argv@0.3.2:
    resolution: {integrity: sha512-aqD2Q0144Z+/RqG52NeHEkZauTAUWJO8c6yTftGJKO3Tja5tUgIfmIl6kExvhtxSDP7fXB6DvzkfMpCd/F3G+Q==}
    engines: {node: '>=0.6.19'}

  strip-final-newline@4.0.0:
    resolution: {integrity: sha512-aulFJcD6YK8V1G7iRB5tigAP4TsHBZZrOV8pjV++zdUwmeV8uzbY7yn6h9MswN62adStNZFuCIx4haBnRuMDaw==}
    engines: {node: '>=18'}

  strip-json-comments@5.0.3:
    resolution: {integrity: sha512-1tB5mhVo7U+ETBKNf92xT4hrQa3pm0MZ0PQvuDnWgAAGHDsfp4lPSpiS6psrSiet87wyGPh9ft6wmhOMQ0hDiw==}
    engines: {node: '>=14.16'}

  tailwind-merge@3.6.0:
    resolution: {integrity: sha512-uxL7qAVQriqRQPAyK3pj66VqskWqoZ37PW94jwOTwNfq/z9oyu1V+eqrZqtR2+fCiXdYOZe/Modt8GtvqNzu+w==}

  tailwindcss-animate@1.0.7:
    resolution: {integrity: sha512-bl6mpH3T7I3UFxuvDEXLxy/VuFxBk5bbzplh7tXI68mwMokNYd1t9qPBHlnyTwfa4JGC4zP516I1hYYtQ/vspA==}
    peerDependencies:
      tailwindcss: '>=3.0.0 || insiders'

  tailwindcss@4.3.3:
    resolution: {integrity: sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==}

  tapable@2.3.3:
    resolution: {integrity: sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==}
    engines: {node: '>=6'}

  thread-stream@3.1.0:
    resolution: {integrity: sha512-OqyPZ9u96VohAyMfJykzmivOrY2wfMSf3C5TtFJVgN+Hm6aj+voFhlK+kZEIv2FBh1X6Xp3DlnCOfEQ3B2J86A==}

  tiny-invariant@1.3.3:
    resolution: {integrity: sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==}

  tinyglobby@0.2.17:
    resolution: {integrity: sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==}
    engines: {node: '>=12.0.0'}

  to-regex-range@5.0.1:
    resolution: {integrity: sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==}
    engines: {node: '>=8.0'}

  toidentifier@1.0.1:
    resolution: {integrity: sha512-o5sSPKEkg/DIQNmH43V0/uerLrpzVedkUh8tGNvaeXpfpuwjKenlSox/2O/BTlZUtEe+JG7s5YhEz608PlAHRA==}
    engines: {node: '>=0.6'}

  tslib@2.8.1:
    resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}

  tsx@4.23.13:
    resolution: {integrity: sha512-BL5MGkRln6aDYhb0xbQlEAGw743BaZYWdbWtdJOBriYJboKgUUYCadFp2/FpBBZquBC/ezNBn7wMMPx7FDZUDw==}
    engines: {node: '>=18.0.0'}
    hasBin: true

  tw-animate-css@1.4.0:
    resolution: {integrity: sha512-7bziOlRqH0hJx80h/3mbicLW7o8qLsH5+RaLR2t+OHM3D0JlWGODQKQ4cxbK7WlvmUxpcj6Kgu6EKqjrGFe3QQ==}

  type-is@2.1.0:
    resolution: {integrity: sha512-faYHw0anBbc/kWF3zFTEnxSFOAGUX9GFbOBthvDdLsIlEoWOFOtS0zgCiQYwIskL9iGXZL3kAXD8OoZ4GmMATA==}
    engines: {node: '>= 18'}

  typedoc-plugin-coverage@4.0.3:
    resolution: {integrity: sha512-baim3wyMkqpX7rBzL/6iZ7wzKJuSr9ffP16RHOsdTUNoHUZeXLIZHSUBtUhXmNHaUNRgfqdmKLBwyggbJjGdeQ==}
    engines: {node: '>= 18'}
    peerDependencies:
      typedoc: 0.28.x

  typedoc-plugin-markdown@4.13.0:
    resolution: {integrity: sha512-OHaOLoMTS0wL2ud73WXvxv486mrUEtgXxW4iKiTOGJVipT/VBWY76rlVRMQGes7aVonoIf5roWRe1UvHbufLlQ==}
    engines: {node: '>= 18'}
    peerDependencies:
      typedoc: 0.28.x

  typedoc@0.28.20:
    resolution: {integrity: sha512-uSKqkh8Cr48vllnEy+jdaAgOeR6Y+QCBW7usgUsKj7gJEfR7stw9U/fE49LBnj2tPRKPY0c0EBJSWe9Appmplg==}
    engines: {node: '>= 18', pnpm: '>= 10'}
    hasBin: true
    peerDependencies:
      typescript: 5.0.x || 5.1.x || 5.2.x || 5.3.x || 5.4.x || 5.5.x || 5.6.x || 5.7.x || 5.8.x || 5.9.x || 6.0.x

  typescript@5.9.3:
    resolution: {integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==}
    engines: {node: '>=14.17'}
    hasBin: true

  uc.micro@2.1.0:
    resolution: {integrity: sha512-ARDJmphmdvUk6Glw7y9DQ2bFkKBHwQHLi2lsaH6PPmz/Ka9sFOBsBluozhDltWmnv9u/cF6Rt87znRTPV+yp/A==}

  undici-types@7.24.6:
    resolution: {integrity: sha512-WRNW+sJgj5OBN4/0JpHFqtqzhpbnV0GuB+OozA9gCL7a993SmU+1JBZCzLNxYsbMfIeDL+lTsphD5jN5N+n0zg==}

  unicorn-magic@0.3.0:
    resolution: {integrity: sha512-+QBBXBCvifc56fsbuxZQ6Sic3wqqc3WWaqxs58gvJrcOuN83HGTCwz3oS5phzU9LthRNE9VrJCFCLUgHeeFnfA==}
    engines: {node: '>=18'}

  universalify@2.0.1:
    resolution: {integrity: sha512-gptHNQghINnc/vTGIk0SOFGFNXw7JVrlRUtConJRlvaw6DuX0wO5Jeko9sWrMBhh+PsYAZ7oXAiOnf/UKogyiw==}
    engines: {node: '>= 10.0.0'}

  unpipe@1.0.0:
    resolution: {integrity: sha512-pjy2bYhSsufwWlKwPc+l3cN7+wuJlK6uz0YdJEOlQDbl6jo/YlPi4mb8agUkVC8BF7V8NuzeyPNqRksA3hztKQ==}
    engines: {node: '>= 0.8'}

  update-browserslist-db@1.3.2:
    resolution: {integrity: sha512-UQ+MSxlhRm1bzjhU+DcuXfjFO1FzNtqhK5+9Yvlp90ItDLk5vT932A0rFu619nf7RVS+Y/VeaUW1jaRDqZ8VJw==}
    hasBin: true
    peerDependencies:
      browserslist: '>= 4.21.0'

  use-callback-ref@1.3.3:
    resolution: {integrity: sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sidecar@1.1.3:
    resolution: {integrity: sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==}
    engines: {node: '>=10'}
    peerDependencies:
      '@types/react': '*'
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc
    peerDependenciesMeta:
      '@types/react':
        optional: true

  use-sync-external-store@1.7.0:
    resolution: {integrity: sha512-6L+EeigHMQhdaIPNIFUKwfWJSwWFQ8gJbJ2DLOs5sDIegTwR9fRxvnM3uciHKjIZhFz+KAv2emhWMRvDmMcY8A==}
    peerDependencies:
      react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0

  util-deprecate@1.0.2:
    resolution: {integrity: sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==}

  vary@1.1.2:
    resolution: {integrity: sha512-BNGbWLfd0eUPabhkXUVm0j8uuvREyTh5ovRa/dyow/BqAbZJyC+5fU+IzQOzmAKzYqYRAISoRhdQr3eIZ/PXqg==}
    engines: {node: '>= 0.8'}

  vaul@1.1.2:
    resolution: {integrity: sha512-ZFkClGpWyI2WUQjdLJ/BaGuV6AVQiJ3uELGk3OYtP+B6yCO7Cmn9vPFXVJkRaGkOJu3m8bQMgtyzNHixULceQA==}
    peerDependencies:
      react: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc
      react-dom: ^16.8 || ^17.0 || ^18.0 || ^19.0.0 || ^19.0.0-rc

  victory-vendor@36.9.2:
    resolution: {integrity: sha512-PnpQQMuxlwYdocC8fIJqVXvkeViHYzotI+NJrCuav0ZYFoq912ZHBk3mCeuj+5/VpodOjPe1z0Fk2ihgzlXqjQ==}

  vite@7.3.6:
    resolution: {integrity: sha512-4XP60spRGjSZFf1qYH+dJIkK2znL3zQfl9KkOV9MkkRR/3Dls0dxaBsQPTloEc5BLXWPL9vsOxopxyKoMmDueg==}
    engines: {node: ^20.19.0 || >=22.12.0}
    hasBin: true
    peerDependencies:
      '@types/node': ^20.19.0 || >=22.12.0
      jiti: '>=1.21.0'
      less: ^4.0.0
      lightningcss: ^1.21.0
      sass: ^1.70.0
      sass-embedded: ^1.70.0
      stylus: '>=0.54.8'
      sugarss: ^5.0.0
      terser: ^5.16.0
      tsx: ^4.8.1
      yaml: ^2.4.2
    peerDependenciesMeta:
      '@types/node':
        optional: true
      jiti:
        optional: true
      less:
        optional: true
      lightningcss:
        optional: true
      sass:
        optional: true
      sass-embedded:
        optional: true
      stylus:
        optional: true
      sugarss:
        optional: true
      terser:
        optional: true
      tsx:
        optional: true
      yaml:
        optional: true

  which@2.0.2:
    resolution: {integrity: sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==}
    engines: {node: '>= 8'}
    hasBin: true

  wouter@3.13.0:
    resolution: {integrity: sha512-p1RoCuVyxwb3X5jLjDdkwDzlXj+/UGZqZb+806uaJOVEHvNfGkjET0KiQ/CGiDKC90rLsALMgMj4onNVKxgNdQ==}
    peerDependencies:
      react: '>=16.8.0'

  wrappy@1.0.2:
    resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}

  xtend@4.0.2:
    resolution: {integrity: sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==}
    engines: {node: '>=0.4'}

  yallist@3.1.1:
    resolution: {integrity: sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==}

  yaml@2.9.0:
    resolution: {integrity: sha512-2AvhNX3mb8zd6Zy7INTtSpl1F15HW6Wnqj0srWlkKLcpYl/gMIMJiyuGq2KeI2YFxUPjdlB+3Lc10seMLtL4cA==}
    engines: {node: '>= 14.6'}
    hasBin: true

  yocto-queue@1.2.2:
    resolution: {integrity: sha512-4LCcse/U2MHZ63HAJVE+v71o7yOdIe4cZ70Wpf8D/IyjDKYQLV5GD46B+hSTjJsvV5PztjvHoU580EftxjDZFQ==}
    engines: {node: '>=12.20'}

  yoctocolors@2.2.0:
    resolution: {integrity: sha512-xYqdZFUK/VYazNl/oCDYN+3WloWQwMfZxBoiNt6qNyk+xfOdi598muWE42rNZFp1kNOiqW936q5RhUdnpqElSg==}
    engines: {node: '>=18'}

  zod@3.25.76:
    resolution: {integrity: sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==}

snapshots:

  '@babel/code-frame@7.29.7':
    dependencies:
      '@babel/helper-validator-identifier': 7.29.7
      js-tokens: 4.0.0
      picocolors: 1.1.1

  '@babel/compat-data@7.29.7': {}

  '@babel/core@7.29.7':
    dependencies:
      '@babel/code-frame': 7.29.7
      '@babel/generator': 7.29.8
      '@babel/helper-compilation-targets': 7.29.7
      '@babel/helper-module-transforms': 7.29.7(@babel/core@7.29.7)
      '@babel/helpers': 7.29.7
      '@babel/parser': 7.29.8
      '@babel/template': 7.29.7
      '@babel/traverse': 7.29.8
      '@babel/types': 7.29.8
      '@jridgewell/remapping': 2.3.5
      convert-source-map: 2.0.0
      debug: 4.4.3
      gensync: 1.0.0-beta.2
      json5: 2.2.3
      semver: 6.3.1
    transitivePeerDependencies:
      - supports-color

  '@babel/generator@7.29.8':
    dependencies:
      '@babel/parser': 7.29.8
      '@babel/types': 7.29.8
      '@jridgewell/gen-mapping': 0.3.13
      '@jridgewell/trace-mapping': 0.3.31
      jsesc: 3.1.0

  '@babel/helper-compilation-targets@7.29.7':
    dependencies:
      '@babel/compat-data': 7.29.7
      '@babel/helper-validator-option': 7.29.7
      browserslist: 4.28.9
      lru-cache: 5.1.1
      semver: 6.3.1

  '@babel/helper-globals@7.29.7': {}

  '@babel/helper-module-imports@7.29.7':
    dependencies:
      '@babel/traverse': 7.29.8
      '@babel/types': 7.29.8
    transitivePeerDependencies:
      - supports-color

  '@babel/helper-module-transforms@7.29.7(@babel/core@7.29.7)':
    dependencies:
      '@babel/core': 7.29.7
      '@babel/helper-module-imports': 7.29.7
      '@babel/helper-validator-identifier': 7.29.7
      '@babel/traverse': 7.29.8
    transitivePeerDependencies:
      - supports-color

  '@babel/helper-plugin-utils@7.29.7': {}

  '@babel/helper-string-parser@7.29.7': {}

  '@babel/helper-validator-identifier@7.29.7': {}

  '@babel/helper-validator-option@7.29.7': {}

  '@babel/helpers@7.29.7':
    dependencies:
      '@babel/template': 7.29.7
      '@babel/types': 7.29.8

  '@babel/parser@7.29.8':
    dependencies:
      '@babel/types': 7.29.8

  '@babel/plugin-transform-react-jsx-self@7.29.7(@babel/core@7.29.7)':
    dependencies:
      '@babel/core': 7.29.7
      '@babel/helper-plugin-utils': 7.29.7

  '@babel/plugin-transform-react-jsx-source@7.29.7(@babel/core@7.29.7)':
    dependencies:
      '@babel/core': 7.29.7
      '@babel/helper-plugin-utils': 7.29.7

  '@babel/runtime@7.29.7': {}

  '@babel/template@7.29.7':
    dependencies:
      '@babel/code-frame': 7.29.7
      '@babel/parser': 7.29.8
      '@babel/types': 7.29.8

  '@babel/traverse@7.29.8':
    dependencies:
      '@babel/code-frame': 7.29.7
      '@babel/generator': 7.29.8
      '@babel/helper-globals': 7.29.7
      '@babel/parser': 7.29.8
      '@babel/template': 7.29.7
      '@babel/types': 7.29.8
      debug: 4.4.3
    transitivePeerDependencies:
      - supports-color

  '@babel/types@7.29.8':
    dependencies:
      '@babel/helper-string-parser': 7.29.7
      '@babel/helper-validator-identifier': 7.29.7

  '@commander-js/extra-typings@15.0.0(commander@15.0.0)':
    dependencies:
      commander: 15.0.0

  '@date-fns/tz@1.5.0': {}

  '@drizzle-team/brocli@0.10.2': {}

  '@esbuild/linux-x64@0.28.2':
    optional: true

  '@floating-ui/core@1.8.0':
    dependencies:
      '@floating-ui/utils': 0.2.12

  '@floating-ui/dom@1.8.0':
    dependencies:
      '@floating-ui/core': 1.8.0
      '@floating-ui/utils': 0.2.12

  '@floating-ui/react-dom@2.1.9(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@floating-ui/dom': 1.8.0
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  '@floating-ui/utils@0.2.12': {}

  '@gerrit0/mini-shiki@3.23.0':
    dependencies:
      '@shikijs/engine-oniguruma': 3.23.0
      '@shikijs/langs': 3.23.0
      '@shikijs/themes': 3.23.0
      '@shikijs/types': 3.23.0
      '@shikijs/vscode-textmate': 10.0.2

  '@hookform/resolvers@3.10.0(react-hook-form@7.87.0(react@19.1.0))':
    dependencies:
      react-hook-form: 7.87.0(react@19.1.0)

  '@jridgewell/gen-mapping@0.3.13':
    dependencies:
      '@jridgewell/sourcemap-codec': 1.6.0
      '@jridgewell/trace-mapping': 0.3.31

  '@jridgewell/remapping@2.3.5':
    dependencies:
      '@jridgewell/gen-mapping': 0.3.13
      '@jridgewell/trace-mapping': 0.3.31

  '@jridgewell/resolve-uri@3.1.2': {}

  '@jridgewell/sourcemap-codec@1.6.0': {}

  '@jridgewell/trace-mapping@0.3.31':
    dependencies:
      '@jridgewell/resolve-uri': 3.1.2
      '@jridgewell/sourcemap-codec': 1.6.0

  '@napi-rs/lzma-linux-x64-gnu@1.5.1':
    optional: true

  '@nodelib/fs.scandir@2.1.5':
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      run-parallel: 1.2.0

  '@nodelib/fs.stat@2.0.5': {}

  '@nodelib/fs.walk@1.2.8':
    dependencies:
      '@nodelib/fs.scandir': 2.1.5
      fastq: 1.20.3

  '@orval/angular@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/axios@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/core@8.30.0(typescript@5.9.3)':
    dependencies:
      '@scalar/openapi-types': 0.9.4
      acorn: 8.18.0
      compare-versions: 6.1.1
      debug: 4.4.3
      esbuild: 0.28.2
      esutils: 2.0.3
      fs-extra: 11.4.0
      jiti: 2.7.0
      jsesc: 3.1.0
      remeda: 2.48.0
      tinyglobby: 0.2.17
      typedoc: 0.28.20(typescript@5.9.3)
    transitivePeerDependencies:
      - supports-color
      - typescript

  '@orval/effect@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      remeda: 2.48.0
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/fetch@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/hono@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      '@orval/zod': 8.30.0(typescript@5.9.3)
      fs-extra: 11.4.0
    optionalDependencies:
      typescript: 5.9.3
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color

  '@orval/mcp@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      '@orval/fetch': 8.30.0(typescript@5.9.3)
      '@orval/zod': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/mock@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      remeda: 2.48.0
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/query@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      '@orval/fetch': 8.30.0(typescript@5.9.3)
      remeda: 2.48.0
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/solid-start@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/swr@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      '@orval/fetch': 8.30.0(typescript@5.9.3)
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@orval/zod@8.30.0(typescript@5.9.3)':
    dependencies:
      '@orval/core': 8.30.0(typescript@5.9.3)
      jsesc: 3.1.0
      remeda: 2.48.0
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  '@pinojs/redact@0.4.0': {}

  '@radix-ui/number@1.1.3': {}

  '@radix-ui/primitive@1.1.7': {}

  '@radix-ui/react-accordion@1.2.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collapsible': 1.1.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-alert-dialog@1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-arrow@1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-aspect-ratio@1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-avatar@1.2.6(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-checkbox@1.3.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-collapsible@1.1.20(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-collection@1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-compose-refs@1.1.5(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-context-menu@2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-context@1.2.2(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-dialog@1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      aria-hidden: 1.2.6
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-remove-scroll: 2.7.2(@types/react@19.3.0)(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-direction@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-dismissable-layer@1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-dropdown-menu@2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-focus-guards@1.1.6(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-focus-scope@1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-hover-card@1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-id@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-label@2.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-menu@2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      aria-hidden: 1.2.6
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-remove-scroll: 2.7.2(@types/react@19.3.0)(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-menubar@1.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-menu': 2.1.24(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-navigation-menu@1.2.22(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-popover@1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      aria-hidden: 1.2.6
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-remove-scroll: 2.7.2(@types/react@19.3.0)(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-popper@1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@floating-ui/react-dom': 2.1.9(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-arrow': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-rect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/rect': 1.1.3
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-portal@1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-presence@1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-primitive@2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-progress@1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-radio-group@1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-roving-focus@1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-is-hydrated': 0.1.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-scroll-area@1.2.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-select@2.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-focus-guards': 1.1.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-focus-scope': 1.1.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      aria-hidden: 1.2.6
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-remove-scroll: 2.7.2(@types/react@19.3.0)(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-separator@1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-slider@1.4.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/number': 1.1.3
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-previous': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-slot@1.3.3(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-switch@1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-size': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-tabs@1.1.21(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-toast@1.2.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-collection': 1.1.15(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-callback-ref': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-toggle-group@1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-direction': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-roving-focus': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-toggle': 1.1.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-toggle@1.1.18(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-tooltip@1.2.16(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-context': 1.2.2(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dismissable-layer': 1.1.19(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-popper': 1.3.7(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-portal': 1.1.17(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-presence': 1.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-slot': 1.3.3(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-controllable-state': 1.2.6(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-visually-hidden': 1.2.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/react-use-callback-ref@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-controllable-state@1.2.6(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/primitive': 1.1.7
      '@radix-ui/react-use-effect-event': 0.0.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-effect-event@0.0.5(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-is-hydrated@0.1.3(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-layout-effect@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-previous@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-rect@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/rect': 1.1.3
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-use-size@1.1.4(@types/react@19.3.0)(react@19.1.0)':
    dependencies:
      '@radix-ui/react-use-layout-effect': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      react: 19.1.0
    optionalDependencies:
      '@types/react': 19.3.0

  '@radix-ui/react-visually-hidden@1.2.11(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)':
    dependencies:
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0
      '@types/react-dom': 19.3.0(@types/react@19.3.0)

  '@radix-ui/rect@1.1.3': {}

  '@replit/connectors-sdk@0.4.3': {}

  '@replit/vite-plugin-cartographer@0.5.21':
    dependencies:
      '@babel/parser': 7.29.8
      '@babel/traverse': 7.29.8
      '@babel/types': 7.29.8
      magic-string: 0.30.21
      modern-screenshot: 4.7.0
    transitivePeerDependencies:
      - supports-color

  '@replit/vite-plugin-dev-banner@0.1.2': {}

  '@replit/vite-plugin-runtime-error-modal@0.0.6':
    dependencies:
      '@jridgewell/trace-mapping': 0.3.31

  '@rolldown/pluginutils@1.0.0-rc.3': {}

  '@rollup/rollup-linux-x64-gnu@4.63.1':
    optional: true

  '@scalar/helpers@0.10.0': {}

  '@scalar/helpers@0.11.1': {}

  '@scalar/json-magic@0.12.20':
    dependencies:
      '@scalar/helpers': 0.10.0
      pathe: 2.0.3
      yaml: 2.9.0

  '@scalar/json-magic@0.13.2':
    dependencies:
      '@scalar/helpers': 0.11.1
      pathe: 2.0.3
      yaml: 2.9.0

  '@scalar/openapi-parser@0.28.16':
    dependencies:
      '@scalar/helpers': 0.11.1
      '@scalar/json-magic': 0.13.2
      '@scalar/openapi-types': 0.9.5
      '@scalar/openapi-upgrader': 0.2.15
      ajv: 8.20.0
      ajv-draft-04: 1.0.0(ajv@8.20.0)
      ajv-formats: 3.0.1
      jsonpointer: 5.0.1
      leven: 4.1.0
      yaml: 2.9.0

  '@scalar/openapi-types@0.9.4': {}

  '@scalar/openapi-types@0.9.5': {}

  '@scalar/openapi-upgrader@0.2.15':
    dependencies:
      '@scalar/openapi-types': 0.9.5

  '@sec-ant/readable-stream@0.4.1': {}

  '@shikijs/engine-oniguruma@3.23.0':
    dependencies:
      '@shikijs/types': 3.23.0
      '@shikijs/vscode-textmate': 10.0.2

  '@shikijs/langs@3.23.0':
    dependencies:
      '@shikijs/types': 3.23.0

  '@shikijs/themes@3.23.0':
    dependencies:
      '@shikijs/types': 3.23.0

  '@shikijs/types@3.23.0':
    dependencies:
      '@shikijs/vscode-textmate': 10.0.2
      '@types/hast': 3.0.5

  '@shikijs/vscode-textmate@10.0.2': {}

  '@sindresorhus/merge-streams@4.0.0': {}

  '@tabby_ai/hijri-converter@1.0.5': {}

  '@tailwindcss/node@4.3.3':
    dependencies:
      '@jridgewell/remapping': 2.3.5
      enhanced-resolve: 5.24.5
      jiti: 2.7.0
      lightningcss: 1.32.0
      magic-string: 0.30.21
      source-map-js: 1.2.1
      tailwindcss: 4.3.3

  '@tailwindcss/oxide-linux-x64-gnu@4.3.3':
    optional: true

  '@tailwindcss/oxide-wasm32-wasi@4.3.3':
    optional: true

  '@tailwindcss/oxide@4.3.3':
    optionalDependencies:
      '@tailwindcss/oxide-linux-x64-gnu': 4.3.3
      '@tailwindcss/oxide-wasm32-wasi': 4.3.3

  '@tailwindcss/typography@0.5.20(tailwindcss@4.3.3)':
    dependencies:
      postcss-selector-parser: 6.0.10
      tailwindcss: 4.3.3

  '@tailwindcss/vite@4.3.3(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))':
    dependencies:
      '@tailwindcss/node': 4.3.3
      '@tailwindcss/oxide': 4.3.3
      tailwindcss: 4.3.3
      vite: 7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0)

  '@tanstack/query-core@5.102.8': {}

  '@tanstack/react-query@5.102.8(react@19.1.0)':
    dependencies:
      '@tanstack/query-core': 5.102.8
      react: 19.1.0

  '@types/babel__core@7.20.5':
    dependencies:
      '@babel/parser': 7.29.8
      '@babel/types': 7.29.8
      '@types/babel__generator': 7.27.0
      '@types/babel__template': 7.4.4
      '@types/babel__traverse': 7.28.0

  '@types/babel__generator@7.27.0':
    dependencies:
      '@babel/types': 7.29.8

  '@types/babel__template@7.4.4':
    dependencies:
      '@babel/parser': 7.29.8
      '@babel/types': 7.29.8

  '@types/babel__traverse@7.28.0':
    dependencies:
      '@babel/types': 7.29.8

  '@types/body-parser@1.19.6':
    dependencies:
      '@types/connect': 3.4.38
      '@types/node': 25.9.6

  '@types/connect@3.4.38':
    dependencies:
      '@types/node': 25.9.6

  '@types/cookie-parser@1.4.10(@types/express@5.0.6)':
    dependencies:
      '@types/express': 5.0.6

  '@types/cors@2.8.19':
    dependencies:
      '@types/node': 25.9.6

  '@types/d3-array@3.2.2': {}

  '@types/d3-color@3.1.3': {}

  '@types/d3-ease@3.0.2': {}

  '@types/d3-interpolate@3.0.4':
    dependencies:
      '@types/d3-color': 3.1.3

  '@types/d3-path@3.1.1': {}

  '@types/d3-scale@4.0.9':
    dependencies:
      '@types/d3-time': 3.0.4

  '@types/d3-shape@3.2.0':
    dependencies:
      '@types/d3-path': 3.1.1

  '@types/d3-time@3.0.4': {}

  '@types/d3-timer@3.0.2': {}

  '@types/estree@1.0.9': {}

  '@types/express-serve-static-core@5.1.3':
    dependencies:
      '@types/node': 25.9.6
      '@types/qs': 6.15.1
      '@types/range-parser': 1.2.7
      '@types/send': 1.2.1

  '@types/express@5.0.6':
    dependencies:
      '@types/body-parser': 1.19.6
      '@types/express-serve-static-core': 5.1.3
      '@types/serve-static': 2.2.0

  '@types/hast@3.0.5':
    dependencies:
      '@types/unist': 3.0.3

  '@types/http-errors@2.0.5': {}

  '@types/node@25.9.6':
    dependencies:
      undici-types: 7.24.6

  '@types/pg@8.23.1':
    dependencies:
      '@types/node': 25.9.6
      pg-protocol: 1.16.0
      pg-types: 2.2.0

  '@types/qs@6.15.1': {}

  '@types/range-parser@1.2.7': {}

  '@types/react-dom@19.3.0(@types/react@19.3.0)':
    dependencies:
      '@types/react': 19.3.0

  '@types/react@19.3.0':
    dependencies:
      csstype: 3.2.3

  '@types/send@1.2.1':
    dependencies:
      '@types/node': 25.9.6

  '@types/serve-static@2.2.0':
    dependencies:
      '@types/http-errors': 2.0.5
      '@types/node': 25.9.6

  '@types/unist@3.0.3': {}

  '@vitejs/plugin-react@5.2.0(vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0))':
    dependencies:
      '@babel/core': 7.29.7
      '@babel/plugin-transform-react-jsx-self': 7.29.7(@babel/core@7.29.7)
      '@babel/plugin-transform-react-jsx-source': 7.29.7(@babel/core@7.29.7)
      '@rolldown/pluginutils': 1.0.0-rc.3
      '@types/babel__core': 7.20.5
      react-refresh: 0.18.0
      vite: 7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0)
    transitivePeerDependencies:
      - supports-color

  accepts@2.0.0:
    dependencies:
      mime-types: 3.0.2
      negotiator: 1.1.0

  acorn@8.18.0: {}

  ajv-draft-04@1.0.0(ajv@8.20.0):
    optionalDependencies:
      ajv: 8.20.0

  ajv-formats@3.0.1:
    dependencies:
      ajv: 8.20.0

  ajv@8.20.0:
    dependencies:
      fast-deep-equal: 3.1.3
      fast-uri: 3.1.7
      json-schema-traverse: 1.0.0
      require-from-string: 2.0.2

  argparse@2.0.1: {}

  aria-hidden@1.2.6:
    dependencies:
      tslib: 2.8.1

  atomic-sleep@1.0.0: {}

  balanced-match@4.0.4: {}

  baseline-browser-mapping@2.11.21: {}

  body-parser@2.3.0:
    dependencies:
      bytes: 3.1.2
      content-type: 2.1.0
      debug: 4.4.3
      http-errors: 2.0.1
      iconv-lite: 0.7.3
      on-finished: 2.4.1
      qs: 6.16.0
      raw-body: 3.0.2
      type-is: 2.1.0
    transitivePeerDependencies:
      - supports-color

  brace-expansion@5.0.9:
    dependencies:
      balanced-match: 4.0.4

  braces@3.0.3:
    dependencies:
      fill-range: 7.1.1

  browserslist@4.28.9:
    dependencies:
      baseline-browser-mapping: 2.11.21
      caniuse-lite: 1.0.30001810
      electron-to-chromium: 1.5.425
      node-releases: 2.0.55
      update-browserslist-db: 1.3.2(browserslist@4.28.9)

  bytes@3.1.2: {}

  call-bind-apply-helpers@1.0.2:
    dependencies:
      es-errors: 1.3.0
      function-bind: 1.1.2

  call-bound@1.0.4:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      get-intrinsic: 1.3.0

  caniuse-lite@1.0.30001810: {}

  chokidar@4.0.3:
    dependencies:
      readdirp: 4.1.2

  chokidar@5.0.0:
    dependencies:
      readdirp: 5.1.1

  class-variance-authority@0.7.1:
    dependencies:
      clsx: 2.1.1

  clsx@2.1.1: {}

  cmdk@1.1.1(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      '@radix-ui/react-compose-refs': 1.1.5(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      '@radix-ui/react-id': 1.1.4(@types/react@19.3.0)(react@19.1.0)
      '@radix-ui/react-primitive': 2.1.10(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  colorette@2.0.20: {}

  commander@15.0.0: {}

  compare-versions@6.1.1: {}

  content-disposition@1.1.0: {}

  content-type@1.0.5: {}

  content-type@2.1.0: {}

  convert-source-map@2.0.0: {}

  cookie-parser@1.4.7:
    dependencies:
      cookie: 0.7.2
      cookie-signature: 1.0.6

  cookie-signature@1.0.6: {}

  cookie-signature@1.2.2: {}

  cookie@0.7.2: {}

  cookie@1.1.1: {}

  cors@2.8.6:
    dependencies:
      object-assign: 4.1.1
      vary: 1.1.2

  cross-spawn@7.0.6:
    dependencies:
      path-key: 3.1.1
      shebang-command: 2.0.0
      which: 2.0.2

  cssesc@3.0.0: {}

  csstype@3.2.3: {}

  d3-array@3.2.4:
    dependencies:
      internmap: 2.0.3

  d3-color@3.1.0: {}

  d3-ease@3.0.1: {}

  d3-format@3.1.2: {}

  d3-interpolate@3.0.1:
    dependencies:
      d3-color: 3.1.0

  d3-path@3.1.0: {}

  d3-scale@4.0.2:
    dependencies:
      d3-array: 3.2.4
      d3-format: 3.1.2
      d3-interpolate: 3.0.1
      d3-time: 3.1.0
      d3-time-format: 4.1.0

  d3-shape@3.2.0:
    dependencies:
      d3-path: 3.1.0

  d3-time-format@4.1.0:
    dependencies:
      d3-time: 3.1.0

  d3-time@3.1.0:
    dependencies:
      d3-array: 3.2.4

  d3-timer@3.0.1: {}

  date-fns-jalali@4.1.0-0: {}

  date-fns@3.6.0: {}

  date-fns@4.4.0: {}

  dateformat@4.6.3: {}

  debug@4.4.3:
    dependencies:
      ms: 2.1.3

  decimal.js-light@2.5.1: {}

  depd@2.0.0: {}

  detect-libc@2.1.2: {}

  detect-node-es@1.1.0: {}

  dom-helpers@5.2.1:
    dependencies:
      '@babel/runtime': 7.29.7
      csstype: 3.2.3

  drizzle-kit@0.31.10:
    dependencies:
      '@drizzle-team/brocli': 0.10.2
      '@esbuild-kit/esm-loader': tsx@4.23.13
      esbuild: 0.28.2
      tsx: 4.23.13

  drizzle-orm@0.45.2(@types/pg@8.23.1)(pg@8.23.0):
    optionalDependencies:
      '@types/pg': 8.23.1
      pg: 8.23.0

  drizzle-zod@0.8.3(drizzle-orm@0.45.2(@types/pg@8.23.1)(pg@8.23.0))(zod@3.25.76):
    dependencies:
      drizzle-orm: 0.45.2(@types/pg@8.23.1)(pg@8.23.0)
      zod: 3.25.76

  dunder-proto@1.0.1:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-errors: 1.3.0
      gopd: 1.2.0

  ee-first@1.1.1: {}

  electron-to-chromium@1.5.425: {}

  embla-carousel-react@8.6.0(react@19.1.0):
    dependencies:
      embla-carousel: 8.6.0
      embla-carousel-reactive-utils: 8.6.0(embla-carousel@8.6.0)
      react: 19.1.0

  embla-carousel-reactive-utils@8.6.0(embla-carousel@8.6.0):
    dependencies:
      embla-carousel: 8.6.0

  embla-carousel@8.6.0: {}

  encodeurl@2.0.0: {}

  end-of-stream@1.4.5:
    dependencies:
      once: 1.4.0

  enhanced-resolve@5.24.5:
    dependencies:
      graceful-fs: 4.2.11
      tapable: 2.3.3

  entities@4.5.0: {}

  es-define-property@1.0.1: {}

  es-errors@1.3.0: {}

  es-object-atoms@1.1.2:
    dependencies:
      es-errors: 1.3.0

  esbuild-plugin-pino@2.3.3(esbuild@0.28.2)(pino-pretty@13.1.3)(pino@9.14.0)(thread-stream@3.1.0):
    dependencies:
      esbuild: 0.28.2
      pino: 9.14.0
    optionalDependencies:
      pino-pretty: 13.1.3
      thread-stream: 3.1.0

  esbuild@0.28.2:
    optionalDependencies:
      '@esbuild/linux-x64': 0.28.2

  escalade@3.2.0: {}

  escape-html@1.0.3: {}

  esutils@2.0.3: {}

  etag@1.8.1: {}

  eventemitter3@4.0.7: {}

  execa@9.6.1:
    dependencies:
      '@sindresorhus/merge-streams': 4.0.0
      cross-spawn: 7.0.6
      figures: 6.1.0
      get-stream: 9.0.1
      human-signals: 8.0.1
      is-plain-obj: 4.1.0
      is-stream: 4.0.1
      npm-run-path: 6.0.0
      pretty-ms: 9.3.1
      signal-exit: 4.1.0
      strip-final-newline: 4.0.0
      yoctocolors: 2.2.0

  express@5.2.1:
    dependencies:
      accepts: 2.0.0
      body-parser: 2.3.0
      content-disposition: 1.1.0
      content-type: 1.0.5
      cookie: 0.7.2
      cookie-signature: 1.2.2
      debug: 4.4.3
      depd: 2.0.0
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      finalhandler: 2.1.1
      fresh: 2.0.0
      http-errors: 2.0.1
      merge-descriptors: 2.0.0
      mime-types: 3.0.2
      on-finished: 2.4.1
      once: 1.4.0
      parseurl: 1.3.3
      proxy-addr: 2.0.7
      qs: 6.16.0
      range-parser: 1.3.0
      router: 2.2.0
      send: 1.2.1
      serve-static: 2.2.1
      statuses: 2.0.2
      type-is: 2.1.0
      vary: 1.1.2
    transitivePeerDependencies:
      - supports-color

  fast-copy@4.1.1: {}

  fast-deep-equal@3.1.3: {}

  fast-equals@5.4.2: {}

  fast-glob@3.3.3:
    dependencies:
      '@nodelib/fs.stat': 2.0.5
      '@nodelib/fs.walk': 1.2.8
      glob-parent: 5.1.2
      merge2: 1.4.1
      micromatch: 4.0.8

  fast-safe-stringify@2.1.1: {}

  fast-uri@3.1.7: {}

  fastq@1.20.3:
    dependencies:
      reusify: 1.1.0

  fdir@6.5.0(picomatch@4.0.7):
    optionalDependencies:
      picomatch: 4.0.7

  figures@6.1.0:
    dependencies:
      is-unicode-supported: 2.1.0

  fill-range@7.1.1:
    dependencies:
      to-regex-range: 5.0.1

  finalhandler@2.1.1:
    dependencies:
      debug: 4.4.3
      encodeurl: 2.0.0
      escape-html: 1.0.3
      on-finished: 2.4.1
      parseurl: 1.3.3
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  find-up@8.0.0:
    dependencies:
      locate-path: 8.0.0
      unicorn-magic: 0.3.0

  forwarded@0.2.0: {}

  framer-motion@12.43.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      motion-dom: 12.43.0
      motion-utils: 12.39.0
      tslib: 2.8.1
    optionalDependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  fresh@2.0.0: {}

  fs-extra@11.4.0:
    dependencies:
      graceful-fs: 4.2.11
      jsonfile: 6.2.1
      universalify: 2.0.1

  fsevents@2.3.3:
    optional: true

  function-bind@1.1.2: {}

  gensync@1.0.0-beta.2: {}

  get-caller-file@2.0.5: {}

  get-intrinsic@1.3.0:
    dependencies:
      call-bind-apply-helpers: 1.0.2
      es-define-property: 1.0.1
      es-errors: 1.3.0
      es-object-atoms: 1.1.2
      function-bind: 1.1.2
      get-proto: 1.0.1
      gopd: 1.2.0
      has-symbols: 1.1.0
      hasown: 2.0.4
      math-intrinsics: 1.1.0

  get-nonce@1.0.1: {}

  get-proto@1.0.1:
    dependencies:
      dunder-proto: 1.0.1
      es-object-atoms: 1.1.2

  get-stream@9.0.1:
    dependencies:
      '@sec-ant/readable-stream': 0.4.1
      is-stream: 4.0.1

  get-tsconfig@4.14.3:
    dependencies:
      resolve-pkg-maps: 1.0.0

  glob-parent@5.1.2:
    dependencies:
      is-glob: 4.0.3

  gopd@1.2.0: {}

  graceful-fs@4.2.11: {}

  has-symbols@1.1.0: {}

  hasown@2.0.4:
    dependencies:
      function-bind: 1.1.2

  help-me@5.0.0: {}

  http-errors@2.0.1:
    dependencies:
      depd: 2.0.0
      inherits: 2.0.4
      setprototypeof: 1.2.0
      statuses: 2.0.2
      toidentifier: 1.0.1

  human-signals@8.0.1: {}

  iconv-lite@0.7.3:
    dependencies:
      safer-buffer: 2.1.2

  inherits@2.0.4: {}

  input-otp@1.5.0(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  internmap@2.0.3: {}

  ipaddr.js@1.9.1: {}

  is-extglob@2.1.1: {}

  is-glob@4.0.3:
    dependencies:
      is-extglob: 2.1.1

  is-number@7.0.0: {}

  is-plain-obj@4.1.0: {}

  is-promise@4.0.0: {}

  is-stream@4.0.1: {}

  is-unicode-supported@2.1.0: {}

  isexe@2.0.0: {}

  jiti@2.7.0: {}

  joycon@3.1.1: {}

  js-tokens@4.0.0: {}

  js-yaml@4.3.2:
    dependencies:
      argparse: 2.0.1

  jsesc@3.1.0: {}

  json-schema-traverse@1.0.0: {}

  json5@2.2.3: {}

  jsonfile@6.2.1:
    dependencies:
      universalify: 2.0.1
    optionalDependencies:
      graceful-fs: 4.2.11

  jsonpointer@5.0.1: {}

  leven@4.1.0: {}

  lightningcss-linux-x64-gnu@1.32.0:
    optional: true

  lightningcss@1.32.0:
    dependencies:
      detect-libc: 2.1.2
    optionalDependencies:
      lightningcss-linux-x64-gnu: 1.32.0

  linkify-it@5.0.2:
    dependencies:
      uc.micro: 2.1.0

  locate-path@8.0.0:
    dependencies:
      p-locate: 6.0.0

  lodash@4.18.1: {}

  loose-envify@1.4.0:
    dependencies:
      js-tokens: 4.0.0

  lru-cache@5.1.1:
    dependencies:
      yallist: 3.1.1

  lucide-react@0.545.0(react@19.1.0):
    dependencies:
      react: 19.1.0

  lunr@2.3.9: {}

  magic-string@0.30.21:
    dependencies:
      '@jridgewell/sourcemap-codec': 1.6.0

  markdown-it@14.3.1:
    dependencies:
      argparse: 2.0.1
      entities: 4.5.0
      linkify-it: 5.0.2
      mdurl: 2.1.0
      punycode.js: 2.3.1
      uc.micro: 2.1.0

  math-intrinsics@1.1.0: {}

  mdurl@2.1.0: {}

  media-typer@1.1.1: {}

  merge-descriptors@2.0.0: {}

  merge2@1.4.1: {}

  micromatch@4.0.8:
    dependencies:
      braces: 3.0.3
      picomatch: 2.3.2

  mime-db@1.54.0: {}

  mime-types@3.0.2:
    dependencies:
      mime-db: 1.54.0

  minimatch@10.2.6:
    dependencies:
      brace-expansion: 5.0.9

  minimist@1.2.8: {}

  modern-screenshot@4.7.0: {}

  motion-dom@12.43.0:
    dependencies:
      motion-utils: 12.39.0

  motion-utils@12.39.0: {}

  ms@2.1.3: {}

  nanoid@3.3.18: {}

  negotiator@1.1.0:
    dependencies:
      content-type: 2.1.0

  next-themes@0.4.6(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  node-releases@2.0.55: {}

  npm-run-path@6.0.0:
    dependencies:
      path-key: 4.0.0
      unicorn-magic: 0.3.0

  object-assign@4.1.1: {}

  object-inspect@1.13.4: {}

  on-exit-leak-free@2.1.2: {}

  on-finished@2.4.1:
    dependencies:
      ee-first: 1.1.1

  once@1.4.0:
    dependencies:
      wrappy: 1.0.2

  orval@8.30.0(prettier@3.9.6)(typescript@5.9.3):
    dependencies:
      '@commander-js/extra-typings': 15.0.0(commander@15.0.0)
      '@orval/angular': 8.30.0(typescript@5.9.3)
      '@orval/axios': 8.30.0(typescript@5.9.3)
      '@orval/core': 8.30.0(typescript@5.9.3)
      '@orval/effect': 8.30.0(typescript@5.9.3)
      '@orval/fetch': 8.30.0(typescript@5.9.3)
      '@orval/hono': 8.30.0(typescript@5.9.3)
      '@orval/mcp': 8.30.0(typescript@5.9.3)
      '@orval/mock': 8.30.0(typescript@5.9.3)
      '@orval/query': 8.30.0(typescript@5.9.3)
      '@orval/solid-start': 8.30.0(typescript@5.9.3)
      '@orval/swr': 8.30.0(typescript@5.9.3)
      '@orval/zod': 8.30.0(typescript@5.9.3)
      '@scalar/json-magic': 0.12.20
      '@scalar/openapi-parser': 0.28.16
      '@scalar/openapi-types': 0.9.4
      chokidar: 5.0.0
      commander: 15.0.0
      execa: 9.6.1
      find-up: 8.0.0
      fs-extra: 11.4.0
      get-tsconfig: 4.14.3
      jiti: 2.7.0
      js-yaml: 4.3.2
      remeda: 2.48.0
      string-argv: 0.3.2
      typedoc: 0.28.20(typescript@5.9.3)
      typedoc-plugin-coverage: 4.0.3(typedoc@0.28.20(typescript@5.9.3))
      typedoc-plugin-markdown: 4.13.0(typedoc@0.28.20(typescript@5.9.3))
    optionalDependencies:
      prettier: 3.9.6
    transitivePeerDependencies:
      - '@faker-js/faker'
      - supports-color
      - typescript

  p-limit@4.0.0:
    dependencies:
      yocto-queue: 1.2.2

  p-locate@6.0.0:
    dependencies:
      p-limit: 4.0.0

  parse-ms@4.0.0: {}

  parseurl@1.3.3: {}

  path-key@3.1.1: {}

  path-key@4.0.0: {}

  path-to-regexp@8.4.2: {}

  pathe@2.0.3: {}

  pg-cloudflare@1.4.0:
    optional: true

  pg-connection-string@2.14.0: {}

  pg-int8@1.0.1: {}

  pg-pool@3.14.0(pg@8.23.0):
    dependencies:
      pg: 8.23.0

  pg-protocol@1.16.0: {}

  pg-types@2.2.0:
    dependencies:
      pg-int8: 1.0.1
      postgres-array: 2.0.0
      postgres-bytea: 1.0.1
      postgres-date: 1.0.7
      postgres-interval: 1.2.0

  pg@8.23.0:
    dependencies:
      pg-connection-string: 2.14.0
      pg-pool: 3.14.0(pg@8.23.0)
      pg-protocol: 1.16.0
      pg-types: 2.2.0
      pgpass: 1.0.5
    optionalDependencies:
      pg-cloudflare: 1.4.0

  pgpass@1.0.5:
    dependencies:
      split2: 4.2.0

  picocolors@1.1.1: {}

  picomatch@2.3.2: {}

  picomatch@4.0.7: {}

  pino-abstract-transport@2.0.0:
    dependencies:
      split2: 4.2.0

  pino-abstract-transport@3.0.0:
    dependencies:
      split2: 4.2.0

  pino-http@10.5.0:
    dependencies:
      get-caller-file: 2.0.5
      pino: 9.14.0
      pino-std-serializers: 7.1.0
      process-warning: 5.1.0

  pino-pretty@13.1.3:
    dependencies:
      colorette: 2.0.20
      dateformat: 4.6.3
      fast-copy: 4.1.1
      fast-safe-stringify: 2.1.1
      help-me: 5.0.0
      joycon: 3.1.1
      minimist: 1.2.8
      on-exit-leak-free: 2.1.2
      pino-abstract-transport: 3.0.0
      pump: 3.0.4
      secure-json-parse: 4.1.0
      sonic-boom: 4.2.1
      strip-json-comments: 5.0.3

  pino-std-serializers@7.1.0: {}

  pino@9.14.0:
    dependencies:
      '@pinojs/redact': 0.4.0
      atomic-sleep: 1.0.0
      on-exit-leak-free: 2.1.2
      pino-abstract-transport: 2.0.0
      pino-std-serializers: 7.1.0
      process-warning: 5.1.0
      quick-format-unescaped: 4.0.4
      real-require: 0.2.0
      safe-stable-stringify: 2.5.0
      sonic-boom: 4.2.1
      thread-stream: 3.1.0

  postcss-selector-parser@6.0.10:
    dependencies:
      cssesc: 3.0.0
      util-deprecate: 1.0.2

  postcss@8.5.28:
    dependencies:
      nanoid: 3.3.18
      picocolors: 1.1.1
      source-map-js: 1.2.1

  postgres-array@2.0.0: {}

  postgres-bytea@1.0.1: {}

  postgres-date@1.0.7: {}

  postgres-interval@1.2.0:
    dependencies:
      xtend: 4.0.2

  prettier@3.9.6: {}

  pretty-ms@9.3.1:
    dependencies:
      parse-ms: 4.0.0

  process-warning@5.1.0: {}

  prop-types@15.8.1:
    dependencies:
      loose-envify: 1.4.0
      object-assign: 4.1.1
      react-is: 16.13.1

  proxy-addr@2.0.7:
    dependencies:
      forwarded: 0.2.0
      ipaddr.js: 1.9.1

  pump@3.0.4:
    dependencies:
      end-of-stream: 1.4.5
      once: 1.4.0

  punycode.js@2.3.1: {}

  qs@6.16.0:
    dependencies:
      es-define-property: 1.0.1
      side-channel: 1.1.1

  queue-microtask@1.2.3: {}

  quick-format-unescaped@4.0.4: {}

  range-parser@1.3.0: {}

  raw-body@3.0.2:
    dependencies:
      bytes: 3.1.2
      http-errors: 2.0.1
      iconv-lite: 0.7.3
      unpipe: 1.0.0

  react-day-picker@9.14.0(react@19.1.0):
    dependencies:
      '@date-fns/tz': 1.5.0
      '@tabby_ai/hijri-converter': 1.0.5
      date-fns: 4.4.0
      date-fns-jalali: 4.1.0-0
      react: 19.1.0

  react-dom@19.1.0(react@19.1.0):
    dependencies:
      react: 19.1.0
      scheduler: 0.26.0

  react-hook-form@7.87.0(react@19.1.0):
    dependencies:
      react: 19.1.0

  react-icons@5.7.0(react@19.1.0):
    dependencies:
      react: 19.1.0

  react-is@16.13.1: {}

  react-is@18.3.1: {}

  react-refresh@0.18.0: {}

  react-remove-scroll-bar@2.3.8(@types/react@19.3.0)(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-style-singleton: 2.2.3(@types/react@19.3.0)(react@19.1.0)
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.3.0

  react-remove-scroll@2.7.2(@types/react@19.3.0)(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-remove-scroll-bar: 2.3.8(@types/react@19.3.0)(react@19.1.0)
      react-style-singleton: 2.2.3(@types/react@19.3.0)(react@19.1.0)
      tslib: 2.8.1
      use-callback-ref: 1.3.3(@types/react@19.3.0)(react@19.1.0)
      use-sidecar: 1.1.3(@types/react@19.3.0)(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0

  react-resizable-panels@2.1.9(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  react-router-dom@7.18.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-router: 7.18.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0)

  react-router@7.18.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      cookie: 1.1.1
      react: 19.1.0
      set-cookie-parser: 2.7.2
    optionalDependencies:
      react-dom: 19.1.0(react@19.1.0)

  react-smooth@4.0.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      fast-equals: 5.4.2
      prop-types: 15.8.1
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-transition-group: 4.4.5(react-dom@19.1.0(react@19.1.0))(react@19.1.0)

  react-style-singleton@2.2.3(@types/react@19.3.0)(react@19.1.0):
    dependencies:
      get-nonce: 1.0.1
      react: 19.1.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.3.0

  react-transition-group@4.4.5(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      '@babel/runtime': 7.29.7
      dom-helpers: 5.2.1
      loose-envify: 1.4.0
      prop-types: 15.8.1
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)

  react@19.1.0: {}

  readdirp@4.1.2: {}

  readdirp@5.1.1: {}

  real-require@0.2.0: {}

  recharts-scale@0.4.5:
    dependencies:
      decimal.js-light: 2.5.1

  recharts@2.15.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      clsx: 2.1.1
      eventemitter3: 4.0.7
      lodash: 4.18.1
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
      react-is: 18.3.1
      react-smooth: 4.0.4(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      recharts-scale: 0.4.5
      tiny-invariant: 1.3.3
      victory-vendor: 36.9.2

  regexparam@3.0.0: {}

  remeda@2.48.0: {}

  require-from-string@2.0.2: {}

  resolve-pkg-maps@1.0.0: {}

  reusify@1.1.0: {}

  rollup@4.63.1:
    dependencies:
      '@types/estree': 1.0.9
    optionalDependencies:
      '@napi-rs/lzma-linux-x64-gnu': 1.5.1
      '@rollup/rollup-linux-x64-gnu': 4.63.1
      fsevents: 2.3.3

  router@2.2.0:
    dependencies:
      debug: 4.4.3
      depd: 2.0.0
      is-promise: 4.0.0
      parseurl: 1.3.3
      path-to-regexp: 8.4.2
    transitivePeerDependencies:
      - supports-color

  run-parallel@1.2.0:
    dependencies:
      queue-microtask: 1.2.3

  safe-stable-stringify@2.5.0: {}

  safer-buffer@2.1.2: {}

  scheduler@0.26.0: {}

  secure-json-parse@4.1.0: {}

  semver@6.3.1: {}

  send@1.2.1:
    dependencies:
      debug: 4.4.3
      encodeurl: 2.0.0
      escape-html: 1.0.3
      etag: 1.8.1
      fresh: 2.0.0
      http-errors: 2.0.1
      mime-types: 3.0.2
      ms: 2.1.3
      on-finished: 2.4.1
      range-parser: 1.3.0
      statuses: 2.0.2
    transitivePeerDependencies:
      - supports-color

  serve-static@2.2.1:
    dependencies:
      encodeurl: 2.0.0
      escape-html: 1.0.3
      parseurl: 1.3.3
      send: 1.2.1
    transitivePeerDependencies:
      - supports-color

  set-cookie-parser@2.7.2: {}

  setprototypeof@1.2.0: {}

  shebang-command@2.0.0:
    dependencies:
      shebang-regex: 3.0.0

  shebang-regex@3.0.0: {}

  side-channel-list@1.0.1:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4

  side-channel-map@1.0.1:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4

  side-channel-weakmap@1.0.2:
    dependencies:
      call-bound: 1.0.4
      es-errors: 1.3.0
      get-intrinsic: 1.3.0
      object-inspect: 1.13.4
      side-channel-map: 1.0.1

  side-channel@1.1.1:
    dependencies:
      es-errors: 1.3.0
      object-inspect: 1.13.4
      side-channel-list: 1.0.1
      side-channel-map: 1.0.1
      side-channel-weakmap: 1.0.2

  signal-exit@4.1.0: {}

  sonic-boom@4.2.1:
    dependencies:
      atomic-sleep: 1.0.0

  sonner@2.0.8(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    optionalDependencies:
      '@types/react': 19.3.0

  source-map-js@1.2.1: {}

  split2@4.2.0: {}

  statuses@2.0.2: {}

  string-argv@0.3.2: {}

  strip-final-newline@4.0.0: {}

  strip-json-comments@5.0.3: {}

  tailwind-merge@3.6.0: {}

  tailwindcss-animate@1.0.7(tailwindcss@4.3.3):
    dependencies:
      tailwindcss: 4.3.3

  tailwindcss@4.3.3: {}

  tapable@2.3.3: {}

  thread-stream@3.1.0:
    dependencies:
      real-require: 0.2.0

  tiny-invariant@1.3.3: {}

  tinyglobby@0.2.17:
    dependencies:
      fdir: 6.5.0(picomatch@4.0.7)
      picomatch: 4.0.7

  to-regex-range@5.0.1:
    dependencies:
      is-number: 7.0.0

  toidentifier@1.0.1: {}

  tslib@2.8.1: {}

  tsx@4.23.13:
    dependencies:
      esbuild: 0.28.2
    optionalDependencies:
      fsevents: 2.3.3

  tw-animate-css@1.4.0: {}

  type-is@2.1.0:
    dependencies:
      content-type: 2.1.0
      media-typer: 1.1.1
      mime-types: 3.0.2

  typedoc-plugin-coverage@4.0.3(typedoc@0.28.20(typescript@5.9.3)):
    dependencies:
      typedoc: 0.28.20(typescript@5.9.3)

  typedoc-plugin-markdown@4.13.0(typedoc@0.28.20(typescript@5.9.3)):
    dependencies:
      typedoc: 0.28.20(typescript@5.9.3)

  typedoc@0.28.20(typescript@5.9.3):
    dependencies:
      '@gerrit0/mini-shiki': 3.23.0
      lunr: 2.3.9
      markdown-it: 14.3.1
      minimatch: 10.2.6
      typescript: 5.9.3
      yaml: 2.9.0

  typescript@5.9.3: {}

  uc.micro@2.1.0: {}

  undici-types@7.24.6: {}

  unicorn-magic@0.3.0: {}

  universalify@2.0.1: {}

  unpipe@1.0.0: {}

  update-browserslist-db@1.3.2(browserslist@4.28.9):
    dependencies:
      browserslist: 4.28.9
      escalade: 3.2.0
      picocolors: 1.1.1

  use-callback-ref@1.3.3(@types/react@19.3.0)(react@19.1.0):
    dependencies:
      react: 19.1.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.3.0

  use-sidecar@1.1.3(@types/react@19.3.0)(react@19.1.0):
    dependencies:
      detect-node-es: 1.1.0
      react: 19.1.0
      tslib: 2.8.1
    optionalDependencies:
      '@types/react': 19.3.0

  use-sync-external-store@1.7.0(react@19.1.0):
    dependencies:
      react: 19.1.0

  util-deprecate@1.0.2: {}

  vary@1.1.2: {}

  vaul@1.1.2(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0):
    dependencies:
      '@radix-ui/react-dialog': 1.1.23(@types/react-dom@19.3.0(@types/react@19.3.0))(@types/react@19.3.0)(react-dom@19.1.0(react@19.1.0))(react@19.1.0)
      react: 19.1.0
      react-dom: 19.1.0(react@19.1.0)
    transitivePeerDependencies:
      - '@types/react'
      - '@types/react-dom'

  victory-vendor@36.9.2:
    dependencies:
      '@types/d3-array': 3.2.2
      '@types/d3-ease': 3.0.2
      '@types/d3-interpolate': 3.0.4
      '@types/d3-scale': 4.0.9
      '@types/d3-shape': 3.2.0
      '@types/d3-time': 3.0.4
      '@types/d3-timer': 3.0.2
      d3-array: 3.2.4
      d3-ease: 3.0.1
      d3-interpolate: 3.0.1
      d3-scale: 4.0.2
      d3-shape: 3.2.0
      d3-time: 3.1.0
      d3-timer: 3.0.1

  vite@7.3.6(@types/node@25.9.6)(jiti@2.7.0)(lightningcss@1.32.0)(tsx@4.23.13)(yaml@2.9.0):
    dependencies:
      esbuild: 0.28.2
      fdir: 6.5.0(picomatch@4.0.7)
      picomatch: 4.0.7
      postcss: 8.5.28
      rollup: 4.63.1
      tinyglobby: 0.2.17
    optionalDependencies:
      '@types/node': 25.9.6
      fsevents: 2.3.3
      jiti: 2.7.0
      lightningcss: 1.32.0
      tsx: 4.23.13
      yaml: 2.9.0

  which@2.0.2:
    dependencies:
      isexe: 2.0.0

  wouter@3.13.0(react@19.1.0):
    dependencies:
      react: 19.1.0
      regexparam: 3.0.0
      use-sync-external-store: 1.7.0(react@19.1.0)

  wrappy@1.0.2: {}

  xtend@4.0.2: {}

  yallist@3.1.1: {}

  yaml@2.9.0: {}

  yocto-queue@1.2.2: {}

  yoctocolors@2.2.0: {}

  zod@3.25.76: {}
```

## ```pnpm-workspace.yaml```

```yaml
# ============================================================================
# SECURITY: Minimum release age for npm packages (supply-chain attack defense)
# ============================================================================
#
# This setting requires that any npm package version must have been published
# for at least 1 day (1440 minutes) before pnpm will allow installing it.
# This is a critical defense against supply-chain attacks. In most cases,
# malicious npm releases are discovered and pulled within hours, so a 1-day
# delay provides a strong safety buffer.
#
# DO NOT DISABLE THIS SETTING. Removing or setting it to 0 is considered
# extremely dangerous and leaves the entire workspace vulnerable to supply-
# chain attacks, which have been the #1 vector for npm ecosystem compromises.
#
# If you absolutely need to install a package before the 1-day window has
# passed (e.g. an urgent security bugfix), you can add it to the
# `minimumReleaseAgeExclude` allowlist below. Only consider doing this for
# packages released by trusted organizations with an impeccable security
# posture (e.g. Replit packsges, react from Meta, typescript from Microsoft). Even then,
# remove the exclusion once the 1-day window has passed.
#
# Example:
#   minimumReleaseAgeExclude:
#     - react
#     - typescript
#
# ============================================================================
minimumReleaseAge: 1440

minimumReleaseAgeExclude:
  # Exclude @replit scoped packages from the minimum release age check.
  # These are published by Replit and trusted — the supply-chain attack vector
  # this setting guards against does not apply to our own packages.
  - '@replit/*'
  - stripe-replit-sync

packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts

catalog:
  '@replit/vite-plugin-cartographer': ^0.5.21
  '@replit/vite-plugin-dev-banner': ^0.1.1
  '@replit/vite-plugin-runtime-error-modal': ^0.0.6
  '@tailwindcss/vite': ^4.1.14
  '@tanstack/react-query': ^5.90.21
  '@types/node': ^25.3.3
  '@types/react': ^19.2.0
  '@types/react-dom': ^19.2.0
  '@vitejs/plugin-react': ^5.0.4
  class-variance-authority: ^0.7.1
  clsx: ^2.1.1
  drizzle-orm: ^0.45.2
  framer-motion: ^12.23.24
  lucide-react: ^0.545.0
  # Must be this exact version because expo requires it
  react: 19.1.0
  # Must be this exact version because expo requires it
  react-dom: 19.1.0
  tailwind-merge: ^3.3.1
  tailwindcss: ^4.1.14
  tsx: ^4.21.0
  vite: ^7.3.2
  wouter: ^3.3.5
  zod: ^3.25.76

autoInstallPeers: false

onlyBuiltDependencies:
  - '@swc/core'
  - esbuild
  - msw
  - unrs-resolver

overrides:
  # replit uses linux-x64 only, we can exclude all other platforms
  "esbuild>@esbuild/darwin-arm64": "-"
  "esbuild>@esbuild/darwin-x64": "-"
  "esbuild>@esbuild/freebsd-arm64": "-"
  "esbuild>@esbuild/freebsd-x64": "-"
  "esbuild>@esbuild/linux-arm": "-"
  "esbuild>@esbuild/linux-arm64": "-"
  "esbuild>@esbuild/linux-ia32": "-"
  "esbuild>@esbuild/linux-loong64": "-"
  "esbuild>@esbuild/linux-mips64el": "-"
  "esbuild>@esbuild/linux-ppc64": "-"
  "esbuild>@esbuild/linux-riscv64": "-"
  "esbuild>@esbuild/linux-s390x": "-"
  "esbuild>@esbuild/netbsd-arm64": "-"
  "esbuild>@esbuild/netbsd-x64": "-"
  "esbuild>@esbuild/openbsd-arm64": "-"
  "esbuild>@esbuild/openbsd-x64": "-"
  "esbuild>@esbuild/sunos-x64": "-"
  "esbuild>@esbuild/win32-arm64": "-"
  "esbuild>@esbuild/win32-ia32": "-"
  "esbuild>@esbuild/win32-x64": "-"
  "esbuild>@esbuild/aix-ppc64": '-'
  "esbuild>@esbuild/android-arm": '-'
  "esbuild>@esbuild/android-arm64": '-'
  "esbuild>@esbuild/android-x64": '-'
  "esbuild>@esbuild/openharmony-arm64": '-'
  "lightningcss>lightningcss-android-arm64": "-"
  "lightningcss>lightningcss-darwin-arm64": "-"
  "lightningcss>lightningcss-darwin-x64": "-"
  "lightningcss>lightningcss-freebsd-x64": "-"
  "lightningcss>lightningcss-linux-arm-gnueabihf": "-"
  "lightningcss>lightningcss-linux-arm64-gnu": "-"
  "lightningcss>lightningcss-linux-arm64-musl": "-"
  "lightningcss>lightningcss-linux-x64-musl": "-"
  "lightningcss>lightningcss-win32-arm64-msvc": "-"
  "lightningcss>lightningcss-win32-x64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-android-arm64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-darwin-arm64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-darwin-x64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-freebsd-x64": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm-gnueabihf": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-gnu": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-arm64-musl": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-win32-arm64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-win32-x64-msvc": "-"
  "@tailwindcss/oxide>@tailwindcss/oxide-linux-x64-musl": "-"
  "rollup>@rollup/rollup-android-arm-eabi": "-"
  "rollup>@rollup/rollup-android-arm64": "-"
  "rollup>@rollup/rollup-darwin-arm64": "-"
  "rollup>@rollup/rollup-darwin-x64": "-"
  "rollup>@rollup/rollup-freebsd-arm64": "-"
  "rollup>@rollup/rollup-freebsd-x64": "-"
  "rollup>@rollup/rollup-linux-arm-gnueabihf": "-"
  "rollup>@rollup/rollup-linux-arm-musleabihf": "-"
  "rollup>@rollup/rollup-linux-arm64-gnu": "-"
  "rollup>@rollup/rollup-linux-arm64-musl": "-"
  "rollup>@rollup/rollup-linux-loong64-gnu": "-"
  "rollup>@rollup/rollup-linux-loong64-musl": "-"
  "rollup>@rollup/rollup-linux-ppc64-gnu": "-"
  "rollup>@rollup/rollup-linux-ppc64-musl": "-"
  "rollup>@rollup/rollup-linux-riscv64-gnu": "-"
  "rollup>@rollup/rollup-linux-riscv64-musl": "-"
  "rollup>@rollup/rollup-linux-s390x-gnu": "-"
  "rollup>@rollup/rollup-linux-x64-musl": "-"
  "rollup>@rollup/rollup-openbsd-x64": "-"
  "rollup>@rollup/rollup-openharmony-arm64": "-"
  "rollup>@rollup/rollup-win32-arm64-msvc": "-"
  "rollup>@rollup/rollup-win32-ia32-msvc": "-"
  "rollup>@rollup/rollup-win32-x64-gnu": "-"
  "rollup>@rollup/rollup-win32-x64-msvc": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-darwin-arm64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-darwin-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-freebsd-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-freebsd-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-arm64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-arm": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-linux-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-sunos-x64": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-win32-ia32": "-"
  "@expo/ngrok-bin>@expo/ngrok-bin-win32-x64": "-"
  # drizzle-kit uses esbuild internally on an older version that's vulnerable, this overrides it
  "@esbuild-kit/esm-loader": "npm:tsx@^4.21.0"
  esbuild: "0.28.2"
  # orval pins js-yaml to an exact version older than the CVE fix (>=4.3.2)
  js-yaml: '4.3.2'
```

## ```replit.md```

```md
# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
```

## ```scripts/package.json```

```json
{
  "name": "@workspace/scripts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "hello": "tsx ./src/hello.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "tsx": "catalog:"
  }
}
```

## ```scripts/post-merge.sh```

```sh
#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push
```

## ```scripts/src/hello.ts```

```ts
console.log("Hello from @workspace/scripts");
```

## ```scripts/tsconfig.json```

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]
  },
  "include": ["src"]
}
```

## ```tsconfig.base.json```

```json
{
  "compilerOptions": {
    "incremental": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": false,
    "noImplicitReturns": true,
    "noUnusedLocals": false,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": false,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "skipLibCheck": true,
    "target": "es2022",
    "types": [],
    "customConditions": ["workspace"]
  }
}
```

## ```tsconfig.json```

```json
{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": [
    {
      "path": "./lib/db"
    },
    {
      "path": "./lib/api-client-react"
    },
    {
      "path": "./lib/api-zod"
    }
  ]
}
```
