/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    actionTimeout: 15 * 1000,
    navigationTimeout: 15 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm dev:api',
      url: 'http://localhost:4000/health',
      reuseExistingServer: !process.env.CI,
      cwd: '../../',
      timeout: 180 * 1000,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        MONGO_URI: process.env.MONGO_URI_E2E || 'mongodb://localhost:27017/barber_reservation_e2e',
        JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-for-e2e',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-gemini-key-for-e2e',
        CORS_ORIGINS: 'http://localhost:5173,http://localhost:5174',
      },
    },
    {
      command: 'pnpm dev:web-admin',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: '../../',
      timeout: 180 * 1000,
      env: {
        ...process.env,
        VITE_API_URL: 'http://localhost:4000',
      },
    },
    {
      command: 'pnpm dev:web-user',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      cwd: '../../',
      timeout: 180 * 1000,
      env: {
        ...process.env,
        VITE_API_URL: 'http://localhost:4000',
      },
    },
  ],
});
