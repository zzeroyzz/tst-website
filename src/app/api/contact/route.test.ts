// src/app/api/contact/route.test.ts
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock the dependencies
jest.mock('@supabase/supabase-js')
jest.mock('@/lib/email-sender')
jest.mock('@/lib/custom-email-templates')

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}

const mockEmailSender = {
  sendCustomEmailWithRetry: jest.fn().mockResolvedValue({ success: true }),
}

const mockEmailTemplates = {
  getContactConfirmationTemplate: jest.fn().mockReturnValue('<html>Mock Template</html>'),
}

// Mock fetch for Mailchimp API
global.fetch = jest.fn()

describe('/api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Supabase
    require('@supabase/supabase-js').createClient = jest.fn(() => mockSupabase)

    // Mock email functions
    require('@/lib/email-sender').sendCustomEmailWithRetry = mockEmailSender.sendCustomEmailWithRetry
    require('@/lib/custom-email-templates').getContactConfirmationTemplate = mockEmailTemplates.getContactConfirmationTemplate

    // Mock successful Mailchimp response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: 'subscribed' }),
    })
  })

  it('should handle valid contact form submission', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully submitted!')
    expect(mockSupabase.from).toHaveBeenCalledWith('contacts')
  })

  it('should return 400 for missing email', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        phone: '555-0123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email is required.')
  })

  it('should handle Mailchimp existing member', async () => {
    // Mock Mailchimp "Member Exists" response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        title: 'Member Exists',
        detail: 'john@example.com is already a list member'
      }),
    })

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully submitted!')
  })

  it('should handle database errors', async () => {
    // Mock database error
    mockSupabase.from = jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      }),
    }))

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0123',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})
