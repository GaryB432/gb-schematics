/* eslint @typescript-eslint/no-var-requires: 0 */
import { createConsoleLogger } from '@angular-devkit/core/node';
import colors from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { join, parse, posix, type ParsedPath } from 'path';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  executors?: string;
  generators?: string;
  schematics?: string;
}

// eslint-disable-next-line
const cliOptions = require('minimist')(process.argv.slice(2)) as {
  _: string[];
  d: boolean;
  help: boolean;
  stamp: string;
  verbose: boolean;
};
cliOptions.stamp = cliOptions.stamp ?? '';

async function writeSchemaTypeDef(
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<string> {
  const schemaObj = JSON.parse(
    await readFile(join(root, sdef.schema), 'utf-8')
  ) as JSONSchema;
  const { title } = schemaObj;
  schemaObj.title = 'options';
  const dts = await compile(schemaObj, 'options', {
    bannerComment: `/* eslint-disable */
    /* from ${sdef.schema}
        ${title}
    */`,
  });
  const fname = [path.name, cliOptions.stamp, 'd', 'ts']
    .filter((p) => p.length > 0)
    .join('.');
  const outName = join(root, path.dir, fname);
  if (!cliOptions.d) {
    void (await writeFile(outName, dts));
  }

  return outName;
}

const cwd = posix.resolve('.');

interface Schemtic {
  description: string;
  factory: string;
  schema?: string;
}

interface Collection {
  schematics: Record<string, Schemtic>;
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf-8')) as T;
}

async function main(stdout = process.stdout, stderr = process.stderr) {
  const logger = createConsoleLogger(!!cliOptions.verbose, stdout, stderr, {
    info: (s) => s,
    debug: (s) => s,
    warn: (s) => colors.bold.yellow(s),
    error: (s) => colors.bold.red(s),
    fatal: (s) => colors.bold.red(s),
  });

  if (cliOptions.help) {
    logger.info(getUsage());

    return 0;
  }

  const packageJ = await readJson<PackageConfig>('package.json');

  if (!packageJ.schematics) {
    throw new Error('no schematics');
  }

  const collection = await readJson<Collection>(packageJ.schematics);

  const collParsed = parse(packageJ.schematics);

  for (const [k, v] of Object.entries(collection.schematics).sort()) {
    if (v.schema) {
      const schParsed = parse(v.schema);
      const sfn = join(collParsed.dir, schParsed.dir, schParsed.base);
      const n = await writeSchemaTypeDef(cwd, { schema: sfn }, parse(sfn));
      logger.info(
        [
          colors.white(k).padEnd(40).slice(0, 40),
          ' ✔ ',
          colors.green(parse(sfn).dir),
          colors.yellow(parse(n).base),
        ].join(' ')
      );
    } else {
      logger.info([colors.white(k), colors.gray('no schema')].join(' '));
    }
  }

  if (cliOptions.d) {
    logger.warn('Nothing written. Dry run.');
  }
  logger.complete();
}

function getUsage(): string {
  return `use some arguments`;
}

void main();
