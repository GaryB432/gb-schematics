"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseName = parseName;
exports.gmodule = gmodule;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const globalTestRunners = {
    jest: '@jest/globals',
    native: 'node:test',
    none: '',
    vitest: 'vitest',
};
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
function gmodule(options) {
    const opts = normalizeOptions(options);
    const directory = opts.directory ?? '';
    const sourceRoot = opts.sourceRoot ?? '';
    const parsedPath = parseName(directory, options.name);
    opts.name = parsedPath.name;
    const modulePath = parsedPath.path;
    const moduleName = opts.name;
    const srcPath = './';
    const kind = options.kind || 'values';
    const globalTestModule = globalTestRunners[opts.unitTestRunner ?? 'none'];
    const moduleFileName = options.pascalCaseFiles
        ? core_1.strings.classify(moduleName)
        : core_1.strings.dasherize(moduleName);
    return (0, schematics_1.chain)([
        (0, schematics_1.mergeWith)((0, schematics_1.apply)((0, schematics_1.url)(`./files/${kind}`), [
            opts.unitTestRunner === 'none'
                ? (0, schematics_1.filter)((path) => !path.endsWith('.spec.__language__.template'))
                : (0, schematics_1.noop)(),
            (0, schematics_1.applyTemplates)({
                ...opts,
                ...core_1.strings,
                globalTestModule,
                modulePath,
                moduleName,
                moduleFileName,
                srcPath,
            }),
            (0, schematics_1.move)(sourceRoot),
        ])),
    ]);
}
