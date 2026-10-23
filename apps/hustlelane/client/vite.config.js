import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project site: https://ditiromoabelo.github.io/DitiroPortfolio/hustlelane/
const base = process.env.VITE_BASE || '/DitiroPortfolio/hustlelane/';

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 5174,
    proxy: {
      '/api': { target: 'http://localhost:5002', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
