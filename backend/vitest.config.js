// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],  // executado antes de cada arquivo de teste
    env: {
      NODE_ENV: 'test',
    },
    // roda os arquivos em série para não ter conflito de banco
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    maxWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/swagger.js'],
    },
  },
});