using GastosResidenciais.API.Data;
using Microsoft.AspNetCore.Mvc;

namespace GastosResidenciais.API.Controllers;

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
}