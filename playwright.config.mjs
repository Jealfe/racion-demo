import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'**/*.spec.mjs',workers:1,
  timeout:30000,use:{headless:true},
  webServer:{command:'node tests/serve.mjs',url:'http://127.0.0.1:8000',reuseExistingServer:!process.env.CI},
});
