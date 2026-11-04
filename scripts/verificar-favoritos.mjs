// Verificação dos favoritos e do filtro "somente favoritos". Rode: npm test
import assert from "node:assert/strict";
import {
  alternarFavorito,
  sanitizarFavoritos,
  carregarFavoritos,
  salvarFavoritos,
} from "../js/favoritos.js";
import { filtrarProdutos } from "../js/catalogo.js";
import { produtos } from "../js/dados/produtos.js";

let favs = alternarFavorito([], "asics-pulse-x");
assert.deepEqual(favs, ["asics-pulse-x"]);
assert.deepEqual(alternarFavorito(favs, "asics-pulse-x"), []);
assert.equal(alternarFavorito(favs, "nao-existe"), favs);
assert.deepEqual(sanitizarFavoritos(["asics-pulse-x", "asics-pulse-x", 7, "xx"]), [
  "asics-pulse-x",
]);

const store = {
  v: null,
  getItem() {
    return this.v;
  },
  setItem(_, x) {
    this.v = x;
  },
};
salvarFavoritos(["top-core"], store);
assert.deepEqual(carregarFavoritos(store), ["top-core"]);
store.v = "{quebrado";
assert.deepEqual(carregarFavoritos(store), []);

assert.deepEqual(
  filtrarProdutos(produtos, { somenteFavoritos: true, idsFavoritos: ["top-core"] }).map(
    (p) => p.id,
  ),
  ["top-core"],
);
assert.equal(filtrarProdutos(produtos, { somenteFavoritos: true, idsFavoritos: [] }).length, 0);
console.log("Etapa 3: favoritos verificados.");
