import { readFile } from 'fs/promises';

const BASE = 'https://studiomarkintatto.com.br';
const envFile = await readFile('backend/.env.production', 'utf8');
const pass = envFile.match(/^ADMIN_PASS=(.+)$/m)?.[1]?.trim();

console.log('Logging in...');
const loginRes = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: pass }),
});
const { token } = await loginRes.json();
console.log('Token OK');

const data = await readFile('backend/media/fundo-Tatto-web.mp4');
const form = new FormData();
form.append('file', new Blob([data], { type: 'video/mp4' }), 'fundo-Tatto-web.mp4');

console.log('Uploading compressed video (10.5 MB)...');
const upRes = await fetch(`${BASE}/api/uploads`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});
const result = await upRes.json();
console.log('Upload result:', JSON.stringify(result));
