/**
 * Faz backup das tabelas críticas antes de rodar migrações.
 * Uso: node scripts/backup-data.mjs
 * Salva em: backups/YYYY-MM-DD_HH-MM-SS.sql
 */
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupsDir = path.join(__dirname, '..', 'backups');

mkdirSync(backupsDir, { recursive: true });

const now = new Date();
const ts = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outFile = path.join(backupsDir, `${ts}.sql`);

const tables = ['app.specialist', 'app.portfolio_item', 'app.hero', 'app.media_asset', 'app.site_config'];
const tableArgs = tables.map(t => `-t "${t}"`).join(' ');

try {
  execSync(
    `pg_dump ${tableArgs} --data-only studio_tatto -f "${outFile}"`,
    { stdio: 'inherit' }
  );
  console.log(`✅ Backup salvo em: ${outFile}`);
} catch (e) {
  // pg_dump pode não estar no PATH; tenta via variável de ambiente PGPASSWORD
  console.error('❌ Erro ao rodar pg_dump:', e.message);
  console.log('Certifique-se que pg_dump está no PATH e o PostgreSQL está rodando.');
  process.exit(1);
}
