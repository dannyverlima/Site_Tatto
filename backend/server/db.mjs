import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

// Mock data para modo offline
const mockData = {
  sites: [{ id: randomUUID(), name: 'Studios Tatto', domain: null, created_at: new Date() }],
  portfolio_items: [],
  specialists: [],
};

// Tentar conectar ao PostgreSQL, se falhar retornar um pool mock
let pool;

try {
  pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'studio_tatto',
    max: 10,
  });
  
  // Teste rápido de conexão
  await pool.query('SELECT NOW()');
  console.log('✅ Conectado ao PostgreSQL');
} catch (error) {
  console.warn('⚠️  PostgreSQL não disponível, usando modo offline');
  console.log('   Mensagem:', error.message.split('\n')[0]);
  
  // Mock pool para desenvolvimento
  pool = {
    query: async (sql, params) => {
      const sqlLower = sql.toLowerCase();
      
      // CREATE/ALTER - retornar sucesso
      if (sqlLower.includes('create') || sqlLower.includes('alter')) {
        return { rows: [], rowCount: 0 };
      }
      
      // SELECT id FROM app.site
      if (sqlLower.includes('select id from app.site')) {
        return { rows: mockData.sites.length > 0 ? [mockData.sites[0]] : [], rowCount: mockData.sites.length };
      }
      
      // INSERT INTO app.site
      if (sqlLower.includes('insert into app.site')) {
        const newSite = { id: randomUUID(), name: params[0], domain: params[1], created_at: new Date() };
        mockData.sites.push(newSite);
        return { rows: [{ id: newSite.id }], rowCount: 1 };
      }
      
      // SELECT disk_filename FROM app.media_asset
      if (sqlLower.includes('select disk_filename')) {
        return { rows: [], rowCount: 0 };
      }
      
      // SELECT id, filename... FROM app.media_asset
      if (sqlLower.includes('select') && sqlLower.includes('media_asset')) {
        return { rows: [], rowCount: 0 };
      }
      
      console.log('📝 Query (mock):', sql.substring(0, 50) + '...');
      return { rows: [], rowCount: 0 };
    },
    connect: async () => ({
      query: async (sql, params) => {
        if (sql.toLowerCase().includes('select id from app.site')) {
          return { rows: mockData.sites.length > 0 ? [mockData.sites[0]] : [], rowCount: mockData.sites.length };
        }
        return { rows: [], rowCount: 0 };
      },
      release: () => {},
    }),
    end: async () => {},
  };
}

export { pool };



