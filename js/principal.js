// Ponto de entrada da página inicial: liga estado, eventos e interface.
import { produtos, CATEGORIAS, PUBLICOS, obterProdutoPorId } from "./dados/produtos.js";
import { FAIXAS_PRECO, ORDENACOES, consultarCatalogo } from "./catalogo.js";
import {
  criarCardProduto,
  criarDetalheProduto,
  criarEstadoVazio,
  criarEstadoErro,
  elemento,
} from "./interface/renderizar.js";
import { renderizarGavetaCarrinho } from "./interface/gaveta-carrinho.js";
import {
  adicionarItem,
  definirQuantidade,
  removerItem,
  calcularTotais,
  carregarCarrinho,
  salvarCarrinho,
  QUANTIDADE_MAXIMA,
  CHAVE_CARRINHO,
} from "./carrinho.js";
import {
  alternarFavorito,
  carregarFavoritos,
  salvarFavoritos,
  CHAVE_FAVORITOS,
} from "./favoritos.js";
import { iniciarMenu } from "./interface/menu.js";
import { iniciarDestaques } from "./interface/destaques.js";

const FILTROS_PADRAO = Object.freeze({
  busca: "",
  categoria: "todos",
  publico: "todos",
  faixaPreco: "todos",
  ordem: "destaque",
  somenteFavoritos: false,
});

const $ = (id) => document.getElementById(id);
const grade = $("lista-produtos");
const campoBusca = $("campo-busca");
const caixaCategorias = $("categorias-botoes");
const gaveta = $("carrinho-gaveta");
const dialogoDetalhe = $("produto-dialogo");
const selecoes = {
  publico: $("filtro-publico"),
  faixaPreco: $("filtro-preco"),
  ordem: $("filtro-ordem"),
};

let estado = { ...FILTROS_PADRAO };
let carrinho = carregarCarrinho();
let favoritos = carregarFavoritos();

const anunciar = (mensagem) => {
  $("carrinho-status").textContent = mensagem;
};

/* ---------- Catálogo ---------- */

function preencherSelect(selecao, opcoes) {
  selecao.replaceChildren(
    ...Object.entries(opcoes).map(([valor, rotulo]) =>
      elemento("option", { texto: rotulo, atributos: { value: valor } }),
    ),
  );
}

function montarControles() {
  preencherSelect(selecoes.publico, { todos: "Todos", ...PUBLICOS });
  preencherSelect(
    selecoes.faixaPreco,
    Object.fromEntries(Object.entries(FAIXAS_PRECO).map(([k, r]) => [k, r.rotulo])),
  );
  preencherSelect(selecoes.ordem, ORDENACOES);
  caixaCategorias.replaceChildren(
    ...Object.entries({ todos: "Todos", ...CATEGORIAS }).map(([valor, rotulo]) =>
      elemento("button", {
        classe: "botao-categoria",
        texto: rotulo,
        atributos: { type: "button", "data-categoria": valor },
      }),
    ),
  );
}

function sincronizarControles() {
  campoBusca.value = estado.busca;
  for (const [chave, selecao] of Object.entries(selecoes)) selecao.value = estado[chave];
  for (const botaoCategoria of caixaCategorias.children)
    botaoCategoria.setAttribute(
      "aria-pressed",
      String(botaoCategoria.dataset.categoria === estado.categoria),
    );
  $("favoritos-alternar").setAttribute("aria-pressed", String(estado.somenteFavoritos));
}

function renderizar() {
  const resultados = consultarCatalogo(produtos, { ...estado, idsFavoritos: favoritos });
  const semFavoritosAinda = estado.somenteFavoritos && favoritos.length === 0;
  grade.replaceChildren(
    ...(resultados.length
      ? resultados.map((p) => criarCardProduto(p, favoritos.includes(p.id)))
      : [
          semFavoritosAinda
            ? criarEstadoVazio(
                limparFiltros,
                "Você ainda não tem favoritos",
                "Use o coração em um produto para salvá-lo aqui.",
              )
            : criarEstadoVazio(limparFiltros),
        ]),
  );
  $("resultados-status").textContent =
    resultados.length === 1 ? "1 produto encontrado" : `${resultados.length} produtos encontrados`;
}

