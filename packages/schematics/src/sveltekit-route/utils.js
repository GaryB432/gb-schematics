import { normalize } from '@angular-devkit/core';
function deBracket(s) {
    return s.replace(/[[\]]+/g, '_');
}
export function makeTestRoute(path, name) {
    return normalize('/'.concat(path).split('/').concat(name).map(deBracket).join('/'));
}
//# sourceMappingURL=utils.js.map