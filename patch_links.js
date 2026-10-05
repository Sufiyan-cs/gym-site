const fs = require('fs');
const path = require('path');

const previewDir = path.join(__dirname, 'temp_preview');

function buildBottomNav(activeTab) {
  // activeTab: 'home' | 'workouts' | 'checkin' | 'progress' | 'profile'
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

const filesConfig = [
  { file: 'index.html', active: 'home' },
  { file: 'workouts.html', active: 'workouts' },
  { file: 'checkin.html', active: 'checkin' },
  { file: 'progress.html', active: 'progress' },
  { file: 'profile.html', active: 'profile' }
];

for (const cfg of filesConfig) {
  const filePath = path.join(previewDir, cfg.file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace existing <nav ...> ... </nav>
  const navRegex = /<nav[\s\S]*?<\/nav>/i;
  if (navRegex.test(content)) {
    content = content.replace(navRegex, buildBottomNav(cfg.active));
  } else {
    // If not found, insert before </body>
    content = content.replace('</body>', `${buildBottomNav(cfg.active)}\n</body>`);
  }

  // Cross links:
  if (cfg.file === 'index.html') {
    // Turnstile QR Pass pill
    content = content.replace(
      /(<section aria-label="Turnstile QR Gym Pass"[\s\S]*?<button[\s\S]*?)(type="button")/,
      '$1onclick="window.location.href=\'checkin.html\'" type="button"'
    );
    // Start Routine CTA
    content = content.replace(
      /(<button[^>]*class="[^"]*bg-primary-container[^"]*"[^>]*>[\s\S]*?Start Routine[\s\S]*?<\/button>)/,
      '<a href="workouts.html" style="text-decoration:none">$1</a>'
    );
  }

  if (cfg.file === 'profile.html') {
    // Back arrow button
    content = content.replace(
      /(<button aria-label="Go Back"[^>]*>)/,
      '$1'
    ).replace(
      'aria-label="Go Back"',
      'aria-label="Go Back" onclick="window.location.href=\'index.html\'"'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched bottom nav and links in ${cfg.file}`);
}

console.log('Navigation wiring complete!');
