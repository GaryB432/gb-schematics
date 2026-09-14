import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve as resolvePath } from 'node:path';

export interface CollectionEntry {
  description?: string;
  schema: string;
  factory: string;
}

export interface Collection {
  schematics: Record<string, CollectionEntry>;
}

export interface ResolvedCollection {
  /** Absolute path to the package root (directory containing package.json). */
  packageRoot: string;
  /** Absolute path to the directory containing collection.json. Schema paths are relative to this. */
  collectionDir: string;
  collection: Collection;
}

/**
 * Well-known short aliases that map to full npm package names.
 * This lets callers pass `@gb-schematics` instead of `@gb-schematics/schematics`.
 */
const COLLECTION_ALIASES: Record<string, string> = {
  '@gb-schematics': '@gb-schematics/schematics',
};

/**
 * Resolves a collection by npm package name or by a local file-system path.
 *
 * - If `collectionName` starts with `.` or `/`, or is an absolute path, it is
 *   treated as a path to the package root directory (the folder that contains
 *   `package.json`).
 * - Otherwise it is looked up as an npm package via Node module resolution.
 *
 * The resolved package must have a `schematics` field in its `package.json`
 * pointing to the `collection.json` file (relative to the package root).
 */
export async function resolveCollection(
  collectionName: string
): Promise<ResolvedCollection> {
  const { pkgJsonPath, packageRoot } =
    await resolvePackageRoot(collectionName);

  let pkgJson: Record<string, unknown>;
  try {
    pkgJson = JSON.parse(await readFile(pkgJsonPath, 'utf-8')) as Record<
      string,
      unknown
    >;
  } catch (cause) {
    throw new Error(
      `Failed to parse package.json at "${pkgJsonPath}": ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }

  const schematicsField = pkgJson['schematics'] as string | undefined;
  if (!schematicsField) {
    throw new Error(
      `Package at "${packageRoot}" does not have a "schematics" field in package.json.`
    );
  }

  const collectionJsonPath = resolvePath(packageRoot, schematicsField);
  const collectionDir = dirname(collectionJsonPath);

  let collection: Collection;
  try {
    collection = JSON.parse(
      await readFile(collectionJsonPath, 'utf-8')
    ) as Collection;
  } catch (cause) {
    throw new Error(
      `Failed to parse collection.json at "${collectionJsonPath}": ${cause instanceof Error ? cause.message : String(cause)}`
    );
  }

  return { packageRoot, collectionDir, collection };
}

async function resolvePackageRoot(
  collectionName: string
): Promise<{ pkgJsonPath: string; packageRoot: string }> {
  if (collectionName.startsWith('.') || isAbsolute(collectionName)) {
    // Local path — treat as package root
    const packageRoot = resolvePath(collectionName);
    const pkgJsonPath = join(packageRoot, 'package.json');
    return { pkgJsonPath, packageRoot };
  }

  // npm package name — apply aliases then use Node resolution
  const resolved = COLLECTION_ALIASES[collectionName] ?? collectionName;
  const require = createRequire(import.meta.url);

  let pkgJsonPath: string;
  try {
    pkgJsonPath = require.resolve(`${resolved}/package.json`);
  } catch {
    throw new Error(
      `Cannot find collection package "${resolved}". Make sure it is installed.`
    );
  }

  const packageRoot = dirname(pkgJsonPath);
  return { pkgJsonPath, packageRoot };
}
