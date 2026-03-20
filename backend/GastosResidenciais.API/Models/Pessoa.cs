using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

/// <summary>
/// Representa os dados da pessoa sendo cadastradas no sistema
/// Caso os dados forem excluídos
/// os dados da transação são removidas em cascata
/// </summary>
public class Pessoa
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200, ErrorMessage = "O limite de caracteres foi ultrapassado")]
    public string Nome { get; set; } = string.Empty;

    [Range(0, 150, ErrorMessage = "Idade deve ser um valor válido.")]
    public int Idade { get; set; }
}