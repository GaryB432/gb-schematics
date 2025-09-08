/* eslint @typescript-eslint/no-var-requires: 0 */
import colors from 'ansi-colors';
import { compile, type JSONSchema } from 'json-schema-to-typescript';
import { readFile, writeFile } from 'node:fs/promises';
import { join, parse, type ParsedPath } from 'node:path';
import yap from 'yargs-parser';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  executors?: string;
  generators?: string;
  name: string;
  schematics?: string;
}

const argv = yap(process.argv.slice(2), {
  alias: { p: 'package', s: 'stamp' },
  array: [{ key: 'package' }],
}) as {
  _: string[];
  d: boolean;
  package: string[];
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
  schemaObj.title = 'schema';
  const dts = await compile(schemaObj, '', {
    bannerComment: `/* eslint-disable */
/* from ${sdef.schema}
   ${title}
   ${new Date().toDateString()}
*/`,
    cwd: root,
    declareExternallyReferenced: false,
    enableConstEnums: true,
    inferStringEnumKeysFromValues: true,
    format: true,
    ignoreMinAndMaxItems: false,
    maxItems: -1,
    strictIndexSignatures: true,
    unreachableDefinitions: false,
    unknownAny: true,
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
  for (const aroot of argv.package) {
    const packageJ = await readJson<PackageConfig>(join(aroot, 'package.json'));

    if (!packageJ.schematics) {
      console.log(packageJ.name);
      console.warn('no schematics');
      return;
    }

    console.log(colors.cyan(packageJ.name), colors.white(aroot));

    const collection = await readJson<Collection>(
      join(aroot, packageJ.schematics)
    );

    const collParsed = parse(packageJ.schematics);

    for (const [k, v] of Object.entries(collection.schematics).sort()) {
      if (v.schema) {
        const schParsed = parse(v.schema);
        const sfn = join(collParsed.dir, schParsed.dir, schParsed.base);
        const n = await writeSchemaTypeDef(aroot, { schema: sfn }, parse(sfn));
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
  }
}
void main().then(() => {
  if (argv.d) {
    console.log(colors.yellowBright('Nothing written. Dry run.'));
  }
});