function atualizar(alteracoes) {
  estado = { ...estado, ...alteracoes };
  sincronizarControles();
  renderizar();
}

function limparFiltros() {
  atualizar({ ...FILTROS_PADRAO });
  campoBusca.focus();
}

/* ---------- Carrinho ---------- */

function atualizarContadorCarrinho() {
  const { quantidadeItens } = calcularTotais(carrinho);
  const selo = $("carrinho-contador");
  selo.textContent = String(quantidadeItens);
  selo.hidden = quantidadeItens === 0;
  $("carrinho-botao").setAttribute(
    "aria-label",
    `Abrir carrinho, ${quantidadeItens} ${quantidadeItens === 1 ? "item" : "itens"}`,
  );
}

/** Único ponto que altera o carrinho: salva, atualiza o contador e a gaveta. */
function definirCarrinho(novo) {
  carrinho = novo;
  salvarCarrinho(carrinho);
  atualizarContadorCarrinho();
  renderizarGavetaCarrinho(carrinho);
}

const quantidadeNoCarrinho = (id) => carrinho.find((i) => i.id === id)?.quantidade ?? 0;

function tratarAdicionar(botao) {
  const produto = obterProdutoPorId(botao.dataset.adicionar);
  if (!produto) return;
  const antes = quantidadeNoCarrinho(produto.id);
  definirCarrinho(adicionarItem(carrinho, produto.id));
  const depois = quantidadeNoCarrinho(produto.id);
  const limiteAtingido = depois === antes; // já havia o máximo: nada foi adicionado
  // A quantidade vai na mensagem: texto idêntico seria ignorado pelo leitor de tela na 2ª vez.
  anunciar(
    limiteAtingido
      ? `Limite de ${QUANTIDADE_MAXIMA} unidades de ${produto.nome} no carrinho atingido`
      : `${produto.nome} adicionado ao carrinho (${depois} no carrinho)`,
  );
  // Feedback temporário: texto E nome acessível mudam juntos (o "✓" é só enfeite de CSS).
  botao.dataset.rotulo ??= botao.textContent;
  botao.dataset.rotuloAria ??= botao.getAttribute("aria-label");
  botao.textContent = limiteAtingido ? "Limite atingido" : "Adicionado";
  botao.setAttribute("aria-label", `${botao.textContent}: ${produto.nome}`);
  botao.classList.toggle("adicionado", !limiteAtingido);
  setTimeout(() => {
    botao.textContent = botao.dataset.rotulo;
    botao.setAttribute("aria-label", botao.dataset.rotuloAria);
    botao.classList.remove("adicionado");
  }, 1500);
}

function tratarAcaoCarrinho(botao) {
  const { acao, id } = botao.dataset;
  const produto = obterProdutoPorId(id);
  const linha = carrinho.find((i) => i.id === id);
  if (!produto || !linha) return;

  if (acao === "aumentar") definirCarrinho(definirQuantidade(carrinho, id, linha.quantidade + 1));
  if (acao === "diminuir") definirCarrinho(definirQuantidade(carrinho, id, linha.quantidade - 1));
  if (acao === "remover") definirCarrinho(removerItem(carrinho, id));

  const atualizado = carrinho.find((i) => i.id === id);
  anunciar(
    atualizado
      ? `${produto.nome}: quantidade ${atualizado.quantidade}`
      : `${produto.nome} removido do carrinho`,
  );

  // A lista foi redesenhada: devolve o foco ao controle equivalente para o teclado não se perder.
  const itens = $("carrinho-itens");
  const alvo =
    itens.querySelector(`[data-acao="${acao}"][data-id="${id}"]:not(:disabled)`) ??
    itens.querySelector(`[data-acao="remover"][data-id="${id}"]`) ??
    $("carrinho-titulo");
  alvo.focus();
}

/* ---------- Favoritos e detalhes ---------- */

