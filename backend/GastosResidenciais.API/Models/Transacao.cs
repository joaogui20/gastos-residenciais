using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Representa uma transação financeira residencial.
/// Regras de negócio que serão aplicadas:
///   1. Valor deve ser positivo.
///   2. Pessoa menor de 18 anos só pode ter transações do tipo Despesa.
///   3. A Categoria deve ser compatível com o Tipo da transação:
///      - Categoria "Despesa" → apenas transações Despesa
///      - Categoria "Receita" → apenas transações Receita
///      - Categoria "Ambas"   → qualquer tipo
/// </summary>
public class Transacao
{
    // Identificador único gerado automaticamente
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(400, ErrorMessage = "A descrição não pode ultrapassar em 400 caracteres.")]
    // Descrição da transação - Não pode ultrapassar em 400 caracteres
    public string Descricao { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser positivo.")]
    [Column(TypeName = "decimal(18,2)")]
    // Valor da transação na qual não pode ser negativo
    public decimal Valor { get; set; }

    // Tipo de Transação - Despesa ou receita
    public TipoTransacao Tipo { get; set; }

    // FK para a Categoria associada
    public Guid CategoriaId { get; set; }

    // Navegação para a Categoria
    public Categoria? Categoria { get; set; }

    // FK para a Pessoa responsável pela transação
    public Guid PessoaId { get; set; }

    // Navegação para a Pessoa
    public Pessoa? Pessoa { get; set; }
}