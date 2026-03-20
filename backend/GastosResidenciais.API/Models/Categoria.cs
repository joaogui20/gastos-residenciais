using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Representa uma categoria de transação. Ex: Salário
/// A Finalidade tem o intuito de apontar quais transações serão utilizadas
///     - Despesa: apenas serão realizadas transações para despesa
///     - Receita: apenas serão realizadas transações para receita
///     - Ambas: serão realizadas transações para ambos os casos
/// </summary>
public class Categoria
{
    // Identificador único gerado automaticamente
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(400, ErrorMessage = "A descrição não pode ultrapassar de 400 caracteres.")]
    // Descrição da categoria - Não pode ultrapassar dos 400 caracteres.
    public string Descricao { get; set; } = string.Empty;

    // Finalidade da categoria - despesa, receita, ambas
    public Finalidade Finalidade { get; set; }

    // Navegação para as transações desta categoria
    public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
}