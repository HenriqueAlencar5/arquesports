// Lógica do carrinho. O carrinho é uma lista imutável de { id, quantidade }.
// Guardamos só id e quantidade: nome e preço são sempre lidos de dados/produtos.js,
// então um preço alterado no catálogo vale automaticamente no carrinho.
import { obterProdutoPorId, obterPrecoUnitarioCentavos } from "./dados/produtos.js";
import { lerJson, escreverJson } from "./armazenamento.js";

export const QUANTIDADE_MAXIMA = 10;
export const FRETE_CENTAVOS = 1990;
export const FRETE_GRATIS_A_PARTIR_DE_CENTAVOS = 29900;
export const CHAVE_CARRINHO = "arquesports:carrinho:v1";

const limitarQuantidade = (n) => Math.min(QUANTIDADE_MAXIMA, Math.max(1, Math.trunc(n)));

export function adicionarItem(carrinho, idProduto, quantidade = 1) {
  if (!obterProdutoPorId(idProduto) || !Number.isFinite(quantidade)) return carrinho;
  const existente = carrinho.find((i) => i.id === idProduto);
  if (!existente)
    return [...carrinho, { id: idProduto, quantidade: limitarQuantidade(quantidade) }];
  return carrinho.map((i) =>
    i.id === idProduto ? { ...i, quantidade: limitarQuantidade(i.quantidade + quantidade) } : i,
  );
}

export const removerItem = (carrinho, idProduto) => carrinho.filter((i) => i.id !== idProduto);

/** Define a quantidade; zero ou menos remove o item. */
export function definirQuantidade(carrinho, idProduto, quantidade) {
  if (!Number.isFinite(quantidade)) return carrinho;
  if (quantidade < 1) return removerItem(carrinho, idProduto);
  return carrinho.map((i) =>
    i.id === idProduto ? { ...i, quantidade: limitarQuantidade(quantidade) } : i,
  );
}

export const limparCarrinho = () => [];

/** Itens enriquecidos com produto e valores, prontos para a interface exibir. */
export function obterItensCarrinho(carrinho) {
  return carrinho.flatMap(({ id, quantidade }) => {
    const produto = obterProdutoPorId(id);
    if (!produto) return [];
    const precoUnitarioCentavos = obterPrecoUnitarioCentavos(produto);
    return [
      {
        produto,
        quantidade,
        precoUnitarioCentavos,
        totalItemCentavos: precoUnitarioCentavos * quantidade,
      },
    ];
  });
}

export function calcularTotais(carrinho) {
  const linhas = obterItensCarrinho(carrinho);
  const subtotalCentavos = linhas.reduce((soma, l) => soma + l.totalItemCentavos, 0);
  const quantidadeItens = linhas.reduce((soma, l) => soma + l.quantidade, 0);
  const freteGratis = subtotalCentavos >= FRETE_GRATIS_A_PARTIR_DE_CENTAVOS;
  const freteCentavos = quantidadeItens === 0 || freteGratis ? 0 : FRETE_CENTAVOS;
  return {
    quantidadeItens,
    subtotalCentavos,
    freteCentavos,
    totalCentavos: subtotalCentavos + freteCentavos,
    freteGratis,
  };
}

/** localStorage é texto editável pelo usuário: nunca confie nele sem validar. */
export function sanitizarCarrinho(bruto) {
  if (!Array.isArray(bruto)) return [];
  let carrinho = [];
  for (const entrada of bruto) {
    if (entrada && typeof entrada.id === "string" && Number.isFinite(entrada.quantidade)) {
      carrinho = adicionarItem(carrinho, entrada.id, entrada.quantidade);
    }
  }
  return carrinho;
}

export const carregarCarrinho = (armazenamento) =>
  sanitizarCarrinho(lerJson(CHAVE_CARRINHO, armazenamento));
export const salvarCarrinho = (carrinho, armazenamento) =>
  escreverJson(CHAVE_CARRINHO, carrinho, armazenamento);
