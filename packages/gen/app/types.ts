export type Language = string;
export type ModuleKind = string;
export type ModuleOptions = {
  /**
   * The directory to create the module, relative to the project source.
   */
  directory?: string;
  /**
   * When using Vitest, separate spec files will not be generated and instead will be included within the source files.
   */
  inSourceTests?: boolean;
  /**
   * kind of module
   */
  kind?: ModuleKind;
  /**
   * The language to use.
   */
  language?: Language;
  /**
   * The name of the module.
   */
  name: string;
  /**
   * Use pascal case file names for class module.
   */
  pascalCaseFiles?: boolean;
  /**
   * Test runner to use for unit tests.
   */
  testRunner?: TestRunner;
}; // type Languages = (typeof languages)[number];

export type TestRunner = string;
