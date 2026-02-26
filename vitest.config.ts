import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: [
        'src/utils/**',
        'src/stores/**',
        'src/services/**',
        'src/components/**',
      ],
      exclude: [
        'src/components/ui/**',
        'src/**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src')),
    },
  },
})