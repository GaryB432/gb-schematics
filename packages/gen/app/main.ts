import { log } from "@clack/prompts";
import { cac } from "cac";

import { generateModule } from "./generation.ts";
import { resolveModuleOptions } from "./resolution.ts";
import { type ModuleOptions } from "./types.ts";
import { getValidationErrors } from "./validation.ts";

export async function main(rawArguments: string[]): Promise<void> {
  const cli = cac("gen");

  cli
    .command("module [name]", "Generate code module")
    .option(
      "-d, --directory <directory>",
      "The directory to create the module, relative to the project root",
    )
    .option("-k, --kind <kind>", "kind of module, class or values")
    .option(
      "--test-runner <runner>",
      "Test runner to use for unit tests (vite or node or none)",
    )
    .option(
      "--in-source-tests",
      "When using Vitest, separate spec files will not be generated and instead will be included within the source files",
    )
    .option(
      "--pascal-case-files",
      "Use pascal case file names for class module",
    )
    .option("-l, --language <language>", "The language to use (js or ts)")
    // .option("--source-root <src>", "The path to your project's source root)")
    .action(async (name: string | undefined, options: ModuleOptions) => {
      await runGenerateModule(name, options);
    });

  const parsedArgs = cli.parse(rawArguments, { run: false });

  cli.help();
  if (parsedArgs.options.help) {
    cli.outputHelp();
    return;
  }

  if (cli.matchedCommand) {
    await cli.runMatchedCommand();
  } else {
    cli.outputHelp();
  }
}

const allPrompts = process.env.ALL_PROMPTS === "true";

async function runGenerateModule(
  name: string | undefined,
  options: Partial<ModuleOptions>,
): Promise<void> {
  // const allPrompts = true;
  const errors = getValidationErrors(options);
  if (errors.length > 0) {
    errors.forEach((e) => log.error(e));
    process.exit(1);
  }

  await generateModule(
    await resolveModuleOptions({ name, allPrompts, ...options }),
    log,
  );
}
