const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', exception => {
    errors.push(`Uncaught Exception: ${exception.message}\n${exception.stack}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://127.0.0.1:5173/admin/login');
    
    console.log("Filling credentials...");
    await page.fill('input[type="email"]', 'novaesweb@gmail.com');
    await page.fill('input[type="password"]', '180325');
    
    console.log("Submitting...");
    await page.click('button[type="submit"]');
    
    // Wait for network idle or redirect
    await page.waitForTimeout(3000);
    
    console.log("Going to contratos...");
    await page.goto('http://127.0.0.1:5173/admin/contratos');
    await page.waitForTimeout(4000);
    
    if (errors.length > 0) {
      console.log("ERRORS FOUND:");
      console.log(errors.join("\n\n---\n\n"));
    } else {
      console.log("No errors found!");
      const content = await page.content();
      if (content.includes("Carregando seu painel")) {
        console.log("Stuck on loading screen without JS errors.");
      } else {
        console.log("Page seems to have loaded.");
      }
    }
  } catch (e) {
    console.error("Script failed:", e);
  } finally {
    await browser.close();
  }
})();
