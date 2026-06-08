import { pool } from '../backend/server/db.mjs';

// usa strpos() que não tem problema com backslashes
const OLD_PART = 'Site_Tatto\\imagens\\';
const NEW_PART = 'Site_Tatto\\backend\\imagens\\';

const countRes = await pool.query(
  'SELECT COUNT(*) FROM app.media_asset WHERE strpos(disk_path, $1) > 0',
  [OLD_PART]
);
console.log('Records to fix:', countRes.rows[0].count);

const upd = await pool.query(
  'UPDATE app.media_asset SET disk_path = REPLACE(disk_path, $1, $2) WHERE strpos(disk_path, $1) > 0 RETURNING id',
  [OLD_PART, NEW_PART]
);
console.log('Fixed:', upd.rowCount, 'records');

const verify = await pool.query('SELECT disk_path FROM app.media_asset WHERE disk_path IS NOT NULL LIMIT 2');
console.log('After fix:');
verify.rows.forEach(r => console.log(' ', JSON.stringify(r.disk_path)));

await pool.end();
