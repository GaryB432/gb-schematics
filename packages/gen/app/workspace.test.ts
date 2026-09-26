import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { inferModuleOptions } from "./workspace.ts";

describe("resolution", () => {
  describe("inferFromWorkspace", () => {
    it("should vitest", () => {
      assert.equal(inferModuleOptions({ test: "vitest" }).testRunner, "vitest");
    });

    it("should be lulled by whack script", () => {
      assert.equal(
        inferModuleOptions({ test: 'echo "vitest but only a string!"' })
          .testRunner,
        "vitest",
      );
    });

    it("should get node easy", () => {
      assert.equal(
        inferModuleOptions({ test: 'echo "ok" && node --test' }).testRunner,
        "node",
      );
    });

    it("should vitest mocha", () => {
      assert.equal(
        inferModuleOptions({ test: "node --test" }).testRunner,
        "node",
      );
    });
  });
});
