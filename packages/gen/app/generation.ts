import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, parse, type ParsedPath } from "node:path";
import { styleText } from "node:util";

import { createClassContent, createValuesContent } from "./content.ts";
import { type LoggingService } from "./logger.ts";
import { type ModuleOptions } from "./types.ts";

export async function generateModule(
  options: ModuleOptions,
  log: LoggingService,
): Promise<void> {
  const destination = join(process.cwd(), options.directory ?? "");

  switch (options.kind) {
    case "class": {
      writeContent(createClassContent(options, destination, log), log);
      break;
    }
    case "values": {
      writeContent(createValuesContent(options, destination, log), log);
      break;
    }
    default: {
      throw new Error(`${options.kind} is not a recognized module kind`);
    }
  }
}

function filterByExisting(paths: string[]): ParsedPath[] {
  return paths
    .map((path) => {
      const parts = parse(path);
      return { parts, path };
    })
    .filter((g) => existsSync(g.path))
    .map((g) => g.parts);
}

function finalizeWrite(path: string, data: string, log: LoggingService): void {
  const { base, dir } = parse(path);

  if (existsSync(path)) {
    throw new Error("existing file unexpected here");
  }
  const md = mkdirSync(dir, { recursive: true });
  if (md) {
    log.info(styleText(["gray"], `${md} created`));
  }
  log.success(
    join(
      styleText(["green", "italic"], dir),
      styleText(["greenBright", "italic"], base),
    ),
  );

  writeFileSync(path, data, "utf-8");
}

function writeContent(
  content: Record<string, string>,
  log: LoggingService,
): void {
  const existing = filterByExisting(Object.keys(content));

  if (existing.length > 0) {
    for (const ef of existing) {
      log.error(styleText(["red"], `${ef.base} exists in ${ef.dir}`));
    }
    log.error(styleText(["red"], `Nothing generated`));
  } else {
    for (const [path, data] of Object.entries(content)) {
      if (data !== "") {
        finalizeWrite(path, data.concat("\n"), log);
      }
    }
  }
}
