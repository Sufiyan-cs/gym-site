const fs = require('fs');
let p = 'client/src/app/dashboard/layout.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/fontSize: \1.2rem\/g, "fontSize: '1.2rem'");
c = c.replace(/fontSize: \1.5rem\, marginBottom: \4px\/g, "fontSize: '1.5rem', marginBottom: '4px'");
c = c.replace(/fontSize: \1.8rem\/g, "fontSize: '1.8rem'");
fs.writeFileSync(p, c, 'utf8');

p = 'client/src/app/dashboard/page.tsx';
c = fs.readFileSync(p, 'utf8');
c = c.replace(/color: \ar\(--amber\)\/g, "color: 'var(--amber)'");
c = c.replace(/className=\{\streak-flame \$\{d\.active \? \ctive\ : \\\}\\}/g, "className={streak-flame \}");
fs.writeFileSync(p, c, 'utf8');
