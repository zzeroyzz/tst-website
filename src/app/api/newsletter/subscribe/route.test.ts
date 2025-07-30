/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/newsletter/subscribe/route.test.ts
import { NextRequest } from 'next/server'
import { POST } from './route'

// Mock the dependencies
jest.mock('@/lib/email-sender')
jest.mock('@/lib/custom-email-templates')

const mockEmailSender = {
  sendCustomEmailWithRetry: jest.fn(),
}

const mockEmailTemplates = {
  getWelcomeEmailTemplate: jest.fn().mockReturnValue('<html>Welcome Template</html>'),
}

// Mock fetch for Mailchimp API
global.fetch = jest.fn()

describe('/api/newsletter/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock email functions
    require('@/lib/email-sender').sendCustomEmailWithRetry = mockEmailSender.sendCustomEmailWithRetry
    require('@/lib/custom-email-templates').getWelcomeEmailTemplate = mockEmailTemplates.getWelcomeEmailTemplate

    // Mock successful email sending
    mockEmailSender.sendCustomEmailWithRetry.mockResolvedValue({ success: true })
  })

  it('should handle valid newsletter subscription', async () => {
    // Mock successful Mailchimp response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: 'subscribed' }),
    })

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@example.com',
        name: 'Jane Doe',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully subscribed to newsletter!')
    expect(data.status).toBe('subscribed')
    expect(data.emailSent).toBe(true)
  })

  it('should return 400 for invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        name: 'Jane Doe',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Valid email is required.')
  })

  it('should handle existing subscriber and update', async () => {
    // Mock Mailchimp "Member Exists" response, then successful update
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({
          title: 'Member Exists',
          detail: 'jane@example.com is already subscribed'
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'subscribed' }),
      })

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@example.com',
        name: 'Jane Doe',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Successfully subscribed to newsletter!')
    expect(global.fetch).toHaveBeenCalledTimes(2) // Once for POST, once for PATCH
  })

  it('should handle Mailchimp API errors', async () => {
    // Mock Mailchimp error response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        title: 'API Error',
        detail: 'Invalid API key'
      }),
    })

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@example.com',
        name: 'Jane Doe',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Subscription failed')
  })

  it('should extract username from email when no name provided', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ status: 'subscribed' }),
    })

    const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        email: 'testuser@example.com',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockEmailTemplates.getWelcomeEmailTemplate).toHaveBeenCalledWith({
      name: 'testuser'
    })
  })
})
