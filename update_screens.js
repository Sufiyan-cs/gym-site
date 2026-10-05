const https = require('https');
const fs = require('fs');
const path = require('path');

const screensToUpdate = [
  {
    name: 'workouts.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzU3OWViNTNlZDc0YjQxYTY4Yzc0NmNmNGQyZmViOWVmEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  },
  {
    name: 'progress.html',
    url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzEwNmZkMjgyMWYyNDQ1M2FiZmEyNmM0MDU5OGRlMjVmEgsSBxCn8cSExhQYAZIBIwoKcHJvamVjdF9pZBIVQhM1NDkyMDcxMDI1ODAyMjQ4MTIx&filename=&opi=96797242'
  }
];

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
        console.log(`Updated ${path.basename(dest)} (${data.length} bytes)`);
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function run() {
  for (const s of screensToUpdate) {
    const dest = path.join(__dirname, 'temp_preview', s.name);
    await download(s.url, dest);
  }
}

run().catch(console.error);
