import { basename, dirname, join, normalize, } from '@angular-devkit/core';
export function parseName(path, name) {
    const nameWithoutPath = basename(normalize(name));
    const namePath = dirname(join(normalize(path), name));
    return {
        name: nameWithoutPath,
        path: normalize('/' + namePath),
    };
}
//# sourceMappingURL=parse-name.js.map