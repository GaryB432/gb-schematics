import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@appliances': resolve(__dirname, '../../packages/appliances/src'),
    },
  },
  build: {
    sourcemap: true,
  },
});
