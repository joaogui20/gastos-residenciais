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
}