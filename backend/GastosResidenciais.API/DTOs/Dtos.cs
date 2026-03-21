using System.Collections;
using GastosResidenciais.API.Models;

namespace GastosResidenciais.API.DTOs;

// =============== Pessoa DTOs ===================
// Payload para criação e edição de Pessoa
public record PessoaRequest(
    string Nome,
    int Idade
);

// Resposta padrão para Pessoa, obtendo o Id gerado
public record PessoaResponse(
    Guid Id,
    string Nome,
    int Idade
);

// ========== Categoria DTOs ==========
// Payload para criação de Categoria
public record CategoriaRequest(
    string Descricao,
    Finalidade Finalidade
);

// Resposta padrão para Categoria
public record CategoriaResponse(
    Guid Id,
    string Descricao,
    Finalidade Finalidade,
    string FinalidadeDescricao
);

// ========== Transação DTOs ==========
// Payload para criação de Transação
public record TransacaoRequest(
    string Descricao,
    decimal Valor,
    TipoTransacao Tipo,
    Guid CategoriaId,
    Guid PessoaId
);

// Resposta padrão para Transação, com dados desnormalizados para exibição
public record TransacaoResponse(
    Guid Id,
    string Descricao,
    decimal Valor,
    TipoTransacao Tipo,
    string TipoDescricao,
    Guid CategoriaId,
    string CategoriaDescricao,
    Guid PessoaId,
    string PessoaNome
);

// ========== Relatório DTOs ==========
// Total financeiro de uma Pessoa: receitas, despesas e saldo
public record RelatorioPessoaItem(
    Guid PessoaId,
    string PessoaNome,
    int PessoaIdade,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo
);

// Relatório consolidado por pessoa, incluindo totais gerais no final
public record RelatorioPessoaResponse(
    IEnumerable<RelatorioPessoaItem> Pessoas,
    decimal TotalGeralReceitas,
    decimal TotalGeralDespesas,
    decimal SaldoLiquido
);

// Total financeiro de uma Categoria: receitas, despesas e saldo
public record RelatorioCategoriaItem(
    Guid CategoriaId,
    string CategoriaDescricao,
    Finalidade Finalidade,
    string FinalidadeDescricao,
    decimal TotalReceitas,
    decimal TotalDespesas,
    decimal Saldo
);

// Relatório consolidado por categoria, incluindo totais gerais no final
public record RelatorioCategoriaResponse(
    IEnumerable<RelatorioCategoriaItem> Categorias,
    decimal TotalGeralReceitas,
    decimal TotalGeralDespesas,
    decimal SaldoLiquido
);