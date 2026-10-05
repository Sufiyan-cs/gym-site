const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'temp_preview');

function fixFileNav(fileName) {
  const filePath = path.join(dir, fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix #home, #workouts, #checkin, #analytics, #profile
  content = content
    .replace(/href="#home"/g, 'href="index.html"')
    .replace(/href="#workouts"/g, 'href="workouts.html"')
    .replace(/href="#checkin"/g, 'href="checkin.html"')
    .replace(/href="#analytics"/g, 'href="progress.html"')
    .replace(/href="#profile"/g, 'href="profile.html"');

  // For progress.html where all 5 links are href="#" in order:
  if (fileName === 'progress.html') {
    const navMatch = content.match(/<nav[\s\S]*?<\/nav>/);
    if (navMatch) {
      let nav = navMatch[0];
      const pages = ['index.html', 'workouts.html', 'checkin.html', 'progress.html', 'profile.html'];
      let i = 0;
      nav = nav.replace(/href="#"/g, () => {
        const page = pages[i] || '#';
        i++;
        return `href="${page}"`;
      });
      content = content.replace(navMatch[0], nav);
    }
  }

  // Also in workouts.html, make sure back button or workout start buttons lead to sensible actions
  if (fileName === 'workouts.html') {
    // Add quick link back to home if needed
    content = content.replace(/(<button[^>]*?aria-label="Notifications"[^>]*?>)/i, `
      <a href="index.html" class="flex items-center text-xs text-outline hover:text-primary mr-2 font-mono">← Back</a>
      $1
    `);
  }

  // Add mobile preview switcher to all screens for convenience
  if (!content.includes('MOBILE PREVIEW DOCK')) {
    const topSwitcher = `
    <!-- MOBILE PREVIEW DOCK -->
    <div style="background:#1A1712; border-bottom:1px solid #332B22; padding:6px 14px; font-family:'JetBrains Mono',monospace; font-size:11px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:9999;">
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
        <a href="profile.html" style="color:#F0EAE0; text-decoration:none;">Profile</a>
        <span style="color:#554335;">|</span>
        <a href="admin.html" style="color:#22C55E; font-weight:700; text-decoration:none;">Ops Command</a>
      </div>
    </div>
    `;
    content = content.replace(/(<body[^>]*?>)/i, `$1\n${topSwitcher}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fully linked ${fileName}`);
}

['index.html', 'workouts.html', 'checkin.html', 'progress.html', 'profile.html', 'onboarding.html', 'admin.html'].forEach(fixFileNav);
