# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog and this project follows Semantic Versioning.

## [6.0.0-alpha.1] - 2026-06-04

### Miscellaneous cleanup

- README badges
- Added github info to packages for npm display

## [6.0.0-alpha.0] - 2026-06-03

### Added

- Initial stable release of the `gb-schematics` monorepo.
- New package: `@gb-schematics/cli` for running schematics with a modern CLI UX.
- New package: `@gb-schematics/schematics` for module, route, component, and version bump workflows.
- New schema type generation pipeline based on `json-schema-to-typescript`.
- New generated schema option types aligned with string-union based schematic options.
- New dist-backed test strategy using Node's built-in test runner (`node --test`).
- New test pipeline that compiles specs and runs from `dist/**/*_spec.js`.
- New architecture and operating notes for Devkit-first, dist-backed execution in `GEMINI.md` and `docs/devkit-runner-architecture.md`.

### Notes

- This release establishes the stable baseline for future 1.x changes.
- Built on Angular Devkit/Schematics conventions intentionally, following the model the Angular tooling team has encouraged over time.
- The preferred local verification path is:
  - build schematics to `dist`
  - run tests against `dist`
  - run CLI from built entrypoints
