using GastosResidenciais.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GastosResidenciais.API.Data;

/// <summary>
/// Contexto principal do Entity Framework Core.
/// Utiliza SQLite como banco de dados para garantir persistência local simples,
/// sem necessidade de servidor externo. O arquivo gastos.db é criado automaticamente.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Tabela de pessoas cadastradas
    public DbSet<Pessoa> Pessoas { get; set; }

    // Tabela de categorias de transação
    public DbSet<Categoria> Categorias { get; set; }

    // Tabela de transações financeiras
    public DbSet<Transacao> Transacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---------- Pessoa --------------
        modelBuilder.Entity<Pessoa>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Nome).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Idade).IsRequired();

            // A exclusão será feito em cascata pois,
            // A partir do momento que será deletado uma Pessoa,
            // todas as suas transações vinculadas também serão
            entity.HasMany(p => p.Transacoes)
                  .WithOne(t => t.Pessoa)
                  .HasForeignKey(t => t.PessoaId)
                  .OnDelete(DeleteBehavior.Cascade);  
        });

        // ---------- Categoria ------------
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Descricao).IsRequired().HasMaxLength(400);

            // Finalidade armazenada como inteiro para eficiência
            entity.Property(c => c.Finalidade).IsRequired();

            // Ao deletar Categoria, restringe se existirem transações vinculadas
            entity.HasMany(c => c.Transacoes)
                  .WithOne(t => t.Categoria)
                  .HasForeignKey(t => t.CategoriaId)
                  .OnDelete(DeleteBehavior.Restrict);  
        });

        // ----------- Transações ----------
        modelBuilder.Entity<Transacao>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Descricao).IsRequired().HasMaxLength(400);
            entity.Property(t => t.Tipo).IsRequired();
            entity.Property(t => t.Valor).IsRequired().HasColumnType("decimal(18,2)");
        });
    }
}