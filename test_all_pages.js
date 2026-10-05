const puppeteer = require('puppeteer');
const path = require('path');

const SCREENSHOT_DIR = 'C:/Users/SUFIYAN/.gemini/antigravity/brain/2eb27db0-64f6-40a8-b14b-608456f2ab66/scratch';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Simulate mobile viewport like a phone
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2 });

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    // 1. Login page
    console.log('Testing /login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login.png'), fullPage: true });
    console.log('  OK: Login page loaded');

    // 2. Login
    console.log('Logging in...');
    await page.type('input[type="tel"]', '9876543210');
    await page.type('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_dashboard.png'), fullPage: true });
    console.log('  OK: Dashboard loaded at', page.url());

    // 3. Workouts page
    console.log('Testing /dashboard/workouts...');
    await page.goto('http://localhost:3000/dashboard/workouts', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_workouts_list.png'), fullPage: false });
    console.log('  OK: Workouts list loaded');

    // 4. Click first exercise to see detail with GIF
    const firstItem = await page.$('.w-item');
    if (firstItem) {
      await firstItem.click();
      await new Promise(r => setTimeout(r, 3000)); // Wait for GIF to load
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_exercise_detail.png'), fullPage: true });
      console.log('  OK: Exercise detail with GIF loaded');
      // Go back
      const backBtn = await page.$('.w-back');
      if (backBtn) await backBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // 5. Profile page
    console.log('Testing /dashboard/profile...');
    await page.goto('http://localhost:3000/dashboard/profile', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_profile.png'), fullPage: true });
    console.log('  OK: Profile page loaded');

    // 6. Progress page
    console.log('Testing /dashboard/progress...');
    await page.goto('http://localhost:3000/dashboard/progress', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_progress.png'), fullPage: true });
    console.log('  OK: Progress page loaded');

    // 7. Checkin page
    console.log('Testing /dashboard/checkin...');
    await page.goto('http://localhost:3000/dashboard/checkin', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_checkin.png'), fullPage: true });
    console.log('  OK: Checkin page loaded');

  } catch (err) {
    console.error('FATAL:', err.message);
  }

  if (errors.length) {
    console.log('\n--- BROWSER ERRORS ---');
    errors.forEach(e => console.log('  ❌', e));
  } else {
    console.log('\n✅ No browser errors detected!');
  }

  await browser.close();
  console.log('Done.');
})();
