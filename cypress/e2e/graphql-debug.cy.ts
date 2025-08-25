describe('GraphQL Schema Debug', () => {
  it('should debug the schema issue by intercepting requests', () => {
    cy.log('=== STARTING GRAPHQL SCHEMA DEBUG ===');
    
    // Intercept GraphQL requests to see what's being sent
    cy.intercept('POST', '**/graphql', (req) => {
      cy.log('=== GRAPHQL REQUEST ===');
      cy.log('URL:', req.url);
      cy.log('Operation:', req.body.operationName);
      cy.log('Query:', req.body.query);
      cy.log('Variables:', JSON.stringify(req.body.variables, null, 2));
    }).as('graphqlRequest');

    // Visit booking page
    cy.visit('/book/trauma');
    
    // Wait for any initial GraphQL calls
    cy.wait(3000);
    
    // Try to manually trigger a booking submission by going directly to the form
    cy.window().then((win) => {
      // Store a mock appointment in localStorage to bypass calendar step
      const mockAppointment = {
        dateTime: new Date('2024-02-15T15:00:00.000Z'),
        displayDate: 'Thursday, February 15, 2024',
        displayTime: '3:00 PM EST'
      };
      
      win.localStorage.setItem('selectedAppointment', JSON.stringify(mockAppointment));
      win.localStorage.setItem('appointmentVariant', 'trauma');
    });

    // Navigate to details page directly
    cy.visit('/book/trauma/details');
    
    // Wait for page to load
    cy.wait(2000);
    
    // Check if form is visible
    cy.get('body').then(($body) => {
      if ($body.find('form').length > 0) {
        cy.log('Form found, proceeding with test submission');
        
        // Fill out the form with test data
        cy.get('input[name="name"]').type('GraphQL Debug Test');
        cy.get('input[name="email"]').type('debug@test.com');
        cy.get('input[name="phone"]').type('(555) 123-4567');
        
        // Check consent if checkbox exists
        cy.get('body').then(($body) => {
          if ($body.find('input[type="checkbox"][id="consent"]').length > 0) {
            cy.get('input[type="checkbox"][id="consent"]').check();
          }
        });

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Wait for GraphQL request and analyze response
        cy.wait('@graphqlRequest', { timeout: 10000 }).then((interception) => {
          cy.log('=== GRAPHQL RESPONSE ===');
          cy.log('Status:', interception.response?.statusCode);
          
          if (interception.response?.body?.data) {
            cy.log('Response Data:', JSON.stringify(interception.response.body.data, null, 2));
          }
          
          if (interception.response?.body?.errors) {
            cy.log('=== ERRORS FOUND ===');
            interception.response.body.errors.forEach((error: any, index: number) => {
              cy.log(`Error ${index + 1}:`);
              cy.log('  Message:', error.message);
              cy.log('  Code:', error.extensions?.code);
              cy.log('  Path:', error.path);
              cy.log('  Stacktrace:', error.extensions?.stacktrace);
              
              // Specific analysis for the questionnaire_completed column issue
              if (error.message.includes('questionnaire_completed')) {
                cy.log('=== SCHEMA ISSUE DETECTED ===');
                cy.log('Issue: Missing questionnaire_completed column in contacts table');
                cy.log('This suggests the database migration may not have been applied');
                cy.log('or the GraphQL schema is out of sync with the database');
              }
            });
          }
        });
        
      } else {
        cy.log('Form not found, checking current page state');
        cy.url().then((url) => {
          cy.log('Current URL:', url);
        });
        cy.get('body').then(($body) => {
          cy.log('Page content:', $body.text().substring(0, 500));
        });
      }
    });
  });

  it('should test the GraphQL endpoint directly', () => {
    cy.log('=== TESTING GRAPHQL ENDPOINT DIRECTLY ===');
    
    // Get GraphQL endpoint from environment or assume default
    const graphqlEndpoint = Cypress.env('GRAPHQL_ENDPOINT') || '/api/graphql';
    
    // Test query to understand schema
    const testQuery = {
      query: `
        query TestContactsSchema {
          __type(name: "Contact") {
            fields {
              name
              type {
                name
              }
            }
          }
        }
      `
    };
    
    cy.request({
      method: 'POST',
      url: graphqlEndpoint,
      body: testQuery,
      failOnStatusCode: false
    }).then((response) => {
      cy.log('Schema Query Response:', response.status);
      cy.log('Response Body:', JSON.stringify(response.body, null, 2));
      
      if (response.body.data?.__type?.fields) {
        cy.log('=== CONTACT SCHEMA FIELDS ===');
        response.body.data.__type.fields.forEach((field: any) => {
          cy.log(`${field.name}: ${field.type.name}`);
        });
        
        // Check if questionnaire_completed field exists
        const hasQuestionnaireCompleted = response.body.data.__type.fields.some(
          (field: any) => field.name === 'questionnaire_completed'
        );
        
        cy.log('questionnaire_completed field exists:', hasQuestionnaireCompleted);
      }
    });
  });

  it('should test appointment creation with minimal data', () => {
    cy.log('=== TESTING MINIMAL APPOINTMENT CREATION ===');
    
    const graphqlEndpoint = Cypress.env('GRAPHQL_ENDPOINT') || '/api/graphql';
    
    // Try creating with minimal required fields
    const createMutation = {
      query: `
        mutation CreateMinimalLead($name: String!, $email: String!, $phone: String!) {
          createLead(
            name: $name
            email: $email
            phone: $phone
            segments: ["Debug Test"]
          ) {
            id
            name
            email
          }
        }
      `,
      variables: {
        name: 'Debug Test User',
        email: 'debug@test.com',
        phone: '(555) 123-4567'
      }
    };
    
    cy.request({
      method: 'POST',
      url: graphqlEndpoint,
      body: createMutation,
      failOnStatusCode: false
    }).then((response) => {
      cy.log('Create Lead Response:', response.status);
      cy.log('Response Body:', JSON.stringify(response.body, null, 2));
      
      if (response.body.errors) {
        cy.log('=== ERRORS IN LEAD CREATION ===');
        response.body.errors.forEach((error: any) => {
          cy.log('Error:', error.message);
          cy.log('Extensions:', error.extensions);
        });
      }
    });
  });
});