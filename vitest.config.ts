import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./__tests__/setup.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
      ],
      exclude: [
        '**/*.d.ts',
        '**/node_modules/**',
        '**/.next/**',
        '**/coverage/**',
        '**/dist/**',
        '**/__tests__/**',
        '**/e2e/**',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 80,
        statements: 80,
      },
    },

    // Test patterns
    include: [
      '**/__tests__/**/*.test.{js,jsx,ts,tsx}',
      '**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/e2e/**',
      '**/dist/**',
    ],

    // Performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Watch mode settings
    watch: false,

    // Reporter
    reporter: ['verbose', 'json', 'html'],

    // Timeout
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
