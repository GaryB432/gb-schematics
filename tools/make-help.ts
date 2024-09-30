import { readFile } from 'fs/promises';
import { join, parse } from 'path';

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

function makeDescription(name: string, details: Details): string {
  return details.description ?? `${name} details`;
}

function tableHeader(...cells: string[]): string {
  const ff = tableRow(...cells);
  const fj = tableRow(...cells.map(() => '---'));
  return ['<!-- prettier-ignore -->', ff, fj].join('\n');
}

function tableRow(...cells: string[]): string {
  return ['', ...cells, ''].join(' | ').slice(1);
}

function isFromArgv(d: Details): unknown {
  return d.$default && d.$default.$source === 'argv';
}

async function main() {
  const packageJ = await readJson<{ schematics: string }>('package.json');

  console.log(packageJ.schematics);

  const collection = await readJson<Collection>(packageJ.schematics);

  for (const [k, v] of Object.entries(collection.schematics).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    console.log(`## ${k}\n`);
    if (v.schema) {
      const collParsed = parse(packageJ.schematics);
      const schParsed = parse(v.schema);
      const sfn = join(collParsed.dir, schParsed.dir, schParsed.base);
      const b = await readJson<SchematicProperties>(sfn);

      const args = Object.entries(b.properties)
        .filter(([_c, d]) => isFromArgv(d))
        .sort((e, f) => e[1].$default.index - f[1].$default.index);

      console.log('```');
      console.log(
        `schematics gb-schematics:${k} ${args
          .map((a) => `[${a[0]}]`)
          .join(' ')}`
      );
      console.log('```\n');
      console.log(v.description);
      console.log();

      if (args.length > 0) {
        console.log('### Arguments\n');
        console.log(tableHeader('ARGUMENT', 'DESCRIPTION', 'VALUE TYPE'));
        for (const [c, d] of args) {
          console.log(
            tableRow(
              c,
              makeDescription(c, d),
              d.enum ? d.enum.join(' \\| ') : d.type
            )
          );
        }
      }

      const schematidOptions = Object.entries(b.properties).filter(
        ([_c, d]) => !isFromArgv(d)
      );
      if (schematidOptions.length > 0) {
        console.log('\n### Options\n');
        console.log(
          tableHeader('OPTION', 'DESCRIPTION', 'VALUE TYPE', 'DEFAULT VALUE')
        );
        for (const [c, d] of schematidOptions) {
          const u = d.default ?? '';
          if (d.visible === false) {
            break;
          }
          console.log(
            tableRow(
              `--${c}`,
              makeDescription(c, d),
              d.enum ? d.enum.join(' \\| ') : d.type,
              u.toString()
            )
          );
        }
      }
    } else {
      console.log('```');
      console.log(`schematics gb-schematics:${k}`);
      console.log('```\n');
      console.log(v.description);
    }
    console.log();
  }
}

void main();
