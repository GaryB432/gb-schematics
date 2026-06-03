# GB Schematics Monorepo

## Overview

A modern monorepo for developing and consuming Angular-style schematics. This project provides a custom CLI (`@gb-schematics/cli`) optimized for developer experience and a collection of schematics (`@gb-schematics/schematics`) for scaffolding.

## Architecture

- **Monorepo Manager:** pnpm workspaces.
- **Language:** TypeScript (ESM only).
- **Packages:**
  - `packages/cli`: A cac-based CLI that wraps the Angular Schematics engine. Uses `ora` for progress and `rxjs` for handling the schematics stream.
  - `packages/schematics`: A collection of schematic rules and templates.

## Developer Workflows

### Build & Discovery

The build process is critical for schematic discovery:

- **Template Handling:** Schematic templates in `src/**/files/` are NOT compiled by `tsc` (excluded in `tsconfig.json`).
- **Asset Copying:** The `build` script in `packages/schematics` uses `copyfiles` to move `collection.json` and template files into the `dist/` directory.
- **ESM Imports:** All internal imports MUST include the `.js` extension. Direct imports from `@angular-devkit` packages may require pointing to `index.js` (e.g., `@angular-devkit/schematics/tools/index.js`).

### Common Commands

- `pnpm install`: Install all dependencies.
- `pnpm build`: Build all packages (ordered by dependencies).
- `node packages/cli/dist/index.js generate <name> --name=<value>`: Test a schematic locally.

## Conventions

- **ESM:** Always use `"type": "module"` in `package.json`.
- **Strict Typing:** Avoid `any` where possible, though it is currently used sparingly to resolve specific RxJS version mismatch issues in the environment.
- **Paths:** Always use `dist/` targets for execution to ensure templates and JSON files are properly resolved.
