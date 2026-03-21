/**
 * Formata um número como moeda brasileira (R$).
 * Ex.: 1500.5 → "R$ 1.500,50"
 */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * Retorna a classe CSS de cor para um valor de saldo:
 * positivo → verde, negativo → vermelho, zero → cinza.
 */
export const saldoColor = (saldo: number): string => {
  if (saldo > 0) return '#16a34a';  // green-600
  if (saldo < 0) return '#dc2626';  // red-600
  return '#6b7280';                  // gray-500
};
