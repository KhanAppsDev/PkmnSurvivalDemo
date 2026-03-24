import { defineConfig } from 'vite';

export default defineConfig({
  base: './',   // relative paths — works on GitHub Pages
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
