// cypress/e2e/newsletter-archives.cy.ts

describe('Newsletter Archives Page', () => {
  const mockPosts = [
    {
      id: '1',
      title: 'Understanding Self-Care in Modern Times',
      created_at: '2023-01-01T00:00:00Z',
      sent_at: '2023-01-02T00:00:00Z',
      image_url: '/assets/test-image-1.jpg',
      tags: ['Self-Care', 'Mindfulness'],
      status: 'published'
    },
    {
      id: '2',
      title: 'Building Healthy Relationships',
      created_at: '2023-02-01T00:00:00Z',
      sent_at: '2023-02-02T00:00:00Z',
      image_url: '/assets/test-image-2.jpg',
      tags: ['Relationships', 'Communication'],
      status: 'published'
    },
    {
      id: '3',
      title: 'Trauma Recovery: A Journey of Healing',
      created_at: '2023-03-01T00:00:00Z',
      sent_at: '2023-03-02T00:00:00Z',
      image_url: '/assets/test-image-3.jpg',
      tags: ['Trauma & PTSD', 'Healing'],
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

  it('should display the page title and description', () => {
    cy.visit('/newsletter-archives')

    cy.contains('h1', 'Newsletter Archive').should('be.visible')
    cy.contains('Browse all of our past publications.').should('be.visible')
  })

  it('should show loading state initially then display posts', () => {
    cy.visit('/newsletter-archives')

    // Should show loading initially
    cy.contains('Loading posts...').should('be.visible')

    // Wait for API call and posts to load
    cy.wait('@getPosts')

    // Loading should disappear
    cy.contains('Loading posts...').should('not.exist')

    // Posts should be visible
    cy.contains('Understanding Self-Care in Modern Times').should('be.visible')
    cy.contains('Building Healthy Relationships').should('be.visible')
    cy.contains('Trauma Recovery: A Journey of Healing').should('be.visible')
  })

  it('should display filter controls with core tags', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    cy.contains('Filter by Tag:').should('be.visible')
    cy.contains('button', 'Self-Care').should('be.visible')
    cy.contains('button', 'Mindfulness').should('be.visible')
    cy.contains('button', 'Relationships').should('be.visible')
    cy.contains('button', 'Trauma & CPTSD').should('be.visible')
  })

  it('should display sort controls', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    cy.contains('Sort by Date:').should('be.visible')
    cy.get('select').should('have.value', 'new-to-old')
    cy.get('select').should('contain', 'Newest to Oldest')
    cy.get('select').should('contain', 'Oldest to Newest')
  })

  it('should filter posts by single tag', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Initially should show all 3 posts
    cy.get('[data-testid="resource-card"]').should('have.length', 3)

    // Click Self-Care tag
    cy.contains('button', 'Self-Care').click()

    // Should show only posts with Self-Care tag (1 post)
    cy.contains('Understanding Self-Care in Modern Times').should('be.visible')
    cy.contains('Building Healthy Relationships').should('not.exist')
    cy.contains('Trauma Recovery: A Journey of Healing').should('not.exist')
  })

  it('should filter posts by multiple tags (AND logic)', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Click Self-Care and Mindfulness tags
    cy.contains('button', 'Self-Care').click()
    cy.contains('button', 'Mindfulness').click()

    // Should show only posts with both tags
    cy.contains('Understanding Self-Care in Modern Times').should('be.visible')
    cy.contains('Building Healthy Relationships').should('not.exist')
    cy.contains('Trauma Recovery: A Journey of Healing').should('not.exist')
  })

  it('should deselect tags when clicked again', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Select Self-Care tag
    cy.contains('button', 'Self-Care').click()

    // Verify only 1 post shows
    cy.get('[data-testid="resource-card"]').should('have.length', 1)

    // Deselect Self-Care tag
    cy.contains('button', 'Self-Care').click()

    // Should show all posts again
    cy.get('[data-testid="resource-card"]').should('have.length', 3)
  })

  it('should change sort order', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Check default sort
    cy.get('select').should('have.value', 'new-to-old')

    // Change to oldest first
    cy.get('select').select('old-to-new')
    cy.get('select').should('have.value', 'old-to-new')
  })

  it('should show no results message when filters match no posts', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Select tags that don't appear together
    cy.contains('button', 'Relationships').click()
    cy.contains('button', 'Self-Care').click()

    // Should show no results message
    cy.contains('No posts match the selected filters.').should('be.visible')
    cy.get('[data-testid="resource-card"]').should('not.exist')
  })

  it('should handle empty API response', () => {
    // Override with empty response
    cy.intercept('GET', '**/rest/v1/posts*', {
      statusCode: 200,
      body: []
    }).as('getEmptyPosts')

    cy.visit('/newsletter-archives')
    cy.wait('@getEmptyPosts')

    // Should not show loading
    cy.contains('Loading posts...').should('not.exist')

    // Should not show any posts
    cy.get('[data-testid="resource-card"]').should('not.exist')
  })

  it('should handle API errors gracefully', () => {
    // Mock error response
    cy.intercept('GET', '**/rest/v1/posts*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getPostsError')

    cy.visit('/newsletter-archives')
    cy.wait('@getPostsError')

    // Should not crash and should stop loading
    cy.contains('Loading posts...').should('not.exist')

    // Should not show any posts
    cy.get('[data-testid="resource-card"]').should('not.exist')
  })

  it('should have clickable post cards', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Click on first post
    cy.contains('Understanding Self-Care in Modern Times').click()

    // Should navigate to post detail page
    cy.url().should('include', '/posts/1')
  })

  it('should update tag button styles when selected', () => {
    cy.visit('/newsletter-archives')
    cy.wait('@getPosts')

    // Initially tag should have gray background
    cy.contains('button', 'Self-Care')
      .should('have.class', 'bg-gray-100')
      .should('not.have.class', 'bg-tst-purple')

    // Click tag
    cy.contains('button', 'Self-Care').click()

    // Should have purple background when selected
    cy.contains('button', 'Self-Care')
      .should('have.class', 'bg-tst-purple')
      .should('not.have.class', 'bg-gray-100')
  })

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.visit('/newsletter-archives')
      cy.wait('@getPosts')

      // Check that content is visible on mobile
      cy.contains('Newsletter Archive').should('be.visible')
      cy.get('[data-testid="resource-card"]').should('be.visible')
      cy.contains('button', 'Self-Care').should('be.visible')
    })

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.visit('/newsletter-archives')
      cy.wait('@getPosts')

      // Check tablet layout
      cy.contains('Newsletter Archive').should('be.visible')
      cy.get('[data-testid="resource-card"]').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      cy.visit('/newsletter-archives')
      cy.wait('@getPosts')

      // Check heading hierarchy
      cy.get('h1').should('contain', 'Newsletter Archive')
      cy.get('h3').should('exist') // Filter section headings
    })
  })
})
