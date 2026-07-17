# @gb-schematics/generate-cli

Standalone generate CLI — a minimal, dependency-light replacement for
`@angular-devkit/schematics-cli`.

## Architecture

The CLI reads the **existing** `collection.json` / schema files from any
installed `@gb-schematics`-compatible package and drives generation using
plain Node.js APIs.

**No `@angular-devkit` dependency — by design.**

The Angular DevKit's `SchematicEngine`, `NodeModulesEngineHost`, `HostTree`,
`DryRunSink`, `HostSink`, and RxJS streaming pipeline are deliberately **not
used here**. File generation (Milestone 2) is implemented with straightforward
`fs.writeFile` calls and string-template rendering — nothing more.

## Milestones

| # | Description | Status |
|---|-------------|--------|
| 1 | Collection & schema resolution (proof-of-concept) | ✅ done |
| 2 | Declarative input resolution + file emission | 🔜 next |

## Usage

```bash
# Build first
pnpm build

# Run (local collection path, useful during development)
node generate.mjs module --collection ./packages/schematics --name oven --verbose

# Run (installed npm package)
node generate.mjs module --collection @gb-schematics/schematics --name oven
# Short alias also works:
node generate.mjs module --collection @gb-schematics --name oven
```

## Development

```bash
pnpm build      # tsdown → dist/cli.mjs
pnpm test       # vitest unit tests (no build needed)
pnpm dev        # tsdown --watch
```

## Package structure

```
apps/generate-cli/
  generate.mjs                  # thin ESM entry point
  src/
    cli.ts                      # cac setup, subcommand wiring
    resolve-collection.ts       # package name / local path → collection.json
    resolve-schema.ts           # collection entry → schema JSON
  tests/
    resolve-collection.spec.ts
    resolve-schema.spec.ts
    fixtures/                   # self-contained test collections
```
