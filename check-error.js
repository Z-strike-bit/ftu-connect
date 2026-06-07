const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.error('PAGE_ERROR:', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE_ERROR:', msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000/find-mentor', { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (e) {
    console.error('GOTO_ERROR:', e.message);
  }

  await browser.close();
})();
