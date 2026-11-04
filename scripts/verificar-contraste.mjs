// Calcula a razão de contraste WCAG dos pares de cores dos tokens. Rode: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../css/variaveis.css", import.meta.url), "utf8");
const t = Object.fromEntries(
  [...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
);

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [texto, fundo, mínimo]: 4,5 para texto normal (WCAG AA)
const pairs = [
  ["cor-texto", "cor-fundo"],
  ["cor-texto", "cor-superficie"],
  ["cor-texto", "cor-superficie-elevada"],
  ["cor-texto-suave", "cor-fundo"],
  ["cor-texto-suave", "cor-superficie"],
  ["cor-texto-suave", "cor-superficie-elevada"],
  ["cor-marca-texto", "cor-fundo"],
  ["cor-marca-texto", "cor-superficie"],
  ["cor-marca-texto", "cor-superficie-elevada"],
  ["cor-erro", "cor-superficie"],
  ["cor-erro", "cor-superficie-elevada"],
  ["cor-texto", "cor-marca"],
].map(([fg, bg]) => [t[fg], t[bg], `${fg} / ${bg}`]);
pairs.push(
  [t["cor-branco"], t["cor-marca-hover"], "branco / botão azul (hover)"],
  [t["cor-preto"], t["cor-branco"], "selo Promoção"],
  [t["cor-preto"], t["cor-realce"], "botão claro (hover)"],
);

let failed = 0;
for (const [fg, bg, nome] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= 4.5;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FALHA"} ${r.toFixed(2).padStart(5)}:1  ${nome}`);
}
assert.equal(failed, 0, `${failed} par(es) abaixo de 4,5:1`);
console.log("Etapa 5: contraste AA verificado.");
