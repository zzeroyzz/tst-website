/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Ignore hydration errors globally
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  if (err.message.includes('Hydration failed')) {
    return false;
  }
  if (err.message.includes('hydration')) {
    return false;
  }
  if (err.message.includes('server rendered HTML')) {
    return false;
  }
  if (err.message.includes('client')) {
    return false;
  }
  return true;
});

Cypress.Commands.add('visitWithoutCookies', (url: string) => {
  // Set the cookie before visiting the page to prevent banner
  cy.setCookie('cookieConsent', 'accepted');
  cy.visit(url);
});

// Add API mocking commands
Cypress.Commands.add('mockContactAPI', () => {
  cy.intercept('POST', '/api/contact', { fixture: 'contact-success.json' }).as(
    'submitContact'
  );
  cy.intercept('POST', '/api/newsletter/subscribe', {
    fixture: 'newsletter-success.json',
  }).as('subscribeNewsletter');
});

Cypress.Commands.add('mockQuestionnaireAPI', () => {
  cy.intercept('GET', '/api/questionnaire/*', {
    fixture: 'questionnaire-contact.json',
  }).as('getQuestionnaire');
  cy.intercept('POST', '/api/questionnaire/*', {
    statusCode: 200,
    body: { message: 'Updated successfully' },
  }).as('submitQuestionnaire');
  cy.intercept('POST', '/api/schedule-consultation', {
    fixture: 'schedule-consultation-success.json',
  }).as('scheduleConsultation');
  cy.intercept('POST', '/api/appointment/booked-slots', {
    fixture: 'booked-slots-success.json',
  }).as('getBookedSlots');
});

Cypress.Commands.add('mockAllAPIs', () => {
  cy.mockContactAPI();
  cy.mockQuestionnaireAPI();
});

declare global {
  namespace Cypress {
    interface Chainable {
      visitWithoutCookies(url: string): Chainable<void>;
      mockContactAPI(): Chainable<void>;
      mockQuestionnaireAPI(): Chainable<void>;
      mockAllAPIs(): Chainable<void>;
    }
  }
}
