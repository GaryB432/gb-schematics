import { readFile, writeFile } from 'fs/promises';
import { compileFromFile } from 'json-schema-to-typescript';
import { join, parse, ParsedPath, posix } from 'path';
// import { Workspaces } from '@nrwl/tao/src/shared/workspace';

interface SchemaDefined {
  schema: string;
}

interface PackageConfig {
  schematics?: string;
  generators?: string;
  executors?: string;
}

interface SchemaDefinedList {
  schematics: Record<string, SchemaDefined>;
  executors: Record<string, SchemaDefined>;
  generators: Record<string, SchemaDefined>;
}

async function writeSchemaTypeDef(
  root: string,
  sdef: SchemaDefined,
  path: ParsedPath
): Promise<void> {
  const dts = await compileFromFile(join(root, sdef.schema), {
    bannerComment: `/* eslint-disable */
    /* from ${sdef.schema} */`,
  });
  void writeFile(join(root, path.dir, `${path.name}.gen.d.ts`), dts);
}

const cwd = posix.resolve('.');

async function handleSchemaDefList(
  root: string,
  defListPath: string | undefined,
  k: keyof SchemaDefinedList
): Promise<void> {
  if (!defListPath) return;
  console.log(root, defListPath, 'woo');
  const buf = await readFile(join(root, defListPath));
  const sds = JSON.parse(buf.toString()) as SchemaDefinedList;
  for (const sdef of Object.values(sds[k])) {
    await writeSchemaTypeDef(root, sdef, parse(sdef.schema));
  }
}

interface Proj {
  root: string;
}

interface WsConfig {
  projects: Record<string, Proj>;
}

class Workspaces {
  readWorkspaceConfiguration(): WsConfig {
    return { projects: { fun: { root: this.cwd } } };
  }
  public constructor(private readonly cwd: string) {}
}

async function processWorkspace() {
  const cwd = posix.resolve('.');
  const ws = new Workspaces(cwd);

  const wsConfig = ws.readWorkspaceConfiguration();
  for (const projName in wsConfig.projects) {
    const proj = wsConfig.projects[projName];
    // console.log(proj);
    const pjb = await readFile(join(proj.root, 'package.json'));
    const pj = JSON.parse(pjb.toString()) as PackageConfig;
    const { root } = proj;
    // console.log(pj.schematics);
    await handleSchemaDefList(root, pj.schematics, 'schematics');
    // await handleSchemaDefList(root, pj.executors, 'executors');
    // await handleSchemaDefList(root, pj.generators, 'generators');
  }
}

/* big stuff below */
interface Schemtic {
  description: string;
  factory: string;
  schema?: string;
}

interface Collection {
  schematics: Record<string, Schemtic>;
}

interface Details {
  $default: { $source: string; index: number };
  default?: string | number | boolean;
  description?: string;
  enum?: string[];
  type: string;
  visible?: boolean;
}

interface SchematicProperties {
  properties: Record<string, Details>;
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

  // handleSchemaDefList('.', 'src/collection.json', 'schematics');

  // console.log(collection.schematics);

  const collParsed = parse(packageJ.schematics);
  for (const v of Object.values(collection.schematics)) {
    if (v.schema) {
      const schParsed = parse(v.schema);
      const sfn = join(collParsed.dir, schParsed.dir, schParsed.base);
      console.log(v.schema);
      const pp = parse(sfn);
      await writeSchemaTypeDef(cwd, { schema: sfn }, pp);
    }
  }
}

// void processWorkspace();
void main();
