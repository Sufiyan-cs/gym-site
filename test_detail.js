const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2 });

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });
  await page.type('input[type="tel"]', '9876543210');
  await page.type('input[type="password"]', 'test123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));

  // Go to workouts
  await page.goto('http://localhost:3000/dashboard/workouts', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Click first exercise
  const firstItem = await page.$('.w-item');
  if (firstItem) {
    await firstItem.click();
    await new Promise(r => setTimeout(r, 4000)); // Wait for GIF to load and animate

    // Take viewport screenshot (not full page - since overlay is position:fixed)
    await page.screenshot({
      path: 'C:/Users/SUFIYAN/.gemini/antigravity/brain/2eb27db0-64f6-40a8-b14b-608456f2ab66/scratch/exercise_detail_gif.png',
      fullPage: false
    });
    console.log('Exercise detail screenshot taken');

    // Scroll down to see the instructions
    await page.evaluate(() => {
      const overlay = document.querySelector('.w-overlay');
      if (overlay) overlay.scrollTop = 500;
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: 'C:/Users/SUFIYAN/.gemini/antigravity/brain/2eb27db0-64f6-40a8-b14b-608456f2ab66/scratch/exercise_detail_steps.png',
      fullPage: false
    });
    console.log('Exercise steps screenshot taken');
  }

  await browser.close();
  console.log('Done');
})();
