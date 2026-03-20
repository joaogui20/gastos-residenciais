using GastosResidenciais.API.Data;
using GastosResidenciais.API.DTOs;
using GastosResidenciais.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;

namespace GastosResidenciais.API.Controllers;

/// <summary>
/// Controller responsável pelo gerenciamento de Pessoas.
/// Expõe endpoints para criação, listagem, edição e exclusão.
/// A exclusão de uma pessoa remove em cascata todas as suas transações (regra de negócio).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public PessoasController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // GET /api/pessoas
    // Retorna todas as pessoas cadastradas
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PessoaResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var pessoas = await _dbContext.Pessoas
            .AsNoTracking()
            .OrderBy(p => p.Nome)
            .Select(p => new PessoaResponse(p.Id, p.Nome, p.Idade))
            .ToListAsync();

        return Ok(pessoas);
    }

    // GET /api/pessoas/{id}
    // Retorna a pessoa cadastrada por ID
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(IEnumerable<PessoaResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var pessoa = await _dbContext.Pessoas.FindAsync(id);

        if (pessoa is null) return NotFound(new { mensagem = "Pessoa não localizada" });

        return Ok(new PessoaResponse(pessoa.Id, pessoa.Nome, pessoa.Idade));
    }

    // POST /api/pessoas
    // Cria novo registro para Pessoa
    [HttpPost]
    [ProducesResponseType(typeof(IEnumerable<PessoaResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] PessoaRequest request)
    {
        // Validação de model annotations (MaxLength, Range, Required)
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var pessoa = new Pessoa
        {
            Nome = request.Nome.Trim(),
            Idade = request.Idade
        };

        _dbContext.Pessoas.Add(pessoa);

        await _dbContext.SaveChangesAsync();

        var response = new PessoaResponse(pessoa.Id, pessoa.Nome, pessoa.Idade);

        return CreatedAtAction(nameof(GetById), new { id = pessoa.Id }, response);
    }

    // PUT /api/pessoas/{id}
    // Atualizar informações do registro
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(IEnumerable<PessoaResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] PessoaRequest request)
    {
        // Validação de model annotations (MaxLength, Range, Required)
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var pessoa = await _dbContext.Pessoas.FindAsync(id);

        if (pessoa is null) return NotFound(new { mensagem = "Pessoa não localizada" });

        pessoa.Nome = request.Nome.Trim();
        pessoa.Idade = request.Idade;

        await _dbContext.SaveChangesAsync();

        return Ok(new PessoaResponse(pessoa.Id, pessoa.Nome, pessoa.Idade));
    }

    // DELETE /api/pessoas/{id}
    // Deletar o registro no banco de dados
    // Assim como será deletado todas as suas transações (configurado no AppDbContext para cascade)
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var pessoa = await _dbContext.Pessoas.FindAsync(id);

        if (pessoa is null) return NotFound(new { mensagem = "Pessoa não localizada" });

        _dbContext.Pessoas.Remove(pessoa);

        await _dbContext.SaveChangesAsync();

        return NoContent();
    }
}