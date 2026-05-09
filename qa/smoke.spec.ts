import { test, expect } from '@playwright/test';

const NAV_ROUTES = ['/', '/dashboard', '/traces'];

test.describe('Smoke: nav routes', () => {
  for (const route of NAV_ROUTES) {
    test(`${route} returns 200`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
    });
  }
});

test('Hero/H1 present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('Primary CTA visible', async ({ page }) => {
  await page.goto('/');
  const cta = page.locator('button, a[href]').first();
  await expect(cta).toBeVisible();
});

test('Mobile no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
