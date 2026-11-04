// Fonte ÚNICA dos produtos. Preços em CENTAVOS (inteiros) para evitar erros
// de ponto flutuante (0.1 + 0.2 !== 0.3). Para trocar uma foto, edite `image`.

import { FOTOS } from "./imagens.js";

const bruto = [
  {
    id: "camisa-selecao",
    nome: "Camisa Seleção Brasileira",
    marca: "Jordan",
    tipo: "camisa",
    categoria: "roupas",
    publico: "masculino",
    precoCentavos: 14990,
    precoPromocionalCentavos: null,
    descricao: "Camisa esportiva Jordan com tecido leve e respirável.",
    destaque: true,
  },
  {
    id: "asics-pulse-x",
    nome: "Asics Pulse X",
    marca: "Asics",
    tipo: "tenis",
    categoria: "calcados",
    publico: "masculino",
    precoCentavos: 11990,
    precoPromocionalCentavos: null,
    descricao: "Tênis com amortecimento macio para treinos e corridas diárias.",
    destaque: true,
  },
  {
    id: "adidas-street-cap",
    nome: "Adidas Street Cap",
    marca: "Adidas",
    tipo: "bone",
    categoria: "acessorios",
    publico: "unissex",
    precoCentavos: 8990,
    precoPromocionalCentavos: null,
    descricao: "Boné casual azul-marinho com aba curva e ajuste traseiro.",
    destaque: true,
  },
  {
    id: "volt-runner-elite",
    nome: "Volt Runner Elite",
    marca: "ArqueSports",
    tipo: "tenis",
    categoria: "calcados",
    publico: "masculino",
    precoCentavos: 39990,
    precoPromocionalCentavos: 32990,
    descricao: "Tênis de corrida da linha Volt-Reaction, com retorno de energia a cada passada.",
    destaque: true,
  },
  {
    id: "volt-sprint-feminino",
    nome: "Volt Sprint Feminino",
    marca: "ArqueSports",
    tipo: "tenis",
    categoria: "calcados",
    publico: "feminino",
    precoCentavos: 29990,
    precoPromocionalCentavos: null,
    descricao: "Tênis leve para treino e corrida, com cabedal respirável.",
    destaque: false,
  },
  {
    id: "short-pace-dry",
    nome: "Short Pace Dry",
    marca: "ArqueSports",
    tipo: "shorts",
    categoria: "roupas",
    publico: "masculino",
    precoCentavos: 8990,
    precoPromocionalCentavos: 6990,
    descricao: "Short de secagem rápida com bolso interno para chave.",
    destaque: false,
  },
  {
    id: "jaqueta-thermo",
    nome: "Jaqueta Cortavento Thermo",
    marca: "ArqueSports",
    tipo: "jaqueta",
    categoria: "roupas",
    publico: "masculino",
    precoCentavos: 24990,
    precoPromocionalCentavos: null,
    descricao: "Jaqueta leve que protege do vento e da garoa sem esquentar demais.",
    destaque: false,
  },
  {
    id: "legging-flex-pro",
    nome: "Legging Flex Pro",
    marca: "ArqueSports",
    tipo: "legging",
    categoria: "roupas",
    publico: "feminino",
    precoCentavos: 12990,
    precoPromocionalCentavos: null,
    descricao: "Legging de cintura alta com compressão média e costuras planas.",
    destaque: false,
  },
  {
    id: "top-core",
    nome: "Top Fitness Core",
    marca: "ArqueSports",
    tipo: "top",
    categoria: "roupas",
    publico: "feminino",
    precoCentavos: 6990,
    precoPromocionalCentavos: null,
    descricao: "Top com sustentação média para treinos de academia e corrida.",
    destaque: false,
  },
  {
    id: "tenis-play-kids",
    nome: "Tênis Play Fast Kids",
    marca: "ArqueSports",
    tipo: "tenis",
    categoria: "calcados",
    publico: "infantil",
    precoCentavos: 17990,
    precoPromocionalCentavos: 14990,
    descricao: "Tênis infantil com fechamento em velcro e solado antiderrapante.",
    destaque: false,
  },
  {
    id: "mochila-kids",
    nome: "Mochila Kids Sport",
    marca: "ArqueSports",
    tipo: "mochila",
    categoria: "acessorios",
    publico: "infantil",
    precoCentavos: 12990,
    precoPromocionalCentavos: null,
    descricao: "Mochila resistente com alças acolchoadas e bolso para garrafa.",
    destaque: false,
  },
  {
    id: "garrafa-volt",
    nome: "Garrafa Térmica Volt 750 ml",
    marca: "ArqueSports",
    tipo: "garrafa",
    categoria: "acessorios",
    publico: "unissex",
    precoCentavos: 5990,
    precoPromocionalCentavos: null,
    descricao: "Garrafa de aço inox que mantém a bebida gelada por até 12 horas.",
    destaque: false,
  },
];

export const CATEGORIAS = Object.freeze({
  calcados: "Calçados",
  roupas: "Roupas",
  acessorios: "Acessórios",
});

export const PUBLICOS = Object.freeze({
  masculino: "Masculino",
  feminino: "Feminino",
  infantil: "Infantil",
  unissex: "Unissex",
});

export const produtos = Object.freeze(
  bruto.map((p) =>
    Object.freeze({
      ...p,
      imagem: FOTOS[p.id] ?? `recursos/imagens/${p.id}.svg`, // foto real, se existir; senão o placeholder
      altImagem: `${p.nome}, ${p.marca}`,
    }),
  ),
);

// Falha cedo se houver dado inconsistente (id repetido, preço inválido...).
(function validarCatalogo() {
  const ids = new Set();
  for (const p of produtos) {
    if (ids.has(p.id)) throw new Error(`Produto com id duplicado: ${p.id}`);
    ids.add(p.id);
    if (!Number.isInteger(p.precoCentavos) || p.precoCentavos <= 0) {
      throw new Error(`Preço inválido em ${p.id}`);
    }
    if (
      p.precoPromocionalCentavos !== null &&
      !(
        Number.isInteger(p.precoPromocionalCentavos) && p.precoPromocionalCentavos < p.precoCentavos
      )
    ) {
      throw new Error(`Preço promocional inválido em ${p.id}`);
    }
    if (!(p.categoria in CATEGORIAS) || !(p.publico in PUBLICOS)) {
      throw new Error(`Categoria ou público inválido em ${p.id}`);
    }
  }
})();

const porId = new Map(produtos.map((p) => [p.id, p]));

export const obterProdutoPorId = (id) => porId.get(id) ?? null;
export const estaEmPromocao = (p) => p.precoPromocionalCentavos !== null;
/** Preço que o cliente de fato paga (promocional, se existir). */
export const obterPrecoUnitarioCentavos = (p) =>
  estaEmPromocao(p) ? p.precoPromocionalCentavos : p.precoCentavos;
