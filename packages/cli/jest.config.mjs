/* eslint-disable */
import { defaults } from 'jest-config';

export const ersatzPreset = {
  testMatch: ['**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'mts', 'mjs', 'cts', 'cjs', 'html'],
  coverageReporters: ['html'],
  testEnvironment: 'node',
};

export default {
  ...defaults,
  ...ersatzPreset,
  displayName: '@gb-schematics/cli',
  verbose: true,
  injectGlobals: true,
  testMatch: ['**/*_spec.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '<rootDir>/../../../coverage/packages/cli'
};
