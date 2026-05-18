import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '../framework/src/nexus': path.resolve(__dirname, '../framework/src/nexus.ts'),
    },
  },
  server: {
    port: 5173,
  },
});