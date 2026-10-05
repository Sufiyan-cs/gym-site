const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'temp_preview', 'profile.html');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Remove any old preview dock
content = content.replace(/<!-- MOBILE PREVIEW DOCK -->[\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Clean top preview ribbon that never wraps
const sleekRibbon = `
<!-- MOBILE PREVIEW DOCK -->
<div style="background:#141210; border-bottom:1px solid #2C261F; padding:8px 12px; font-family:'JetBrains Mono',monospace; font-size:11px; display:flex; gap:12px; align-items:center; overflow-x:auto; white-space:nowrap; position:sticky; top:0; z-index:9999; -webkit-overflow-scrolling:touch;">
  <span style="color:#FF9A2E; font-weight:700; flex-shrink:0;">AM-TIPPU MOBILE</span>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="index.html" style="color:#F0EAE0; text-decoration:none; flex-shrink:0;">Home</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="workouts.html" style="color:#F0EAE0; text-decoration:none; flex-shrink:0;">Workouts</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="checkin.html" style="color:#F0EAE0; text-decoration:none; flex-shrink:0;">Pass</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="progress.html" style="color:#F0EAE0; text-decoration:none; flex-shrink:0;">Stats</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="profile.html" style="color:#FF9A2E; font-weight:700; text-decoration:underline; flex-shrink:0;">Profile</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="onboarding.html" style="color:#F0EAE0; text-decoration:none; flex-shrink:0;">Onboarding</a>
  <span style="color:#554335; flex-shrink:0;">|</span>
  <a href="admin.html" style="color:#22C55E; font-weight:700; text-decoration:none; flex-shrink:0;">Ops Command</a>
</div>
`;

// Insert ribbon right after <body>
content = content.replace(/(<body[^>]*?>)/, `$1\n${sleekRibbon}`);

// 3. Remove overflow-x-hidden from main so position: fixed works relative to viewport
content = content.replace(
  /<main class="([^"]*?)overflow-x-hidden([^"]*?)"/,
  '<main class="$1$2"'
);

// 4. Extract nav tag and place it outside main, before </body>
const navRegex = /<nav[\s\S]*?<\/nav>/;
const navMatch = content.match(navRegex);
if (navMatch) {
  const navHtml = navMatch[0];
  // Remove nav from inside main
  content = content.replace(navRegex, '');
  // Insert nav right before </body>
  content = content.replace('</body>', `${navHtml}\n</body>`);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Fixed profile layout and nav placement!');
