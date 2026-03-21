import apiClient from './client';
import type { Categoria, CategoriaRequest } from '../types';

/** Serviço de acesso aos endpoints de Categorias. */
export const categoriasApi = {
    /** Listar todas as categorias cadastradas */
    listar: async (): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>('/categorias');
    return data;
  },                                          // ← vírgula aqui

    /**
   * Lista categorias compatíveis com um tipo de transação.
   * @param tipo - 1 (Despesa) ou 2 (Receita)
   * Utilizado para filtrar as opções no formulário de transação.
   */
    listarPorTipo: async (tipo: number): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>('/categorias/por-tipo', {
      params: { tipo },
    });
    return data;
  },                                          // ← vírgula aqui

    /** Cria uma nova categoria. */
    criar: async (payload: CategoriaRequest): Promise<Categoria> => {
    const { data } = await apiClient.post<Categoria>('/categorias', payload);
    return data;
  },                                          // ← opcional na última
};