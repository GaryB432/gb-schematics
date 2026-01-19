"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bump = bump;
const tasks_1 = require("@angular-devkit/schematics/tasks");
const semver_1 = __importDefault(require("semver"));
function bump(options) {
    return (tree, context) => {
        const packageJsonPath = './package.json';
        const json = tree.read(packageJsonPath);
        if (json) {
            const pj = JSON.parse(json.toString());
            const oldOne = pj.version;
            const newOne = semver_1.default.inc(pj.version, options.part) ?? pj.version;
            pj.version = newOne;
            tree.overwrite(packageJsonPath, `${JSON.stringify(pj, null, 2)}\n`);
            context.logger.info(`${oldOne} ➡️ ${newOne}`);
            if (!options.skipInstall) {
                context.addTask(new tasks_1.NodePackageInstallTask());
            }
        }
        return tree;
    };
}
