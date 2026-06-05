# gb-schematics

[![pkg.pr.new](https://pkg.pr.new/badge/GaryB432/gb-schematics)](https://pkg.pr.new/~/GaryB432/gb-schematics)

## Architecture

- [Devkit Runner Architecture Note](docs/devkit-runner-architecture.md)

```mermaid
flowchart TB
	CLI["Our CLI"] --> RUN["Runner layer"]
	RUN --> DEVKIT["Angular Devkit Engine"]
	DEVKIT --> COLL["Schematic collection"]
	COLL --> RULES["Rules and templates"]

```

| Package                                          |                                       |
| ------------------------------------------------ | ------------------------------------- |
| [**cli**](packages/cli//README.md)               | Schematics runner `gb-schematics-cli` |
| [**schematics**](packages/schematics//README.md) | Some of my favorite schematics        |

# Development

> pnpx tsx tools/make-schemas

see

- [Angular Schematics](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular)
- [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md)
- [Angular Blog](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
