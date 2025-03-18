/* eslint @typescript-eslint/no-var-requires: 0 */
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
const argv = require('minimist')(process.argv.slice(2)) as {
  _: string[];
  d: boolean;
  stamp: string;
};
argv.stamp = argv.stamp ?? '';

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
  const fname = [path.name, argv.stamp, 'd', 'ts']
    .filter((p) => p.length > 0)
    .join('.');
  const outName = join(root, path.dir, fname);
  if (!argv.d) {
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

async function main() {
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
      console.log(
        colors.white(k),
        colors.green('✔'),
        colors.green(parse(sfn).dir),
        colors.yellow(parse(n).base)
      );
    } else {
      console.log(colors.white(k), colors.gray('no schema'));
    }
  }

  if (argv.d) {
    console.log(colors.yellowBright('Nothing written. Dry run.'));
  }
}
void main();
