/* eslint-disable @typescript-eslint/no-unused-vars */
// src/__tests__/mocks/simple-server.js
// Simple mock setup without MSW

// Mock fetch globally with common responses
const setupFetchMocks = () => {
  global.fetch = jest.fn().mockImplementation((url, options) => {
    // Default successful response
    const defaultResponse = {
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
      text: () => Promise.resolve('Success'),
      status: 200,
    }

    // Handle specific endpoints
    if (url.includes('/api/contact')) {
      return Promise.resolve({
        ...defaultResponse,
        json: () => Promise.resolve({
          message: 'Successfully submitted!',
          emailSent: true,
        }),
      })
    }

    if (url.includes('/api/leads/send-reminder')) {
      return Promise.resolve({
        ...defaultResponse,
        json: () => Promise.resolve({
          message: 'Reminder email sent successfully!',
          contactName: 'Test User',
          emailSent: true,
        }),
      })
    }

    if (url.includes('/api/newsletter/subscribe')) {
      return Promise.resolve({
        ...defaultResponse,
        json: () => Promise.resolve({
          message: 'Successfully subscribed to newsletter!',
          status: 'subscribed',
          emailSent: true,
        }),
      })
    }

    // Return default for any other URL
    return Promise.resolve(defaultResponse)
  })
}

// Setup function to call in tests
export const setupMocks = () => {
  setupFetchMocks()
}

// Cleanup function
export const cleanupMocks = () => {
  jest.restoreAllMocks()
}

// Auto-setup for all tests
beforeEach(() => {
  setupMocks()
})

afterEach(() => {
  jest.clearAllMocks()
})
