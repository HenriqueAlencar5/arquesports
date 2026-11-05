// Slider de destaques acessível:
//  - slides inativos recebem `inert` (saem da ordem de Tab e do leitor de tela);
//  - botão Pausar/Reproduzir (exigência WCAG 2.2.2 para conteúdo que se move);
//  - não avança sozinho com prefers-reduced-motion, nem com mouse ou foco dentro dos destaques.
import { elemento } from "./renderizar.js";

const INTERVALO_AUTOMATICO_MS = 6000;

export function iniciarDestaques(raiz) {
  const slides = [...raiz.querySelectorAll(".slide")];
  const trilho = raiz.querySelector(".destaques-slides");
  const alternar = raiz.querySelector("#destaques-alternar");
  const indicadores = slides.map((_, i) =>
    elemento("button", {
      classe: "destaques-indicador",
      atributos: { type: "button", "aria-label": `Ir para o slide ${i + 1}` },
    }),
  );
  raiz.querySelector(".destaques-indicadores").replaceChildren(...indicadores);

  let indice = 0;
  let reproduzindo = !(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  let comMouse = false;
  let comFoco = false;
  let temporizador = null;

  function mostrar(proximo) {
    indice = (proximo + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("ativo", i === indice);
      if (i === indice) slide.removeAttribute("inert");
      else slide.setAttribute("inert", "");
    });
    indicadores.forEach((indicador, i) => {
      if (i === indice) indicador.setAttribute("aria-current", "true");
      else indicador.removeAttribute("aria-current");
    });
  }

  function agendar() {
    clearInterval(temporizador);
    temporizador =
      reproduzindo && !comMouse && !comFoco
        ? setInterval(() => mostrar(indice + 1), INTERVALO_AUTOMATICO_MS)
        : null;
  }

  function ir(proximo) {
    mostrar(proximo);
    agendar();
  }

  function renderizarAlternar() {
    alternar.textContent = reproduzindo ? "Pausar" : "Reproduzir";
    alternar.setAttribute(
      "aria-label",
      reproduzindo ? "Pausar rotação dos destaques" : "Reproduzir rotação dos destaques",
    );
    trilho.setAttribute("aria-live", reproduzindo ? "off" : "polite"); // pausado: anuncia a troca manual
  }

  raiz.querySelector("#destaques-anterior").addEventListener("click", () => ir(indice - 1));
  raiz.querySelector("#destaques-proximo").addEventListener("click", () => ir(indice + 1));
  indicadores.forEach((indicador, i) => indicador.addEventListener("click", () => ir(i)));
  alternar.addEventListener("click", () => {
    reproduzindo = !reproduzindo;
    renderizarAlternar();
    agendar();
  });
  raiz.addEventListener("mouseenter", () => {
    comMouse = true;
    agendar();
  });
  raiz.addEventListener("mouseleave", () => {
    comMouse = false;
    agendar();
  });
  raiz.addEventListener("focusin", () => {
    comFoco = true;
    agendar();
  });
  raiz.addEventListener("focusout", (e) => {
    if (!raiz.contains(e.relatedTarget)) {
      comFoco = false;
      agendar();
    }
  });

  mostrar(0);
  renderizarAlternar();
  agendar();
}
