using System.ComponentModel.DataAnnotations;

namespace GastosResidenciais.API.Models;

public class Categoria
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(400, ErrorMessage = "A descrição não pode ultrapassar de 400 caracteres.")]
    public string Descricao { get; set; } = string.Empty;

    public Finalidade Finalidade { get; set; }
}