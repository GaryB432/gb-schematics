import { basename, dirname, join, normalize, strings, } from '@angular-devkit/core';
import { MergeStrategy, apply, applyTemplates, chain, mergeWith, move, url, } from '@angular-devkit/schematics';
import { makeTestRoute } from './utils.js';
function parseName(path, name) {
    const nameWithoutPath = basename(normalize(name));
    const namePath = dirname(join(normalize(path), name));
    return {
        name: nameWithoutPath,
        path: normalize('/' + namePath),
    };
}
function normalizeOptions(o) {
    const path = o.path ?? '';
    const style = o.style ?? 'css';
    const load = o.load ?? 'none';
    const skipTests = o.skipTests ?? false;
    const projectRoot = o.projectRoot ?? '.';
    return { ...o, path, style, skipTests, load, projectRoot };
}
export default function (opts) {
    return async (tree, context) => {
        const options = normalizeOptions(opts);
        if (!tree.exists(join(options.projectRoot, 'svelte.config.js'))) {
            context.logger.warn('no svelte configuration');
        }
        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const templateSource = apply(url(join('.', 'files', 'load', options.load)), [
            applyTemplates({
                ...strings,
                ...options,
            }),
            move(join(options.projectRoot, 'src', 'routes', parsedPath.path, parsedPath.name)),
        ]);
        const route = makeTestRoute(options.path, options.name);
        const testSource = apply(url('./files/test'), [
            applyTemplates({
                ...strings,
                ...options,
                route,
            }),
            move(join(options.projectRoot, 'tests', parsedPath.path)),
        ]);
        const rules = [
            mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict),
        ];
        if (!options.skipTests) {
            rules.push(mergeWith(testSource, MergeStrategy.AllowOverwriteConflict));
        }
        return chain(rules);
    };
}
//# sourceMappingURL=index.js.map