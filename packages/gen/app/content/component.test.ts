import { log } from "@clack/prompts";
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { createComponentContent } from "./component.ts";

describe("createComponentContent", () => {
  test("ts component declares typed props", () => {
    const content = createComponentContent(
      {
        language: "ts",
        name: "my-card",
        prop: ["title:string", "count:number", "done:boolean"],
      },
      "/a/b",
      log,
    );
    const code = content["/a/b/my-card.svelte"].split("\n");

    assert.equal(code[0], '<script lang="ts">');
    assert.ok(code.includes("\ttitle: string;"));
    assert.ok(code.includes("\tcount: number;"));
    assert.ok(code.includes("\tdone: boolean;"));
    assert.ok(code.includes("<article>"));
    assert.ok(code.includes("{title}"));
  });

  test("pascalCaseFiles names the file in pascal case", () => {
    const content = createComponentContent(
      { language: "ts", name: "my-card", pascalCaseFiles: true, prop: [] },
      "/a/b",
      log,
    );
    assert.ok("/a/b/MyCard.svelte" in content);
  });

  test("component without props generates no prop", () => {
    const content = createComponentContent(
      { language: "ts", name: "card", prop: [] },
      "/a/b",
      log,
    );
    const code = content["/a/b/card.svelte"];

    assert.ok(!code.includes("undefined"));
    assert.ok(code.includes("interface Props {\n}"));
  });

  test("js component logs a typescript nudge", () => {
    const content = createComponentContent(
      { language: "js", name: "card", prop: ["title"] },
      "/a/b",
      log,
    );
    assert.deepEqual(content["/a/b/card.svelte"].split("\n"), [
      "{title}",
      "console.log('use typescript!');",
    ]);
  });
});
