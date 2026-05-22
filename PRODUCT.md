# Product Snapshot

## What This Is

MCT Playground is a browser-based HTML, CSS, and JavaScript playground built with Vite, React, and TypeScript. It lets users edit code, run it in a sandboxed preview iframe, save projects locally, and share projects through compressed URL routes.

## Core Features

- Three Monaco-powered editors for HTML, CSS, and JavaScript.
- Sandboxed live preview with manual Run and persisted Auto Run modes.
- Runtime error reporting from the preview iframe into a dismissible in-app error banner.
- Local project persistence with IndexedDB, including save, save as, load, rename, delete, and reset-to-starter flows.
- Share links at `/p/:encoded` using compressed project payloads.
- Light/dark theme toggle persisted to localStorage and applied to both Tailwind UI and Monaco.
- Desktop resizable editor/preview split with persisted panel sizes.
- Tablet/mobile tabbed layout for HTML, CSS, JS, and Preview.
- Fullscreen preview mode.

## Architecture And Conventions

- React Router handles `/` and `/p/:encoded`; static hosts must fall back to `index.html` for shared routes.
- `VITE_BASE_PATH` controls both Vite asset base paths and the router basename for subpath deployments.
- Tailwind design tokens live in `src/index.css`; UI primitives are local shadcn-style components under `src/components/ui`.
- Playground document state is centralized in a Zustand store.
- Build output is static and emitted to `dist/`.
- Tests use Vitest for unit/component coverage and Playwright for the core user flow.

## Verification

Current verification commands:

- `npm run format:check`
- `npm test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
