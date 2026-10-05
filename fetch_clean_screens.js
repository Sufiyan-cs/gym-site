const https = require('https');
const fs = require('fs');
const path = require('path');

const screens = [
  {
    name: 'index.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzllOTk2ODgzNDYzNDQ0NzJhNjgwMDk1ZWUyZTk0ZTBiEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  },
  {
    name: 'workouts.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y4OTE2NDczNDExMjRkODA5Y2YwODUyMzE5N2YzNDUyEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  },
  {
    name: 'checkin.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y5MDllODkwMTQ4OTQwMjU5Y2FmMjI0ZWVmYzM0YmI0EgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  },
  {
    name: 'progress.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JlMzcxYjhjYTQyYzRkZjk5ZTE2YzE1MDZjNjBjNzc4EgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  },
  {
    name: 'profile.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc2OWFlY2FkZGIyYzQ4ZmFhZjlmYTFhYjJmMTRiYTE1EgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  }
];

// Backup old files first if not already backed up
const backupDir = path.join(__dirname, 'temp_preview', 'v1_congested_backup');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  const oldFiles = fs.readdirSync(path.join(__dirname, 'temp_preview'));
  for (const f of oldFiles) {
    if (f !== 'v1_congested_backup' && !fs.lstatSync(path.join(__dirname, 'temp_preview', f)).isDirectory()) {
      fs.copyFileSync(path.join(__dirname, 'temp_preview', f), path.join(backupDir, f));
    }
  }
  console.log('Archived old congested screens into v1_congested_backup/');
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        fs.writeFileSync(dest, data, 'utf8');
        console.log(`Downloaded ${path.basename(dest)} (${data.length} bytes)`);
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const screen of screens) {
    const dest = path.join(__dirname, 'temp_preview', screen.name);
    await download(screen.url, dest);
  }
  console.log('All 5 clean screens downloaded successfully!');
}

run().catch(console.error);
