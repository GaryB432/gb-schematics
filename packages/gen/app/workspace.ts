import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { type ModuleOptions } from "./types.ts";

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

export function inferModuleOptions(
  cwd = process.cwd(),
): Required<Pick<ModuleOptions, "language" | "testRunner">> {
  const packageJson = readJsonFile<PackageJson>(join(cwd, "package.json"));
  const language = inferLanguage(cwd, packageJson);
  const testScript = packageJson?.scripts?.test ?? "";

  let testRunner: Required<Pick<ModuleOptions, "testRunner">>["testRunner"] =
    "none";

  if (testScript.includes("vitest")) {
    testRunner = "vitest";
  } else if (
    testScript.includes("node --test") ||
    testScript.includes("node:test")
  ) {
    testRunner = "node";
  }

  return { language, testRunner };
}

function inferLanguage(
  cwd: string,
  packageJson: PackageJson | undefined,
): "js" | "ts" {
  if (existsSync(join(cwd, "tsconfig.json"))) {
    return "ts";
  }

  const dependencies = {
    ...((packageJson?.dependencies ?? {}) as Record<string, string>),
    ...((packageJson?.devDependencies ?? {}) as Record<string, string>),
  };

  if (
    typeof dependencies.typescript === "string" ||
    Object.values(packageJson?.scripts ?? {}).some(
      (value) => typeof value === "string" && /(?:tsc|tsx|ts-node)/.test(value),
    )
  ) {
    return "ts";
  }

  return "js";
}

function readJsonFile<T>(filePath: string): T | undefined {
  try {
    if (!existsSync(filePath)) {
      return undefined;
    }

    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return undefined;
  }
}
