// Favoritos: lista imutável de ids de produtos.
import { obterProdutoPorId } from "./dados/produtos.js";
import { lerJson, escreverJson } from "./armazenamento.js";

export const CHAVE_FAVORITOS = "arquesports:favoritos:v1";

export function alternarFavorito(ids, idProduto) {
  if (!obterProdutoPorId(idProduto)) return ids;
  return ids.includes(idProduto) ? ids.filter((id) => id !== idProduto) : [...ids, idProduto];
}

export function sanitizarFavoritos(bruto) {
  if (!Array.isArray(bruto)) return [];
  return [...new Set(bruto.filter((id) => typeof id === "string" && obterProdutoPorId(id)))];
}

export const carregarFavoritos = (storage) => sanitizarFavoritos(lerJson(CHAVE_FAVORITOS, storage));
export const salvarFavoritos = (ids, storage) => escreverJson(CHAVE_FAVORITOS, ids, storage);
