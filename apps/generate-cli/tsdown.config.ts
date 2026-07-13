import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: 'esm',
  outDir: 'dist',
  platform: 'node',
  dts: false,
  clean: true,
});
