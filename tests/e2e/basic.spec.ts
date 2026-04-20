import { test, expect } from '@playwright/test';

test.describe('NovaesWeb E2E smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('homepage carrega corretamente', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/NovaesWeb/i);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /solicitar/i }).first()).toBeVisible();
  });

  test('rota legada de login redireciona para o login admin', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('**/admin/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
  });

  test('acesso admin sem sessao volta para login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/admin/login');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
  });

  test('menu mobile abre corretamente', async ({ page }, testInfo) => {
    test.skip(
      ['firefox', 'webkit'].includes(testInfo.project.name),
      'A cobertura mobile desta smoke suite fica nos projetos Mobile Chrome e Mobile Safari.',
    );

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const openMenuButton = page.locator('button[aria-label="Abrir menu"]').first();
    await expect(openMenuButton).toBeVisible();
    await openMenuButton.click();

    await expect(page.locator('button[aria-label="Fechar menu"]').nth(1)).toBeVisible();
    await expect(page.getByText('Explorar', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /solicitar/i }).first()).toBeVisible();
  });

  test('pwa basico esta exposto na home', async ({ page }) => {
    await page.goto('/');

    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveCount(1);
    await expect(manifest).toHaveAttribute('href', /manifest/i);

    const serviceWorker = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(serviceWorker).toBe(true);
  });

  test('skip link fica acessivel por teclado', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  });

  test('layout nao cria overflow horizontal nas larguras principais', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(150);
      await expect(page.locator('h1').first()).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 1);
    }
  });
});
