/* eslint-disable */
/* from /home/gary/repos/gb-schematics/libs/schematics/src/sveltekit-component/schema.json
        GB Schematics SveltekitComponent Options Schema
    */

export interface GBSchematicsSveltekitComponentOptionsSchema {
  /**
   * The name of the component.
   */
  name: string;
  /**
   * The directory to create the component, relative to your project source.
   */
  directory?: string;
  /**
   * Component script language (ts/js).
   */
  language?: "js" | "ts";
  /**
   * Component style language (css/scss).
   */
  style?: "css" | "scss";
  /**
   * Svelte App root directory
   */
  projectRoot?: string;
}
