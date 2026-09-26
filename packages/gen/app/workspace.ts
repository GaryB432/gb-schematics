import { type ModuleOptions } from "./types.ts";

export function inferModuleOptions(
  scripts: Record<string, string> = {},
): Required<Pick<ModuleOptions, "language" | "testRunner">> {
  const language = "js";
  let testRunner = "none";

  const testScript = scripts.test ?? "";

  if (testScript.includes("vitest")) {
    testRunner = "vitest";
  } else if (testScript.includes("node --test")) {
    testRunner = "node";
  }

  return { language, testRunner };
}
