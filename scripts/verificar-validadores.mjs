// Verificação das regras de validação do checkout. Rode: npm test
import assert from "node:assert/strict";
import * as v from "../js/validadores.js";

const NOW = new Date(2026, 9, 30); // 30/10/2026

// máscaras
assert.equal(v.formatarNumeroCartao("41111111111111119999"), "4111 1111 1111 1111");
assert.equal(v.formatarNumeroCartao("4111"), "4111");
assert.equal(v.formatarCep("58000123"), "58000-123");
assert.equal(v.formatarValidade("1230"), "12/30");
assert.equal(v.formatarCvv("12a3456"), "1234");

// Luhn e cartão
assert.ok(v.verificarLuhn("4111111111111111"));
assert.ok(!v.verificarLuhn("4111111111111112"));
assert.equal(v.validarNumeroCartao("4111 1111 1111 1111"), null);
assert.ok(v.validarNumeroCartao("4111 1111 1111 1112"));
assert.ok(v.validarNumeroCartao("1234"));

// validade: vale até o fim do mês
assert.equal(v.validarValidade("10/26", NOW), null);
assert.equal(v.validarValidade("09/26", NOW), "Cartão vencido.");
assert.equal(v.validarValidade("12/25", NOW), "Cartão vencido.");
assert.equal(v.validarValidade("01/27", NOW), null);
assert.equal(v.validarValidade("13/30", NOW), "Mês inválido.");
assert.equal(v.validarValidade("00/30", NOW), "Mês inválido.");
assert.ok(v.validarValidade("1/30", NOW));

// demais campos
assert.equal(v.validarNome("Maria Silva"), null);
assert.ok(v.validarNome("Maria"));
assert.ok(v.validarNome("  "));
assert.equal(v.validarEmail("a@b.com"), null);
assert.ok(v.validarEmail("a@b"));
assert.ok(v.validarEmail("a b@c.com"));
assert.equal(v.validarCep("58000-123"), null);
assert.ok(v.validarCep("58000"));
assert.equal(v.validarCvv("123"), null);
assert.ok(v.validarCvv("12"));

// formulário completo
const ok = {
  nome: "Maria Silva",
  email: "m@x.com",
  endereco: "Rua A, 10, Centro",
  cidade: "João Pessoa",
  cep: "58000-000",
  cartao: "4111 1111 1111 1111",
  validade: "12/30",
  cvv: "123",
};
assert.deepEqual(v.validarCheckout(ok, NOW), {});
assert.deepEqual(Object.keys(v.validarCheckout({}, NOW)), Object.keys(v.CAMPOS));
assert.deepEqual(Object.keys(v.validarCheckout({ ...ok, cvv: "1" }, NOW)), ["cvv"]);
console.log("Etapa 4: validadores verificados.");
