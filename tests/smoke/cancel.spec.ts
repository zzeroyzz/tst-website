import { test, expect } from '@playwright/test';

test.describe('Cancel Appointment Flow Smoke Tests', () => {
  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  test('cancel appointment page renders with valid UUID', async ({ page }) => {
    await page.goto(`/cancel-appointment/${mockUuid}`);
    
    // Should show the cancellation interface or appropriate message
    await expect(page.locator('body')).toBeVisible();
    
    // Check for common cancel page elements
    const hasCancelForm = await page.locator('form').isVisible().catch(() => false);
    const hasCancelHeading = await page.getByRole('heading', { name: /cancel/i }).isVisible().catch(() => false);
    const hasCancelButton = await page.getByRole('button', { name: /cancel/i }).isVisible().catch(() => false);
    const hasErrorMessage = await page.getByText(/not found|expired|invalid/i).isVisible().catch(() => false);
    
    // Should have either cancel functionality or appropriate error message
    expect(hasCancelForm || hasCancelHeading || hasCancelButton || hasErrorMessage).toBeTruthy();
  });

  test('cancel appointment page handles invalid UUID gracefully', async ({ page }) => {
    await page.goto('/cancel-appointment/invalid-uuid');
    
    // Should show error or handle gracefully, not crash
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load without throwing errors
    const hasContent = await page.locator('main, body').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('cancel page has proper user messaging', async ({ page }) => {
    await page.goto(`/cancel-appointment/${mockUuid}`);
    
    // Should have some form of user communication
    const hasHeading = await page.locator('h1, h2, h3').isVisible().catch(() => false);
    const hasText = await page.locator('p').isVisible().catch(() => false);
    const hasContent = await page.textContent('body');
    
    expect(hasHeading || hasText || (hasContent && hasContent.length > 100)).toBeTruthy();
  });

  test('cancel page has navigation elements', async ({ page }) => {
    await page.goto(`/cancel-appointment/${mockUuid}`);
    
    // Should have navigation or way to get back to main site
    const hasNavigation = await page.locator('nav').isVisible().catch(() => false);
    const hasHomeLink = await page.locator('a[href="/"]').isVisible().catch(() => false);
    const hasLogo = await page.locator('[data-testid="logo"], img[alt*="logo"]').isVisible().catch(() => false);
    
    // At least some form of navigation should be present
    expect(hasNavigation || hasHomeLink || hasLogo).toBeTruthy();
  });
});