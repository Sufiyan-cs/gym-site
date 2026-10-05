const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to simulate a desktop checking a PWA
  await page.setViewport({ width: 1920, height: 1080 });
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  
  // Type in login credentials
  await page.type('input[type="tel"]', '9876543210');
  await page.type('input[type="password"]', 'test123');
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  // Take screenshot of the dashboard
  await page.screenshot({ path: 'C:/Users/SUFIYAN/.gemini/antigravity/brain/2eb27db0-64f6-40a8-b14b-608456f2ab66/scratch/dashboard_test.png' });
  
  // Go to workouts page
  await page.goto('http://localhost:3000/dashboard/workouts', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'C:/Users/SUFIYAN/.gemini/antigravity/brain/2eb27db0-64f6-40a8-b14b-608456f2ab66/scratch/workouts_test.png' });

  await browser.close();
})();
