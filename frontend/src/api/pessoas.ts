import apiClient from "./client";
import type { Pessoa, PessoaRequest } from "../types";

/**
 * API para operações relacionadas a pessoas.
 */
export const pessoasApi = {
    /** Listar todas as pessoas cadastradas */
    listar: async (): Promise<Pessoa[]> => {
        const { data } = await apiClient.get<Pessoa[]>('/pessoas');

        return data;
    },

    /** Criar uma nova pessoa */
    criar: async (payload: PessoaRequest): Promise<Pessoa> => {
        const { data } = await apiClient.post<Pessoa>('/pessoas', payload);

        return data;
    },

    /** Atualizar dados de uma pessoa existente */
    atualizar: async (id: number, payload: PessoaRequest): Promise<Pessoa> => {
        const { data } = await apiClient.put<Pessoa>(`/pessoas/${id}`, payload);

        return data;
    },

    /**
     * Excluir uma pessoa do sistema
     * O backend apaga todas as transações associadas a essa pessoa, garantindo a integridade dos dados.
     */
    deletar: async (id: string): Promise<void> => {
        await apiClient.delete(`/pessoas/${id}`);
    },
};