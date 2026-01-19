/* eslint-disable */
/* from /home/gary/repos/gb-schematics/libs/schematics/src/bump/schema.json

S E R I O U S L Y :
   S A V E D   F R O M   V E R S I O N   4
   P L E A S E   D O   C O N T I N U E   T O   I G N O R E

        GB Schematics Bump Options Schema
    */

export interface GBSchematicsBumpOptionsSchema {
  /**
   * Which part to increment
   */
  part:
    | 'major'
    | 'premajor'
    | 'minor'
    | 'preminor'
    | 'patch'
    | 'prepatch'
    | 'prerelease';
  /**
   * Skip package installation
   */
  skipInstall?: boolean;
}
