# Scaffolding & Devkit Runner Architecture Note

## Mermaid Rendering Note (VS Code)

When documenting runner flows with Mermaid in VS Code, prefer quoted labels:

- Use `A["label"]` instead of `A[label]`.
- Avoid special characters in labels when possible (`@`, `#`, unescaped braces).

This avoids the common `[object Object]` rendering glitch in some Mermaid integrations.

---

## Architecture Diagrams

```mermaid
flowchart TB
	U["User in target CWD"] --> BIN["packages/gen bin.ts / dist/bin.mjs"]
	BIN --> MAIN["app/main.ts: cac command parser"]
	MAIN --> CMD["Command: gen module [name]"]

	CMD --> VAL["validation.ts: getValidationErrors"]
	VAL --> RES["resolution.ts: resolveModuleOptions"]
	RES --> PROMPT["@clack/prompts interactive prompts and workspace inference"]

	RES --> GEN["generation.ts: generateModule"]
	GEN --> CONT["content.ts: createClassContent or createValuesContent"]
	CONT --> MAP["In-memory file map: Record<path, content>"]

	GEN --> CHECK["generation.ts: filterByExisting"]
	CHECK -->|Collision detected| ABORT["Log error and abort write"]
	CHECK -->|No collision| WRITE["generation.ts: finalizeWrite"]
	WRITE --> FS["node:fs mkdirSync and writeFileSync"]
	WRITE --> LOG["@clack/prompts visual logging"]
```

## Architectural Evolution: Why Version 7 Removed DevKit

Version 6 and earlier relied on `@angular-devkit/schematics` as the execution engine. While powerful for complex AST transforms in the Angular ecosystem, DevKit introduced substantial complexity:

- **Heavy Dependency Graph:** DevKit packages brought significant runtime and build overhead, including RxJS version compatibility challenges across monorepo packages.
- **Complex Abstractions:** Virtual file system hosts (`virtualFs.ScopedHost`, `HostTree`), sinks (`HostSink`, `DryRunSink`), and engine hosts (`NodeModulesEngineHost`) created layers of indirection for what is fundamentally template and file creation.
- **Multi-Stage Build Burden:** Schematics required generating TypeScript typings from JSON schemas (`tools/generate-schema-types.ts`), compiling TypeScript with `tsc`, and running `copyfiles` to transport `collection.json` and raw template files to `dist/`.
- **Runtime Resolution Fragility:** Schematics factories were resolved dynamically from string paths in `collection.json`, leading to runtime path resolution issues and ESM compatibility hurdles.

**Version 7 Decision:**
Scaffolding has been simplified for developers and AI agents. Code generation in `@gb-schematics/gen` uses plain Node.js built-ins (`node:fs`, `node:path`), `@clack/prompts` for interactive UX, `cac` for command routing, and `tsdown` for fast single-step builds.

---

## Core Position

- **Direct Execution:** Code generation relies directly on pure TypeScript generator functions returning in-memory file representations.
- **Safety by Default:** Pre-flight collision checks (`filterByExisting`) ensure no files are overwritten or partially generated if a collision occurs.
- **Agent and Developer Ergonomics:** Simple CLI commands (`gen module <name> [options]`) with interactive prompts fallback when options are missing.
- **Minimal Tooling:** Fast builds powered by `tsdown`, tests executed with native `node --test`, and formatting/linting via ESLint and Prettier.

---

## Package Responsibilities

### `packages/gen` (`@gb-schematics/gen`) — Active

- **`bin.ts`:** Executable entrypoint (`#!/usr/bin/env node`), handles top-level execution and error exit codes.
- **`app/main.ts`:** Sets up `cac("gen")`, configures `module` command options, and routes commands.
- **`app/types.ts`:** Domain types (`ModuleOptions`, `ModuleKind`, `Language`, `TestRunner`).
- **`app/validation.ts`:** Validates option inputs against supported option sets (`kindOptions`, `languageOptions`, `testRunnerOptions`).
- **`app/resolution.ts`:** Resolves missing CLI options interactively via `@clack/prompts` (`text`, `select`) or workspace inference.
- **`app/content.ts`:** Pure generator functions (`createClassContent`, `createValuesContent`) creating source and test file contents.
- **`app/generation.ts`:** Orchestrates file writing: verifies destination, detects existing files, creates directories (`mkdirSync`), and writes files (`writeFileSync`).
- **`app/logger.ts`:** Defines `LoggingService` contract matching `@clack/prompts.log`.
- **`fixtures/`:** Golden test fixtures covering combinations of `language` (ts/js), `kind` (class/values), and `testRunner` (vitest/node/none).

