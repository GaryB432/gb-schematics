import { basename, dirname, join, normalize, strings, } from '@angular-devkit/core';
import { MergeStrategy, apply, applyTemplates, mergeWith, move, url, } from '@angular-devkit/schematics';
function parseName(path, name) {
    const nameWithoutPath = basename(normalize(name));
    const namePath = dirname(join(normalize(path), name));
    return {
        name: nameWithoutPath,
        path: normalize('/' + namePath),
    };
}
function normalizeOptions(options) {
    return { ...options };
}
export default function (options) {
    const opts = normalizeOptions(options);
    const directory = opts.directory ?? 'lib/components';
    const projectRoot = (opts.projectRoot ?? '.');
    const parsedPath = parseName(directory, options.name);
    opts.name = parsedPath.name;
    return (tree, context) => {
        if (!tree.exists(normalize(join(projectRoot, 'svelte.config.js')))) {
            context.logger.warn(`no svelte configuration found in '${projectRoot}'`);
        }
        const templateSource = apply(url('./files/v2/runes'), [
            applyTemplates({ ...opts, ...strings }),
            move(normalize(join(projectRoot, 'src', parsedPath.path))),
        ]);
        return mergeWith(templateSource, MergeStrategy.AllowOverwriteConflict);
    };
}
//# sourceMappingURL=index.js.map