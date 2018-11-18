// tslint:disable:no-implicit-dependencies no-console no-submodule-imports forin
import { readFile, writeFile } from 'fs';
import { dirname, format, parse, resolve } from 'path';

import { Schema } from '@angular-devkit/schematics/collection-schema';
import { compileFromFile, Options } from 'json-schema-to-typescript';

interface Package {
  schematics: string;
}

async function readJSONFile<T>(path: string): Promise<T> {
  return new Promise<T>((res, reject) => {
    readFile(path, (err, buff) => {
      if (err) {
        reject(err);
      } else {
        const obj = JSON.parse(buff.toString()) as T;
        res(obj);
      }
    });
  });
}

async function main() {
  const pkg = await readJSONFile<Package>('package.json');
  const dname = dirname(pkg.schematics);
  const folder = resolve(process.cwd(), pkg.schematics);
  const coll = await readJSONFile<Schema>(folder);

  for (const schematicName in coll.schematics) {
    const schematic = coll.schematics[schematicName];
    if (schematic.schema) {
      const schemaPath = resolve(dname, schematic.schema);
      const { dir, name, ext } = { ...parse(schemaPath), ext: '.d.ts' };
      const defPath = format({ dir, name, ext });
      const options: Partial<Options> = {
        bannerComment:
          '/**\n* run your build script to regenerate this file.\n*/',
        style: {
          bracketSpacing: false,
          printWidth: 120,
          semi: true,
          singleQuote: false,
          tabWidth: 2,
          trailingComma: 'none',
          useTabs: false,
        },
      };
      compileFromFile(schemaPath, options).then(ts => {
        writeFile(defPath, ts, { encoding: 'utf-8' }, (err) => {
          if (!err) {
            console.log(`\x1b[32m${schematicName}: ${schematic.description}\x1b[0m`);
          }
        })
      });
    }
  }
}

main();

