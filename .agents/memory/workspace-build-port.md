---
name: Workspace build PORT requirement
description: A workspace build invocation quirk when building all artifacts recursively.
---

The workspace root build recursively invokes builds for sibling artifacts, and a Vite config in a sibling app requires `PORT` even during a production build.

**Why:** A root build without `PORT` stopped in the mockup-sandbox artifact before reaching OFFLINE MIND, while supplying a supported port allowed the full workspace build to complete.

**How to apply:** When running the root `npm run build`, provide a supported `PORT` (and the app's `BASE_PATH` when needed); use the artifact-scoped build when only one app needs verification.