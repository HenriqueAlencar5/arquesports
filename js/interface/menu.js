// Menu de navegação por público (Masculino, Feminino, Infantil).
// Os links são gerados a partir de PUBLICOS e CATEGORIAS, então sempre refletem o catálogo real.
// Abre por clique/Enter/Espaço (funciona em teclado e toque); Esc fecha e devolve o foco ao botão.
import { PUBLICOS, CATEGORIAS } from "../dados/produtos.js";
import { elemento, icone } from "./renderizar.js";

const PUBLICOS_MENU = ["masculino", "feminino", "infantil"];
const CAMINHO_SETA = "m6 9 6 6 6-6";

export function iniciarMenu(navegacao) {
  const menus = PUBLICOS_MENU.map((publico) => {
    const rotulo = PUBLICOS[publico];
    const idPainel = `menu-${publico}`;
    const link = (texto, categoria, classe) =>
      elemento(
        "li",
        {},
        elemento("a", {
          classe,
          texto,
          atributos: {
            href: "#produtos",
            "data-ir-publico": publico,
            ...(categoria ? { "data-ir-categoria": categoria } : {}),
          },
        }),
      );

    const gatilho = elemento(
      "button",
      {
        classe: "menu-botao",
        atributos: { type: "button", "aria-expanded": "false", "aria-controls": idPainel },
      },
      rotulo,
      icone(CAMINHO_SETA),
    );
    const painel = elemento(
      "div",
      { classe: "menu-painel", atributos: { id: idPainel, hidden: "" } },
      elemento("p", { classe: "menu-titulo", texto: `Linha ${rotulo}` }),
      elemento(
        "ul",
        { classe: "menu-links" },
        ...Object.entries(CATEGORIAS).map(([categoria, rotuloCategoria]) =>
          link(rotuloCategoria, categoria),
        ),
        link(`Ver tudo de ${rotulo.toLowerCase()}`, null, "menu-todos"),
      ),
    );
    return { gatilho, painel, item: elemento("div", { classe: "menu-item" }, gatilho, painel) };
  });

  const definirAberto = (menu, aberto) => {
    menu.gatilho.setAttribute("aria-expanded", String(aberto));
    menu.painel.hidden = !aberto;
  };
  const fecharTodos = () => menus.forEach((m) => definirAberto(m, false));

  for (const menu of menus) {
    menu.gatilho.addEventListener("click", () => {
      const vaiAbrir = menu.painel.hidden;
      fecharTodos();
      definirAberto(menu, vaiAbrir);
    });
  }
  navegacao.addEventListener("click", (e) => {
    if (e.target.closest(".menu-painel a")) fecharTodos();
  });
  navegacao.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const aberto = menus.find((m) => !m.painel.hidden);
    if (aberto) {
      fecharTodos();
      aberto.gatilho.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!navegacao.contains(e.target)) fecharTodos();
  });
  document.addEventListener("focusin", (e) => {
    if (!navegacao.contains(e.target)) fecharTodos();
  }); // Tab para fora fecha

  navegacao.replaceChildren(...menus.map((m) => m.item));
}
