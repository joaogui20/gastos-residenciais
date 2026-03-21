using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Controller de consultas e relatórios financeiros.
/// 
/// Disponibiliza:
///   - Totais por Pessoa (receitas, despesas, saldo individual + totais gerais)
///   - Totais por Categoria (receitas, despesas, saldo por categoria + totais gerais)
/// 
/// Os cálculos são feitos diretamente via LINQ sobre o banco de dados,
/// evitando carregar dados desnecessários para a memória.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class RelatoriosController : ControllerBase
{
    private readonly AppDbContext _db;

    public RelatoriosController(AppDbContext db) => _db = db;

    // GET /api/relatorios/por-pessoa
    /// <summary>
    /// Retorna o resumo financeiro de cada pessoa cadastrada.
    /// Para cada pessoa: total de receitas, total de despesas e saldo (receita - despesa).
    /// Ao final: totais gerais consolidando todas as pessoas.
    /// </summary>
    [HttpGet("por-pessoa")]
    [ProducesResponseType(typeof(RelatorioPessoaResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> TotaisPorPessoa()
    {
        // Left join: inclui pessoas sem transações (totais = 0)
        var pessoas = await _db.Pessoas
            .AsNoTracking()
            .OrderBy(p => p.Nome)
            .Select(p => new RelatorioPessoaItem(
                p.Id,
                p.Nome,
                p.Idade,
                // Soma somente Receitas desta pessoa; retorna 0 se não houver
                p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => (decimal?)t.Valor) ?? 0,
                // Soma somente Despesas desta pessoa; retorna 0 se não houver
                p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => (decimal?)t.Valor) ?? 0,
                // Saldo = Receitas - Despesas (pode ser negativo)
                (p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => (decimal?)t.Valor) ?? 0)
                -
                (p.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => (decimal?)t.Valor) ?? 0)
            ))
            .ToListAsync();

        // Totais gerais: agrega os valores já calculados por pessoa
        var totalGeralReceitas  = pessoas.Sum(p => p.TotalReceitas);
        var totalGeralDespesas  = pessoas.Sum(p => p.TotalDespesas);
        var saldoLiquido        = totalGeralReceitas - totalGeralDespesas;

        var resposta = new RelatorioPessoaResponse(
            pessoas,
            totalGeralReceitas,
            totalGeralDespesas,
            saldoLiquido);

        return Ok(resposta);
    }

    // GET /api/relatorios/por-categoria
    /// <summary>
    /// Retorna o resumo financeiro de cada categoria cadastrada.
    /// Para cada categoria: total de receitas, total de despesas e saldo.
    /// Ao final: totais gerais consolidando todas as categorias.
    /// </summary>
    [HttpGet("por-categoria")]
    [ProducesResponseType(typeof(RelatorioCategoriaResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> TotaisPorCategoria()
    {
        var categorias = await _db.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Descricao)
            .Select(c => new RelatorioCategoriaItem(
                c.Id,
                c.Descricao,
                c.Finalidade,
                c.Finalidade.ToString(),
                c.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => (decimal?)t.Valor) ?? 0,
                c.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => (decimal?)t.Valor) ?? 0,
                (c.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Receita)
                    .Sum(t => (decimal?)t.Valor) ?? 0)
                -
                (c.Transacoes
                    .Where(t => t.Tipo == TipoTransacao.Despesa)
                    .Sum(t => (decimal?)t.Valor) ?? 0)
            ))
            .ToListAsync();

        var totalGeralReceitas = categorias.Sum(c => c.TotalReceitas);
        var totalGeralDespesas = categorias.Sum(c => c.TotalDespesas);
        var saldoLiquido       = totalGeralReceitas - totalGeralDespesas;

        var resposta = new RelatorioCategoriaResponse(
            categorias,
            totalGeralReceitas,
            totalGeralDespesas,
            saldoLiquido);

        return Ok(resposta);
    }
}