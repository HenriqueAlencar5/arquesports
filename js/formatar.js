// Formatação de moeda. Intl.NumberFormat já cuida de vírgula, ponto e "R$".
const formatadorBrl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** formatarPreco(14990) → "R$ 149,90" */
export function formatarPreco(cents) {
  if (!Number.isInteger(cents)) throw new TypeError("O preço deve ser um inteiro em centavos.");
  return formatadorBrl.format(cents / 100);
}
