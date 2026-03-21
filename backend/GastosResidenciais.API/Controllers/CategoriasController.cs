using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Controller responsável pelo gerenciamento de Categorias de transação.
/// Expõe endpoints para criação e listagem.
/// A Finalidade da categoria define quais tipos de transação podem utilizá-la.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public CategoriasController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/categorias
    // Retorna todos os registros de categoria
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoriaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var categorias = await _dbContext.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Descricao)
            .Select(c => new CategoriaResponse(
                c.Id,
                c.Descricao,
                c.Finalidade,
                c.Finalidade.ToString()))
            .ToListAsync();

        return Ok(categorias);   
    }

    // GET /api/categorias/por-tipo?tipo={tipoTransacao} ────────────────
    /// <summary>
    /// Retorna categorias compatíveis com um determinado tipo de transação.
    /// Utilizado pelo front-end para filtrar opções ao registrar uma transação.
    /// Regra: Despesa → Finalidade Despesa ou Ambas
    ///        Receita → Finalidade Receita ou Ambas
    /// </summary>
    [HttpGet("por-tipo")]
    [ProducesResponseType(typeof(IEnumerable<CategoriaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByTipoTransacao([FromQuery] TipoTransacao tipo)
    {
        var categorias = await _dbContext.Categorias
            .AsNoTracking()
            .Where(c => c.Finalidade == Finalidade.Ambas ||
                        (tipo == TipoTransacao.Despesa && c.Finalidade == Finalidade.Despesa) ||
                        (tipo == TipoTransacao.Receita && c.Finalidade == Finalidade.Receita))
            .OrderBy(c => c.Descricao)
            .Select(c => new CategoriaResponse(
                c.Id,
                c.Descricao,
                c.Finalidade,
                c.Finalidade.ToString()))
            .ToListAsync();
        
        return Ok(categorias);
    }

    // POST /api/categorias
    /// <summary>
    /// Cria uma nova categoria de transação.
    /// Validações:
    /// - Descrição é obrigatória e deve ser única.
    /// - Finalidade é obrigatória e deve ser um valor válido.
    /// - Retorna 400 Bad Request com mensagens de erro detalhadas em caso de falha.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CategoriaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CategoriaRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // Valida que o enum de Finalidade é válido
        if (!Enum.IsDefined(typeof(Finalidade), request.Finalidade)) return BadRequest(new { mensagem = "Finalidade inválida."});

        var categoria = new Categoria
        {
            Descricao = request.Descricao.Trim(),
            Finalidade = request.Finalidade
        };

        _dbContext.Categorias.Add(categoria);

        await _dbContext.SaveChangesAsync();

        var response = new CategoriaResponse(
            categoria.Id,
            categoria.Descricao,
            categoria.Finalidade,
            categoria.Finalidade.ToString());
        
        return CreatedAtAction(nameof(GetAll), response);
    }
}