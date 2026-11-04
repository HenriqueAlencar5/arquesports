// Regras de validação e máscaras do checkout. Funções puras: cada validador
// devolve uma mensagem de erro (string) ou null quando o valor é válido.

export const somenteDigitos = (value) => value.replace(/\D/g, "");

/** Algoritmo de Luhn: detecta erros de digitação em números de cartão. */
export function verificarLuhn(digitos) {
  let soma = 0;
  let dobrar = false;
  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = Number(digitos[i]);
    if (dobrar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

/* ---------- Máscaras (formatam enquanto o usuário digita) ---------- */
export const formatarCep = (v) => {
  const d = somenteDigitos(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
export const formatarNumeroCartao = (v) =>
  somenteDigitos(v)
    .slice(0, 16)
    .replace(/(.{4})(?=.)/g, "$1 ");
export const formatarValidade = (v) => {
  const d = somenteDigitos(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
export const formatarCvv = (v) => somenteDigitos(v).slice(0, 4);

/* ---------- Validadores ---------- */
export function validarNome(value) {
  const palavras = value
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  return palavras.length >= 2 ? null : "Informe nome e sobrenome.";
}

export const validarEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
    ? null
    : "Informe um e-mail válido, como nome@exemplo.com.";

export const validarEndereco = (value) =>
  value.trim().length >= 5 ? null : "Informe rua, número e bairro.";
export const validarCidade = (value) => (value.trim().length >= 2 ? null : "Informe a cidade.");
export const validarCep = (value) =>
  somenteDigitos(value).length === 8 ? null : "O CEP deve ter 8 números.";

export function validarNumeroCartao(value) {
  const digitos = somenteDigitos(value);
  if (digitos.length < 13 || digitos.length > 16)
    return "O número do cartão deve ter entre 13 e 16 dígitos.";
  return verificarLuhn(digitos) ? null : "Número de cartão inválido. Confira os dígitos.";
}

/** O cartão vale até o ÚLTIMO dia do mês indicado. */
export function validarValidade(value, now = new Date()) {
  const correspondencia = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!correspondencia) return "Use o formato MM/AA.";
  const mes = Number(correspondencia[1]);
  const ano = 2000 + Number(correspondencia[2]);
  if (mes < 1 || mes > 12) return "Mês inválido.";
  const vencido =
    ano < now.getFullYear() || (ano === now.getFullYear() && mes < now.getMonth() + 1);
  return vencido ? "Cartão vencido." : null;
}

export const validarCvv = (value) =>
  /^\d{3,4}$/.test(value) ? null : "O CVV deve ter 3 ou 4 números.";

/** Fonte única: id do campo → validador. A ordem é a ordem do formulário. */
export const CAMPOS = Object.freeze({
  nome: validarNome,
  email: validarEmail,
  endereco: validarEndereco,
  cidade: validarCidade,
  cep: validarCep,
  cartao: validarNumeroCartao,
  validade: validarValidade,
  cvv: validarCvv,
});

export const MASCARAS = Object.freeze({
  cep: formatarCep,
  cartao: formatarNumeroCartao,
  validade: formatarValidade,
  cvv: formatarCvv,
});

/** Valida tudo e devolve { campo: mensagem } só com os campos inválidos. */
export function validarCheckout(values, now = new Date()) {
  const erros = {};
  for (const [id, validate] of Object.entries(CAMPOS)) {
    const mensagem = validate(values[id] ?? "", now);
    if (mensagem) erros[id] = mensagem;
  }
  return erros;
}
