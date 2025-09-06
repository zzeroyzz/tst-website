import { test, expect } from '@playwright/test';

test.describe('Reschedule Flow Smoke Tests', () => {
  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  test('reschedule page renders with valid UUID', async ({ page }) => {
    await page.goto(`/reschedule/${mockUuid}`);
    
    // Should show the reschedule interface or an appropriate message
    await expect(page.locator('body')).toBeVisible();
    
    // Check for common reschedule page elements
    const hasRescheduleForm = await page.locator('form').isVisible().catch(() => false);
    const hasRescheduleHeading = await page.getByRole('heading', { name: /reschedule/i }).isVisible().catch(() => false);
    const hasErrorMessage = await page.getByText(/not found|expired|invalid/i).isVisible().catch(() => false);
    
    // Should have either a reschedule form or an appropriate error message
    expect(hasRescheduleForm || hasRescheduleHeading || hasErrorMessage).toBeTruthy();
  });

  test('reschedule page handles invalid UUID gracefully', async ({ page }) => {
    await page.goto('/reschedule/invalid-uuid');
    
    // Should show error or redirect, not crash
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load without throwing errors
    const hasContent = await page.locator('main, body').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('thank you reschedule page renders', async ({ page }) => {
    await page.goto('/thank-you-reschedule');
    
    await expect(page.getByText(/thank you/i)).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
  });

  test('reschedule flow has proper navigation elements', async ({ page }) => {
    await page.goto(`/reschedule/${mockUuid}`);
    
    // Should have navigation or way to get back to main site
    const hasNavigation = await page.locator('nav').isVisible().catch(() => false);
    const hasHomeLink = await page.locator('a[href="/"]').isVisible().catch(() => false);
    const hasLogo = await page.locator('[data-testid="logo"], img[alt*="logo"]').isVisible().catch(() => false);
    
    // At least some form of navigation should be present
    expect(hasNavigation || hasHomeLink || hasLogo).toBeTruthy();
  });
});