// Teste de fluxo no DOM simulado (jsdom). Requer: npm install. Rode: npm run test:dom
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const raiz = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", raiz), "utf8").replace(
  /<script[\s\S]*?<\/script>/,
  "",
);
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, localStorage: window.localStorage });

// jsdom pode não implementar <dialog>: simulamos só o essencial.
const D = window.HTMLDialogElement.prototype;
D.showModal = function () {
  this.setAttribute("open", "");
};
D.close = function () {
  this.removeAttribute("open");
};
window.HTMLElement.prototype.scrollIntoView = () => {};

const erros = [];
console.error = (...a) => erros.push(a);
await import(new URL("js/principal.js", raiz).href);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const texto = (s) => $(s).textContent.replace(/\s/g, " ");
const botaoAdicionar = (id) => $(`.card-produto [data-adicionar="${id}"]`);

// 1) adicionar e abrir a gaveta
botaoAdicionar("asics-pulse-x").click();
botaoAdicionar("asics-pulse-x").click();
assert.equal($("#carrinho-contador").textContent, "2");
$("#carrinho-botao").click();
assert.ok($("#carrinho-gaveta").hasAttribute("open"));
assert.equal($$(".carrinho-item").length, 1);
assert.equal(texto(".carrinho-item-total"), "R$ 239,80");
assert.match(texto("#carrinho-frete"), /19,90/);
assert.equal(texto("#carrinho-total"), "R$ 259,70");
assert.match(texto("#carrinho-aviso-frete"), /Faltam R\$ 59,20/);

// 2) quantidades, limites e foco
$('[data-acao="aumentar"]').click();
assert.equal(texto(".quantidade-valor"), "Quantidade: 3");
assert.equal(texto("#carrinho-subtotal"), "R$ 359,70");
assert.equal(texto("#carrinho-frete"), "Grátis");
$('[data-acao="diminuir"]').click();
$('[data-acao="diminuir"]').click();
assert.ok($('[data-acao="diminuir"]').disabled, "diminuir fica desabilitado em 1");
assert.equal(document.activeElement.dataset.acao, "remover", "foco migra para Remover");
$('[data-acao="remover"]').click();
assert.ok(!$("#carrinho-vazio").hidden && $("#carrinho-rodape").hidden);
assert.equal(document.activeElement.id, "carrinho-titulo");
assert.equal($("#carrinho-contador").hidden, true);
$("#carrinho-continuar").click();
assert.ok(!$("#carrinho-gaveta").hasAttribute("open"));

// 3) favoritos
assert.equal($$(".card-produto [data-favorito]")[0].getAttribute("aria-pressed"), "false");
$("#favoritos-alternar").click();
assert.match(texto(".estado-vazio h3"), /ainda não tem favoritos/);
$("#favoritos-alternar").click();
$('.card-produto [data-favorito="top-core"]').click();
assert.equal(localStorage.getItem("arquesports:favoritos:v1"), '["top-core"]');
$("#favoritos-alternar").click();
assert.equal($$(".card-produto").length, 1);
$('.card-produto [data-favorito="top-core"]').click(); // desfavorita dentro do filtro
assert.equal($$(".card-produto").length, 0);
assert.equal(document.activeElement.id, "catalogo-titulo");
$("#favoritos-alternar").click();

// 4) modal de detalhes
$('.card-produto [data-detalhe="volt-runner-elite"]').click();
assert.ok($("#produto-dialogo").hasAttribute("open"));
assert.equal(texto("#detalhe-titulo"), "Volt Runner Elite");
assert.match(texto("#detalhe-conteudo .preco"), /399,90.*329,90/);
$("#detalhe-conteudo [data-adicionar]").click();
assert.equal($("#carrinho-contador").textContent, "1");
$("#detalhe-fechar").click();

// 5) menu de navegação
const gatilhos = $$(".menu-botao");
assert.equal(gatilhos.length, 3);
assert.ok(gatilhos.every((t) => t.getAttribute("aria-expanded") === "false"));
assert.ok($$(".menu-painel").every((p) => p.hidden));
gatilhos[0].click();
assert.equal(gatilhos[0].getAttribute("aria-expanded"), "true");
assert.equal($("#menu-masculino").hidden, false);
gatilhos[1].click();
assert.ok(
  $("#menu-masculino").hidden && !$("#menu-feminino").hidden,
  "abrir outro fecha o anterior",
);
gatilhos[1].dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
assert.ok($("#menu-feminino").hidden);
assert.equal(document.activeElement, gatilhos[1], "Esc devolve o foco ao botão");
gatilhos[0].click();
$('#menu-masculino [data-ir-categoria="calcados"]').click();
assert.ok($("#menu-masculino").hidden);
assert.deepEqual(
  $$(".card-nome")
    .map((n) => n.textContent)
    .sort(),
  ["Asics Pulse X", "Volt Runner Elite"],
);

