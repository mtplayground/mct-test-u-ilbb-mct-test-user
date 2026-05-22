# MCT Playground

A Vite, React, and TypeScript code playground with local saves, share links, and a sandboxed preview.

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` type-checks and builds the production bundle.
- `npm run lint` checks TypeScript and React source with ESLint.
- `npm run format:check` verifies formatting with Prettier.
- `npm run preview` serves the production build locally.
- `npm test` runs the Vitest unit and component tests.
- `npm run test:e2e` runs the Playwright core user flow.

## Environment

Copy `.env.example` to a local env file and adjust values as needed.

- `VITE_APP_TITLE` sets the app title shown in the scaffold.
- `VITE_BASE_PATH` sets Vite's base path for hosted deployments.

## Production Build

Run:

```bash
npm install
npm run build
```

The production app is emitted to `dist/`. The build command runs TypeScript first, then creates optimized static assets with Vite. To verify the generated bundle locally:

```bash
npm run preview
```

## Static Self-Hosting

Host the contents of `dist/` from any static file server or object storage service. The app is a client-side React Router SPA, so configure the host to serve `dist/index.html` for unknown routes. This is required for shared project URLs like `/p/:encoded`.

Examples:

- Root deployment: set `VITE_BASE_PATH="/"`, run `npm run build`, and serve `dist/` at the domain root.
- Subpath deployment: set `VITE_BASE_PATH="/playground/"`, run `npm run build`, and serve `dist/` from `/playground/`.

For a one-off local static check after building:

```bash
npx vite preview --host 127.0.0.1
```

## Base Path Configuration

`VITE_BASE_PATH` controls both Vite asset URLs and the app router basename. Include leading and trailing slashes for clarity:

```bash
VITE_BASE_PATH="/playground/"
npm run build
```

If `VITE_BASE_PATH` is omitted or set to `/`, the app assumes it is hosted at the site root.
