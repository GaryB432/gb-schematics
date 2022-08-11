# gb-schematics

[![npm version](https://badge.fury.io/js/gb-schematics.svg)](https://badge.fury.io/js/gb-schematics)

This package contains a collection of [Schematics](https://github.com/angular/angular-cli/tree/main/packages/angular_devkit/schematics) for generating my favorite features.

You will need the [Reference Schematics CLI](https://www.npmjs.com/package/@angular-devkit/schematics-cli) tooling to execute these schematics.

> npm i @angular-devkit/schematics-cli -g

🔥 Now including [SvelteKit](https://kit.svelte.dev/) (@sveltejs/kit@1.0.0-next.401)

# Development

> npx ts-node tools/make-schemas --stamp generated

# Schematics

## bump

```
schematics gb-schematics:bump [part]
```

Bump package.json version

### Arguments

| ARGUMENT | DESCRIPTION             | VALUE TYPE                                                                |
| -------- | ----------------------- | ------------------------------------------------------------------------- |
| part     | Which part to increment | major \| premajor \| minor \| preminor \| patch \| prepatch \| prerelease |

### Options

| OPTION        | DESCRIPTION               | VALUE TYPE | DEFAULT VALUE |
| ------------- | ------------------------- | ---------- | ------------- |
| --skipInstall | Skip package installation | boolean    | false         |

## devops

```
schematics gb-schematics:devops [platform]
```

Add platform devops pipeline

### Arguments

| ARGUMENT | DESCRIPTION            | VALUE TYPE      |
| -------- | ---------------------- | --------------- |
| platform | Which Dev Ops pipeline | azure \| github |

### Options

| OPTION        | DESCRIPTION               | VALUE TYPE | DEFAULT VALUE |
| ------------- | ------------------------- | ---------- | ------------- |
| --skipInstall | Skip package installation | boolean    | false         |

## eslint

```
schematics gb-schematics:eslint
```

Add eslint configuration.

### Options

| OPTION              | DESCRIPTION               | VALUE TYPE | DEFAULT VALUE |
| ------------------- | ------------------------- | ---------- | ------------- |
| --includeTypescript | Include Typescript        | boolean    | true          |
| --includePrettier   | Include Prettier          | boolean    | true          |
| --skipInstall       | Skip package installation | boolean    | false         |

## jest

```
schematics gb-schematics:jest
```

Add Jest testing

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

| ARGUMENT | DESCRIPTION            | VALUE TYPE |
| -------- | ---------------------- | ---------- |
| name     | The name of the route. | string     |

### Options

| OPTION      | DESCRIPTION                                 | VALUE TYPE          | DEFAULT VALUE  |
| ----------- | ------------------------------------------- | ------------------- | -------------- |
| --directory | The directory for your component, under src | string              | lib/components |
| --style     | The value of style element lang attribute   | css \| scss \| none | scss           |

## sveltekit-route

```
schematics gb-schematics:sveltekit-route [name]
```

Add a route to your sveltekit project

### Arguments

| ARGUMENT | DESCRIPTION            | VALUE TYPE |
| -------- | ---------------------- | ---------- |
| name     | The name of the route. | string     |

### Options

| OPTION      | DESCRIPTION                                           | VALUE TYPE          | DEFAULT VALUE |
| ----------- | ----------------------------------------------------- | ------------------- | ------------- |
| --style     | The value of style element lang attribute             | css \| scss \| none | scss          |
| --skipTests | Do not create "spec.ts" test files for the new route. | boolean             | false         |
| --endpoint  | Create an endpoint handler for your route.            | boolean             | true          |

## typescript

```
schematics gb-schematics:typescript
```

Add typescript.

see

- [Angular Schematics](https://github.com/angular/angular-cli/tree/main/packages/schematics/angular)
- [Schematics README](https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/schematics/README.md)
- [Angular Blog](https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2)
