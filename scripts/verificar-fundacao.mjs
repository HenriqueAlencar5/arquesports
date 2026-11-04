// Verificação rápida da Etapa 1. Rode: npm test
import assert from "node:assert/strict";
import {
  adicionarItem,
  definirQuantidade,
  removerItem,
  calcularTotais,
  sanitizarCarrinho,
  carregarCarrinho,
  salvarCarrinho,
  QUANTIDADE_MAXIMA,
} from "../js/carrinho.js";
import { formatarPreco } from "../js/formatar.js";
import { produtos } from "../js/dados/produtos.js";

const armazenamentoEmMemoria = (initial = null) => {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_, v) => {
      value = v;
    },
  };
};

// moeda
assert.equal(formatarPreco(14990).replace(/\s/g, " "), "R$ 149,90");
assert.throws(() => formatarPreco(149.9));

// adicionar soma quantidades e ignora ids inexistentes
let carrinho = adicionarItem([], "camisa-selecao");
carrinho = adicionarItem(carrinho, "camisa-selecao", 2);
assert.deepEqual(carrinho, [{ id: "camisa-selecao", quantidade: 3 }]);
assert.equal(adicionarItem(carrinho, "nao-existe"), carrinho);

// limite máximo e remoção por quantidade 0
assert.equal(definirQuantidade(carrinho, "camisa-selecao", 99)[0].quantidade, QUANTIDADE_MAXIMA);
assert.deepEqual(definirQuantidade(carrinho, "camisa-selecao", 0), []);

// totais: 3 x 149,90 = 449,70 → frete grátis
let t = calcularTotais(carrinho);
assert.equal(t.subtotalCentavos, 44970);
assert.equal(t.freteCentavos, 0);

// abaixo do limite cobra frete; usa preço promocional (329,90 → frete grátis)
t = calcularTotais(adicionarItem([], "adidas-street-cap"));
assert.deepEqual([t.subtotalCentavos, t.freteCentavos, t.totalCentavos], [8990, 1990, 10980]);
assert.equal(calcularTotais(adicionarItem([], "volt-runner-elite")).subtotalCentavos, 32990);
assert.equal(calcularTotais([]).totalCentavos, 0);

// imutabilidade
const original = [{ id: "asics-pulse-x", quantidade: 1 }];
adicionarItem(original, "asics-pulse-x");
removerItem(original, "asics-pulse-x");
assert.deepEqual(original, [{ id: "asics-pulse-x", quantidade: 1 }]);

// persistência e dados corrompidos
const storage = armazenamentoEmMemoria();
salvarCarrinho(carrinho, storage);
assert.deepEqual(carregarCarrinho(storage), carrinho);
assert.deepEqual(carregarCarrinho(armazenamentoEmMemoria("{quebrado")), []);
assert.deepEqual(
  sanitizarCarrinho([
    { id: "asics-pulse-x", quantidade: "x" },
    null,
    5,
    { id: "asics-pulse-x", quantidade: 2 },
  ]),
  [{ id: "asics-pulse-x", quantidade: 2 }],
);

assert.equal(produtos.length, 12);
console.log("Etapa 1: todas as verificações passaram.");
