import { log } from "@clack/prompts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";

import { type ModuleOptions } from "../../types.ts";
import {
  kindOptions,
  languageOptions,
  testRunnerOptions,
} from "../../validation.ts";
import { createClassContent } from "./class.ts";
import { createModuleContent } from "./index.ts";
import { createValuesContent } from "./values.ts";

describe("fixtures", () => {
  for (const language of languageOptions) {
    for (const kind of kindOptions) {
      for (const testRunner of testRunnerOptions) {
        const opts: ModuleOptions = {
          kind: kind.value,
          language: language.value,
          name: "oven",
          testRunner: testRunner.value,
        };

        if (!opts.language || !opts.kind || !opts.testRunner) {
          continue;
        }

        const given_path = join(
          process.cwd(),
          "fixtures",
          "module",
          opts.language,
          opts.kind,
          opts.testRunner,
        );

        const module_fn = join(
          given_path,
          opts.name.concat(".".concat(opts.language)),
        );

        const spec_fn = join(
          given_path,
          opts.name.concat(".test.".concat(opts.language)),
        );

        const module_fixt_path = join(
          given_path,
          opts.name.concat(".".concat(opts.language.concat("_"))),
        );

        const spec_fixture_path = join(
          given_path,
          opts.name.concat(".test.".concat(opts.language.concat("_"))),
        );

        const module_fixture_content = readFileSync(module_fixt_path, "utf-8");

        const spec_fixture_content =
          opts.testRunner === "none"
            ? "arbitrary content we do not control"
            : readFileSync(spec_fixture_path, "utf-8");

        const actual =
createModuleContent(opts, given_path, log);

        const expected = {
          [module_fn]: module_fixture_content.trim(),
          [spec_fn]: spec_fixture_content.trim(),
        };

        test(given_path, () => {
          assert.deepEqual(actual[module_fn], expected[module_fn]);
          if (opts.testRunner !== "none") {
            assert.deepEqual(actual[spec_fn], expected[spec_fn]);
          }
        });
      }
    }
  }
});

describe("createClassContent", () => {
  test("ts class with node runner", () => {
    const content = createClassContent(
      { kind: "class", language: "ts", name: "my-sut", testRunner: "node" },
      "/a/b",
      log,
    );
    assert.deepEqual(content["/a/b/my-sut.ts"].split("\n"), [
      "export class MySut {",
      "\tpublic add(...addends: number[]): number {",
      "\t\treturn addends.reduce((a, b) => (a += b));",
      "\t}",
      "",
      "\tpublic greet(greetee: string): string {",
      "\t\treturn `my-sut says hello to ${greetee}`;",
      "\t}",
      "}",
    ]);
    assert.ok(content["/a/b/my-sut.test.ts"].includes("new MySut()"));
  });

  test("pascalCaseFiles names files in pascal case", () => {
    const content = createClassContent(
      {
        kind: "class",
        language: "ts",
        name: "my-sut",
        pascalCaseFiles: true,
        testRunner: "node",
      },
      "/a/b",
      log,
    );
    assert.deepEqual(Object.keys(content), [
      "/a/b/MySut.ts",
      "/a/b/MySut.test.ts",
    ]);
  });

  test("unknown ts test runner throws", () => {
    assert.throws(
      () =>
        createClassContent(
          { kind: "class", language: "ts", name: "sut", testRunner: "jest" },
          "/a/b",
          log,
        ),
      /not a testRunner/,
    );
  });
});

describe("createValuesContent", () => {
  test("create Values Content ts", () => {
    const content = createValuesContent(
      {
        kind: "values",
        language: "ts",
        name: "sut",
        testRunner: "node",
      },
      "/a/b",
      log,
    );
    assert.deepEqual(content["/a/b/sut.ts"].split("\n"), [
      "export function add(...addends: number[]) {",
      "\treturn addends.reduce((a, b) => (a += b));",
      "}",
      "",
      "export function greet(greetee: string): string {",
      "\treturn `sut says hello to ${greetee}`;",
      "}",
    ]);
    assert.deepEqual(content["/a/b/sut.test.ts"].split("\n"), [
      "import assert from 'node:assert/strict';",
      "import { describe, it } from 'node:test';",
      "",
      "import { add } from './sut.ts';",
      "",
      "describe('sut', () => {",
      "\tit('should add', () => {",
      "\t\tassert.equal(add(3, 2, 1), 1 + 2 + 3);",
      "\t});",
      "});",
    ]);
  });

  test("createValuesContent js", () => {
    const content = createValuesContent(
      {
        kind: "values",
        language: "js",
        name: "sut",
        testRunner: "node",
      },
      "/a/b",
      log,
    );
    assert.deepEqual(content["/a/b/sut.js"].split("\n"), [
      "export function add(...addends) {",
      "\treturn addends.reduce((a, b) => (a += b));",
      "}",
      "",
      "export function greet(greetee) {",
      "\treturn `sut says hello to ${greetee}`;",
      "}",
    ]);
    assert.deepEqual(content["/a/b/sut.test.js"].split("\n"), [
      "import assert from 'node:assert/strict';",
      "import { describe, it } from 'node:test';",
      "",
      "import { add } from './sut.js';",
      "",
      "describe('sut', () => {",
      "\tit('should add', () => {",
      "\t\tassert.equal(add(3, 2, 1), 1 + 2 + 3);",
      "\t});",
      "});",
    ]);
  });
});
