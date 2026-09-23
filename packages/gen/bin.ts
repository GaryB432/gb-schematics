#!/usr/bin/env node
/* eslint-disable no-console */

import { main } from "./app/main.ts";

main(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
