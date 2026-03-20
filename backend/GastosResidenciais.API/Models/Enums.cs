namespace GastosResidenciais.API.Models;

/// <summary>
/// Será definida a finalidade da categoria
/// </summary>
public enum Finalidade
{
    Despesa = 1,
    Receita = 2,
    Ambas = 3
}

/// <summary>
/// Será definido o tipo da transação
/// </summary>
public enum TipoTransacao
{
    Despesa = 1,
    Receita = 2
}