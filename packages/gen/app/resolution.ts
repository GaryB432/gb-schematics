import { log, select, text } from "@clack/prompts";
import { styleText } from "node:util";

import { type ModuleOptions } from "./types.ts";
import {
  kindOptions,
  languageOptions,
  testRunnerOptions,
} from "./validation.ts";

export async function resolveModuleOptions(
  options: Partial<ModuleOptions>,
): Promise<ModuleOptions> {
  const resolved: Partial<ModuleOptions> = {
    inSourceTests: options.inSourceTests ?? false,
    pascalCaseFiles: options.pascalCaseFiles ?? false,
    ...options,
  };

  if (resolved.name === undefined) {
    const d = await nameResolve();
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.name = d;
  }
  if (resolved.language === undefined) {
    const d = await languageResolve(inferred.language);
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.language = d;
  }
  if (resolved.kind === undefined) {
    const d = await kindResolve();
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.kind = d;
  }
  if (resolved.testRunner === undefined) {
    const d = await testRunnerResolve(inferred.testRunner);
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.testRunner = d;
  }
  if (resolved.directory === undefined) {
    const d = await directoryResolve();
    if (typeof d === "symbol") {
      process.exit(0);
    }
    resolved.directory = d;
  }

  return resolved as ModuleOptions;
}

async function directoryResolve(): Promise<string | symbol> {
  log.info(
    [styleText("white", "cwd:"), styleText("green", process.cwd())].join(" "),
  );

  return text({
    message: "Provide directory for your module",
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
async function kindResolve(): Promise<string | symbol> {
  return select({
    initialValue: "values",
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
async function nameResolve(): Promise<string | symbol> {
  return text({
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

const inferred = inferFromWorkspace();
