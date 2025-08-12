describe('Questionnaire Flow', () => {
  const testToken = 'test-questionnaire-token-123'

  beforeEach(() => {
    cy.mockAllAPIs()
    cy.visitWithoutCookies(`/questionnaire/${testToken}`)
  })

  it('should load questionnaire successfully', () => {
    cy.wait('@getQuestionnaire')
    cy.contains('Hey Test! Are you located in Georgia?').should('be.visible')
    cy.get('[role="progressbar"], .bg-tst-purple').should('be.visible') // Progress bar
  })

  it('should complete the happy path (Georgia resident who schedules)', () => {
    cy.wait('@getQuestionnaire')

    // Step 1: Location - Select Georgia
    cy.contains('Yes, I\'m in Georgia').click()
    cy.contains('Continue').click()

    // Step 2: Interests
    cy.contains('What are you interested in working on?').should('be.visible')
    cy.contains('Anxiety').click()
    cy.contains('Burnout & Exhaustion').click()
    cy.contains('Continue').click()

    // Step 3: Scheduling
    cy.contains('How often would you like to meet?').should('be.visible')
    cy.contains('Weekly').click()
    cy.contains('Continue').click()

    // Step 4: Payment
    cy.contains('How do you plan to pay?').should('be.visible')
    cy.contains('Pay out of pocket').click()
    cy.contains('Continue').click()

    // Step 5: Budget
    cy.contains('Does our rate work for you?').should('be.visible')
    cy.contains('Yes, $150 per session works for my budget').click()
    cy.contains('Continue').click()

    // Step 6: Calendar should appear
    cy.contains('Let\'s schedule your consultation').should('be.visible')
    cy.wait('@getBookedSlots')

    cy.get('.grid-cols-7').should('be.visible')

    cy.get('button.bg-tst-green').first().click()

    cy.get('[data-testid="calendar-slot"]', { timeout: 10000 }).should('exist')
    cy.get('[data-testid="calendar-slot"]').should('have.length.greaterThan', 0)


    // Mock clicking a calendar slot (you'll need to adjust selector based on your calendar component)
    cy.get('[data-testid="calendar-slot"]').first().click()

    // Should show confirmation section
    cy.contains('Selected appointment:').should('be.visible')

    // Click confirm
    cy.contains('Confirm Appointment').click()

    // Should call the schedule API
    cy.wait('@scheduleConsultation')
    cy.contains('Consultation Scheduled!').should('be.visible')
  })

  it('should handle out-of-state user flow', () => {
    cy.wait('@getQuestionnaire')

    // Step 1: Location - Select out of state
    cy.contains('No, I\'m not in Georgia').click()
    cy.contains('Continue').click()

    // Should show out-of-state message
    cy.contains('Service Area').should('be.visible')
    cy.contains('Unfortunately, we are only able to provide services').should('be.visible')
    cy.contains('Inclusive Therapists').should('be.visible')

    // Should have external links
    cy.get('a[href*="inclusivetherapists.com"]').should('have.attr', 'target', '_blank')
    cy.get('a[href*="openpathcollective.org"]').should('have.attr', 'target', '_blank')

    // Complete out-of-state flow
    cy.contains('Check Out Toasty Tidbits').click()
    cy.wait('@submitQuestionnaire')
  })

  it('should handle budget not working flow', () => {
    cy.wait('@getQuestionnaire')

    // Complete flow until budget question
    cy.contains('Yes, I\'m in Georgia').click()
    cy.contains('Continue').click()
    cy.contains('Anxiety').click()
    cy.contains('Continue').click()
    cy.contains('Weekly').click()
    cy.contains('Continue').click()
    cy.contains('Pay out of pocket').click()
    cy.contains('Continue').click()

    // Budget - select no
    cy.contains('No, I need to explore other options').click()
    cy.contains('Continue').click()

    // Should show therapy fund resources
    cy.contains('Other Support Options').should('be.visible')
    cy.contains('If my rate isn\'t accessible right now').should('be.visible')

    // Should have external resource links
    cy.get('a[target="_blank"]').should('have.length.greaterThan', 0)

    // Complete budget-not-working flow
    cy.contains('Check Out Toasty Tidbits').click()
    cy.wait('@submitQuestionnaire')
  })

  it('should allow navigation between steps', () => {
    cy.wait('@getQuestionnaire')

    // Go forward a few steps
    cy.contains('Yes, I\'m in Georgia').click()
    cy.contains('Continue').click()
    cy.contains('Anxiety').click()
    cy.contains('Continue').click()

    // Should be on scheduling step
    cy.contains('How often would you like to meet?').should('be.visible')

    // Go back
    cy.contains('Previous').click()
    cy.contains('What are you interested in working on?').should('be.visible')

    // Go back again
    cy.contains('Previous').click()
    cy.contains('Are you located in Georgia?').should('be.visible')
  })

  it('should validate required fields', () => {
  cy.wait('@getQuestionnaire')

  // Target the button element more specifically
  cy.get('button[disabled]').contains('Continue').should('exist')

  cy.contains('Yes, I\'m in Georgia').click()
  cy.get('button').contains('Continue').should('not.be.disabled')
  cy.contains('Continue').click()

  cy.contains('What are you interested in working on?').should('be.visible')
  cy.get('button[disabled]').contains('Continue').should('exist')

  cy.contains('Anxiety').click()
  cy.get('button').contains('Continue').should('not.be.disabled')
})

  it('should show progress bar correctly', () => {
    cy.wait('@getQuestionnaire')

    // Should start at step 1 of 6
    cy.contains('Step 1 of 6').should('be.visible')
    cy.contains('17%').should('be.visible')

    // Move to step 2
    cy.contains('Yes, I\'m in Georgia').click()
    cy.contains('Continue').click()
    cy.contains('Step 2 of 6').should('be.visible')
    cy.contains('33%').should('be.visible') // 2/6 = 33%
  })

  it('should handle multiple interest selections', () => {
    cy.wait('@getQuestionnaire')

    cy.contains('Yes, I\'m in Georgia').click()
    cy.contains('Continue').click()

    // Select multiple interests
    cy.contains('Anxiety').click()
    cy.contains('Burnout & Exhaustion').click()
    cy.contains('Trauma').click()

    // Should be able to deselect
    cy.contains('Anxiety').click() // deselect

    // Continue should work with remaining selections
    cy.contains('Continue').should('not.be.disabled')
  })
})
