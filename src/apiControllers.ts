/**
 * API Routes de exemplo para demonstrar como usar a conexão com BD
 * Copie este arquivo para suas rotas reais e adapte conforme necessário
 */

import { testConnection } from './database';
import { DatabaseService } from './databaseService';

/**
 * Controlador de Usuários - Exemplo de CRUD
 */
export const userController = {
  /**
   * GET /api/users - Retorna todos os usuários
   */
  async getAll() {
    try {
      const users = await DatabaseService.findAll('users');
      return {
        success: true,
        data: users,
        count: users.length,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar usuários',
      };
    }
  },

  /**
   * GET /api/users/:id - Retorna um usuário específico
   */
  async getById(userId: string) {
    try {
      const user = await DatabaseService.findById('users', userId);
      if (!user) {
        return {
          success: false,
          error: 'Usuário não encontrado',
        };
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar usuário',
      };
    }
  },

  /**
   * POST /api/users - Cria um novo usuário
   */
  async create(userData: { id: string; name: string; email: string }) {
    try {
      const result = await DatabaseService.create('users', {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        created_at: new Date(),
      });
      return {
        success: true,
        message: 'Usuário criado com sucesso',
        insertId: result.insertId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar usuário',
      };
    }
  },

  /**
   * PUT /api/users/:id - Atualiza um usuário
   */
  async update(userId: string, updateData: Partial<{ name: string; email: string }>) {
    try {
      await DatabaseService.update('users', userId, updateData);
      return {
        success: true,
        message: 'Usuário atualizado com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao atualizar usuário',
      };
    }
  },

  /**
   * DELETE /api/users/:id - Deleta um usuário
   */
  async delete(userId: string) {
    try {
      await DatabaseService.delete('users', userId);
      return {
        success: true,
        message: 'Usuário deletado com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao deletar usuário',
      };
    }
  },
};

/**
 * Controlador de Serviços (Tatuagens, Cursos, etc)
 */
export const serviceController = {
  /**
   * GET /api/services - Retorna todos os serviços
   */
  async getAll() {
    try {
      const services = await DatabaseService.findAll('services');
      return {
        success: true,
        data: services,
        count: services.length,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao buscar serviços',
      };
    }
  },

  /**
   * POST /api/services - Cria um novo serviço
   */
  async create(serviceData: { id: string; name: string; price: number; description: string }) {
    try {
      const result = await DatabaseService.create('services', {
        id: serviceData.id,
        name: serviceData.name,
        price: serviceData.price,
        description: serviceData.description,
        created_at: new Date(),
      });
      return {
        success: true,
        message: 'Serviço criado com sucesso',
        insertId: result.insertId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao criar serviço',
      };
    }
  },
};

/**
 * Função para testar a conexão com o banco
 */
export const healthCheck = async () => {
  try {
    const isConnected = await testConnection();
    return {
      status: isConnected ? 'connected' : 'disconnected',
      database: 'MySQL',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Erro ao verificar conexão com banco de dados',
      error: String(error),
    };
  }
};
