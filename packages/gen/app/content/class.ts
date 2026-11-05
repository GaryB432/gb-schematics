import { format } from "node:path";

import type { ModuleOptions } from "../types.ts";

import { type LoggingService } from "../logger.ts";
import { IMPORT_VITEST, simplePascalCase } from "./shared.ts";

export function createClassContent(
  options: ModuleOptions,
  destination: string,
  log: LoggingService,
): Record<string, string> {
  let code_lines: string[];
  let test_lines: string[];

  const ext = ".".concat(options.language ?? "txt");

  const maybePascalName = options.pascalCaseFiles
    ? simplePascalCase(options.name)
    : options.name;

  const codePath = format({
    dir: destination,
    ext,
    name: maybePascalName,
  });

  const testPath = format({
    dir: destination,
    ext,
    name: maybePascalName.concat(".test"),
  });

  const importPath = format({
    dir: ".",
    ext: ext,
    name: options.name,
  });

  switch (options.language) {
    case "js": {
      code_lines = [
        `export class ${simplePascalCase(options.name)} {`,
        "\tadd(...addends) {",
        "\t\treturn addends.reduce((a, b) => (a += b));",
        "\t}",
        "",
        "\tgreet(greetee) {",
        `\t\treturn \`${options.name} says hello to \${greetee}\`;`,
        "\t}",
        "}",
      ];
      switch (options.testRunner) {
        case "node": {
          test_lines = [
            "import assert from 'node:assert/strict';",
            "import { describe, it } from 'node:test';",
            "",
            `import { ${simplePascalCase(options.name)} } from './${options.name}.${options.language}';`,
            "",
            `describe('${options.name}', () => {`,
            `\tconst sut = new ${simplePascalCase(options.name)}();`,
            "\tit('should add', () => {",
            "\t\tassert.equal(sut.add(3, 2, 1), 1 + 2 + 3);",
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
            `import { ${simplePascalCase(options.name)} } from './${options.name}.${options.language}';`,
            "",
            `describe('${options.name}', () => {`,
            `\tconst sut = new ${simplePascalCase(options.name)}();`,
            "\tit('should add', () => {",
            "\t\texpect(sut.add(3, 2, 1)).toEqual(1 + 2 + 3);",
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
        `export class ${simplePascalCase(options.name)} {`,
        "\tpublic add(...addends: number[]): number {",
        "\t\treturn addends.reduce((a, b) => (a += b));",
        "\t}",
        "",
        "\tpublic greet(greetee: string): string {",
        `\t\treturn \`${options.name} says hello to \${greetee}\`;`,
        "\t}",
        "}",
      ];
      switch (options.testRunner) {
        case "node": {
          test_lines = [
            "import assert from 'node:assert/strict';",
            "import { describe, it } from 'node:test';",
            "",
            `import { ${simplePascalCase(options.name)} } from '${importPath}';`,
            "",
            `describe('${options.name}', () => {`,
            `\tconst sut = new ${simplePascalCase(options.name)}();`,
            "\tit('should add', () => {",
            "\t\tassert.equal(sut.add(3, 2, 1), 1 + 2 + 3);",
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
            `import { ${simplePascalCase(options.name)} } from '${importPath}';`,
            "",
            `describe('${options.name}', () => {`,
            `\tconst sut = new ${simplePascalCase(options.name)}();`,
            "\tit('should add', () => {",
            "\t\texpect(sut.add(3, 2, 1)).toEqual(1 + 2 + 3);",
            "\t});",
            "});",
          ];
          break;
        }
        default: {
          throw new Error("not a testRunner");
        }
      }
      break;
    }
    default: {
      code_lines = ['// console.log("not implemented");'];
      test_lines = ["// tbd", `import { add } from '${importPath}';`];
      log.error("not implemented");
    }
  }

  return {
    [codePath]: code_lines.join("\n"),
    [testPath]: test_lines.join("\n"),
  };
}
