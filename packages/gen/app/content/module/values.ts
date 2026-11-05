import { format } from "node:path";

import type { ModuleOptions } from "../../types.ts";

import { type LoggingService } from "../../logger.ts";
import { IMPORT_VITEST } from "../shared.ts";

export function createValuesContent(
  options: ModuleOptions,
  destination: string,
  log: LoggingService,
): Record<string, string> {
  let code_lines: string[];
  let test_lines: string[];

  const ext = ".".concat(options.language ?? "txt");

  const codePath = format({
    dir: destination,
    ext,
    name: options.name,
  });

  const testPath = format({
    dir: destination,
    ext,
    name: options.name.concat(".test"),
  });

  const importPath = format({
    dir: ".",
    ext: ext,
    name: options.name,
  });

  switch (options.language) {
    case "js": {
      code_lines = [
        "export function add(...addends) {",
        "\treturn addends.reduce((a, b) => (a += b));",
        "}",
        "",
        "export function greet(greetee) {",
        `\treturn \`${options.name} says hello to \${greetee}\`;`,
        "}",
      ];

      switch (options.testRunner) {
        case "node": {
          test_lines = [
            "import assert from 'node:assert/strict';",
            "import { describe, it } from 'node:test';",
            "",
            `import { add } from '${importPath}';`,
            "",
            `describe('${options.name}', () => {`,
            "\tit('should add', () => {",
            "\t\tassert.equal(add(3, 2, 1), 1 + 2 + 3);",
            "\t});",
            "});",
          ];
          break;
        }
        case "none": {
          test_lines = [];
          break;
        }
        case "vitest": {
          test_lines = [
            ...IMPORT_VITEST,
            `import { add } from './${options.name}.js';`,
            "",
            `describe('${options.name}', () => {`,
            "\tit('should add', () => {",
            "\t\texpect(add(3, 2, 1)).toEqual(1 + 2 + 3)",
            "\t});",
            "});",
          ];
          break;
        }
        default: {
          test_lines = [];
          break;
        }
      }
      break;
    }
    case "ts": {
      code_lines = [
        "export function add(...addends: number[]) {",
        "\treturn addends.reduce((a, b) => (a += b));",
        "}",
        "",
        "export function greet(greetee: string): string {",
        `\treturn \`${options.name} says hello to \${greetee}\`;`,
        "}",
      ];
      switch (options.testRunner) {
        case "node": {
          test_lines = [
            "import assert from 'node:assert/strict';",
            "import { describe, it } from 'node:test';",
            "",
            `import { add } from '${importPath}';`,
            "",
            `describe('${options.name}', () => {`,
            "\tit('should add', () => {",
            "\t\tassert.equal(add(3, 2, 1), 1 + 2 + 3);",
            "\t});",
            "});",
          ];
          break;
        }

        case "vitest": {
          test_lines = [
            ...IMPORT_VITEST,
            `import { add } from './${options.name}.ts';`,
            "",
            `describe('oven', () => {`,
            "	it('should add', () => {",
            "		expect(add(3, 2, 1)).toEqual(1 + 2 + 3);",
            "	});",
            "});",
          ];
          break;
        }
        default:
          test_lines = [];
          break;
      }
      break;
    }
    default: {
      code_lines = ['// log.info("not implemented");'];
      test_lines = [];
      log.error("not implemented");
      break;
    }
  }

  return {
    [codePath]: code_lines.join("\n"),
    [testPath]: test_lines.join("\n"),
  };
}
