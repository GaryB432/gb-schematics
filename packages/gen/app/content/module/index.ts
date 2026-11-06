import type { LoggingService } from "../../logger.ts";
import type { ModuleOptions } from "../../types.ts";

import { createClassContent } from "./class.ts";
import { createValuesContent } from "./values.ts";

export function createModuleContent(
  options: ModuleOptions,
  destination: string,
  log: LoggingService,
): Record<string, string> {
  switch (options.kind) {
    case "class": {
      return createClassContent(options, destination, log);
    }
    case "values": {
      return createValuesContent(options, destination, log);
    }
    default: {
      throw new Error(`${options.kind} is not a recognized module kind`);
    }
  }
}
