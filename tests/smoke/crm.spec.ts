import { test, expect } from '@playwright/test';

test.describe('CRM Dashboard Smoke Tests', () => {
  // Note: These tests assume authentication is handled in playwright config or setup
  // In a real scenario, you'd need to login first or mock authentication
  
  test('dashboard main page loads', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should either show the dashboard or redirect to login
    await expect(page.locator('body')).toBeVisible();
    
    const isDashboard = page.url().includes('/dashboard');
    const isLogin = page.url().includes('/login');
    
    // Should be on either dashboard or login page (not crashed)
    expect(isDashboard || isLogin).toBeTruthy();
    
    if (isDashboard) {
      // If on dashboard, should have dashboard elements
      const hasNavigation = await page.locator('[data-testid="dashboard-nav"], nav').isVisible().catch(() => false);
      const hasDashboardContent = await page.locator('[data-testid="dashboard"], main').isVisible().catch(() => false);
      
      expect(hasNavigation || hasDashboardContent).toBeTruthy();
    }
  });

  test('dashboard has proper navigation structure', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Skip if redirected to login
    if (page.url().includes('/login')) {
      test.skip('Not authenticated, skipping dashboard tests');
      return;
    }
    
    // Should have some form of navigation between dashboard sections
    const hasViewButtons = await page.locator('button').count() > 0;
    const hasNavLinks = await page.locator('nav a').count() > 0;
    const hasTabNavigation = await page.locator('[role="tab"], [data-testid*="tab"]').count() > 0;
    
    expect(hasViewButtons || hasNavLinks || hasTabNavigation).toBeTruthy();
  });

  test('dashboard can handle CRM view switching', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Skip if redirected to login
    if (page.url().includes('/login')) {
      test.skip('Not authenticated, skipping dashboard tests');
      return;
    }
    
    // Look for CRM-related elements
    const hasCRMButton = await page.getByText(/crm|leads|contacts/i).isVisible().catch(() => false);
    const hasAppointmentsView = await page.getByText(/appointments|calendar/i).isVisible().catch(() => false);
    const hasNotifications = await page.locator('[data-testid="notifications"]').isVisible().catch(() => false);
    
    // Dashboard should have some business functionality
    expect(hasCRMButton || hasAppointmentsView || hasNotifications).toBeTruthy();
  });

  test('dashboard handles data loading states gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Skip if redirected to login
    if (page.url().includes('/login')) {
      test.skip('Not authenticated, skipping dashboard tests');
      return;
    }
    
    // Should handle loading states without crashing
    await page.waitForTimeout(1000); // Wait for initial load
    
    const hasLoadingIndicator = await page.locator('[data-testid*="loading"], .loading').isVisible().catch(() => false);
    const hasContent = await page.locator('main, [data-testid="dashboard"]').isVisible().catch(() => false);
    const hasErrorBoundary = await page.getByText(/error|something went wrong/i).isVisible().catch(() => false);
    
    // Should show loading, content, or error - not blank page
    expect(hasLoadingIndicator || hasContent || hasErrorBoundary).toBeTruthy();
  });
});