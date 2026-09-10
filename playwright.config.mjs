import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'tests',timeout:45000,fullyParallel:true,workers:2,retries:0,
 reporter:[['list'],['json',{outputFile:'test-results/report.json'}]],
 use:{baseURL:'http://127.0.0.1:4173',locale:'fr-FR',colorScheme:'light',screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}}],
 webServer:{command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});
