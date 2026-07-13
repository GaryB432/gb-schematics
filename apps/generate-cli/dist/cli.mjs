import { createRequire } from "node:module";
import { intro, log, note, outro } from "@clack/prompts";
import { cac } from "cac";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
//#region src/resolve-collection.ts
/**
* Well-known short aliases that map to full npm package names.
* This lets callers pass `@gb-schematics` instead of `@gb-schematics/schematics`.
*/
const COLLECTION_ALIASES = { "@gb-schematics": "@gb-schematics/schematics" };
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
async function resolveCollection(collectionName) {
	const { pkgJsonPath, packageRoot } = await resolvePackageRoot(collectionName);
	let pkgJson;
	try {
		pkgJson = JSON.parse(await readFile(pkgJsonPath, "utf-8"));
	} catch (cause) {
		throw new Error(`Failed to parse package.json at "${pkgJsonPath}": ${cause instanceof Error ? cause.message : String(cause)}`);
	}
	const schematicsField = pkgJson["schematics"];
	if (!schematicsField) throw new Error(`Package at "${packageRoot}" does not have a "schematics" field in package.json.`);
	const collectionJsonPath = resolve(packageRoot, schematicsField);
	const collectionDir = dirname(collectionJsonPath);
	let collection;
	try {
		collection = JSON.parse(await readFile(collectionJsonPath, "utf-8"));
	} catch (cause) {
		throw new Error(`Failed to parse collection.json at "${collectionJsonPath}": ${cause instanceof Error ? cause.message : String(cause)}`);
	}
	return {
		packageRoot,
		collectionDir,
		collection
	};
}
async function resolvePackageRoot(collectionName) {
	if (collectionName.startsWith(".") || isAbsolute(collectionName)) {
		const packageRoot = resolve(collectionName);
		return {
			pkgJsonPath: join(packageRoot, "package.json"),
			packageRoot
		};
	}
	const resolved = COLLECTION_ALIASES[collectionName] ?? collectionName;
	const require = createRequire(import.meta.url);
	let pkgJsonPath;
	try {
		pkgJsonPath = require.resolve(`${resolved}/package.json`);
	} catch {
		throw new Error(`Cannot find collection package "${resolved}". Make sure it is installed.`);
	}
	const packageRoot = dirname(pkgJsonPath);
	return {
		pkgJsonPath,
		packageRoot
	};
}
//#endregion
//#region src/resolve-schema.ts
/**
* Loads and parses the JSON Schema file referenced by a collection entry.
*
* @param collectionDir  Absolute path to the directory that contains
*                       `collection.json` — schema paths are resolved relative
*                       to this directory.
* @param schemaRelativePath  Value of the `schema` field from the collection
*                            entry (e.g. `"./module/schema.json"`).
*/
async function resolveSchema(collectionDir, schemaRelativePath) {
	const schemaPath = resolve(collectionDir, schemaRelativePath);
	let contents;
	try {
		contents = await readFile(schemaPath, "utf-8");
	} catch (cause) {
		throw new Error(`Cannot read schema file at "${schemaPath}": ${cause instanceof Error ? cause.message : String(cause)}`);
	}
	try {
		return JSON.parse(contents);
	} catch (cause) {
		throw new Error(`Failed to parse schema JSON at "${schemaPath}": ${cause instanceof Error ? cause.message : String(cause)}`);
	}
}
//#endregion
//#region src/cli.ts
const cli = cac("generate");
cli.command("<schematic>", "Run a schematic from the resolved collection").option("--collection <name>", "Collection package name or local path (default: @gb-schematics/schematics)", { default: "@gb-schematics/schematics" }).option("--name <name>", "Name of the item to generate").option("--kind <kind>", "Kind of item (e.g. class | values)").option("--directory <path>", "Directory to create the files in").option("--source-root <path>", "Project source root path").option("--dry-run", "Run without creating files").option("--verbose", "Show verbose debug output").action(async (schematic, flags) => {
	const collectionName = flags["collection"];
	const verbose = Boolean(flags["verbose"]);
	intro(`generate — Milestone 1`);
	try {
		const resolved = await resolveCollection(collectionName);
		const entry = resolved.collection.schematics[schematic];
		if (!entry) {
			const available = Object.keys(resolved.collection.schematics).join(", ");
			log.error(`Unknown schematic "${schematic}". Available: ${available}`);
			process.exit(1);
		}
		const schema = await resolveSchema(resolved.collectionDir, entry.schema);
		const properties = schema.properties ?? {};
		const required = schema.required ?? [];
		const xPrompts = {};
		for (const [k, v] of Object.entries(properties)) if (v["x-prompt"] !== void 0) xPrompts[k] = v["x-prompt"];
		note([
			`Collection : ${collectionName}`,
			`Package    : ${resolved.packageRoot}`,
			`Schematic  : ${schematic}`,
			`Schema     : ${entry.schema}`,
			`Properties : ${Object.keys(properties).join(", ")}`,
			`Required   : ${required.join(", ") || "(none)"}`,
			`x-prompts  : ${Object.keys(xPrompts).join(", ") || "(none)"}`
		].join("\n"), "Resolved schema summary");
		if (verbose) {
			log.info("Full schema properties:");
			for (const [name, prop] of Object.entries(properties)) {
				const parts = [];
				if (prop.type) parts.push(`type=${Array.isArray(prop.type) ? prop.type.join("|") : prop.type}`);
				if (prop.enum) parts.push(`enum=[${prop.enum.join(", ")}]`);
				if (prop.default !== void 0) parts.push(`default=${String(prop.default)}`);
				if (prop["x-prompt"]) {
					const msg = typeof prop["x-prompt"] === "string" ? prop["x-prompt"] : prop["x-prompt"].message ?? "";
					parts.push(`x-prompt="${msg}"`);
				}
				log.info(`  ${name}: ${parts.join(", ")}`);
			}
		}
		outro("Collection & schema resolved successfully (Milestone 1 ✓)");
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		log.error(message);
		if (verbose && error instanceof Error && error.stack) log.error(error.stack);
		process.exit(1);
	}
});
cli.help();
cli.on("command:*", () => {
	console.error(`Unknown command: ${cli.args.join(" ")}`);
	console.error("Run with --help to see available options.");
	process.exit(1);
});
cli.parse();
//#endregion
export {};
