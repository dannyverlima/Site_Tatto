import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const mediaManifestPath = path.join(rootDir, 'db', 'exports', 'media_assets_manifest.json');
const mediaDir = path.join(rootDir, 'db', 'exports');

const client = new Client({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'studio_tatto',
});

await client.connect();

try {
  const manifestRaw = await fs.readFile(mediaManifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  await client.query('BEGIN');
  await client.query('TRUNCATE TABLE app.media_asset RESTART IDENTITY CASCADE');

  for (const item of manifest) {
    const filePath = path.join(mediaDir, item.file);
    const data = await fs.readFile(filePath);

    await client.query(
      'INSERT INTO app.media_asset (id, site_id, filename, mimetype, data, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [item.id, item.siteId, item.filename, item.mimetype, data, item.createdAt]
    );
  }

  await client.query('COMMIT');
  console.log(`Media restauradas a partir de ${mediaManifestPath}`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await client.end();
}