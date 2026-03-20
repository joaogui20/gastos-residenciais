using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Representa os dados da pessoa sendo cadastradas no sistema
/// Caso os dados forem excluídos
/// os dados da transação são removidas em cascata
/// </summary>
public class Pessoa
{
    // Identificador único gerado automaticamente
    public Guid Id { get; set; } = Guid.NewGuid();

    // Nome da pessoa - Permitido o limite máximo de 200 caracteres
    [Required]
    [MaxLength(200, ErrorMessage = "O limite de caracteres foi ultrapassado")]
    public string Nome { get; set; } = string.Empty;

    // Idade da pessoa
    // Caso a pessoa for menor de 18 anos, será registrado como despesa
    [Range(0, 150, ErrorMessage = "Idade deve ser um valor válido.")]
    public int Idade { get; set; }

    // Navegação para as transações vinculadas a esta pessoa.
    public List<Transacao> Transacoes { get; set; } = new List<Transacao>();
}