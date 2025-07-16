// Custom Cypress commands

// Command to mock Supabase
Cypress.Commands.add('mockSupabase', (data = [], error = null) => {
  cy.intercept('POST', '**/rest/v1/rpc/**', { body: { data, error } })
  cy.intercept('GET', '**/rest/v1/posts**', { body: data, status: error ? 400 : 200 })
})

// Command to visit newsletter archives with mocked data
Cypress.Commands.add('visitNewsletterArchives', (mockPosts = []) => {
  cy.mockSupabase(mockPosts)
  cy.visit('/newsletter-archives')
})

// Command to wait for page to load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="section"]', { timeout: 10000 }).should('be.visible')
})
