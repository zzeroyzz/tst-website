// src/__tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
// import { createMockContact, createMockPost } from '../test-utils'

export const handlers = [
  // Contact API
  http.post('/api/contact', async ({ request }) => {
    const body = await request.json()

    // Simulate validation
    if (!body.email) {
      return HttpResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      message: 'Successfully submitted!',
      emailSent: true,
    })
  }),

  // Newsletter subscription
  http.post('/api/newsletter/subscribe', async ({ request }) => {
    const body = await request.json()

    if (!body.email?.includes('@')) {
      return HttpResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      message: 'Successfully subscribed to newsletter!',
      status: 'subscribed',
      emailSent: true,
    })
  }),

  // Newsletter preview
  http.post('/api/newsletter/preview', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      html: `<html><body><h1>${body.title}</h1><p>${body.body}</p></body></html>`,
    })
  }),

  // Newsletter send
  http.post('/api/newsletter/send', async ({ request }) => {
    const body = await request.json()

    return HttpResponse.json({
      message: 'Campaign sent successfully!',
      campaignId: 'test-campaign-123',
      postId: 'test-post-123',
      slug: 'test-post-slug',
    })
  }),

  // Lead reminder
  http.post('/api/leads/send-reminder', async ({ request }) => {
    const body = await request.json()

    if (!body.email) {
      return HttpResponse.json(
        { error: 'Email is required.' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      message: 'Reminder email sent successfully!',
      contactName: 'Test User',
      emailSent: true,
    })
  }),

  // Image upload
  http.post('/api/upload/image', async ({ request }) => {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      url: 'https://example.com/uploaded-image.jpg',
      fileName: 'test-image.jpg',
      message: 'Upload successful',
    })
  }),

  // External APIs

  // Mailchimp API mock
  http.post('https://us1.api.mailchimp.com/3.0/lists/*/members', () => {
    return HttpResponse.json({
      email_address: 'test@example.com',
      status: 'subscribed',
    })
  }),

  // Mailchimp campaign creation
  http.post('https://us1.api.mailchimp.com/3.0/campaigns', () => {
    return HttpResponse.json({
      id: 'test-campaign-123',
      status: 'save',
    })
  }),

  // Mailchimp send campaign
  http.post('https://us1.api.mailchimp.com/3.0/campaigns/*/actions/send', () => {
    return HttpResponse.json({
      complete: true,
    })
  }),
]

// Error handlers for testing error scenarios
export const errorHandlers = [
  http.post('/api/contact', () => {
    return HttpResponse.json(
      { error: 'Server temporarily unavailable' },
      { status: 503 }
    )
  }),

  http.post('/api/newsletter/subscribe', () => {
    return HttpResponse.json(
      { error: 'Mailchimp API Error: Invalid API key' },
      { status: 400 }
    )
  }),
]
