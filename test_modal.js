const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    
    await page.goto('http://localhost:4000/profile.html', { waitUntil: 'networkidle0' });
    
    // Find button containing RENEW PLAN VIA UPI and click it
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('RENEW PLAN VIA UPI')) {
        await b.click();
        break;
      }
    }
    
    // Wait a brief moment for transition
    await new Promise(r => setTimeout(r, 400));
    
    const modalPath = path.join(__dirname, 'temp_preview', 'profile_modal.png');
    await page.screenshot({ path: modalPath });
    console.log('Modal screenshot saved to:', modalPath);
    
    await browser.close();
  } catch (err) {
    console.error('Error in modal test:', err);
  }
})();
