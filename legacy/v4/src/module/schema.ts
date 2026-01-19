/* eslint-disable */
/* from /home/gary/repos/gb-schematics/libs/schematics/src/module/schema.json
        GB Schematics Module Options Schema
    */

/**
 * Creates a new value or class module.
 */
export interface GBSchematicsModuleOptionsSchema {
  /**
   * The name of the module.
   */
  name: string;
  /**
   * The directory to create the module, relative to the project source.
   */
  directory?: string;
  /**
   * kind of module
   */
  kind?: "class" | "values";
  /**
   * Test runner to use for unit tests.
   */
  unitTestRunner?: "jest" | "vitest" | "native" | "none";
  /**
   * When using Vitest, separate spec files will not be generated and instead will be included within the source files.
   */
  inSourceTests?: boolean;
  /**
   * Use pascal case file names for class module.
   */
  pascalCaseFiles?: boolean;
  /**
   * The language to use.
   */
  language?: "ts" | "js";
  /**
   * The path to your project's source root
   */
  sourceRoot?: string;
}
