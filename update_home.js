const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzEwOTU1ZDUyYWIzYzRlODNiZWZkYWNkNmRmN2QzZjUwEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242';
const dest = path.join(__dirname, 'temp_preview', 'index.html');

function download(u, d) {
  return new Promise((resolve, reject) => {
    https.get(u, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, d).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed download: ' + res.statusCode));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

function buildBottomNav(activeTab) {
  const items = [
    { id: 'home', file: 'index.html', icon: 'home', label: 'Home' },
    { id: 'workouts', file: 'workouts.html', icon: 'fitness_center', label: 'Workouts' },
    { id: 'checkin', file: 'checkin.html', icon: 'qr_code_scanner', label: 'Check-in' },
    { id: 'progress', file: 'progress.html', icon: 'monitoring', label: 'Progress' },
    { id: 'profile', file: 'profile.html', icon: 'person', label: 'Profile' }
  ];

  const htmlItems = items.map(item => {
    const isActive = item.id === activeTab;
    if (isActive) {
      return `
        <!-- ${item.label} (Active) -->
        <a aria-current="page" aria-label="${item.label}" href="${item.file}" class="flex flex-col items-center justify-center text-on-surface dark:text-on-surface p-2 after:content-[''] after:w-1.5 after:h-1.5 after:bg-primary-container after:rounded-full after:mt-1 active:scale-90 transition-transform duration-200">
          <span class="material-symbols-outlined text-[23px] text-primary" style="font-variation-settings: 'FILL' 1;">${item.icon}</span>
        </a>`;
    } else {
      return `
        <!-- ${item.label} -->
        <a aria-label="${item.label}" href="${item.file}" class="flex flex-col items-center justify-center text-outline dark:text-outline p-2 hover:text-on-surface dark:hover:text-on-surface transition-colors duration-200 active:scale-90">
          <span class="material-symbols-outlined text-[23px]">${item.icon}</span>
        </a>`;
    }
  }).join('\n');

  return `
<!-- BOTTOM NAVIGATION DOCK (Unified Stitch Component) -->
<nav aria-label="Primary Navigation" class="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-2 pb-safe max-w-md mx-auto pointer-events-none">
  <div class="w-full bg-surface-container-high/90 dark:bg-surface-container-high/90 backdrop-blur-xl rounded-full micro-border shadow-[0px_12px_32px_rgba(255,154,46,0.15)] flex justify-around items-center px-3 py-1.5 pointer-events-auto border border-white/[0.06]">
    ${htmlItems}
  </div>
</nav>`;
}

async function run() {
  let content = await download(url, dest);
  console.log('Downloaded new index.html with Member Streaks:', content.length, 'bytes');

  // Replace navigation with unified bottom nav
  const navRegex = /<!-- BOTTOM NAVIGATION DOCK[\s\S]*?<\/nav>/i;
  if (navRegex.test(content)) {
    content = content.replace(navRegex, buildBottomNav('home'));
  } else {
    const genericNav = /<nav[\s\S]*?<\/nav>/i;
    if (genericNav.test(content)) {
      content = content.replace(genericNav, buildBottomNav('home'));
    }
  }

  // Ensure button links are wired
  content = content.replace(/Start Workout/g, 'Start Workout');
  content = content.replace(/(<button[^>]*class="[^"]*bg-primary-container[^"]*"[^>]*>[\s\S]*?Start Workout[\s\S]*?<\/button>)/, '<a href="workouts.html" style="text-decoration:none">$1</a>');
  
  // Quick Turnstile Pass button
  content = content.replace(/Turnstile QR Pass/g, 'Turnstile QR Pass');

  fs.writeFileSync(dest, content, 'utf8');
  console.log('Saved and patched index.html successfully!');
}

run().catch(console.error);
