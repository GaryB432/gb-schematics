/* eslint-disable */
/* from /home/gary/repos/gb-schematics/libs/schematics/src/sveltekit-route/schema.json
        GB Schematics SveltekitRoute Options Schema
    */

/**
 * Creates a new, generic route in the given or default project.
 */
export interface GBSchematicsSveltekitRouteOptionsSchema {
  /**
   * The path at which to create the route file, relative to the projectRoot. Default is a folder with the same name as the route in the project root.
   */
  path?: string;
  /**
   * The name of the route.
   */
  name: string;
  /**
   * The value of style element lang attribute
   */
  style?: "css" | "scss" | "none";
  /**
   * Do not create "spec.ts" test files for the new route.
   */
  skipTests?: boolean;
  /**
   * Create an endpoint handler for your route.
   */
  endpoint?: boolean;
  /**
   * The path to your project root, relative to the current workspace. Default is workingDirectory
   */
  projectRoot?: string;
}
