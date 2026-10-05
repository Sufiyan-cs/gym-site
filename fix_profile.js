const fs = require('fs');
const path = require('path');

const cleanPath = path.join(__dirname, 'temp_preview', 'profile_clean.html');
let content = fs.readFileSync(cleanPath, 'utf8');

// 1. Fix body tag: remove 'flex justify-center' so children stack vertically
content = content.replace(
  /<body class="[^"]*"/,
  '<body class="bg-[#050403] text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-surface-container-lowest"'
);

// 2. Fix main tag: change max-w-[390px] to max-w-md mx-auto
content = content.replace(
  /<main class="w-full max-w-\[390px\]/,
  '<main class="w-full max-w-md mx-auto'
);

// 3. Update the 5 bottom nav hrefs
content = content
  .replace(/href="#home"/g, 'href="index.html"')
  .replace(/href="#workouts"/g, 'href="workouts.html"')
  .replace(/href="#checkin"/g, 'href="checkin.html"')
  .replace(/href="#analytics"/g, 'href="progress.html"')
  .replace(/href="#profile"/g, 'href="profile.html"');

// 4. Wrap bottom nav contents in max-w-md mx-auto
content = content.replace(
  /<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-space-xs py-space-sm safe-area-bottom bg-surface-container-lowest shadow-2xl">([\s\S]*?)<\/nav>/,
  `<nav class="fixed bottom-0 left-0 w-full z-50 bg-[#0F0E0D] border-t border-[#2C261F] shadow-2xl">
    <div class="max-w-md mx-auto flex justify-around items-center px-space-xs py-space-sm safe-area-bottom">
      $1
    </div>
  </nav>`
);

// 5. Add interactive UPI payment modal + handler on RENEW PLAN VIA UPI
const upiModalHtml = `
  <!-- UPI RENEWAL MODAL POPUP -->
  <div id="upi-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4">
    <div class="bg-[#141210] border border-[#FF9A2E] rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-[0_0_40px_rgba(255,154,46,0.3)]">
      <div class="flex justify-between items-center border-b border-[#2C261F] pb-3">
        <span class="font-headline-sm uppercase text-[#FF9A2E] font-bold">UPI RENEWAL GATEWAY</span>
        <button onclick="document.getElementById('upi-modal').classList.add('hidden'); document.getElementById('upi-modal').classList.remove('flex');" class="text-white hover:text-[#FF9A2E]">✕</button>
      </div>
      <div>
        <p class="font-label-sm text-[#8F8578] uppercase">Plan: Gold 3-Month Membership</p>
        <p class="font-telemetry-digit text-2xl text-[#FF9A2E] font-bold mt-1">₹1,500</p>
      </div>
      <div class="bg-white p-3 rounded-lg inline-block shadow-inner">
        <!-- UPI QR Code placeholder -->
        <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2">
          <rect x="2" y="2" width="8" height="8" rx="1"></rect>
          <rect x="14" y="2" width="8" height="8" rx="1"></rect>
          <rect x="2" y="14" width="8" height="8" rx="1"></rect>
          <rect x="4" y="4" width="4" height="4" fill="#000"></rect>
          <rect x="16" y="4" width="4" height="4" fill="#000"></rect>
          <rect x="4" y="16" width="4" height="4" fill="#000"></rect>
          <path d="M14 14h2v2h-2zM18 14h4v2h-4zM14 18h2v4h-2zM18 18h4v4h-4z" fill="#000"></path>
        </svg>
      </div>
      <div class="bg-[#1A1712] p-2.5 rounded border border-[#2C261F] flex items-center justify-between">
        <span class="font-label-sm text-[#F0EAE0]">amtippufitness@upi</span>
        <button onclick="navigator.clipboard.writeText('amtippufitness@upi'); alert('UPI ID copied!');" class="text-xs text-[#FF9A2E] font-bold font-mono">COPY</button>
      </div>
      <p class="font-body-sm text-xs text-[#8F8578]">Open GPay, PhonePe, or Paytm and scan to renew instantly.</p>
      <button onclick="alert('Payment verified! Your Gold Plan has been extended by 90 days.'); document.getElementById('upi-modal').classList.add('hidden'); document.getElementById('upi-modal').classList.remove('flex');" class="w-full py-3 bg-[#FF9A2E] text-[#0A0908] font-bold uppercase rounded-lg font-headline-sm hover:brightness-110">
        I HAVE COMPLETED PAYMENT
      </button>
    </div>
  </div>
`;

// Insert the modal before </main>
content = content.replace('</main>', `${upiModalHtml}\n</main>`);

// Attach modal opener to RENEW PLAN VIA UPI button
content = content.replace(
  /(<button class="[^"]*min-h-\[52px\] bg-primary-container[^"]*")>/,
  `$1 onclick="document.getElementById('upi-modal').classList.remove('hidden'); document.getElementById('upi-modal').classList.add('flex');">`
);

// Also attach click to GPay / PhonePe / Paytm cards
content = content.replace(
  /(<div class="h-10 bg-surface-container rounded border border-outline-variant\/60 flex items-center justify-center gap-1.5 hover:border-primary-container\/80 transition-colors cursor-pointer")/g,
  `$1 onclick="document.getElementById('upi-modal').classList.remove('hidden'); document.getElementById('upi-modal').classList.add('flex');"`
);

// 6. Add top preview dock properly so it stays on top without breaking layout
const topSwitcher = `
<!-- MOBILE PREVIEW DOCK -->
<div style="background:#1A1712; border-bottom:1px solid #332B22; padding:8px 14px; font-family:'JetBrains Mono',monospace; font-size:11px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:9999; width:100%;">
  <span style="color:#FF9A2E; font-weight:700;">AM-TIPPU MOBILE</span>
  <div style="display:flex; gap:10px; align-items:center;">
    <a href="index.html" style="color:#F0EAE0; text-decoration:none;">Home</a>
    <span style="color:#554335;">|</span>
    <a href="workouts.html" style="color:#F0EAE0; text-decoration:none;">Workouts</a>
    <span style="color:#554335;">|</span>
    <a href="checkin.html" style="color:#F0EAE0; text-decoration:none;">Pass</a>
    <span style="color:#554335;">|</span>
    <a href="progress.html" style="color:#F0EAE0; text-decoration:none;">Stats</a>
    <span style="color:#554335;">|</span>
    <a href="profile.html" style="color:#FF9A2E; font-weight:700; text-decoration:underline;">Profile</a>
    <span style="color:#554335;">|</span>
    <a href="admin.html" style="color:#22C55E; font-weight:700; text-decoration:none;">Ops Command</a>
  </div>
</div>
`;

content = content.replace(/(<body[^>]*?>)/, `$1\n${topSwitcher}`);

// 7. Add quick switcher card before </main>
const bottomSwitcherCard = `
  <div class="carbon-card p-4 rounded-lg border border-outline-variant text-center space-y-2 mb-6 mx-margin bg-surface-container-low">
    <span class="font-label-sm text-outline uppercase block text-xs">Gym System Switcher</span>
    <div class="flex justify-center gap-4 text-xs font-mono">
      <a href="admin.html" class="text-secondary hover:underline font-bold">Open Coach Ops Command →</a>
      <span class="text-outline">•</span>
      <a href="onboarding.html" class="text-primary hover:underline font-bold">Restart Onboarding →</a>
    </div>
  </div>
`;
content = content.replace('</main>', `${bottomSwitcherCard}\n</main>`);

const outPath = path.join(__dirname, 'temp_preview', 'profile.html');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Successfully regenerated and perfected profile.html!');
