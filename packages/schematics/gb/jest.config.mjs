/* eslint-disable */
import { defaults } from 'jest-config';

// TODO clean up
export const ersatzPreset = {
  // This is one of the patterns that jest finds by default https://jestjs.io/docs/configuration#testmatch-arraystring
  testMatch: ['**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  // resolver: '@nx/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'mts', 'mjs', 'cts', 'cjs', 'html'],
  coverageReporters: ['html'],
  // transform: {
  //   '^.+\\.(ts|js|mts|mjs|cts|cjs|html)$': [
  //     'ts-jest',
  //     { tsconfig: '<rootDir>/tsconfig.spec.json' },
  //   ],
  // },
  testEnvironment: 'node',

  // testEnvironmentOptions: {
  //   customExportConditions: ['node', 'require', 'default'],
  // },
};

// import { defaults } from "jest-config";

// // console.log(defaults);

// export default {
//   ...defaults,

//   injectGlobals: false,
//   listTests: true,

//   testEnvironment: 'jest-environment-node',

//   // Define patterns for test files
//   testMatch: ['**/*spec.ts'],

//   // Configure transformations for different file types
//   transform: {
//     '^.+\\.mjs$': 'babel-jest', // Example: Using babel-jest for .mjs files
//     // Add other transformations as needed (e.g., for TypeScript with ts-jest)
//   },

//   // Set up module name mapping for imports
//   moduleNameMapper: {
//     '^@/(.*)$': '<rootDir>/src/$1', // Example: Alias for src directory
//   },

//   // Other Jest configuration options
//   // setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'], // Example: Setup file
//   collectCoverage: true,
//   coverageDirectory: 'coverage',
// };

// /* eslint-disable */
// export default {
//   displayName: 'blockchain',
//   preset: '../../jest.preset.js',
//   testEnvironment: 'node',
//   transform: {
//     '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
//   },
//   moduleFileExtensions: ['ts', 'js', 'html'],
//   coverageDirectory: '../../coverage/libs/blockchain',
// };

export default {
  ...defaults,
  ...ersatzPreset,
  displayName: '@gb-schematics/gb',
  verbose: true,
  injectGlobals: true,
  testMatch: ['**/*_spec.ts'],
  // preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '<rootDir>/../../../coverage/packages/schemtics/gb',
  // setupFilesAfterEnv:['<rootDir>/setupTests.js']
};
