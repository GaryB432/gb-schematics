import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

// const q = defineConfig({
//   test: {
//     globals: true,
//     include: ['**/*.spec.ts'],
//   },
// });
// console.log(q);

export default defineConfig({
  test: {
    // Global test options can go here, outside the `projects` array.
    // Vitest will collect coverage from all projects when run from the root.
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text'],
      include: ['packages/*/src/**', 'tools/*/src/**'],
    },

    projects: [
      {
        test: {
          name: 'bakery', // A unique name for the project
          include: [
            'packages/bakery/*/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            'home/gary/repos/gb-schematics/packages/bakery/src/counter.spec.ts',
            'packages/bakery/src/counter.spec.ts',
            'src/counter.spec.ts',
            '**/*.spec.ts',
          ],
          globals: true,
          environment: 'node',
        },
      },

      {
        test: {
          name: 'appliances', // A unique name for the project
          include: [
            'packages/appliances/*/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
          ],
          globals: true,
          environment: 'node',
        },
      },

      // Add other workspaces here following the same pattern
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
