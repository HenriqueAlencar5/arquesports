// Desenha o conteúdo da gaveta do carrinho a partir do estado (carrinho).
import {
  calcularTotais,
  obterItensCarrinho,
  FRETE_GRATIS_A_PARTIR_DE_CENTAVOS,
} from "../carrinho.js";
import { formatarPreco } from "../formatar.js";
import { criarItemCarrinho } from "./renderizar.js";

const $ = (id) => document.getElementById(id);

export function renderizarGavetaCarrinho(carrinho) {
  const linhas = obterItensCarrinho(carrinho);
  const totais = calcularTotais(carrinho);
  const temItens = linhas.length > 0;

  $("carrinho-itens").replaceChildren(...linhas.map(criarItemCarrinho));
  $("carrinho-itens").hidden = !temItens;
  $("carrinho-vazio").hidden = temItens;
  $("carrinho-rodape").hidden = !temItens;

  $("carrinho-subtotal").textContent = formatarPreco(totais.subtotalCentavos);
  $("carrinho-frete").textContent = totais.freteGratis
    ? "Grátis"
    : formatarPreco(totais.freteCentavos);
  $("carrinho-total").textContent = formatarPreco(totais.totalCentavos);
  $("carrinho-aviso-frete").textContent = totais.freteGratis
    ? "Você ganhou frete grátis!"
    : `Faltam ${formatarPreco(FRETE_GRATIS_A_PARTIR_DE_CENTAVOS - totais.subtotalCentavos)} para ganhar frete grátis.`;
}
