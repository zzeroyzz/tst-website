describe('Contact Page', () => {
  beforeEach(() => {
    cy.mockAllAPIs();
    cy.visitWithoutCookies('/contact');
  });

  it('should load the contact page successfully', () => {
    cy.contains('Book a Consultation').should('be.visible');
  });

  it('should display the contact form', () => {
    cy.get('form').should('be.visible');
  });

  it('should allow filling out and submitting the contact form', () => {
    // Fill out all form fields
    cy.get('input[placeholder*="Your name"]')
      .filter(':visible')
      .first()
      .type('Test User');
    cy.get('input[type="email"]')
      .filter(':visible')
      .first()
      .type('test@example.com');
    cy.get('input[placeholder*="Phone number"]')
      .filter(':visible')
      .first()
      .type('4044042244');

    // Submit form
    cy.get('form')
      .filter(':visible')
      .first()
      .within(() => {
        cy.get('button[type="submit"]').should('exist').click();
      });

    // Verify API call was made with correct data
    cy.wait('@submitContact').then(interception => {
      expect(interception.request.body).to.include({
        name: 'Test User',
        email: 'test@example.com',
        phone: '4044042244',
      });
    });
  });

  it('should be responsive', () => {
    // Test mobile view
    cy.viewport('iphone-6');
    cy.get('form').should('be.visible');

    // Test desktop view
    cy.viewport(1280, 720);
    cy.get('form').should('be.visible');
  });
});
