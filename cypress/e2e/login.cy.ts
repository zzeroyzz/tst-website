// cypress/e2e/login.cy.ts

describe('Login Page', () => {
  beforeEach(() => {
    // Mock Supabase auth API calls
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: 'admin@example.com'
        }
      }
    }).as('loginSuccess')

    // Mock error response
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials'
      }
    }).as('loginError')
  })

  it('should display the login page elements', () => {
    cy.visit('/login')

    // Check logo
    cy.get('img[alt="TST logo"]').should('be.visible')

    // Check title
    cy.contains('h1', 'Admin Login').should('be.visible')

    // Check form elements
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[placeholder="Email"]').should('be.visible')

    cy.get('input[type="password"]').should('be.visible')
    cy.get('input[placeholder="Password"]').should('be.visible')

    cy.get('button[type="submit"]').should('be.visible')
    cy.contains('button', 'Login').should('be.visible')
  })

  it('should have required form validation', () => {
    cy.visit('/login')

    // Try to submit empty form
    cy.get('button[type="submit"]').click()

    // HTML5 validation should prevent submission
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')
  })

  it('should require valid email format', () => {
    cy.visit('/login')

    // Enter invalid email
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // HTML5 validation should catch invalid email
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('should handle successful login', () => {
    // Mock successful login
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: 'admin@example.com'
        }
      }
    }).as('loginSuccess')

    cy.visit('/login')

    // Fill in valid credentials
    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('correctpassword')

    // Submit form
    cy.get('button[type="submit"]').click()

    // Wait for API call
    cy.wait('@loginSuccess')

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should display error message on login failure', () => {
    // Mock failed login
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials'
      }
    }).as('loginError')

    cy.visit('/login')

    // Fill in invalid credentials
    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('wrongpassword')

    // Submit form
    cy.get('button[type="submit"]').click()

    // Wait for API call
    cy.wait('@loginError')

    // Should display error message
    cy.contains('Error:').should('be.visible')
    cy.contains('Invalid login credentials').should('be.visible')

    // Error message should have proper styling
    cy.get('.text-red-500').should('be.visible')
    cy.get('.bg-red-100').should('be.visible')

    // Should stay on login page
    cy.url().should('include', '/login')
  })

  it('should clear error message on new submission', () => {
    // First, trigger an error
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 400,
      body: {
        error: 'invalid_grant',
        error_description: 'Invalid login credentials'
      }
    }).as('loginError')

    cy.visit('/login')

    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginError')

    // Error should be visible
    cy.contains('Invalid login credentials').should('be.visible')

    // Now mock success and try again
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-access-token',
        user: { id: 'mock-user-id', email: 'admin@example.com' }
      }
    }).as('loginSuccess')

    // Change password and submit again
    cy.get('input[type="password"]').clear().type('correctpassword')
    cy.get('button[type="submit"]').click()

    // Error should be cleared (may happen before redirect)
    // Check that either error is gone OR we redirected
    cy.then(() => {
      cy.url().then((url) => {
        if (url.includes('/dashboard')) {
          // Successfully redirected
          expect(true).to.be.true
        } else {
          // Still on login page, error should be cleared
          cy.contains('Invalid login credentials').should('not.exist')
        }
      })
    })
  })

  it('should handle network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '**/auth/v1/token*', {
      forceNetworkError: true
    }).as('networkError')

    cy.visit('/login')

    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()

    // Should handle network error gracefully
    // Note: The exact error message depends on how Supabase handles network errors
    cy.get('.text-red-500').should('be.visible')
  })

  it('should handle form input changes correctly', () => {
    cy.visit('/login')

    // Type in email field
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="email"]').should('have.value', 'test@example.com')

    // Type in password field
    cy.get('input[type="password"]').type('mypassword')
    cy.get('input[type="password"]').should('have.value', 'mypassword')

    // Clear and retype
    cy.get('input[type="email"]').clear().type('new@example.com')
    cy.get('input[type="email"]').should('have.value', 'new@example.com')
  })

  it('should have proper form accessibility', () => {
    cy.visit('/login')

    // Check that form inputs have proper types
    cy.get('input[type="email"]').should('exist')
    cy.get('input[type="password"]').should('exist')
    cy.get('button[type="submit"]').should('exist')

    // Check placeholders for accessibility
    cy.get('input[placeholder="Email"]').should('exist')
    cy.get('input[placeholder="Password"]').should('exist')

    // Check that form is properly structured
    cy.get('form').within(() => {
      cy.get('input[type="email"]').should('exist')
      cy.get('input[type="password"]').should('exist')
      cy.get('button[type="submit"]').should('exist')
    })
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.visit('/login')

      // Check that elements are visible on mobile
      cy.get('img[alt="TST logo"]').should('be.visible')
      cy.contains('Admin Login').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.visit('/login')

      // Check tablet layout
      cy.get('img[alt="TST logo"]').should('be.visible')
      cy.contains('Admin Login').should('be.visible')
      cy.get('form').should('be.visible')
    })
  })

  describe('Visual Elements', () => {
    it('should display logo with correct attributes', () => {
      cy.visit('/login')

      // Next.js Image component transforms the src, so we just check it exists and is visible
      cy.get('img[alt="TST logo"]')
        .should('be.visible')
        .and('have.attr', 'alt', 'TST logo')
        .and('have.attr', 'src')
        // Just verify the src attribute exists and isn't empty
        .should('not.be.empty')
    })

    it('should have proper form styling', () => {
      cy.visit('/login')

      // Check that form has proper classes
      cy.get('form').should('have.class', 'flex')
      cy.get('form').should('have.class', 'flex-col')

      // Check button styling
      cy.get('button[type="submit"]').should('have.class', 'bg-tst-purple')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty email submission', () => {
      cy.visit('/login')

      // Only fill password
      cy.get('input[type="password"]').type('password123')
      cy.get('button[type="submit"]').click()

      // Should not submit due to required email
      cy.get('input[type="email"]:invalid').should('exist')
    })

    it('should handle empty password submission', () => {
      cy.visit('/login')

      // Only fill email
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('button[type="submit"]').click()

      // Should not submit due to required password
      cy.get('input[type="password"]:invalid').should('exist')
    })

    it('should handle very long error messages', () => {
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 400,
        body: {
          error: 'complex_error',
          error_description: 'This is a very long error message that should be displayed properly in the UI without breaking the layout or causing any visual issues'
        }
      }).as('longError')

      cy.visit('/login')

      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('password')
      cy.get('button[type="submit"]').click()

      cy.wait('@longError')

      // Long error should be visible and properly contained
      cy.get('.text-red-500').should('be.visible')
      cy.contains('This is a very long error message').should('be.visible')
    })
  })
})
