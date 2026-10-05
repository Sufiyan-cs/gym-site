const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

process.on('uncaughtException', (err) => {
  console.error('Server handled uncaughtException:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Server handled unhandledRejection:', reason);
});

const PORT = 4000;
const NEW_FRONTEND_DIR = path.join(__dirname, 'temp_preview', 'New_Frontend');
const FALLBACK_DIR = path.join(__dirname, 'temp_preview');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '' || reqPath === '/index.html') {
      reqPath = '/dashboard.html';
    }

    let filePath = path.join(NEW_FRONTEND_DIR, reqPath);
    let found = false;

    if (fs.existsSync(filePath)) {
      try {
        if (fs.statSync(filePath).isFile()) found = true;
      } catch(e) {}
    }

    if (!found) {
      filePath = path.join(FALLBACK_DIR, reqPath);
      if (fs.existsSync(filePath)) {
        try {
          if (fs.statSync(filePath).isFile()) found = true;
        } catch(e) {}
      }
    }

    if (!found) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
      }
      res.end('500 Server Error');
    });
    stream.pipe(res);
  } catch(err) {
    console.error('Request handler error:', err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
    }
    res.end('500 Internal Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || iface.address.startsWith('192.') || iface.address.startsWith('10.')) {
          localIp = iface.address;
          break;
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🔥 AM-TIPPU FITNESS NEW_FRONTEND PREVIEW SERVER ACTIVE!`);
  console.log(`======================================================`);
  console.log(`\n📱 On Your Mobile Phone (same Wi-Fi):`);
  console.log(`   👉 http://${localIp}:${PORT}/`);
  console.log(`\n💻 On Your PC Browser:`);
  console.log(`   👉 http://localhost:${PORT}/`);
  console.log(`\n📁 Connected Member Screens:`);
  console.log(`   • 🔐 Login:           http://${localIp}:${PORT}/login.html`);
  console.log(`   • 📝 Register:        http://${localIp}:${PORT}/register.html`);
  console.log(`   • 📋 Onboarding & Split: http://${localIp}:${PORT}/onboarding.html`);
  console.log(`   • 🏠 Home Dashboard:  http://${localIp}:${PORT}/dashboard.html`);
  console.log(`   • 🏋️ Workout Library: http://${localIp}:${PORT}/workouts.html`);
  console.log(`   • 🎫 Turnstile Pass:  http://${localIp}:${PORT}/checkin.html`);
  console.log(`   • 📊 Progress & Stats:http://${localIp}:${PORT}/progress.html`);
  console.log(`   • 👤 Member Profile:  http://${localIp}:${PORT}/profile.html`);
  console.log(`\n🛡️ Gym Admin & Staff Screens:`);
  console.log(`   • 🔐 Admin Login:     http://${localIp}:${PORT}/admin_login.html`);
  console.log(`   • 📡 Ops Command:     http://${localIp}:${PORT}/admin_dashboard.html`);
  console.log(`   • 👥 Athlete Roster:  http://${localIp}:${PORT}/admin_members.html`);
  console.log(`   • 💳 Billing & POS:   http://${localIp}:${PORT}/admin_subscriptions.html`);
  console.log(`   • 📦 Desk Inventory:  http://${localIp}:${PORT}/admin_inventory.html`);
  console.log(`======================================================\n`);
});
