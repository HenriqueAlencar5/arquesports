// Regras do catálogo: busca, filtros e ordenação. Funções puras, sem DOM.
import { obterPrecoUnitarioCentavos } from "./dados/produtos.js";

// Faixas em centavos. `max` é exclusivo; null = sem limite.
export const FAIXAS_PRECO = Object.freeze({
  todos: { rotulo: "Qualquer preço", min: 0, max: null },
  "ate-100": { rotulo: "Até R$ 100", min: 0, max: 10000 },
  "100-200": { rotulo: "R$ 100 a R$ 200", min: 10000, max: 20000 },
  "200-300": { rotulo: "R$ 200 a R$ 300", min: 20000, max: 30000 },
  "300-mais": { rotulo: "Acima de R$ 300", min: 30000, max: null },
});

export const ORDENACOES = Object.freeze({
  destaque: "Destaques",
  "preco-asc": "Menor preço",
  "preco-desc": "Maior preço",
  nome: "Nome (A–Z)",
});

/** "Térmica" e "termica" devem encontrar o mesmo produto. */
export const normalizar = (texto) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export function filtrarProdutos(
  list,
  {
    busca = "",
    categoria = "todos",
    publico = "todos",
    faixaPreco = "todos",
    somenteFavoritos = false,
    idsFavoritos = [],
  } = {},
) {
  const termos = normalizar(busca).split(/\s+/).filter(Boolean);
  const faixa = FAIXAS_PRECO[faixaPreco] ?? FAIXAS_PRECO.all;

  return list.filter((p) => {
    const preco = obterPrecoUnitarioCentavos(p);
    const textoBusca = normalizar(`${p.nome} ${p.marca} ${p.descricao}`);
    return (
      termos.every((t) => textoBusca.includes(t)) &&
      (categoria === "todos" || p.categoria === categoria) &&
      // produtos unissex aparecem em masculino e feminino
      (publico === "todos" ||
        p.publico === publico ||
        (p.publico === "unissex" && publico !== "infantil")) &&
      (!somenteFavoritos || idsFavoritos.includes(p.id)) &&
      preco >= faixa.min &&
      (faixa.max === null || preco < faixa.max)
    );
  });
}

export function ordenarProdutos(list, ordem = "destaque") {
  const copia = [...list]; // nunca altera a lista original
  const porPreco = (a, b) => obterPrecoUnitarioCentavos(a) - obterPrecoUnitarioCentavos(b);
  switch (ordem) {
    case "preco-asc":
      return copia.sort(porPreco);
    case "preco-desc":
      return copia.sort((a, b) => porPreco(b, a));
    case "nome":
      return copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    default:
      return copia.sort((a, b) => Number(b.destaque) - Number(a.destaque)); // sort é estável
  }
}

export const consultarCatalogo = (list, filters) =>
  ordenarProdutos(filtrarProdutos(list, filters), filters?.ordem);
