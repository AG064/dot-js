import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '../framework/src/nexus': path.resolve(__dirname, '../framework/dist/nexus.js'),
    },
  },
  server: {
    port: 5173,
  },
});