import { Client } from 'pg';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const outputPath = path.join(rootDir, 'db', 'exports', 'studio_tatto_current.sql');
const mediaDir = path.join(rootDir, 'db', 'exports', 'media_assets');
const mediaManifestPath = path.join(rootDir, 'db', 'exports', 'media_assets_manifest.json');

const preferredOrder = [
  'site',
  'page',
  'hero',
  'course',
  'course_feature',
  'course_highlight',
  'course_extra_info',
  'specialist',
  'portfolio_item',
  'review',
  'contact_submission',
  'course_enrollment',
  'location',
  'opening_hours',
  'contact_info',
  'social_link',
  'site_link',
];

const escapeSqlString = (value) => String(value).replace(/'/g, "''");

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (Buffer.isBuffer(value)) {
    return `decode('${value.toString('hex')}', 'hex')`;
  }

  if (value instanceof Date) {
    return `'${escapeSqlString(value.toISOString())}'`;
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL';
  }

  if (Array.isArray(value)) {
    return `ARRAY[${value.map(formatValue).join(', ')}]`;
  }

  return `'${escapeSqlString(value)}'`;
};

const client = new Client({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'studio_tatto',
});

await client.connect();

try {
  const tableResult = await client.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'app' AND table_type = 'BASE TABLE'`
  );

  const existingTables = new Set(tableResult.rows.map((row) => row.table_name));
  existingTables.delete('media_asset');
  const orderedTables = [
    ...preferredOrder.filter((table) => existingTables.has(table)),
    ...[...existingTables].filter((table) => !preferredOrder.includes(table)).sort(),
  ];

  const lines = [];
  lines.push('-- Auto-generated data dump for Site_Tatto');
  lines.push(`-- Generated at ${new Date().toISOString()}`);
  lines.push('BEGIN;');
  lines.push(
    'TRUNCATE TABLE app.page, app.hero, app.course_feature, app.course_highlight, app.course_extra_info, app.course, app.portfolio_item, app.specialist, app.review, app.contact_submission, app.course_enrollment, app.location, app.opening_hours, app.contact_info, app.social_link, app.site_link, app.media_asset, app.site RESTART IDENTITY CASCADE;'
  );

  for (const tableName of orderedTables) {
    const columnResult = await client.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'app' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );

    const columns = columnResult.rows.map((row) => row.column_name);
    if (columns.length === 0) {
      continue;
    }

    const orderBy = columns.includes('created_at') ? 'ORDER BY created_at NULLS LAST' : columns.includes('id') ? 'ORDER BY id' : '';
    const rowResult = await client.query(`SELECT * FROM app.${tableName} ${orderBy}`);

    if (rowResult.rowCount === 0) {
      continue;
    }

    lines.push('');
    lines.push(`-- ${tableName}`);

    const columnList = columns.map((column) => `"${column}"`).join(', ');
    const valuesList = rowResult.rows
      .map((row) => `(${columns.map((column) => formatValue(row[column])).join(', ')})`)
      .join(',\n');

    lines.push(`INSERT INTO app.${tableName} (${columnList}) VALUES`);
    lines.push(valuesList + ';');
  }

  const mediaResult = await client.query(
    `SELECT id, site_id, filename, mimetype, created_at, octet_length(data) AS size
     FROM app.media_asset
     ORDER BY created_at, id`
  );

  const mediaManifest = [];
  if (mediaResult.rowCount > 0) {
    await fs.mkdir(mediaDir, { recursive: true });
  }

  const mediaChunkSize = 8 * 1024 * 1024;

  for (const media of mediaResult.rows) {
    const extension = path.extname(media.filename || '') || '.bin';
    const fileName = `${media.id}${extension}`;
    const filePath = path.join(mediaDir, fileName);
    const handle = await fs.open(filePath, 'w');

    try {
      for (let offset = 1; offset <= media.size; offset += mediaChunkSize) {
        const chunkResult = await client.query(
          'SELECT substring(data FROM $1 FOR $2) AS chunk FROM app.media_asset WHERE id = $3',
          [offset, mediaChunkSize, media.id]
        );

        const chunk = chunkResult.rows[0]?.chunk;
        if (!chunk || chunk.length === 0) {
          break;
        }

        await handle.write(chunk);
      }
    } finally {
      await handle.close();
    }

    mediaManifest.push({
      id: media.id,
      siteId: media.site_id,
      filename: media.filename,
      mimetype: media.mimetype,
      createdAt: media.created_at,
      size: media.size,
      file: `media_assets/${fileName}`,
    });
  }

  lines.push('COMMIT;');

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  await fs.writeFile(mediaManifestPath, `${JSON.stringify(mediaManifest, null, 2)}\n`, 'utf8');

  console.log(`Export concluido: ${outputPath}`);
  if (mediaManifest.length > 0) {
    console.log(`Media exportadas: ${mediaManifestPath}`);
  }
} finally {
  await client.end();
}