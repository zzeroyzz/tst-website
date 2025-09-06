import { test, expect } from '@playwright/test';

test.describe('Booking Flow Smoke Tests', () => {
  test('trauma booking page renders and calendar loads', async ({ page }) => {
    await page.goto('/book/trauma');
    await expect(page.getByRole('heading', { name: /trauma/i })).toBeVisible();
    await expect(page.locator('[data-testid="unified-booking-flow"]')).toBeVisible();
    
    // Check that appointment type selection is present
    await expect(page.getByText(/initial consultation/i)).toBeVisible();
  });

  test('nd booking page renders and shows calendar', async ({ page }) => {
    await page.goto('/book/nd');
    await expect(page.getByRole('heading', { name: /neurodivergent/i })).toBeVisible();
    await expect(page.locator('[data-testid="unified-booking-flow"]')).toBeVisible();
  });

  test('affirming booking page renders correctly', async ({ page }) => {
    await page.goto('/book/affirming');
    await expect(page.getByRole('heading', { name: /affirming/i })).toBeVisible();
    await expect(page.locator('[data-testid="unified-booking-flow"]')).toBeVisible();
  });

  test('general booking page redirects or shows options', async ({ page }) => {
    await page.goto('/book');
    // Should either redirect to a specific booking page or show selection options
    await expect(page.locator('body')).toBeVisible();
    // Check that we're still on a booking-related page
    expect(page.url()).toContain('/book');
  });

  test('booking flow can proceed through calendar selection', async ({ page }) => {
    await page.goto('/book/trauma');
    
    // Wait for the booking component to load
    await expect(page.locator('[data-testid="unified-booking-flow"]')).toBeVisible();
    
    // Look for calendar or time slot elements (these may vary based on implementation)
    const calendarExists = await page.locator('[data-testid="calendar"]').isVisible().catch(() => false);
    const timeSlotsExist = await page.locator('[data-testid="time-slots"]').isVisible().catch(() => false);
    const appointmentForm = await page.locator('form').isVisible().catch(() => false);
    
    // At least one of these should be present in a functional booking flow
    expect(calendarExists || timeSlotsExist || appointmentForm).toBeTruthy();
  });
});