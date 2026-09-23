# GB Schematics Monorepo

## Overview

A modern monorepo for developing and consuming Angular-style schematics. This project provides a custom CLI (`@gb-schematics/cli`) optimized for developer experience and a collection of schematics (`@gb-schematics/schematics`) for scaffolding.

## Architecture

- **Monorepo Manager:** pnpm workspaces.
- **Language:** TypeScript (ESM only).
- **Packages:**
  - `packages/gen`: A cac-based CLI that generates a module. Uses `@clack/prompts` for prompts and spinners, and `rxjs` for handling the schematics stream.
  - `packages/schematics`: A collection of schematic rules and templates **deprecated**.

## Developer Workflows

### Common Commands

- `pnpm install`: Install all dependencies.
- `pnpm build`: Build all packages (ordered by dependencies).
- `node packages/gen/dist/bin.mjs generate <name> --name=<value>`: Generate a schematic locally.

## Conventions

- **ESM:** Always use `"type": "module"` in `package.json`.
- **Strict Typing:** Avoid `any` where possible, though it is has been used sparingly to resolve specific version mismatch issues in the environment.
- **Paths:** Node > 24 can work with TypeScript directly without `experimental` flags. Development should work with `node bin.ts`.
