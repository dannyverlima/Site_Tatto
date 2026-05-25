import { getPool } from './database';

/**
 * CRUD Service para o banco de dados
 * Funções auxiliares para executar queries
 */

export class DatabaseService {
  /**
   * Executa uma query SELECT
   */
  static async query(sql: string, values: any[] = []) {
    try {
      const pool = getPool();
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(sql, values);
      connection.release();
      return rows;
    } catch (error) {
      console.error('❌ Erro ao executar query:', error);
      throw error;
    }
  }

  /**
   * Executa uma query de INSERT/UPDATE/DELETE
   */
  static async execute(sql: string, values: any[] = []) {
    try {
      const pool = getPool();
      const connection = await pool.getConnection();
      const [result] = await connection.execute(sql, values);
      connection.release();
      return result;
    } catch (error) {
      console.error('❌ Erro ao executar comando:', error);
      throw error;
    }
  }

  /**
   * Busca um registro por ID
   */
  static async findById(table: string, id: string) {
    try {
      const sql = `SELECT * FROM ${table} WHERE id = ?`;
      const rows = await this.query(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`❌ Erro ao buscar registro de ${table}:`, error);
      throw error;
    }
  }

  /**
   * Busca todos os registros de uma tabela
   */
  static async findAll(table: string, limit: number = 100) {
    try {
      const sql = `SELECT * FROM ${table} LIMIT ?`;
      return await this.query(sql, [limit]);
    } catch (error) {
      console.error(`❌ Erro ao buscar registros de ${table}:`, error);
      throw error;
    }
  }

  /**
   * Insere um novo registro
   */
  static async create(table: string, data: Record<string, any>) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      
      const result = await this.execute(sql, values);
      return { success: true, insertId: result.insertId };
    } catch (error) {
      console.error(`❌ Erro ao criar registro em ${table}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um registro
   */
  static async update(table: string, id: string, data: Record<string, any>) {
    try {
      const keys = Object.keys(data);
      const values = [...Object.values(data), id];
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = ?`;
      
      await this.execute(sql, values);
      return { success: true, message: `Registro ${id} atualizado com sucesso` };
    } catch (error) {
      console.error(`❌ Erro ao atualizar registro em ${table}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um registro
   */
  static async delete(table: string, id: string) {
    try {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      await this.execute(sql, [id]);
      return { success: true, message: `Registro ${id} deletado com sucesso` };
    } catch (error) {
      console.error(`❌ Erro ao deletar registro de ${table}:`, error);
      throw error;
    }
  }
}

export default DatabaseService;
