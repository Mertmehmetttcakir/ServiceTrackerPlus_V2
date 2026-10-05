import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// Vite + React yapılandırması
// - rollup-plugin-visualizer ile bundle analiz desteği
// - manualChunks ile vendor paketlerini parçalara bölerek ilk yükleme süresini iyileştirme
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/bundle-report.html',
      open: false, // İhtiyaç halinde build sonrası manuel olarak açılabilir
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Chunk boyutu uyarıları için üst limit (KB)
    chunkSizeWarningLimit: 1000,
  },
});




