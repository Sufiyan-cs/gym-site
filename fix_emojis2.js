const fs = require('fs');
let p = 'client/src/app/dashboard/layout.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/<span style=\{\{ fontSize: '1.2rem' \}\}\>.*<\/span>/g, '<span style={{ fontSize: 1.2rem }}>🔔</span>');
c = c.replace(/<span style=\{\{ fontSize: '1.5rem', marginBottom: '4px' \}\}\>.*<\/span> Home/g, '<span style={{ fontSize: 1.5rem, marginBottom: 4px }}>🏠</span> Home');
c = c.replace(/<span style=\{\{ fontSize: '1.5rem', marginBottom: '4px' \}\}\>.*<\/span> Workouts/g, '<span style={{ fontSize: 1.5rem, marginBottom: 4px }}>💪</span> Workouts');
c = c.replace(/<span style=\{\{ fontSize: '1.8rem' \}\}\>.*<\/span>/g, '<span style={{ fontSize: 1.8rem }}>📷</span>');
c = c.replace(/<span style=\{\{ fontSize: '1.5rem', marginBottom: '4px' \}\}\>.*<\/span> Progress/g, '<span style={{ fontSize: 1.5rem, marginBottom: 4px }}>📈</span> Progress');
c = c.replace(/<span style=\{\{ fontSize: '1.5rem', marginBottom: '4px' \}\}\>.*<\/span> Profile/g, '<span style={{ fontSize: 1.5rem, marginBottom: 4px }}>👤</span> Profile');
fs.writeFileSync(p, c, 'utf8');

p = 'client/src/app/dashboard/page.tsx';
c = fs.readFileSync(p, 'utf8');
c = c.replace(/\{streak\} DAYS .*/g, '{streak} DAYS 🔥</span>');
c = c.replace(/className=\{\streak-flame \$\{d\.active \? 'active' : ''\}\\}\>.*<\/span>/g, 'className={streak-flame }>🔥</span>');
c = c.replace(/<span\>.* Browse Workouts<\/span>/g, '<span>💪 Browse Workouts</span>');
c = c.replace(/<span\>.* Log Weight<\/span>/g, '<span>📈 Log Weight</span>');
c = c.replace(/<span style=\{\{ color: 'var\(--amber\)' \}\}\>.* Scan Check-in<\/span>/g, '<span style={{ color: ar(--amber) }}>📷 Scan Check-in</span>');
c = c.replace(/<span style=\{\{ color: 'var\(--amber\)' \}\}\>.*?<\/span>\r?\n\s*<\/Link>/g, '<span style={{ color: ar(--amber) }}>→</span>\n      </Link>');
fs.writeFileSync(p, c, 'utf8');
