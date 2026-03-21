// Enums (espelhando os mesmos do backend)
/** Finalidade das categorias */
export type Finalidade = 'Despesa' | 'Receita' | 'Ambas';

/** Tipo de uma transação financeira */
export type TipoTransacao = 'Despesa' | 'Receita';

// Interfaces (espelhando os mesmos do backend)
// ========== Pessoa ==========
export interface Pessoa {
    id: string;
    nome: string;
    idade: number;
}

export interface PessoaRequest {
    nome: string;
    idade: number;
}

// ========== Categoria ==========
export interface Categoria {
    id: string;
    descricao: string;
    finalidade: Finalidade;
    finalidadeDescricao: string; // Campo adicional para exibir a descrição da finalidade
}

export interface CategoriaRequest {
    descricao: string;
    finalidade: number; // Usamos number aqui para enviar o valor do enum
}

// ========== Transacao ==========
export interface Transacao {
    id: string;
    descricao: string;
    valor: number;
    tipo: TipoTransacao;
    tipoDescricao: string; // Campo adicional para exibir a descrição do tipo
    categoriaId: string;
    categoriaDescricao: string; // Campo adicional para exibir a descrição da categoria
    pessoaId: string;
    pessoaNome: string; // Campo adicional para exibir o nome da pessoa
}

export interface TransacaoRequest {
    descricao: string;
    valor: number;
    tipo: number; // Usamos number aqui para enviar o valor do enum
    categoriaId: string;
    pessoaId: string;
}

// ========== Relatórios ==========
export interface RelatorioPessoaItem {
    pessoaId: string;
    pessoaNome: string;
    pessoaIdade: number;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

export interface RelatorioPessoaResponse {
    pessoas: RelatorioPessoaItem[];
    totalGeralReceitas: number;
    totalGeralDespesas: number;
    saldoLiquido: number;
}

export interface RelatorioCategoriaItem {
    categoriaId: string;
    categoriaDescricao: string;
    finalidade: Finalidade;
    finalidadeDescricao: string; // Campo adicional para exibir a descrição da finalidade
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
}

export interface RelatorioCategoriaResponse {
    categorias: RelatorioCategoriaItem[];
    totalGeralReceitas: number;
    totalGeralDespesas: number;
    saldoLiquido: number;
}