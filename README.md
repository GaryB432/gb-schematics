# gb-schematics

[![npm version](https://badge.fury.io/js/gb-schematics.svg)](https://badge.fury.io/js/gb-schematics)

This package contains a collection of [Schematics](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics) for generating my favorite features.

You will need the [Reference Schematics CLI](https://www.npmjs.com/package/@angular-devkit/schematics-cli) tooling to execute these schematics.

If you're using [Nx: Smart, Fast and Extensible Build System](https://nx.dev/) you might also like [my miscellaneous NX plugins](https://github.com/GaryB432/gb-nx).

> npm i @angular-devkit/schematics-cli -g

# Development

> npx tsx tools/make-schemas --stamp generated

# Schematics

## bump

```
schematics gb-schematics:bump [part]
```

Bump package.json version

### Arguments

<!-- prettier-ignore -->
| ARGUMENT | DESCRIPTION | VALUE TYPE | 
| --- | --- | --- | 
| part | Which part to increment | major \| premajor \| minor \| preminor \| patch \| prepatch \| prerelease |

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --skipInstall | Skip package installation | boolean | false |

## devops

```
schematics gb-schematics:devops [platform]
```

Add platform devops pipeline

### Arguments

<!-- prettier-ignore -->
| ARGUMENT | DESCRIPTION | VALUE TYPE | 
| --- | --- | --- | 
| platform | Which Dev Ops pipeline | azure \| github |

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --skipInstall | Skip package installation | boolean | false |

## eslint

```
schematics gb-schematics:eslint
```

Add eslint configuration.

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --includeTypescript | Include Typescript | boolean | true | 
| --includePrettier | Include Prettier | boolean | false | 
| --skipInstall | Skip package installation | boolean | false |

## jest

```
schematics gb-schematics:jest
```

Add Jest testing

## module

```
schematics gb-schematics:module [name]
```

Add Class or general Module

### Arguments

<!-- prettier-ignore -->
| ARGUMENT | DESCRIPTION | VALUE TYPE | 
| --- | --- | --- | 
| name | The name of the module. | string |

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --directory | The directory to create the module, relative to the project source. | string |  | 
| --kind | kind of module | class \| values | values | 
| --unitTestRunner | Test runner to use for unit tests. | jest \| vitest \| native \| none | jest | 
| --inSourceTests | When using Vitest, separate spec files will not be generated and instead will be included within the source files. | boolean | false | 
| --pascalCaseFiles | Use pascal case file names for class module. | boolean | true | 
| --language | The language to use. | ts \| js | ts | 
| --sourceRoot | The path to your project's source root | string |  |

## prettier

```
schematics gb-schematics:prettier
```

Add prettier configuration.

## sveltekit-component

```
schematics gb-schematics:sveltekit-component [name]
```

Add a component to your sveltekit project

### Arguments

<!-- prettier-ignore -->
| ARGUMENT | DESCRIPTION | VALUE TYPE | 
| --- | --- | --- | 
| name | The name of the component. | string |

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --directory | The directory to create the component, relative to your project source. | string |  | 
| --language | Component script language (ts/js). | js \| ts | js | 
| --style | Component style language (css/scss). | css \| scss | css | 
| --projectRoot | Svelte App root directory | string |  |

## sveltekit-route

```
schematics gb-schematics:sveltekit-route [name]
```

Add a route to your sveltekit project

### Arguments

<!-- prettier-ignore -->
| ARGUMENT | DESCRIPTION | VALUE TYPE | 
| --- | --- | --- | 
| name | The name of the route. | string |

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --path | The path at which to create the route file, relative to the projectRoot. Default is a folder with the same name as the route in the project root. | string |  | 
| --style | The value of style element lang attribute | css \| scss | css | 
| --skipTests | Do not create "spec.ts" test files for the new route. | boolean | false | 
| --load | Should the load function run on client and server (universal) or just server | universal \| server \| none | none |

## typescript

```
schematics gb-schematics:typescript
```

Add typescript.

### Options

<!-- prettier-ignore -->
| OPTION | DESCRIPTION | VALUE TYPE | DEFAULT VALUE | 
| --- | --- | --- | --- | 
| --skipInstall | Skip package installation | boolean | false |

see

- [Angular Schematics](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular)
- [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md)
- [Angular Blog](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
