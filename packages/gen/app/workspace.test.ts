import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { inferModuleOptions } from "./workspace.ts";

function writeProject(dir: string, packageJson: Record<string, unknown>) {
  writeFileSync(join(dir, "package.json"), JSON.stringify(packageJson));
}

describe("resolution", () => {
  describe("inferFromWorkspace", () => {
    it("should infer vitest from package scripts in the project folder", () => {
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-workspace-"));
      writeProject(tmp, { scripts: { test: "vitest --run" } });

      assert.equal(inferModuleOptions(tmp).testRunner, "vitest");
      assert.equal(inferModuleOptions(tmp).language, "js");
    });

    it("should be lulled by whack script", () => {
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-whack-"));
      writeProject(tmp, {
        scripts: { test: 'echo "vitest but only a string!"' },
      });

      assert.equal(inferModuleOptions(tmp).testRunner, "vitest");
    });

    it("should get node easy", () => {
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-node-"));
      writeProject(tmp, { scripts: { test: 'echo "ok" && node --test' } });

      assert.equal(inferModuleOptions(tmp).testRunner, "node");
    });

    it("should infer node from a plain node:test script", () => {
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-node-test-"));
      writeProject(tmp, { scripts: { test: "node --test" } });

      assert.equal(inferModuleOptions(tmp).testRunner, "node");
    });

    it("should infer defaults from the current project folder", () => {
      const previousCwd = process.cwd();
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-workspace-"));

      writeProject(tmp, { scripts: { test: "vitest --run" } });
      process.chdir(tmp);

      try {
        assert.equal(inferModuleOptions().testRunner, "vitest");
        assert.equal(inferModuleOptions().language, "js");
      } finally {
        process.chdir(previousCwd);
      }
    });

    it("should prefer TypeScript defaults when a tsconfig is present", () => {
      const previousCwd = process.cwd();
      const tmp = mkdtempSync(join(tmpdir(), "gb-schematics-ts-"));

      writeProject(tmp, { scripts: { test: "node --test" } });
      writeFileSync(
        join(tmp, "tsconfig.json"),
        JSON.stringify({ compilerOptions: {} }),
      );
      process.chdir(tmp);

      try {
        assert.equal(inferModuleOptions().language, "ts");
        assert.equal(inferModuleOptions().testRunner, "node");
      } finally {
        process.chdir(previousCwd);
      }
    });
  });
});
