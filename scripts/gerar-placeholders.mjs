// Gera as imagens SVG de produto (recursos/imagens/<id>.svg) e as artes dos destaques (recursos/imagens/destaque-<id>.svg).
// Rode: npm run placeholders. Desenhos em grade 256×256, escalados na composição.
import { writeFileSync } from "node:fs";
import { produtos } from "../js/dados/produtos.js";

const BRANCO = "#ffffff",
  TINTA = "#0a0a0a",
  AZUL_CLARO = "#5c7cff",
  AZUL_MARCA = "#0033ff";
const raio = (x, y, s = 1, fill = AZUL_CLARO) =>
  `<path transform="translate(${x} ${y}) scale(${s})" d="M10 0 0 24h9l-4 18 16-26h-9z" fill="${fill}"/>`;
const linha = (d, c = TINTA, w = 5) =>
  `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

const DESENHOS = {
  tenis: `<path d="M26 170V120q0-12 12-14l34-6 18-26q8-8 18-2l14 24 26 12q46 8 74 34 14 10 14 22v6z" fill="${BRANCO}"/>
    <path d="M20 170h226v14q0 10-10 10H32q-12 0-12-12z" fill="${AZUL_CLARO}"/>
    ${linha("M92 94l14-12M106 104l14-12M120 114l14-12")}${linha("M44 148q80-24 160 8")}`,
  camisa: `<path d="M88 40 48 56 24 104l34 14 12-18v108h116V100l12 18 34-14-24-48-40-16q-40 36-80 0z" fill="${BRANCO}"/>
    ${linha("M88 40q40 36 80 0")}${raio(117, 112)}`,
  jaqueta: `<path d="M92 40 52 54 30 184l30 8 12-76v98h112v-98l12 76 30-8-22-130-40-14q-36 22-72 0z" fill="${BRANCO}"/>
    ${linha("M128 56V214")}${linha("M84 168h30M142 168h30")}${linha("M92 40l12-10M164 40l-12-10")}`,
  bone: `<path d="M48 156q0-88 80-88t80 88z" fill="${BRANCO}"/>
    <path d="M170 148q56 0 80 22 0 10-12 8-40-6-76-8z" fill="${AZUL_CLARO}"/>
    <circle cx="128" cy="70" r="6" fill="${AZUL_CLARO}"/>${linha("M128 72q-30 40-34 84M128 72q30 40 34 84", TINTA, 4)}${linha("M48 156h160")}`,
  shorts: `<path d="M60 74h136l16 124h-70l-14-70-14 70H44z" fill="${BRANCO}"/>
    <path d="M60 74h136v18H60z" fill="${AZUL_CLARO}"/>${linha("M120 92v28M136 92v28")}${linha("M64 106 54 190")}`,
  legging: `<path d="M72 50h112l12 26-12 138h-44l-12-98-12 98H72L60 76z" fill="${BRANCO}"/>
    ${linha("M64 66h128")}${linha("M82 98 76 204", AZUL_CLARO, 6)}`,
  top: `<path d="M92 56h20l8 40q8 10 16 0l8-40h20l22 74q0 40-58 46-58-6-58-46z" fill="${BRANCO}"/>
    ${linha("M74 152q54 22 108 0")}${raio(118, 108, 0.7)}`,
  mochila: `<path d="M86 66q0-30 42-30t42 30l24 14v128q0 14-14 14H76q-14 0-14-14V80z" fill="${BRANCO}"/>
    ${linha("M106 40q22-26 44 0", BRANCO, 8)}<path d="M78 140h100v66H78z" fill="${AZUL_CLARO}"/>${linha("M78 160h100")}${linha("M128 160v14", TINTA, 6)}`,
  garrafa: `<rect x="106" y="26" width="44" height="26" rx="4" fill="${AZUL_CLARO}"/>
    <path d="M100 58h56l14 26v128q0 14-14 14h-56q-14 0-14-14V84z" fill="${BRANCO}"/>
    <path d="M86 124h84v54H86z" fill="${AZUL_CLARO}"/>${raio(118, 130, 0.9, BRANCO)}`,
};

const fundoDe = (id) =>
  ["#111111", "#14161f", "#101419"][
    [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7) % 3
  ];

const cartaoProduto = (
  p,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${p.altImagem}">
  <rect width="800" height="1000" fill="${fundoDe(p.id)}"/>
  <circle cx="400" cy="420" r="280" fill="${AZUL_MARCA}"/>
  <ellipse cx="400" cy="738" rx="170" ry="14" fill="#000" opacity="0.4"/>
  <g transform="translate(93 108) scale(2.4)">${DESENHOS[p.tipo]}</g>
  <text x="400" y="930" fill="${AZUL_CLARO}" font-family="Arial Black, Arial, sans-serif" font-size="22" letter-spacing="8" text-anchor="middle">ARQUESPORTS</text>
</svg>
`;

const arteDestaque = (
  p,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true">
  <circle cx="320" cy="320" r="296" fill="${AZUL_MARCA}"/>
  <circle cx="320" cy="320" r="316" fill="none" stroke="${AZUL_CLARO}" stroke-width="2"/>
  <g transform="translate(33 36) scale(2.2)">${DESENHOS[p.tipo]}</g>
</svg>
`;

const IDS_DESTAQUES = ["volt-runner-elite", "jaqueta-thermo", "tenis-play-kids"];
for (const p of produtos) {
  writeFileSync(new URL(`../recursos/imagens/${p.id}.svg`, import.meta.url), cartaoProduto(p));
  if (IDS_DESTAQUES.includes(p.id))
    writeFileSync(
      new URL(`../recursos/imagens/destaque-${p.id}.svg`, import.meta.url),
      arteDestaque(p),
    );
}
console.log(`${produtos.length} placeholders e ${IDS_DESTAQUES.length} artes de destaque gerados.`);
