// Página de checkout DEMONSTRATIVA: lê o carrinho, valida o formulário e mostra a confirmação.
// Nenhum dado do formulário é enviado, salvo ou registrado.
import {
  carregarCarrinho,
  salvarCarrinho,
  limparCarrinho,
  obterItensCarrinho,
  calcularTotais,
} from "./carrinho.js";
import { formatarPreco } from "./formatar.js";
import { elemento } from "./interface/renderizar.js";
import { CAMPOS, MASCARAS, validarCheckout } from "./validadores.js";

const $ = (id) => document.getElementById(id);
const IDS_CAMPOS = Object.keys(CAMPOS);
const formulario = $("checkout-formulario");

const linhas = obterItensCarrinho(carregarCarrinho());
const totais = calcularTotais(
  linhas.map(({ produto, quantidade }) => ({ id: produto.id, quantidade })),
);

/* ---------- Resumo do pedido ---------- */

function renderizarResumo() {
  $("resumo-itens").replaceChildren(
    ...linhas.map(({ produto, quantidade, totalItemCentavos }) =>
      elemento(
        "li",
        { classe: "resumo-linha" },
        elemento("span", { texto: `${produto.nome} × ${quantidade}` }),
        elemento("span", { texto: formatarPreco(totalItemCentavos) }),
      ),
    ),
  );
  $("resumo-subtotal").textContent = formatarPreco(totais.subtotalCentavos);
  $("resumo-frete").textContent = totais.freteGratis
    ? "Grátis"
    : formatarPreco(totais.freteCentavos);
  $("resumo-total").textContent = formatarPreco(totais.totalCentavos);
}

/* ---------- Validação ---------- */

function mostrarErro(campo, mensagem) {
  const erro = $(`${campo.id}-erro`);
  if (mensagem) {
    campo.setAttribute("aria-invalid", "true");
    erro.textContent = mensagem;
    erro.hidden = false;
  } else {
    campo.removeAttribute("aria-invalid");
    erro.textContent = "";
    erro.hidden = true;
  }
}

const lerValores = () => Object.fromEntries(IDS_CAMPOS.map((id) => [id, $(id).value]));

formulario.addEventListener("input", (event) => {
  const campo = event.target;
  if (!(campo.id in CAMPOS)) return;
  if (campo.id in MASCARAS) campo.value = MASCARAS[campo.id](campo.value);
  // Depois que o campo já foi marcado com erro, revalida a cada tecla para o erro sumir assim que for corrigido.
  if (campo.hasAttribute("aria-invalid")) mostrarErro(campo, CAMPOS[campo.id](campo.value));
});

formulario.addEventListener("focusout", (event) => {
  const campo = event.target;
  // Não reclama de campo vazio só porque o usuário passou por ele com Tab.
  if (campo.id in CAMPOS && campo.value !== "") mostrarErro(campo, CAMPOS[campo.id](campo.value));
});

formulario.addEventListener("submit", (event) => {
  event.preventDefault();
  const erros = validarCheckout(lerValores());
  for (const id of IDS_CAMPOS) mostrarErro($(id), erros[id] ?? null);

  const invalidos = IDS_CAMPOS.filter((id) => id in erros);
  const resumo = $("resumo-erros");
  if (invalidos.length > 0) {
    resumo.textContent = `Corrija ${invalidos.length} ${invalidos.length === 1 ? "campo" : "campos"} para continuar.`;
    resumo.hidden = false;
    $(invalidos[0]).focus();
    return;
  }
  resumo.hidden = true;
  concluirPedido();
});

/* ---------- Confirmação (demonstrativa) ---------- */

function concluirPedido() {
  const numeroPedido = `ARQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  salvarCarrinho(limparCarrinho()); // o pedido "foi feito": esvazia o carrinho
  const titulo = elemento("h1", {
    classe: "sucesso-titulo",
    texto: "Pedido recebido",
    atributos: { tabindex: "-1" },
  });

  $("checkout-principal").replaceChildren(
    elemento(
      "section",
      { classe: "sucesso" },
      titulo,
      elemento("p", {
        classe: "aviso-demonstracao",
        texto: "Compra demonstrativa: nenhuma cobrança foi feita e nenhum e-mail foi enviado.",
      }),
      elemento("p", { texto: `Número do pedido: ${numeroPedido}` }),
      elemento(
        "ul",
        { classe: "resumo-itens" },
        ...linhas.map(({ produto, quantidade, totalItemCentavos }) =>
          elemento(
            "li",
            { classe: "resumo-linha" },
            elemento("span", { texto: `${produto.nome} × ${quantidade}` }),
            elemento("span", { texto: formatarPreco(totalItemCentavos) }),
          ),
        ),
      ),
      elemento("p", {
        classe: "resumo-total-linha",
        texto: `Total: ${formatarPreco(totais.totalCentavos)}`,
      }),
      elemento("a", {
        classe: "botao botao-principal",
        texto: "Voltar à loja",
        atributos: { href: "index.html" },
      }),
    ),
  );
  titulo.focus();
}

/* ---------- Início ---------- */

if (linhas.length === 0) {
  $("checkout-grade").hidden = true;
  $("pagina-carrinho-vazio").hidden = false;
} else {
  renderizarResumo();
}
