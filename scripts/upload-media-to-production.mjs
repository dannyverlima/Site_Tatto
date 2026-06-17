/**
 * Faz upload de todos os ficheiros de backend/media/ para o servidor de produção.
 * Executa: node scripts/upload-media-to-production.mjs
 */
import { readdir, readFile } from 'fs/promises';
import { resolve, dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import { statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const mediaDir = join(projectRoot, 'backend', 'media');

const BASE_URL = 'https://studiomarkintatto.com.br';

// Lê a password do ficheiro .env.production
async function getAdminPass() {
  try {
    const envFile = await readFile(join(projectRoot, 'backend', '.env.production'), 'utf8');
    const match = envFile.match(/^ADMIN_PASS=(.+)$/m);
    if (match) return match[1].trim();
  } catch { /* */ }
  return null;
}

// Detecta o mime type pelo extension
function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4',
    '.mov': 'video/quicktime', '.webm': 'video/webm',
  };
  return map[ext] || 'application/octet-stream';
}

async function main() {
  console.log('🚀 Upload de media para produção\n');

  // 1. Login
  const adminPass = await getAdminPass();
  if (!adminPass) {
    console.error('❌ Não encontrei ADMIN_PASS em backend/.env.production');
    process.exit(1);
  }

  console.log('🔑 A fazer login no servidor...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPass }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login falhou:', loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('✅ Login OK\n');

  // 2. Listar ficheiros locais
  const entries = await readdir(mediaDir, { withFileTypes: true });
  const files = entries
    .filter(e => e.isFile())
    .map(e => e.name)
    .sort();

  if (files.length === 0) {
    console.log('Nenhum ficheiro encontrado em backend/media/');
    return;
  }

  console.log(`📂 ${files.length} ficheiros encontrados:\n`);

  // 3. Upload de cada ficheiro
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const filename of files) {
    const filePath = join(mediaDir, filename);
    const sizeMB = (statSync(filePath).size / (1024 * 1024)).toFixed(1);
    const mime = getMimeType(filename);

    // Pular vídeos grandes (>100MB) — fazer via SFTP
    if (mime.startsWith('video/') && statSync(filePath).size > 100 * 1024 * 1024) {
      console.log(`⏭️  ${filename} (${sizeMB}MB) — vídeo grande, faz via SFTP`);
      skip++;
      continue;
    }

    process.stdout.write(`⬆️  ${filename} (${sizeMB}MB)... `);

    try {
      const fileData = await readFile(filePath);
      const formData = new FormData();
      const blob = new Blob([fileData], { type: mime });
      formData.append('file', blob, filename);

      const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (uploadRes.ok) {
        const result = await uploadRes.json();
        console.log(`✅ OK → ${result.url}`);
        ok++;
      } else {
        const err = await uploadRes.text();
        console.log(`❌ Erro ${uploadRes.status}: ${err.slice(0, 80)}`);
        fail++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      fail++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Enviados: ${ok}`);
  if (skip > 0) console.log(`⏭️  Ignorados (vídeos grandes): ${skip}`);
  if (fail > 0) console.log(`❌ Falhados: ${fail}`);
  console.log(`\n⚠️  ATENÇÃO: os ficheiros foram carregados com novos IDs.`);
  console.log(`   Vai ao admin do site e reatribui as fotos aos especialistas e portfólio.`);
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
