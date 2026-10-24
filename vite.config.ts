import { defineConfig } from 'vitest/config';

// Relative Basis, damit die App unter https://<user>.github.io/<repo>/ ohne Anpassung läuft.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Die Lektionen machen den Grossteil des Bundles aus. Als eigener Chunk werden
    // App-Code und Inhalte getrennt gecacht.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.replace(/\\/g, '/').includes('/content/')) return 'inhalte';
        },
      },
    },
  },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