---

## Runtime Contracts

### Version 7 (`gen`) Contracts

1. **CLI Entrypoint:** The published binary `gen` maps to `./dist/bin.mjs` (target: Node.js >= 24).
2. **Atomic Verification:** Generator generates all paths in-memory first; if any target file exists on disk, generation immediately halts with errors and writes nothing.
3. **Interactive Resolution:** When executed without required arguments in an interactive shell, `@clack/prompts` prompts for `name`, `language`, `kind`, `testRunner`, and `directory`.
4. **Deterministic Output:** Content generators (`createClassContent`, `createValuesContent`) are deterministic pure functions mapping `ModuleOptions` to `Record<string, string>`.

---

## Testing Strategy

### Version 7 Testing (`node --test`)

Tests run with Node's native test runner against source files and fixtures:

- **Fixture Tests (`packages/gen/app/content.test.ts`):** Iterates over permutations of `language` (`ts`, `js`), `kind` (`values`, `class`), and `testRunner` (`vitest`, `none`, `node`), asserting generated code and specs match golden files in `packages/gen/fixtures/module/`.
- **Unit Tests:** Direct assertions on `createValuesContent` and `createClassContent` output structures.
- **Execution:** Run via `pnpm test` (root) or `node --test` within `packages/gen`.

---

## Build Pipeline

- **Single-step Bundling:** `tsdown bin.ts --clean` bundles `packages/gen/bin.ts` and its application code into an executable ESM artifact at `packages/gen/dist/bin.mjs`.
- **No Asset Copying:** Templates are defined in TypeScript source code (`content.ts`), eliminating the need for `copyfiles` or schema generation build steps.
- **Root Script:** `pnpm build` triggers `pnpm -r --if-present build`.

---

## CLI Options & Usage

[See `gen` details](../packages/gen/README.md)

## Practical Troubleshooting

If `gen` fails or produces unexpected results:

1. **Verify Build Artifact:** Ensure `packages/gen/dist/bin.mjs` exists by running `pnpm build`.
2. **Run Fixture Tests:** Execute `pnpm test` to verify that content generators still match expected fixtures.
3. **Check for File Collision:** If the target directory already contains `<name>.<ext>` or `<name>.test.<ext>`, the command intentionally aborts without modifying existing files.
4. **Inspect Validation Errors:** If invalid options are provided (e.g. `--kind foo`), `getValidationErrors()` logs allowed values and halts execution with exit code 1.
5. **Check Node Version:** Ensure Node.js version satisfies engine requirement (`>= 24`).

---

## Design Guidelines For Future Work

When extending the v7 scaffolding engine:

- **Keep It Light:** Avoid introducing heavy framework dependencies or AST engines unless complex in-place code transformations strictly require them.
- **Pure Content Functions:** Keep file content creation in pure functions (`Record<string, string>`) that can be tested deterministically with fixtures.
- **Maintain Collision Safety:** Always run pre-flight checks (`filterByExisting`) before performing disk writes.
- **Update Golden Fixtures:** When updating generated template content, update corresponding fixtures in `packages/gen/fixtures/` and verify with `pnpm test`.

---

## Handoff Checklist

Before merging changes to scaffolding or CLI packages:

1. Run `pnpm build` and verify `packages/gen/dist/bin.mjs` compiles cleanly.
2. Run `pnpm test` and verify all 14 fixture and unit test cases pass.
3. Run `pnpm lint` to ensure ESLint passes with zero warnings or errors.
4. Test the generated CLI binary locally:
   ```bash
   node packages/gen/dist/bin.mjs module sample --language ts --kind class --test-runner node --directory tmp/test-run
   ```
5. Confirm no regressions or broken imports across monorepo packages.
