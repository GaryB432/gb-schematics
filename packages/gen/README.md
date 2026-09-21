# @gb-schematics/gen

Scaffold a quick module (a `class` or plain values) for idea capture

## Usage

```bash
node ./gen/bin.ts module <name> [options]
```

## Arguments

`<name>`
: Name for the generated module (e.g., `greeter`). **Required.**

## Options

`--language <language>`
: Language (extension) for module. Options: `ts`, `js`. Default: `js`.

`--kind <kind>`
: The kind of module to gnerate. Options: `class` (with methods), `values` (export const or function expressions). Default: `values`.

`--dry-run`
: Bypass writing to disk. Default: `false`.

## Development

```bash
cd ./gb
pnpm dlx eslint . --fix && pnpm dlx prettier . -lw
```