// 6) hero acessível
const slides = $$(".slide");
assert.equal(slides.length, 3);
assert.ok(slides[0].classList.contains("ativo") && !slides[0].hasAttribute("inert"));
assert.ok(
  slides[1].hasAttribute("inert") && slides[2].hasAttribute("inert"),
  "slides ocultos ficam inert",
);
$("#destaques-proximo").click();
assert.ok(slides[1].classList.contains("ativo") && slides[0].hasAttribute("inert"));
assert.equal($$(".destaques-indicador")[1].getAttribute("aria-current"), "true");
$("#destaques-anterior").click();
$("#destaques-anterior").click();
assert.ok(slides[2].classList.contains("ativo"), "anterior do primeiro volta ao último");
assert.equal($("#destaques-alternar").textContent, "Pausar");
$("#destaques-alternar").click();
assert.equal($("#destaques-alternar").textContent, "Reproduzir");
assert.equal(document.querySelector(".destaques-slides").getAttribute("aria-live"), "polite");
slides[2].querySelector("[data-ir-publico]").click();
assert.deepEqual(
  $$(".card-nome")
    .map((n) => n.textContent)
    .sort(),
  ["Mochila Kids Sport", "Tênis Play Fast Kids"],
);

// 7) nome acessível contém o texto visível (WCAG 2.5.3 "Rótulo no nome")
for (const botaoRotulado of $$("button[aria-label], a[aria-label]")) {
  const visivel = botaoRotulado.textContent.trim().toLowerCase();
  const rotulo = botaoRotulado.getAttribute("aria-label");
  if (/[a-zà-ú]{2}/i.test(visivel)) {
    assert.ok(
      rotulo.toLowerCase().includes(visivel),
      `aria-label "${rotulo}" não contém "${visivel}"`,
    );
  }
}

// 8) limite de unidades e anúncios que sempre mudam de texto
$("#menu-masculino .menu-todos").click(); // restaura a lista (unissex aparece em "masculino")
const botaoGarrafa = () => $('.card-produto [data-adicionar="garrafa-volt"]');
botaoGarrafa().click();
assert.match(texto("#carrinho-status"), /adicionado ao carrinho \(\d+ no carrinho\)/);
for (let i = 0; i < 10; i++) botaoGarrafa().click();
assert.match(texto("#carrinho-status"), /Limite de 10 unidades/);
assert.equal(botaoGarrafa().textContent, "Limite atingido");

// 9) outra aba alterou o carrinho / página voltou do cache do navegador
localStorage.setItem(
  "arquesports:carrinho:v1",
  JSON.stringify([{ id: "top-core", quantidade: 3 }]),
);
window.dispatchEvent(new window.StorageEvent("storage", { key: "arquesports:carrinho:v1" }));
assert.equal($("#carrinho-contador").textContent, "3");
localStorage.setItem(
  "arquesports:carrinho:v1",
  JSON.stringify([{ id: "top-core", quantidade: 5 }]),
);
window.dispatchEvent(new window.PageTransitionEvent("pageshow", { persisted: true }));
assert.equal($("#carrinho-contador").textContent, "5");

// 10) segurança: nome malicioso vira texto, nunca HTML
const { criarCardProduto } = await import(new URL("js/interface/renderizar.js", raiz).href);
const malicioso = {
  id: "x",
  nome: "<img src=x onerror=alert(1)>",
  marca: "B",
  descricao: "d",
  precoCentavos: 100,
  precoPromocionalCentavos: null,
  imagem: "a.svg",
  altImagem: "a",
  categoria: "roupas",
  publico: "unissex",
};
const cartaoProduto = criarCardProduto(malicioso);
assert.equal(cartaoProduto.querySelectorAll("img").length, 1);
assert.equal(cartaoProduto.querySelector(".card-nome").textContent, malicioso.nome);

assert.equal($$("img").filter((i) => i.getAttribute("alt") === null).length, 0);
assert.equal(erros.length, 0, "console sem erros");
console.log("DOM: fluxos de carrinho, favoritos e detalhes verificados.");
process.exit(0); // o autoplay do hero mantém um timer ativo
