const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    responseTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  env: {
    apiUrl: process.env.CYPRESS_apiUrl || 'http://localhost:8080',
  },
});
