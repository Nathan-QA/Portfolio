import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: true, retries: 0,
  workers: process.env.CI ? 2 : undefined, timeout: 30000,
  reporter: [['list'], ['html', {open:'never'}]],
  use: {baseURL:'http://127.0.0.1:4173', trace:'retain-on-failure', screenshot:'only-on-failure'},
  webServer: {command:'npm run preview', url:'http://127.0.0.1:4173', reuseExistingServer:!process.env.CI},
  projects: [{name:'chromium', use:{...devices['Desktop Chrome'], viewport:{width:1440,height:1000}}}]
});
