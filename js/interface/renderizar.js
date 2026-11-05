// Criação de elementos do DOM. Usamos createElement + textContent (e não
// innerHTML) para que nenhum texto seja interpretado como HTML.
import { formatarPreco } from "../formatar.js";
import { estaEmPromocao, CATEGORIAS, PUBLICOS } from "../dados/produtos.js";
import { QUANTIDADE_MAXIMA } from "../carrinho.js";

export function elemento(tag, { classe, texto, atributos } = {}, ...filhos) {
  const no = document.createElement(tag);
  if (classe) no.className = classe;
  if (texto !== undefined) no.textContent = texto;
  for (const [nome, valor] of Object.entries(atributos ?? {})) no.setAttribute(nome, valor);
  no.append(...filhos.filter(Boolean));
  return no;
}

const NAMESPACE_SVG = "http://www.w3.org/2000/svg";
const CAMINHO_CORACAO = "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z";

export function icone(dadosCaminho) {
  const svg = document.createElementNS(NAMESPACE_SVG, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icone");
  svg.setAttribute("aria-hidden", "true");
  const caminho = document.createElementNS(NAMESPACE_SVG, "path");
  caminho.setAttribute("d", dadosCaminho);
  svg.append(caminho);
  return svg;
}

const somenteLeitorTela = (texto) => elemento("span", { classe: "so-leitor-tela", texto });

function criarPreco(p) {
  if (!estaEmPromocao(p)) {
    return elemento(
      "p",
      { classe: "preco" },
      elemento(
        "strong",
        { classe: "preco-atual" },
        somenteLeitorTela("Preço: "),
        formatarPreco(p.precoCentavos),
      ),
    );
  }
  return elemento(
    "p",
    { classe: "preco" },
    elemento(
      "s",
      { classe: "preco-antigo" },
      somenteLeitorTela("Preço original: "),
      formatarPreco(p.precoCentavos),
    ),
    elemento(
      "strong",
      { classe: "preco-atual" },
      somenteLeitorTela("Preço promocional: "),
      formatarPreco(p.precoPromocionalCentavos),
    ),
  );
}

const criarBotaoAdicionar = (p) =>
  elemento("button", {
    classe: "botao botao-principal",
    texto: "Adicionar ao carrinho",
    atributos: {
      type: "button",
      "data-adicionar": p.id,
      "aria-label": `Adicionar ao carrinho: ${p.nome}`,
    },
  });

function criarBotaoFavorito(p, ehFavorito, comRotulo = false) {
  return elemento(
    "button",
    {
      classe: comRotulo ? "botao botao-contorno botao-favorito-largo" : "botao-favorito",
      atributos: {
        type: "button",
        "data-favorito": p.id,
        "aria-pressed": String(ehFavorito),
        "aria-label": `Favoritar ${p.nome}`,
      },
    },
    icone(CAMINHO_CORACAO),
    comRotulo ? "Favoritar" : null,
  );
}

export function criarCardProduto(p, ehFavorito = false) {
  const desconto = estaEmPromocao(p)
    ? Math.round((1 - p.precoPromocionalCentavos / p.precoCentavos) * 100)
    : 0;
  const imagem = elemento("img", {
    atributos: {
      src: p.imagem,
      alt: p.altImagem,
      width: 800,
      height: 1000,
      loading: "lazy",
      decoding: "async",
    },
  });

  return elemento(
    "article",
    { classe: "card-produto" },
    elemento(
      "div",
      { classe: "card-imagem" },
      imagem,
      desconto ? elemento("span", { classe: "selo", texto: `Promoção −${desconto}%` }) : null,
      criarBotaoFavorito(p, ehFavorito),
    ),
    elemento(
      "div",
      { classe: "card-corpo" },
      elemento("p", { classe: "card-marca", texto: p.marca }),
      elemento("h3", { classe: "card-nome", texto: p.nome }),
      elemento("p", { classe: "card-descricao", texto: p.descricao }),
      criarPreco(p),
      criarBotaoAdicionar(p),
      elemento("button", {
        classe: "botao botao-discreto",
        texto: "Ver detalhes",
        atributos: {
          type: "button",
          "data-detalhe": p.id,
          "aria-label": `Ver detalhes de ${p.nome}`,
        },
      }),
    ),
  );
}

export function criarDetalheProduto(p, ehFavorito = false) {
  return elemento(
    "div",
    { classe: "detalhe" },
    elemento("img", {
      classe: "detalhe-imagem",
      atributos: { src: p.imagem, alt: p.altImagem, width: 800, height: 1000 },
    }),
    elemento(
      "div",
      { classe: "detalhe-info" },
      elemento("p", { classe: "card-marca", texto: p.marca }),
      elemento("h2", {
        classe: "detalhe-titulo",
        atributos: { id: "detalhe-titulo" },
        texto: p.nome,
      }),
      criarPreco(p),
      elemento("p", { texto: p.descricao }),
      elemento(
        "dl",
        { classe: "especificacoes" },
        elemento("dt", { texto: "Categoria" }),
        elemento("dd", { texto: CATEGORIAS[p.categoria] }),
        elemento("dt", { texto: "Público" }),
        elemento("dd", { texto: PUBLICOS[p.publico] }),
      ),
      elemento(
        "div",
        { classe: "detalhe-acoes" },
        criarBotaoAdicionar(p),
        criarBotaoFavorito(p, ehFavorito, true),
      ),
    ),
  );
}

export function criarItemCarrinho({
  produto: p,
  quantidade,
  precoUnitarioCentavos,
  totalItemCentavos,
}) {
  const botaoQuantidade = (acao, texto, rotulo, disabled) =>
    elemento("button", {
      classe: "quantidade-botao",
      texto,
      atributos: {
        type: "button",
        "data-acao": acao,
        "data-id": p.id,
        "aria-label": rotulo,
        ...(disabled ? { disabled: "" } : {}),
      },
    });

  return elemento(
    "li",
    { classe: "carrinho-item" },
    elemento("img", { atributos: { src: p.imagem, alt: "", width: 80, height: 100 } }), // decorativa: o nome está ao lado
    elemento(
      "div",
      { classe: "carrinho-item-info" },
      elemento("p", { classe: "carrinho-item-nome", texto: p.nome }),
      elemento("p", {
        classe: "carrinho-item-unitario",
        texto: `${formatarPreco(precoUnitarioCentavos)} cada`,
      }),
      elemento(
        "div",
        { classe: "quantidade" },
        botaoQuantidade("diminuir", "−", `Diminuir quantidade de ${p.nome}`, quantidade <= 1),
        elemento(
          "span",
          { classe: "quantidade-valor" },
          somenteLeitorTela("Quantidade: "),
          String(quantidade),
        ),
        botaoQuantidade(
          "aumentar",
          "+",
          `Aumentar quantidade de ${p.nome}`,
          quantidade >= QUANTIDADE_MAXIMA,
        ),
      ),
      elemento("button", {
        classe: "botao-link",
        texto: "Remover",
        atributos: {
          type: "button",
          "data-acao": "remover",
          "data-id": p.id,
          "aria-label": `Remover ${p.nome} do carrinho`,
        },
      }),
    ),
    elemento("p", { classe: "carrinho-item-total", texto: formatarPreco(totalItemCentavos) }),
  );
}

export function criarEstadoVazio(
  aoLimpar,
  title = "Nenhum produto encontrado",
  texto = "Tente outro termo de busca ou remova alguns filtros.",
) {
  const botao = elemento("button", {
    classe: "botao botao-contorno",
    texto: "Limpar filtros",
    atributos: { type: "button" },
  });
  botao.addEventListener("click", aoLimpar);
  return elemento(
    "div",
    { classe: "estado-vazio" },
    elemento("h3", { texto: title }),
    elemento("p", { texto }),
    botao,
  );
}

export function criarEstadoErro() {
  return elemento(
    "div",
    { classe: "estado-vazio", atributos: { role: "alert" } },
    elemento("h3", { texto: "Não foi possível carregar os produtos" }),
    elemento("p", {
      texto: "Atualize a página. Se o problema continuar, tente novamente mais tarde.",
    }),
  );
}
