/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// CRA'dan göç: SPA + react-router korunur, build aracı Vite.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // lokal dev (bkz. yerel stack)
  },
  build: {
    outDir: 'build', // Dockerfile/nginx 'build' bekliyor — değişmesin
    // CSP'de script-src 'unsafe-inline' YOK → Vite inline modulepreload
    // polyfill'i üretmemeli (aksi halde sayfa CSP tarafından bloklanır).
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
