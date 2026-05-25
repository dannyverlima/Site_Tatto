/**
 * Hook React para usar a API do banco de dados
 * Use este hook nos seus componentes React
 */

import { useState, useCallback } from 'react';
import { userController, serviceController, healthCheck } from './apiControllers';

export function useDatabaseAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Health Check
  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await healthCheck();
      setData(result);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Usuários
  const getUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userController.getAll();
      setData(result.data);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userController.getById(id);
      setData(result.data);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userController.create(userData);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, updateData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userController.update(id, updateData);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userController.delete(id);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Serviços
  const getServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceController.getAll();
      setData(result.data);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (serviceData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serviceController.create(serviceData);
      return result;
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    // Health
    checkHealth,
    // Users
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    // Services
    getServices,
    createService,
  };
}
