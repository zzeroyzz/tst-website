/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
// src/__tests__/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => {
  server.close()
})

// Helper to use error handlers for specific tests
export const useErrorHandlers = () => {
  const { errorHandlers } = require('./handlers')
  server.use(...errorHandlers)
}

// Helper to mock specific responses
export const mockApiResponse = (endpoint: string, response: any, status = 200) => {
  const { http, HttpResponse } = require('msw')

  server.use(
    http.post(endpoint, () => {
      return HttpResponse.json(response, { status })
    })
  )
}

// src/__tests__/setup-msw.ts (include this in jest.setup.js)
import './mocks/server'
