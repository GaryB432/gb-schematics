import colors from 'ansi-colors';
import { readFile, writeFile } from 'fs/promises';
import { compile, JSONSchema } from 'json-schema-to-typescript';
import { join, parse, ParsedPath, posix } from 'path';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  executors?: string;
  generators?: string;
  schematics?: string;
}

const dev = false;

async function writeSchemaTypeDef(
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<string> {
  const schemaContent = await readFile(join(root, sdef.schema));
  const schemaObj = JSON.parse(schemaContent.toString()) as JSONSchema;
  const { title } = schemaObj;
  schemaObj.title = 'options';
  const dts = await compile(schemaObj, 'options', {
    bannerComment: `/* eslint-disable */
    /* from ${sdef.schema}
        ${title}
    */`,
  });
  const stamp = dev ? ['generated', 'v1'] : [];
  const fname = [path.name, ...stamp, 'd', 'ts'].join('.');
  const outName = join(root, path.dir, fname);
  void (await writeFile(outName, dts));

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
  return JSON.parse((await readFile(path)).toString()) as T;
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
      console.log(
        colors.white(k),
        colors.gray('no schema'),
      );
    }
  }
}
void main();
