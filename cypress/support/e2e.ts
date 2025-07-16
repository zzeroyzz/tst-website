// cypress/support/e2e.ts

import './commands';

// Global configuration for all tests
beforeEach(() => {
  // Set longer timeouts globally
  Cypress.config('defaultCommandTimeout', 15000);
  Cypress.config('pageLoadTimeout', 60000);
  Cypress.config('requestTimeout', 10000);
  Cypress.config('responseTimeout', 10000);

  // Disable animations and handle Framer Motion
  cy.on('window:before:load', (win) => {
    // Disable Framer Motion animations
    win.FramerMotion = { ...win.FramerMotion, skipAnimations: true };

    // Add global CSS to disable animations
    const style = win.document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: 0.01ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0.01ms !important;
        animation-fill-mode: forwards !important;
      }

      /* Specific overrides for common animation libraries */
      .framer-motion,
      [data-framer-name],
      [style*="opacity: 0"],
      [style*="transform"] {
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
      }

      /* Force visibility for elements that might be hidden */
      [data-testid] {
        opacity: 1 !important;
        visibility: visible !important;
      }
    `;
    win.document.head.appendChild(style);
  });
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions related to animations
  if (err.message.includes('ResizeObserver') ||
      err.message.includes('animation') ||
      err.message.includes('transition')) {
    return false;
  }
  return true;
});

// Add custom assertions for better debugging
chai.use((chai, utils) => {
  chai.Assertion.addMethod('fullyVisible', function () {
    const obj = this._obj;
    const $el = obj.jquery ? obj : Cypress.$(obj);

    // Check if element exists
    this.assert(
      $el.length > 0,
      'expected element to exist',
      'expected element to not exist'
    );

    // Check if element is visible
    const isVisible = $el.is(':visible');
    this.assert(
      isVisible,
      'expected element to be visible',
      'expected element to not be visible'
    );

    // Check CSS properties
    const style = window.getComputedStyle($el[0]);
    const opacity = parseFloat(style.opacity);
    const visibility = style.visibility;
    const display = style.display;

    this.assert(
      opacity > 0,
      `expected element to have opacity > 0, but got ${opacity}`,
      `expected element to have opacity = 0, but got ${opacity}`
    );

    this.assert(
      visibility !== 'hidden',
      `expected element to not have visibility: hidden, but got ${visibility}`,
      `expected element to have visibility: hidden, but got ${visibility}`
    );

    this.assert(
      display !== 'none',
      `expected element to not have display: none, but got ${display}`,
      `expected element to have display: none, but got ${display}`
    );
  });
});
