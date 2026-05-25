import mysql from 'mysql2/promise';

// Configurações do banco de dados
const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost5173',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || '27102006',
  database: import.meta.env.VITE_DB_NAME || 'postgres',
  port: Number(import.meta.env.VITE_DB_PORT) || 5432,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: any;

/**
 * Obtém o pool de conexões do banco de dados
 */
export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

/**
 * Testa a conexão com o banco de dados
 */
export const testConnection = async () => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
};

export default dbConfig;
