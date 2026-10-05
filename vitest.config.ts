import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/dist/**',
        '**/.{eslint,prettier}rc.{js,cjs,yml}',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    env: {
      VITE_SUPABASE_URL: 'https://mock-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components'),
      'hooks': path.resolve(__dirname, 'src/hooks'),
      'types': path.resolve(__dirname, 'src/types'),
      'services': path.resolve(__dirname, 'src/services'),
      'utils': path.resolve(__dirname, 'src/utils'),
      'lib': path.resolve(__dirname, 'src/lib'),
    },
  },
}); 