import apiClient from './client';
import type {
    Transacao,
    TransacaoRequest,
    RelatorioPessoaResponse,
    RelatorioCategoriaResponse,
} from '../types';

/** Serviço de acesso aos endpoints de Transações */
export const transacoesApi = {
    /** Lista todas as transações com dados de pessoa e categoria */
    listar: async (): Promise<Transacao[]> => {
        const { data } = await apiClient.get<Transacao[]>('/transacoes');

        return data;
    },

    /**
     * Cria uma nova transação
     * A API valida: menor de idade, compatibilidade de categoria e valor positivo
     */
    criar: async (payload: TransacaoRequest): Promise<Transacao> => {
        const { data } = await apiClient.post<Transacao>('/transacoes', payload);

        return data;
    },
};

/** Serviço de acesso aos endpoints de Relatórios */
export const relatoriosApi = {
    /**
     * Busca totais por pessoa: receitas, despesas, saldo individual
     * e totais gerais consolidados.
     */
    porPessoa: async (): Promise<RelatorioPessoaResponse> => {
        const { data } = await apiClient.get<RelatorioPessoaResponse>('/relatorios/por-pessoa');

        return data;
    },

    /**
     * Busca totais por categoria: receitas, despesas, saldo por categoria
     * e totais gerais consolidados.
     */
    porCategoria: async (): Promise<RelatorioCategoriaResponse> => {
        const { data } = await apiClient.get<RelatorioCategoriaResponse>('relatorios/por-categoria');

        return data;
    },
};