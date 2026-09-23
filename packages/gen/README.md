# @gb-schematics/gen

![npm version](https://badge.fury.io/js/@gb-schematics%2Fgen.svg)
![example workflow](https://github.com/GaryB432/gb-schematics/actions/workflows/ci.yaml/badge.svg)

Scaffold a quick module (a `class` or plain values) for idea capture

## Usage

```bash
# Generate a module
gen module [name] [options]

# Or locally during development:
node packages/gen/bin.ts module [name] [options]
```

## Arguments

`<name>` : Name for the generated module (e.g., `greeter`). **Required.**

## Options

`--directory <directory>` : The directory to create the module.

`--kind <kind>` : kind of module, class or values. Options: `class` (with methods), `values` (export const or function expressions). Default: `values`.

`--test-runner <runner>` : Test runner to use for unit tests (vite or node or none) Options: `vite`, `node` or `none`.

`--in-source-tests` : When using Vitest, separate spec files will not be generated and instead will be included within the source files.

`--pascal-case-files` : Use pascal case file names for class module.

`--language <language>` : Language (extension) for module. Options: `ts`, `js`. Default: `js`.

`--dry-run` : Bypass writing to disk.

## Pipelines

```mermaid
flowchart LR
	subgraph Build_Pipeline["Build Pipeline"]
		direction TB
		SRC["TypeScript sources in packages/gen"]
		TSDOWN["tsdown bin.ts --clean"]
		DIST["dist/bin.mjs executable"]
		SRC --> TSDOWN --> DIST
	end

	subgraph Test_Pipeline["Test Pipeline"]
		direction TB
		NODETEST["node --test"]
		SUITE["app/content.test.ts"]
		FIXTURES["fixtures/module/<language>/<kind>/<testRunner>"]
		NODETEST --> SUITE
		FIXTURES --> SUITE
	end
```
