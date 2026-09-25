import { log, select, text } from "@clack/prompts";
import { styleText } from "node:util";

import { type ModuleOptions } from "./types.ts";
import {
  kindOptions,
  languageOptions,
  testRunnerOptions,
} from "./validation.ts";

export async function resolveModuleOptions(
  options: Partial<ModuleOptions> & { allPrompts: boolean },
): Promise<ModuleOptions> {
  // options.allPrompts = true;
  const resolved: Partial<ModuleOptions> = {
    inSourceTests: options.inSourceTests ?? false,
    pascalCaseFiles: options.pascalCaseFiles ?? false,
    ...options,
  };

  if (options.allPrompts || resolved.name === undefined) {
    const d = await nameResolve(resolved.name ?? "");
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.name = d;
  }
  if (options.allPrompts || resolved.language === undefined) {
    const d = await languageResolve(options.language ?? inferredx.language);
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.language = d;
  }
  if (options.allPrompts || resolved.kind === undefined) {
    const d = await kindResolve(options.kind ?? "values");
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.kind = d;
  }
  if (options.allPrompts || resolved.testRunner === undefined) {
    const d = await testRunnerResolve(
      options.testRunner ?? inferredx.testRunner,
    );
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.testRunner = d;
  }
  if (options.allPrompts || resolved.directory === undefined) {
    const d = await directoryResolve(options.directory ?? "");
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.directory = d;
  }

  return resolved as ModuleOptions;
}

async function directoryResolve(
  initialValue: string,
): Promise<string | symbol> {
  log.info(
    [styleText("white", "cwd:"), styleText("green", process.cwd())].join(" "),
  );

  return text({
    message: "Provide directory for your module",
    initialValue,
    placeholder: "src",
  });
}

function inferFromWorkspace(): Required<
  Pick<ModuleOptions, "language" | "testRunner">
> {
  const language = "js";
  const testRunner = "none";
  return { language, testRunner };
}
async function kindResolve(initialValue: string): Promise<string | symbol> {
  return select({
    initialValue,
    message: "What kind of module is to be generated?",
    options: kindOptions,
  });
}
async function languageResolve(initialValue: string): Promise<string | symbol> {
  return select({
    initialValue,
    message: "Provide language",
    options: languageOptions,
  });
}
async function nameResolve(initialValue: string): Promise<string | symbol> {
  return text({
    initialValue,
    message: "Provide a name for your module and test",
    placeholder: "greeter",
    validate(value) {
      if (!value || value === "") {
        return "The module must have a name";
      }
    },
  });
}
async function testRunnerResolve(
  initialValue: string,
): Promise<string | symbol> {
  return select({
    initialValue,
    message: "Provide testRunner",
    options: testRunnerOptions,
  });
}

const inferredx = inferFromWorkspace();
