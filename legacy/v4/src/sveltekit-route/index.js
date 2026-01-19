"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function deBracket(s) {
    return s.replace(/[[\]]+/g, '_');
}
function makeTestRoute(path, name) {
    return (0, core_1.normalize)('/'.concat(path).split('/').concat(name).map(deBracket).join('/'));
}
function parseName(path, name) {
    const nameWithoutPath = (0, core_1.basename)((0, core_1.normalize)(name));
    const namePath = (0, core_1.dirname)((0, core_1.join)((0, core_1.normalize)(path), name));
    return {
        name: nameWithoutPath,
        path: (0, core_1.normalize)('/' + namePath),
    };
}
function normalizeOptions(o) {
    const path = o.path ?? '';
    const style = o.style ?? 'none';
    const endpoint = o.endpoint ?? false;
    const skipTests = o.skipTests ?? false;
    const projectRoot = o.projectRoot ?? '.';
    return { ...o, path, style, skipTests, endpoint, projectRoot };
}
function main(opts) {
    return async (tree, context) => {
        const options = normalizeOptions(opts);
        if (!tree.exists((0, core_1.join)(options.projectRoot, 'svelte.config.js'))) {
            context.logger.warn('no svelte configuration');
        }
        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files/v2/runes'), [
            (0, schematics_1.applyTemplates)({
                ...core_1.strings,
                ...options,
            }),
            (0, schematics_1.move)((0, core_1.join)(options.projectRoot, 'src', 'routes', parsedPath.path, parsedPath.name)),
        ]);
        const route = makeTestRoute(options.path, options.name);
        const testSource = (0, schematics_1.apply)((0, schematics_1.url)('./files/test'), [
            (0, schematics_1.applyTemplates)({
                ...core_1.strings,
                ...options,
                route,
            }),
            (0, schematics_1.move)((0, core_1.join)(options.projectRoot, 'tests', parsedPath.path)),
        ]);
        const rules = [
            (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.AllowOverwriteConflict),
        ];
        if (!options.skipTests) {
            rules.push((0, schematics_1.mergeWith)(testSource, schematics_1.MergeStrategy.AllowOverwriteConflict));
        }
        return (0, schematics_1.chain)(rules);
    };
}
