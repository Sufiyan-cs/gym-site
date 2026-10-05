const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'temp_preview');
const files = ['index.html', 'workouts.html', 'checkin.html', 'progress.html', 'onboarding.html', 'admin.html'];

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove existing top ribbons
  content = content.replace(/<!-- MOBILE PREVIEW DOCK -->[\s\S]*?<\/div>\s*<\/div>/, '');
  content = content.replace(/<!-- Mobile Quick Navigation Bar for Preview -->[\s\S]*?<\/div>\s*<\/div>/, '');

  const activePage = f;
  const link = (href, label, isGreen = false) => {
    const isActive = href === activePage;
    let color = isGreen ? '#22C55E' : (isActive ? '#FF9A2E' : '#F0EAE0');
    let weight = (isActive || isGreen) ? '700' : '400';
    let deco = isActive ? 'underline' : 'none';
    return `<a href="${href}" style="color:${color}; font-weight:${weight}; text-decoration:${deco}; flex-shrink:0;">${label}</a>`;
  };

  const sleekRibbon = `
<!-- MOBILE PREVIEW DOCK -->
<div style="background:#141210; border-bottom:1px solid #2C261F; padding:8px 12px; font-family:'JetBrains Mono',monospace; font-size:11px; display:flex; gap:12px; align-items:center; overflow-x:auto; white-space:nowrap; position:sticky; top:0; z-index:9999; -webkit-overflow-scrolling:touch;">
  <span style="color:#FF9A2E; font-weight:700; flex-shrink:0;">AM-TIPPU MOBILE</span>
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('index.html', 'Home')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('workouts.html', 'Workouts')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('checkin.html', 'Pass')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('progress.html', 'Stats')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('profile.html', 'Profile')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('onboarding.html', 'Onboarding')}
  <span style="color:#554335; flex-shrink:0;">|</span>
  ${link('admin.html', 'Ops Command', true)}
</div>
`;

  content = content.replace(/(<body[^>]*?>)/, `$1\n${sleekRibbon}`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Synced ribbon in ${f}`);
});
