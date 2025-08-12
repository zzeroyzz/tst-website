/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      // implement node event listeners here
    },

    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
