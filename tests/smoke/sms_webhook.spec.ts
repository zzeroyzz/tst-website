import { test, expect } from '@playwright/test';

test.describe('SMS Webhook Processing Smoke Tests', () => {
  // Note: These are API endpoint tests for webhook processing
  // They test the webhook endpoint's ability to handle requests
  
  test('twilio webhook endpoint exists and responds', async ({ request }) => {
    // Test that the webhook endpoint exists (should return 405 for GET since it expects POST)
    const response = await request.get('/api/twilio/webhook');
    
    // Should respond (not crash) - likely with 405 Method Not Allowed for GET
    expect(response.status()).toBeLessThan(500);
    
    // Common responses: 200, 405 (method not allowed), 400 (bad request)
    const validStatusCodes = [200, 400, 405];
    expect(validStatusCodes).toContain(response.status());
  });

  test('twilio webhook handles malformed requests gracefully', async ({ request }) => {
    // Test webhook with invalid/empty POST data
    const response = await request.post('/api/twilio/webhook', {
      data: {}
    });
    
    // Should handle gracefully without crashing (400-499 range acceptable)
    expect(response.status()).toBeLessThan(500);
  });

  test('twilio webhook has proper content type handling', async ({ request }) => {
    // Test webhook with different content types
    const response = await request.post('/api/twilio/webhook', {
      data: 'test=data',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Should handle the request without server error
    expect(response.status()).toBeLessThan(500);
  });

  test('conversation respond endpoint exists', async ({ request }) => {
    // Test the conversation response API endpoint
    const response = await request.get('/api/conversation/respond');
    
    // Should exist and respond appropriately
    expect(response.status()).toBeLessThan(500);
  });

  test('conversation state endpoint handles requests', async ({ request }) => {
    // Test conversation state management endpoint
    const response = await request.get('/api/conversation/state');
    
    // Should handle requests without crashing
    expect(response.status()).toBeLessThan(500);
  });

  test('conversation save response endpoint exists', async ({ request }) => {
    // Test the save response endpoint
    const response = await request.post('/api/conversation/save-response', {
      data: {}
    });
    
    // Should handle requests (may return error due to missing data, but shouldn't crash)
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('SMS Integration Health Checks', () => {
  test('test twilio integration endpoint exists', async ({ request }) => {
    // This is likely an admin/test endpoint
    const response = await request.get('/api/test-twilio-integration');
    
    // Should exist (may require auth, but shouldn't crash)
    expect(response.status()).toBeLessThan(500);
    
    // Common responses: 200, 401 (unauthorized), 403 (forbidden), 405 (method not allowed)
    const validStatusCodes = [200, 401, 403, 405];
    expect(validStatusCodes).toContain(response.status());
  });

  test('cron workflow processing endpoint has security', async ({ request }) => {
    // Test cron endpoint (should require secret)
    const response = await request.post('/api/cron/process-workflows');
    
    // Should be protected (401/403) or handle gracefully (400)
    expect(response.status()).toBeLessThan(500);
    
    // Should likely return 401/403 without proper CRON_SECRET
    const securityStatusCodes = [400, 401, 403];
    expect(securityStatusCodes).toContain(response.status());
  });
});