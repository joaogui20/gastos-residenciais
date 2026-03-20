using GastosResidenciais.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Serviços ─────────────────────────────────────────────────────────────────

// Registro do DbContext com SQLite.
// O banco de dados é criado em gastos.db na raiz do projeto.
// EnsureCreated() no startup garante que as tabelas existam sem necessidade de migrations explícitas.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
                     ?? "Data Source=gastos.db"));

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Serializa enums como strings legíveis (ex.: "Despesa") ao invés de inteiros
        opts.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Swagger/OpenAPI para documentação e testes dos endpoints durante desenvolvimento
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Gastos Residenciais API", Version = "v1" });
});

// CORS: permite que o front-end (React em porta diferente) consuma a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────────────────

// Garante criação do banco SQLite e das tabelas ao inicializar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated(); // cria o arquivo gastos.db e aplica o schema
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gastos Residenciais v1"));
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();