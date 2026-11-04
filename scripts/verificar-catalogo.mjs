// Verificação da Etapa 2 (regras de busca, filtro e ordenação). Rode: npm test
import assert from "node:assert/strict";
import { produtos } from "../js/dados/produtos.js";
import { filtrarProdutos, ordenarProdutos, consultarCatalogo, normalizar } from "../js/catalogo.js";
import { obterPrecoUnitarioCentavos } from "../js/dados/produtos.js";

const ids = (list) => list.map((p) => p.id);

assert.equal(normalizar("  TÊNIS Térmica "), "tenis termica");
assert.deepEqual(ids(filtrarProdutos(produtos, { busca: "termica" })), ["garrafa-volt"]);
assert.deepEqual(ids(filtrarProdutos(produtos, { busca: "tenis asics" })), ["asics-pulse-x"]);
assert.equal(filtrarProdutos(produtos, { busca: "xyz" }).length, 0);

assert.ok(
  filtrarProdutos(produtos, { categoria: "calcados" }).every((p) => p.categoria === "calcados"),
);
const fem = filtrarProdutos(produtos, { publico: "feminino" });
assert.ok(fem.every((p) => ["feminino", "unissex"].includes(p.publico)));
assert.ok(
  filtrarProdutos(produtos, { publico: "infantil" }).every((p) => p.publico === "infantil"),
);

// faixa usa o preço promocional: Volt Runner custa 329,90 (não 399,90)
assert.ok(ids(filtrarProdutos(produtos, { faixaPreco: "300-mais" })).includes("volt-runner-elite"));
assert.ok(
  filtrarProdutos(produtos, { faixaPreco: "ate-100" }).every(
    (p) => obterPrecoUnitarioCentavos(p) < 10000,
  ),
);

const asc = ordenarProdutos(produtos, "preco-asc").map(obterPrecoUnitarioCentavos);
assert.deepEqual(
  asc,
  [...asc].sort((a, b) => a - b),
);
assert.equal(ordenarProdutos(produtos, "preco-desc")[0].id, "volt-runner-elite");
const names = ordenarProdutos(produtos, "nome").map((p) => p.nome);
assert.deepEqual(
  names,
  [...names].sort((a, b) => a.localeCompare(b, "pt-BR")),
);
assert.ok(
  ordenarProdutos(produtos, "destaque")
    .slice(0, 4)
    .every((p) => p.destaque),
);
const before = ids(produtos);
ordenarProdutos(produtos, "nome");
assert.deepEqual(ids(produtos), before); // não altera o original

assert.deepEqual(
  ids(
    consultarCatalogo(produtos, { categoria: "roupas", publico: "feminino", ordem: "preco-asc" }),
  ),
  ["top-core", "legging-flex-pro"],
);
console.log("Etapa 2: regras do catálogo verificadas.");
