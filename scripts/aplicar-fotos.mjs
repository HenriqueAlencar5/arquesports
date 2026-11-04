// Liga as fotos de recursos/imagens/fotos/ aos produtos. Rode: npm run fotos
// Regra: o NOME do arquivo é o id do produto (ex.: asics-pulse-x.jpg). Sem foto, o placeholder continua.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { extname, basename } from "node:path";
import { produtos } from "../js/dados/produtos.js";

const dir = new URL("../recursos/imagens/fotos/", import.meta.url);
const PREFERENCE = [".avif", ".webp", ".jpg", ".jpeg", ".png"]; // se houver duas do mesmo produto, vence a primeira
const ids = new Set(produtos.map((p) => p.id));

const map = {};
for (const file of existsSync(dir) ? readdirSync(dir) : []) {
  const ext = extname(file).toLowerCase();
  if (!PREFERENCE.includes(ext)) continue;
  const id = basename(file, extname(file)).toLowerCase();
  if (!ids.has(id)) {
    console.warn(`Ignorado: "${file}" não corresponde a nenhum produto.`);
    continue;
  }
  const current = map[id];
  if (!current || PREFERENCE.indexOf(ext) < PREFERENCE.indexOf(extname(current)))
    map[id] = `recursos/imagens/fotos/${id}${ext}`;
}

writeFileSync(
  new URL("../js/dados/imagens.js", import.meta.url),
  `// GERADO por scripts/aplicar-fotos.mjs (npm run fotos). Não edite à mão.\nexport const PHOTOS = Object.freeze(${JSON.stringify(map, null, 2)});\n`,
);

const missing = produtos.filter((p) => !(p.id in map)).map((p) => p.id);
console.log(`${Object.keys(map).length} de ${produtos.length} produtos com foto.`);
if (missing.length) console.log(`Ainda com placeholder: ${missing.join(", ")}`);
