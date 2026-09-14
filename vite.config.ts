import { defineConfig } from 'vite';

export default defineConfig({
  // The build is uploaded to PHP shared hosting either at / or /lintas-malam/.
  base: './',
  build: {
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true,
  },
});
