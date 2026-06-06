# gb-schematics

<!-- prettier-ignore -->
| Package |     |     |
| ------- | --- | --- |
| [**cli**](packages/cli//README.md) | [![npm](https://badge.fury.io/js/@gb-schematics%2Fschematics.svg)](https://badge.fury.io/js/@gb-schematics%2Fcli)  | Schematics runner `gb-schematics` |
| [**schematics**](packages/schematics//README.md) | [![npm](https://badge.fury.io/js/@gb-schematics%2Fschematics.svg)](https://badge.fury.io/js/@gb-schematics%2Fschematics) | Some of my favorite schematics  |

## Architecture

- [Devkit Runner Architecture Note](docs/devkit-runner-architecture.md)

```mermaid
flowchart TB
	CLI["Our CLI"] --> RUN["Runner layer"]
	RUN --> DEVKIT["Angular Devkit Engine"]
	DEVKIT --> COLL["Schematic collection"]
	COLL --> RULES["Rules and templates"]
```

# Development

> pnpx tsx tools/make-schemas 292

see

- [Angular Schematics](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular)
- [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md)
- [Angular Blog](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
