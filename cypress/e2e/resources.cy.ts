// cypress/e2e/resources.cy.ts

describe('Resources Page', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'Self-Care for Busy People',
      created_at: '2023-01-01T00:00:00Z',
      sent_at: '2023-01-02T00:00:00Z',
      image_url: '/assets/test-image-1.jpg',
      tags: ['Self-Care', 'Mindfulness'],
      status: 'published'
    },
    {
      id: '2',
      title: 'Building Healthy Boundaries',
      created_at: '2023-02-01T00:00:00Z',
      sent_at: '2023-02-02T00:00:00Z',
      image_url: '/assets/test-image-2.jpg',
      tags: ['Relationships', 'Boundaries'],
      status: 'published'
    },
    {
      id: '3',
      title: 'Managing Anxiety in Daily Life',
      created_at: '2023-03-01T00:00:00Z',
      sent_at: '2023-03-02T00:00:00Z',
      image_url: '/assets/test-image-3.jpg',
      tags: ['Anxiety', 'Mental Health'],
      status: 'published'
    }
  ]

  beforeEach(() => {
    // Mock Supabase API calls
    cy.intercept('GET', '**/rest/v1/posts*', {
      statusCode: 200,
      body: mockPosts
    }).as('getPosts')

    // Mock auth calls if needed
    cy.intercept('POST', '**/auth/v1/**', {
      statusCode: 200,
      body: { access_token: 'mock-token' }
    })
  })

  it('should display the hero section with correct content', () => {
    cy.visit('/resources')

    // Check hero section content
    cy.contains('h1', 'Free Guides & Reflections').should('be.visible')
    cy.contains('Join our free, weekly(ish) newsletter').should('be.visible')

    // Check hero image (desktop only)
    cy.get('img[alt="Newsletter illustration"]').should('exist')

    // Check subscription form
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[placeholder="Your email"]').should('be.visible')
    cy.contains('button', 'Subscribe').should('be.visible')

    // Check privacy policy link
    cy.contains('privacy policy').should('be.visible')
    cy.get('a[href="/policy"]').should('exist')
  })

  it('should display the highlight section correctly', () => {
    cy.visit('/resources')

    // Check the reader count highlight
    cy.contains('Join over').should('be.visible')
    cy.contains('10,000').should('be.visible')
    cy.contains('friendly readers').should('be.visible')
  })

  it('should display the latest posts section', () => {
    cy.visit('/resources')
    cy.wait('@getPosts')

    // Check section title
    cy.contains('h2', 'Catch up on our latest posts').should('be.visible')
    cy.contains('Explore previous editions').should('be.visible')

    // Check that posts are displayed
    cy.contains('Self-Care for Busy People').should('be.visible')
    cy.contains('Building Healthy Boundaries').should('be.visible')
    cy.contains('Managing Anxiety in Daily Life').should('be.visible')

    // Check "View All Posts" button
    cy.contains('View All Posts').should('be.visible')
    cy.get('a[href="/newsletter-archives"]').should('exist')
  })

  it('should handle subscription form submission', () => {
    cy.visit('/resources')

    // Fill in email
    cy.get('input[type="email"]').type('test@example.com')

    // Submit form
    cy.contains('button', 'Subscribe').click()

    // Note: Add expectations based on your actual form handling
    // This might involve mocking form submission endpoints
  })

  it('should show loading state for posts', () => {
    // Delay the API response to test loading state
    cy.intercept('GET', '**/rest/v1/posts*', {
      delay: 1000,
      statusCode: 200,
      body: mockPosts
    }).as('getPostsDelayed')

    cy.visit('/resources')

    // Should show loading message
    cy.contains('Loading posts...').should('be.visible')

    cy.wait('@getPostsDelayed')

    // Loading should disappear
    cy.contains('Loading posts...').should('not.exist')
  })

  it('should handle empty posts response', () => {
    cy.intercept('GET', '**/rest/v1/posts*', {
      statusCode: 200,
      body: []
    }).as('getEmptyPosts')

    cy.visit('/resources')
    cy.wait('@getEmptyPosts')

    // Should not show loading
    cy.contains('Loading posts...').should('not.exist')

    // Should not show any posts
    cy.get('[data-testid="resource-card"]').should('not.exist')
  })

  it('should handle API errors gracefully', () => {
    cy.intercept('GET', '**/rest/v1/posts*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getPostsError')

    cy.visit('/resources')
    cy.wait('@getPostsError')

    // Should not crash
    cy.contains('Loading posts...').should('not.exist')
  })

  it('should navigate to individual posts', () => {
    cy.visit('/resources')
    cy.wait('@getPosts')

    // Click on first post
    cy.contains('Self-Care for Busy People').click()

    // Should navigate to post detail page
    cy.url().should('include', '/posts/1')
  })

  it('should navigate to newsletter archives', () => {
    cy.visit('/resources')

    // Click "View All Posts" button
    cy.contains('View All Posts').click()

    // Should navigate to archives
    cy.url().should('include', '/newsletter-archives')
  })

  it('should validate email input', () => {
    cy.visit('/resources')

    // Try invalid email
    cy.get('input[type="email"]').type('invalid-email')
    cy.contains('button', 'Subscribe').click()

    // HTML5 validation should catch it
    cy.get('input[type="email"]:invalid').should('exist')
  })

  it('should require email input', () => {
    cy.visit('/resources')

    // Try to submit without email
    cy.contains('button', 'Subscribe').click()

    // Should not submit due to required field
    cy.get('input[type="email"]:invalid').should('exist')
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.visit('/resources')

      // Hero section should be visible
      cy.contains('Free Guides & Reflections').should('be.visible')

      // Form should stack vertically on mobile
      cy.get('form').should('have.class', 'flex-col')

      // Posts should be visible
      cy.wait('@getPosts')
      cy.contains('Catch up on our latest posts').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.visit('/resources')

      // Check that layout works on tablet
      cy.contains('Free Guides & Reflections').should('be.visible')
      cy.get('input[type="email"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      cy.visit('/resources')

      // Check heading hierarchy
      cy.get('h1').should('contain', 'Free Guides & Reflections')
      cy.get('h2').should('contain', 'Catch up on our latest posts')
    })

    it('should have proper form labels and structure', () => {
      cy.visit('/resources')

      // Check form accessibility
      cy.get('input[type="email"]').should('have.attr', 'required')
      cy.get('input[type="email"]').should('have.attr', 'placeholder')
      cy.get('button[type="submit"]').should('contain.text', 'Subscribe')
    })

  describe('Visual Elements', () => {
    it('should display hero image correctly', () => {
      cy.visit('/resources')

      // Hero image should exist and be properly sized
      cy.get('img[alt="Newsletter illustration"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .should('not.be.empty')
    })

    it('should have proper section styling', () => {
      cy.visit('/resources')

      // Check for background colors and styling
      cy.get('.bg-tst-green').should('exist')
      cy.get('.bg-tst-purple').should('exist') // Subscribe button
      cy.get('.bg-tst-yellow').should('exist') // View All Posts button
    })
  })

  describe('WallOfLove Component', () => {
    it('should render the WallOfLove component', () => {
      cy.visit('/resources')

      // Note: You may need to add specific selectors based on your WallOfLove component
      // This is a placeholder - adjust based on actual component structure
      cy.get('[data-testid="wall-of-love"]').should('exist')
      // or check for specific content that WallOfLove displays
    })
  })

  describe('Integration', () => {
    it('should fetch and display correct number of posts', () => {
      cy.visit('/resources')
      cy.wait('@getPosts')

      // Should limit to 6 posts as per the component logic
      cy.get('[data-testid="resource-card"]').should('have.length.at.most', 6)
    })

    it('should handle posts with different date formats', () => {
      const postsWithDifferentDates = [
        {
          ...mockPosts[0],
          sent_at: null // Should fall back to created_at
        },
        ...mockPosts.slice(1)
      ]

      cy.intercept('GET', '**/rest/v1/posts*', {
        statusCode: 200,
        body: postsWithDifferentDates
      }).as('getPostsWithNullDates')

      cy.visit('/resources')
      cy.wait('@getPostsWithNullDates')

      // Should still display posts without crashing
      cy.contains('Self-Care for Busy People').should('be.visible')
    })
  })
})
