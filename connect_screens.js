const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'temp_preview');

function updateFile(fileName, transform) {
  const filePath = path.join(dir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  content = transform(content);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${fileName}`);
}

// 1. Connect BottomNav in all files with standard 5-tab bar
const navScreens = ['index.html', 'workouts.html', 'checkin.html', 'progress.html', 'profile.html'];

navScreens.forEach(file => {
  updateFile(file, (content) => {
    // Replace the bottom nav anchors
    // Match the 5 nav anchors in order: Home, Workouts, Check In, Analytics, Profile
    content = content.replace(/(<nav[\s\S]*?<\/nav>)/, (navBlock) => {
      // Replace href="#" with actual pages based on text / aria
      let updatedNav = navBlock
        .replace(/(<a[^>]*?(?:aria-label="Home"|>fitness_center<)[\s\S]*?href=)["'][^"']*["']/i, '$1"index.html"')
        .replace(/(<a[^>]*?(?:aria-label="Workouts"|>sports_gymnastics<)[\s\S]*?href=)["'][^"']*["']/i, '$1"workouts.html"')
        .replace(/(<a[^>]*?(?:aria-label="Check In"|>qr_code_scanner<)[\s\S]*?href=)["'][^"']*["']/i, '$1"checkin.html"')
        .replace(/(<a[^>]*?(?:aria-label="Analytics"|>monitoring<)[\s\S]*?href=)["'][^"']*["']/i, '$1"progress.html"')
        .replace(/(<a[^>]*?(?:aria-label="Profile"|>person<)[\s\S]*?href=)["'][^"']*["']/i, '$1"profile.html"');
      return updatedNav;
    });

    return content;
  });
});

// 2. Connect specific interactive buttons in index.html
updateFile('index.html', (content) => {
  // Start Today's workout button
  content = content.replace(/START TODAY'S WORKOUT[\s\S]*?<\/button>/i, (btn) => {
    return `START TODAY'S WORKOUT</span><span class="material-symbols-outlined">arrow_forward</span></button>`.replace(
      '</button>',
      `</button>`
    );
  });
  content = content.replace(
    /<button([^>]*?)>(\s*<span[^>]*?>START TODAY'S WORKOUT<\/span>)/i,
    `<button$1 onclick="window.location.href='workouts.html'">$2`
  );

  // Quick Action: QR Check-In card
  content = content.replace(
    /(<div[^>]*?carbon-card-interactive[^>]*?>[\s\S]*?QR CHECK-IN[\s\S]*?<\/div>)/i,
    `<div onclick="window.location.href='checkin.html'" style="cursor:pointer;" $1`
  );

  // Quick Action: Log Weight card -> progress.html
  content = content.replace(
    /(<div[^>]*?carbon-card-interactive[^>]*?>[\s\S]*?LOG WEIGHT[\s\S]*?<\/div>)/i,
    `<div onclick="window.location.href='progress.html'" style="cursor:pointer;" $1`
  );

  // Quick Action: Calorie Target card -> progress.html
  content = content.replace(
    /(<div[^>]*?carbon-card-interactive[^>]*?>[\s\S]*?CALORIE TARGET[\s\S]*?<\/div>)/i,
    `<div onclick="window.location.href='progress.html'" style="cursor:pointer;" $1`
  );

  // Top header quick shortcut to Admin Ops and Onboarding demo
  const adminSwitcher = `
    <!-- Mobile Quick Navigation Bar for Preview -->
    <div class="bg-surface-container-high border-b border-outline-variant px-margin py-2 text-xs flex items-center justify-between font-label-sm">
      <span class="text-primary font-bold">⚡ MOBILE PREVIEW MODE</span>
      <div class="flex items-center gap-2">
        <a href="onboarding.html" class="text-on-surface-variant hover:text-primary transition-colors underline">Onboarding</a>
        <span class="text-outline">•</span>
        <a href="admin.html" class="text-secondary hover:text-primary transition-colors font-bold underline">Coach/Admin Ops →</a>
      </div>
    </div>
  `;
  content = content.replace(/(<header[^>]*?>)/i, `$1\n${adminSwitcher}`);

  return content;
});

// 3. Connect buttons in checkin.html
updateFile('checkin.html', (content) => {
  // Back button in header
  content = content.replace(
    /<button([^>]*?aria-label="Go Back"[^>]*?)>/i,
    `<button$1 onclick="window.location.href='index.html'">`
  );
  // Camera trigger button
  content = content.replace(
    /<button([^>]*?)>(\s*<span[^>]*?>SCAN FACILITY QR CAMERA<\/span>)/i,
    `<button$1 onclick="alert('Camera viewfinder active: Simulating turnstile scan... Verified!')">$2`
  );
  return content;
});

// 4. Connect buttons in workouts.html
updateFile('workouts.html', (content) => {
  // Notifications or header avatar click -> profile.html
  content = content.replace(
    /(<div class="w-8 h-8 rounded-full[^>]*?>)/i,
    `<div onclick="window.location.href='profile.html'" style="cursor:pointer;" $1`
  );
  return content;
});

// 5. Connect buttons in profile.html
updateFile('profile.html', (content) => {
  // UPI renew button
  content = content.replace(
    /<button([^>]*?)>(\s*[\s\S]*?RENEW PLAN VIA UPI[\s\S]*?<\/button>)/i,
    `<button$1 onclick="alert('Opening instant UPI Payment gateway (GPay / PhonePe / Paytm)... Directing to amtippufitness@upi')">$2`
  );

  // Add link to Admin view and Onboarding at bottom of profile
  const adminProfileLink = `
    <div class="carbon-card p-4 rounded-lg border border-outline-variant text-center space-y-2 mb-6">
      <span class="font-label-sm text-outline uppercase block">System Switcher</span>
      <div class="flex justify-center gap-4">
        <a href="admin.html" class="font-label-sm text-secondary hover:underline font-bold">Open Coach Ops Command →</a>
        <span class="text-outline">•</span>
        <a href="onboarding.html" class="font-label-sm text-primary hover:underline font-bold">Restart Onboarding →</a>
      </div>
    </div>
  `;
  content = content.replace(/(<\/main>)/i, `${adminProfileLink}\n$1`);

  return content;
});

// 6. Connect buttons in onboarding.html
updateFile('onboarding.html', (content) => {
  content = content.replace(
    /<button([^>]*?aria-label="Go Back"[^>]*?)>/i,
    `<button$1 onclick="window.location.href='index.html'">`
  );
  content = content.replace(
    /<button([^>]*?aria-label="Cancel Setup"[^>]*?)>/i,
    `<button$1 onclick="window.location.href='index.html'">`
  );
  content = content.replace(
    /<button([^>]*?)>(\s*<span>LOCK IN PROTOCOL &amp; CONTINUE<\/span>)/i,
    `<button$1 onclick="window.location.href='index.html'">$2`
  );
  return content;
});

// 7. Connect admin.html
updateFile('admin.html', (content) => {
  // Replace Member View button with direct link to index.html
  content = content.replace(
    /<button([^>]*?onclick="alert\('Switching profile to Member Experience preview\.\.\.'\)"[^>]*?)>/i,
    `<button$1 onclick="window.location.href='index.html'">`
  );
  // Manual turnstile pulse button
  content = content.replace(
    /<button([^>]*?)>(\s*<span[^>]*?>MANUAL TURNSTILE OVERRIDE \/ GATE PULSE<\/span>)/i,
    `<button$1 onclick="alert('⚡ Turnstile Gate 01 Pulsed! Unlocked for 10 seconds.')">$2`
  );
  return content;
});

console.log('All screens successfully wired together!');
