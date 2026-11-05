import { format } from "node:path";

import type { ComponentOptions } from "../types.ts";

import { type LoggingService } from "../logger.ts";
import { enquote } from "../validation.ts";
import { simplePascalCase, simpleSnakeCase } from "./shared.ts";

export function createComponentContent(
  options: ComponentOptions,
  destination: string,
  log: LoggingService,
): Record<string, string> {
  let code_lines: string[];
  const test_lines: string[] = [];

  const maybePascalName = options.pascalCaseFiles
    ? simplePascalCase(options.name)
    : options.name;

  const ext = ".svelte";

  const codePath = format({
    dir: destination,
    ext,
    name: maybePascalName,
  });

  const testPath = format({
    dir: destination,
    ext,
    name: maybePascalName.concat(".spec.svelte"),
  });

  const propParts = options.prop.map((propInfo) => propInfo.split(":"));

  const typedPropsLines = propParts.map((propsInfo: string[]) => {
    const [propName, propType] = propsInfo;
    return `\t${simpleSnakeCase(propName)}: ${propType ?? "unknown"};`;
  });

  const propsShowLines = propParts.map((propsInfo: string[]) => {
    return ["{", simpleSnakeCase(propsInfo[0]), "}"].join("");
  });

  const assignments = propParts.map((propParts: string[]) => {
    let val = enquote(propParts[0]);

    switch (propParts[1]) {
      case "boolean": {
        val = "false";
        break;
      }
      case "number": {
        val = "NaN";
        break;
      }
    }

    return `\t${simpleSnakeCase(propParts[0])}: ${val},`;
  });

  const massignments = ["const specimen: Props = {", ...assignments, "}"];

  const propDeclaration = [
    "let {",
    propParts.map((f) => simpleSnakeCase(f[0])).join(", "),
    " }: Props = $props();",
  ].join(" ");

  switch (options.language) {
    case "js": {
      code_lines = [...propsShowLines, "console.log('use typescript!');"];
      break;
    }
    case "ts": {
      code_lines = [
        '<script lang="ts">',
        "",
        "interface Props {",
        ...typedPropsLines,
        "}",
        "",
        propDeclaration,
        "",
        "</script>",
        "",

        ...["<!-- ", ...massignments, "-->"],
        "",
        "<article>",
        ...propsShowLines,
        "</article>",
        "",
        "<style>",
        "\tarticle {",
        "\t\tborder: thin solid silver",
        "\t}",
        "</style>",
      ];
      break;
    }
    default: {
      code_lines = ['// log.info("not implemented");'];
      log.error("not implemented");
      break;
    }
  }

  return {
    [codePath]: code_lines.join("\n"),
    [testPath]: test_lines.join("\n"),
  };
}
