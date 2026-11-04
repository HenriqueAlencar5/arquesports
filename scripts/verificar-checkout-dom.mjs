// Fluxo do checkout no DOM simulado (jsdom). Rode: npm run test:dom
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const raiz = new URL("../", import.meta.url);
const html = readFileSync(new URL("checkout.html", raiz), "utf8").replace(
  /<script[\s\S]*?<\/script>/,
  "",
);
const erros = [];
console.error = (...a) => erros.push(a);
let run = 0;

async function iniciarPagina(carrinho) {
  const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    localStorage: dom.window.localStorage,
  });
  if (carrinho) localStorage.setItem("arquesports:carrinho:v1", JSON.stringify(carrinho));
  await import(new URL(`js/checkout.js?run=${++run}`, raiz).href); // ?run força reexecutar o módulo
  return dom.window;
}
const $ = (id) => document.getElementById(id);
const texto = (id) => $(id).textContent.replace(/\s/g, " ");
const type = (id, value) => {
  $(id).value = value;
  $(id).dispatchEvent(new window.Event("input", { bubbles: true }));
};
const enviar = () => document.querySelector('button[type="submit"]').click();

// 1) carrinho vazio bloqueia o checkout
await iniciarPagina(null);
assert.equal($("checkout-grade").hidden, true);
assert.equal($("pagina-carrinho-vazio").hidden, false);

// 2) resumo lê o carrinho: 2 × Asics (239,80) + frete 19,90
await iniciarPagina([{ id: "asics-pulse-x", quantidade: 2 }]);
assert.equal($("checkout-grade").hidden, false);
assert.equal(document.querySelectorAll(".resumo-linha").length, 1);
assert.equal(texto("resumo-subtotal"), "R$ 239,80");
assert.equal(texto("resumo-total"), "R$ 259,70");

// 3) envio vazio: 8 erros, aria-invalid, foco no primeiro campo, resumo anunciado
enviar();
assert.equal(document.querySelectorAll('[aria-invalid="true"]').length, 8);
assert.equal(document.activeElement.id, "nome");
assert.equal($("resumo-erros").hidden, false);
assert.match(texto("resumo-erros"), /Corrija 8 campos/);
assert.match(texto("nome-erro"), /nome e sobrenome/i);

// 4) máscaras e correção ao vivo
type("cartao", "41111111111111119");
assert.equal($("cartao").value, "4111 1111 1111 1111");
type("nome", "Maria Silva");
assert.ok(!$("nome").hasAttribute("aria-invalid"), "erro some ao corrigir");
assert.equal($("nome-erro").hidden, true);

// 5) cartão com dígito errado e cartão vencido
type("email", "maria@exemplo.com");
type("endereco", "Rua A, 10, Centro");
type("cidade", "João Pessoa");
type("cep", "58000000");
type("validade", "0120");
type("cvv", "12345");
assert.equal($("cep").value, "58000-000");
assert.equal($("cvv").value, "1234");
type("cartao", "4111111111111112");
enviar();
assert.deepEqual(
  [...document.querySelectorAll('[aria-invalid="true"]')].map((i) => i.id),
  ["cartao", "validade"],
);
assert.equal(document.activeElement.id, "cartao");

// 6) pedido válido: confirmação, foco, carrinho limpo
type("cartao", "4111 1111 1111 1111");
type("validade", "12/39");
enviar();
assert.equal(document.querySelector("#checkout-formulario"), null);
assert.equal(document.activeElement.className, "sucesso-titulo");
assert.match(document.body.textContent, /nenhuma cobrança foi feita/);
assert.match(document.body.textContent, /Número do pedido: ARQ-[A-Z0-9]{6}/);
assert.equal(localStorage.getItem("arquesports:carrinho:v1"), "[]");

assert.equal(erros.length, 0, "console sem erros");
console.log("DOM: fluxo do checkout verificado.");
