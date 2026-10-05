const fs = require('fs');

['index.html', 'workouts.html', 'checkin.html', 'progress.html', 'profile.html'].forEach(f => {
  const content = fs.readFileSync('temp_preview/' + f, 'utf8');
  const navMatch = content.match(/<nav[\s\S]*?<\/nav>/);
  if (navMatch) {
    console.log('=== ' + f + ' ===');
    const links = navMatch[0].match(/<a[^>]*>/g) || [];
    links.forEach(l => {
      console.log('  ' + l);
    });
  }
});