function tratarFavorito(botao) {
  const produto = obterProdutoPorId(botao.dataset.favorito);
  if (!produto) return;
  favoritos = alternarFavorito(favoritos, produto.id);
  salvarFavoritos(favoritos);
  anunciar(
    `${produto.nome} ${favoritos.includes(produto.id) ? "adicionado aos" : "removido dos"} favoritos`,
  );

  if (estado.somenteFavoritos) {
    renderizar();
    if (!botao.isConnected) $("catalogo-titulo").focus();
  }
  for (const b of document.querySelectorAll("[data-favorito]")) {
    b.setAttribute("aria-pressed", String(favoritos.includes(b.dataset.favorito)));
  }
}

function abrirDetalhe(idProduto) {
  const produto = obterProdutoPorId(idProduto);
  if (!produto) return;
  $("detalhe-conteudo").replaceChildren(
    criarDetalheProduto(produto, favoritos.includes(produto.id)),
  );
  dialogoDetalhe.showModal();
}

/** Recarrega carrinho e favoritos salvos (outra aba alterou, ou a página voltou do cache do navegador). */
function sincronizarComArmazenamento() {
  carrinho = carregarCarrinho();
  favoritos = carregarFavoritos();
  atualizarContadorCarrinho();
  renderizarGavetaCarrinho(carrinho);
  renderizar();
}

/* ---------- Eventos ---------- */

function vincularEventos() {
  campoBusca.addEventListener("input", () => atualizar({ busca: campoBusca.value }));
  $("formulario-busca").addEventListener("submit", (e) => {
    e.preventDefault();
    $("produtos").scrollIntoView();
  });
  caixaCategorias.addEventListener("click", (e) => {
    const botaoCategoria = e.target.closest("[data-categoria]");
    if (botaoCategoria) atualizar({ categoria: botaoCategoria.dataset.categoria });
  });
  for (const [chave, selecao] of Object.entries(selecoes))
    selecao.addEventListener("change", () => atualizar({ [chave]: selecao.value }));
  $("favoritos-alternar").addEventListener("click", () =>
    atualizar({ somenteFavoritos: !estado.somenteFavoritos }),
  );

  // Delegação: um único listener cobre botões de cards, do modal e criados depois.
  document.addEventListener("click", (e) => {
    // Links do menu e botões dos destaques: aplicam o filtro de categoria/público e o href="#produtos" rola até a lista.
    const ir = e.target.closest("[data-ir-categoria], [data-ir-publico]");
    if (ir)
      return atualizar({
        ...FILTROS_PADRAO,
        categoria: ir.dataset.irCategoria ?? "todos",
        publico: ir.dataset.irPublico ?? "todos",
      });
    const adicionar = e.target.closest("[data-adicionar]");
    if (adicionar) return tratarAdicionar(adicionar);
    const favorito = e.target.closest("[data-favorito]");
    if (favorito) return tratarFavorito(favorito);
    const detalhe = e.target.closest("[data-detalhe]");
    if (detalhe) abrirDetalhe(detalhe.dataset.detalhe);
  });
  $("carrinho-itens").addEventListener("click", (e) => {
    const botao = e.target.closest("[data-acao]");
    if (botao) tratarAcaoCarrinho(botao);
  });

  $("carrinho-botao").addEventListener("click", () => gaveta.showModal());
  $("carrinho-fechar").addEventListener("click", () => gaveta.close());
  $("carrinho-continuar").addEventListener("click", () => gaveta.close());
  $("detalhe-fechar").addEventListener("click", () => dialogoDetalhe.close());
  // Clique no fundo escurecido (::backdrop) tem o próprio <dialog> como alvo.
  for (const dialogo of [gaveta, dialogoDetalhe]) {
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo) dialogo.close();
    });
  }
  // Sem isto, uma segunda aba sobrescreveria o carrinho da primeira com o próprio estado em memória.
  window.addEventListener("storage", (e) => {
    if ([CHAVE_CARRINHO, CHAVE_FAVORITOS, null].includes(e.key)) sincronizarComArmazenamento();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) sincronizarComArmazenamento();
  });
}

try {
  montarControles();
  iniciarMenu($("navegacao-principal"));
  iniciarDestaques($("destaques"));
  vincularEventos();
  sincronizarControles();
  atualizarContadorCarrinho();
  renderizarGavetaCarrinho(carrinho);
  renderizar();
} catch (erro) {
  console.error(erro);
  grade.replaceChildren(criarEstadoErro());
}
