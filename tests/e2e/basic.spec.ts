import { test, expect } from '@playwright/test';

test.describe('NovaesWeb E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar cookies antes de cada teste
    await page.context().clearCookies();
  });

  test('🏠 Homepage carrega corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se o título está correto
    await expect(page).toHaveTitle(/NovaesWeb/);
    
    // Verificar elementos principais
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Verificar performance
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    expect(loadTime).toBeLessThan(3000); // 3 segundos máximo
  });

  test('🔐 Login funciona corretamente', async ({ page }) => {
    await page.goto('/login');
    
    // Preencher formulário de login
    await page.fill('input[type="email"]', 'test@novaesweb.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento após login
    await expect(page).toHaveURL(/\/admin/);
    
    // Verificar se o dashboard carregou
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('📱 Versão mobile funciona', async ({ page }) => {
    // Simular dispositivo mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar menu mobile
    await expect(page.locator('button[aria-label="menu"]')).toBeVisible();
    
    // Testar navegação mobile
    await page.click('button[aria-label="menu"]');
    await expect(page.locator('.mobile-menu')).toBeVisible();
  });

  test('🎨 Tema escuro/claro funciona', async ({ page }) => {
    await page.goto('/');
    
    // Encontrar botão de tema
    const themeButton = page.locator('[aria-label="toggle theme"]');
    await expect(themeButton).toBeVisible();
    
    // Clicar para alternar tema
    await themeButton.click();
    
    // Verificar se o tema mudou (verificar classe no body)
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark');
  });

  test('📊 Dashboard admin carrega dados', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@novaesweb.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar carregar dashboard
    await page.waitForURL(/\/admin/);
    
    // Verificar se os cards do dashboard estão visíveis
    await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
    
    // Verificar se há dados nos cards
    await expect(page.locator('[data-testid="total-clients"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible();
  });

  test('🔍 Busca funciona', async ({ page }) => {
    await page.goto('/');
    
    // Encontrar campo de busca
    const searchInput = page.locator('input[placeholder*="buscar" i]');
    await expect(searchInput).toBeVisible();
    
    // Preencher busca
    await searchInput.fill('serviços');
    
    // Verificar se resultados aparecem
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('📱 PWA features funcionam', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se há manifest link
    const manifest = await page.locator('link[rel="manifest"]');
    await expect(manifest).toBeVisible();
    
    // Verificar service worker registration
    const serviceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(serviceWorker).toBe(true);
  });

  test('♿ Acessibilidade', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se há skip link
    await expect(page.locator('a[href="#main"]')).toBeVisible();
    
    // Verificar se o foco funciona com teclado
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Verificar ARIA labels
    const buttons = page.locator('button[aria-label]');
    await expect(buttons).toHaveCount(3); // Pelo menos 3 botões com ARIA
  });

  test('📱 Responsividade', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verificar se layout se adapta
      const container = page.locator('.container');
      await expect(container).toBeVisible();
      
      // Verificar se não há overflow horizontal
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      const viewportWidth = viewport.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    }
  });
});
