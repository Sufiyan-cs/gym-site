const fs = require('fs');
const path = require('path');
const https = require('https');

const screens = [
  {
    name: 'index.html',
    title: 'Home Dashboard',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJmMGI5NDU2YmU2YjQxNjliMTllNWViNWU2OTM4YjEyEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'workouts.html',
    title: 'Workout Library',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y5YWUzOTBkMDQxYjQzMjRhOGZiNDNiOTFiMjZjMWRiEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'checkin.html',
    title: 'Digital Pass & Check-In',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NiMGQ4ZDI5OGIzNTQ0Njc5NmNjODY5YjQ4YTcxZWU5EgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'progress.html',
    title: 'Progress & Transformation',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzQwNzQyZDhmZDMyZDRkZjFiMjgzNWEwNDIxZjBjMzUwEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'profile.html',
    title: 'Athlete Profile & Subscription',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2E5YzMzNjJlN2UzODQwNDliNjg1NDljYWZiMmFmMjcwEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'onboarding.html',
    title: 'Onboarding & Goals',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y2Y2FiMGM3NzJkZDQ0M2JiZDBkNjVlYTczNjJiMTJiEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  },
  {
    name: 'admin.html',
    title: 'Gym Operations Command',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2VmMTYyYTc0Y2JmYjRhZTA4NjI3YjUyNmU1ZWIyOGQ4EgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1MzMwNjUzMDI5MDg3OTMxNDc0&filename=&opi=96797242'
  }
];

const targetDir = path.join(__dirname, 'temp_preview');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status code: ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading screens...');
  for (const s of screens) {
    try {
      console.log(`Downloading ${s.name} (${s.title})...`);
      const html = await fetchUrl(s.url);
      const filePath = path.join(targetDir, s.name);
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✓ Saved ${s.name} (${html.length} bytes)`);
    } catch (err) {
      console.error(`✗ Error downloading ${s.name}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

main();
