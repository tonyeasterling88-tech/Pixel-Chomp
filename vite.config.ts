import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1400,
  },
  server: {
    host: true,
    port: 5173,
  },
});
