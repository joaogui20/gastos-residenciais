using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Controller responsável pelo gerenciamento de Transações financeiras.
/// 
/// Regras de negócio aplicadas no endpoint de criação:
///   1. Valor deve ser positivo (validado via Data Annotations no modelo).
///   2. Menores de 18 anos só podem registrar transações do tipo Despesa.
///   3. A Finalidade da Categoria deve ser compatível com o Tipo da transação:
///      - Categoria "Despesa"  → transação deve ser Despesa
///      - Categoria "Receita"  → transação deve ser Receita
///      - Categoria "Ambas"    → aceita qualquer tipo
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class TransacoesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TransacoesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/transacoes
    // Retorna todas as transações com dados relacionados (Pessoa e Categoria)
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TransacaoResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var transacoes = await _dbContext.Transacoes
            .AsNoTracking()
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .OrderByDescending(t => t.Valor)
            .Select(t => MapToResponse(t))
            .ToListAsync();
        
        return Ok(transacoes);
    }

    // GET /api/transacoes/por-pessoas/{pessoaId}
    // Lista todas as transações associadas a uma pessoa específica
    [HttpGet("por-pessoas/{pessoaId:guid}")]
    [ProducesResponseType(typeof(IEnumerable<TransacaoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByPessoa(Guid pessoaId)
    {
        var pessoaExiste = await _dbContext.Pessoas.AnyAsync(p => p.Id == pessoaId);

        if (!pessoaExiste) return NotFound(new { mensagem = "Pessoa não encontrada." });

        var transacoes = await _dbContext.Transacoes
            .AsNoTracking()
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .Where(t => t.PessoaId == pessoaId)
            .Select(t => MapToResponse(t))
            .ToListAsync();
        
        return Ok(transacoes);
    }

    // POST /api/transacoes
    // Cria uma nova transação financeira
    [HttpPost]
    [ProducesResponseType(typeof(TransacaoResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] TransacaoRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Verificar existência da pessoa
        var pessoa = await _dbContext.Pessoas.FindAsync(request.PessoaId);

        if (pessoa is null) return NotFound(new { mensagem = "Pessoa não encontrada." });

        // Verificar existência da categoria
        var categoria = await _dbContext.Categorias.FindAsync(request.CategoriaId);

        if (categoria is null) return NotFound(new { mensagem = "Categoria não encontrada." });

        // Primeira Regra: Menores de 18 anos só podem registrar transações do tipo Despesa
        if (pessoa.Idade < 18 && request.Tipo == TipoTransacao.Receita)
        {
            return BadRequest( new { mensagem = $"{pessoa.Nome} é menor de idade e só pode registrar transações do tipo Despesa."});
        }

        // Segunda Regra: A Finalidade da Categoria deve ser compatível com o Tipo da transação
        // Categoria "Despesa"  → transação deve ser Despesa
        // Categoria "Receita"  → transação deve ser Receita
        // Categoria "Ambas"    → aceita qualquer tipo
        var categoriaValida = categoria.Finalidade == Finalidade.Ambas ||
                            (request.Tipo == TipoTransacao.Despesa && categoria.Finalidade == Finalidade.Despesa) ||
                            (request.Tipo == TipoTransacao.Receita && categoria.Finalidade == Finalidade.Receita);
        
        if (!categoriaValida)
        {
            return BadRequest(new { mensagem = $"A categoria '{categoria.Descricao}' é destinada para '{categoria.Finalidade}' e não é compatível com o tipo de transação '{request.Tipo}'." });
        }

        // ── Persistir transação ──────────────────────────────────────────
        var transacao = new Transacao
        {
            Descricao   = request.Descricao.Trim(),
            Valor       = request.Valor,
            Tipo        = request.Tipo,
            CategoriaId = request.CategoriaId,
            PessoaId    = request.PessoaId
        };

        _dbContext.Transacoes.Add(transacao);
        await _dbContext.SaveChangesAsync();

        // Recarrega com navegação para montar a resposta
        transacao.Pessoa    = pessoa;
        transacao.Categoria = categoria;

        return CreatedAtAction(nameof(GetAll), new { id = transacao.Id }, MapToResponse(transacao));
    }

    // Método auxiliar de mapeamento ────────────────────────────────────
    /// <summary>
    /// Converte a entidade Transacao em TransacaoResponse, desnormalizando
    /// os dados relacionados para facilitar a exibição no front-end.
    /// </summary>
    private static TransacaoResponse MapToResponse(Transacao t) => new(
        t.Id,
        t.Descricao,
        t.Valor,
        t.Tipo,
        t.Tipo == TipoTransacao.Despesa ? "Despesa" : "Receita",
        t.CategoriaId,
        t.Categoria?.Descricao ?? string.Empty,
        t.PessoaId,
        t.Pessoa?.Nome ?? string.Empty
    );
}