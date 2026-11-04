import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.js/,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  timeout: 30 * 1000,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8788',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...require('playwright-core').devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...require('playwright-core').devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...require('playwright-core').devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run cf:dev',
    url: 'http://localhost:8788',
    reuseExistingSubtitle: !process.env.CI,
    timeout: 120 * 1000,
  },
});