#!/usr/bin/env node

import { main } from "./app/main.ts";

main(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  // eslint-disable-next-line no-console
  console.error(message);
  process.exitCode = 1;
});
