"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function parseName(path, name) {
    const nameWithoutPath = (0, core_1.basename)((0, core_1.normalize)(name));
    const namePath = (0, core_1.dirname)((0, core_1.join)((0, core_1.normalize)(path), name));
    return {
        name: nameWithoutPath,
        path: (0, core_1.normalize)('/' + namePath),
    };
}
function normalizeOptions(options) {
    return { ...options };
}
function main(options) {
    const opts = normalizeOptions(options);
    const directory = opts.directory ?? 'lib/components';
    const projectRoot = (opts.projectRoot ?? '.');
    const parsedPath = parseName(directory, options.name);
    opts.name = parsedPath.name;
    return (tree, context) => {
        if (!tree.exists((0, core_1.normalize)((0, core_1.join)(projectRoot, 'svelte.config.js')))) {
            context.logger.warn(`no svelte configuration found in '${projectRoot}'`);
        }
        const templateSource = (0, schematics_1.apply)((0, schematics_1.url)('./files/v2/runes'), [
            (0, schematics_1.applyTemplates)({ ...opts, ...core_1.strings }),
            (0, schematics_1.move)((0, core_1.normalize)((0, core_1.join)(projectRoot, 'src', parsedPath.path))),
        ]);
        return (0, schematics_1.mergeWith)(templateSource, schematics_1.MergeStrategy.AllowOverwriteConflict);
    };
}
