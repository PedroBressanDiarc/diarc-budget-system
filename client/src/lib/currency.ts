/**
 * Formata um número para o padrão monetário brasileiro
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão R$ 1.250,43
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

/**
 * Remove a formatação monetária e retorna o número
 * @param formatted - String formatada (ex: "R$ 1.250,43")
 * @returns Número decimal
 */
export function parseCurrency(formatted: string): number {
  if (!formatted) return 0;
  
  // Remove "R$", espaços, pontos de milhar e substitui vírgula por ponto
  const cleaned = formatted
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(cleaned) || 0;
}
