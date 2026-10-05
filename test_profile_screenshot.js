const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set to iPhone 14 standard mobile viewport (390 x 844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    
    await page.goto('http://localhost:4000/profile.html', { waitUntil: 'networkidle0' });
    
    // Viewport screenshot (what user sees on mobile screen)
    const viewportPath = path.join(__dirname, 'temp_preview', 'profile_viewport.png');
    await page.screenshot({ path: viewportPath, fullPage: false });
    console.log('Mobile viewport screenshot saved to:', viewportPath);
    
    await browser.close();
  } catch (err) {
    console.error('Error taking screenshot:', err);
  }
})();
