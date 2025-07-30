// src/__tests__/test-utils.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock providers that your components might need
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* Add any providers your app uses here, like:
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
      */}
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper functions for common test scenarios
export const mockApiResponse = (data: any, ok = true) => {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  })
}

export const mockApiError = (message: string, status = 500) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error: message }),
  })
}

// Mock Supabase client for component tests
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    })),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    signInWithPassword: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn().mockResolvedValue({ data: null, error: null }),
    delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  })),
  removeChannel: jest.fn(),
}

// Mock data factories
export const createMockPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  subject: 'Test Subject',
  body: 'Test body content',
  image_url: 'https://example.com/image.jpg',
  toasty_take: 'Test toasty take',
  archive_posts: [],
  status: 'published' as const,
  created_at: '2024-01-01T00:00:00Z',
  sent_at: '2024-01-01T12:00:00Z',
  tags: ['test', 'example'],
  slug: 'test-post',
  subtext: 'Test subtext',
  ...overrides,
})

export const createMockContact = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-0123',
  status: 'New',
  created_at: '2024-01-01T00:00:00Z',
  notes: '',
  reminder_at: null,
  reminder_message: null,
  ...overrides,
})

// Test helpers for form validation
export const fillContactForm = async (user: any, data: any) => {
  const { name, email, phone } = data
  if (name) await user.type(screen.getByPlaceholderText('Your name'), name)
  if (email) await user.type(screen.getByPlaceholderText('Your email'), email)
  if (phone) await user.type(screen.getByPlaceholderText('Phone number'), phone)
}

export const fillNewsletterForm = async (user: any, email: string, name?: string) => {
  await user.type(screen.getByPlaceholderText(/email/i), email)
  if (name) {
    const nameField = screen.queryByPlaceholderText(/name/i)
    if (nameField) await user.type(nameField, name)
  }
}

// Mock window.fs for file operations
export const mockWindowFs = {
  readFile: jest.fn().mockResolvedValue(new Uint8Array()),
}

// Setup function to reset all mocks
export const setupTest = () => {
  jest.clearAllMocks()
  global.fetch = jest.fn()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  window.fs = mockWindowFs
}
