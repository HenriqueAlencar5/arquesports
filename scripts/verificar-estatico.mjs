// Auditoria estática do projeto: referências quebradas, padrões inseguros e variáveis CSS indefinidas.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { produtos } from "../js/dados/produtos.js";

const root = fileURLToPath(new URL("../", import.meta.url)); // .pathname quebra no Windows (/C:/...)
const walk = (dir) =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(root, rel)).isDirectory() ? walk(rel) : [rel];
  });
const read = (rel) => readFileSync(join(root, rel), "utf8");
const arquivosJs = walk("js").filter((f) => f.endsWith(".js"));
const arquivosCss = walk("css");
const pages = ["index.html", "checkout.html"];

// 0) nenhum arquivo do projeto pode estar vazio (um script de renomeação já zerou um LEIA-ME sem ninguém notar)
const todosArquivos = (dir = "") =>
  readdirSync(join(root, dir))
    .filter((nome) => !["node_modules", ".git"].includes(nome))
    .flatMap((nome) => {
      const rel = join(dir, nome);
      return statSync(join(root, rel)).isDirectory() ? todosArquivos(rel) : [rel];
    });
for (const f of todosArquivos()) assert.ok(statSync(join(root, f)).size > 0, `arquivo vazio: ${f}`);

// 1) todo href/src local das páginas existe
for (const page of pages) {
  for (const [, ref] of read(page).matchAll(/(?:href|src)="([^"#:]+)"/g)) {
    assert.ok(existsSync(join(root, ref)), `${page}: arquivo inexistente "${ref}"`);
  }
}
// 2) todo import relativo de JS existe
for (const file of arquivosJs) {
  for (const [, ref] of read(file).matchAll(/from\s+"(\.[^"]+)"/g)) {
    assert.ok(
      existsSync(resolve(root, dirname(file), ref)),
      `${file}: import inexistente "${ref}"`,
    );
  }
}
// 3) toda imagem do catálogo existe
for (const p of produtos)
  assert.ok(existsSync(join(root, p.imagem)), `imagem ausente: ${p.imagem}`);

// 4) nada de padrões inseguros ou legados no código da aplicação
const forbidden = [
  /\.innerHTML\s*=/,
  /\.outerHTML\s*=/,
  /insertAdjacentHTML\s*\(/,
  /document\.write\s*\(/,
  /\beval\s*\(/,
];
for (const file of arquivosJs) {
  for (const pattern of forbidden)
    assert.ok(!pattern.test(read(file)), `${file}: padrão proibido ${pattern}`);
}
for (const page of pages) {
  const html = read(page);
  assert.ok(!/\son\w+=/.test(html), `${page}: atributo de evento inline (onclick...)`);
  assert.ok(!/font-awesome/i.test(html), `${page}: Font Awesome não deveria mais ser carregado`);
}

// 5) sem dependências externas em tempo de execução (exceto o namespace SVG)
for (const file of [...pages, ...arquivosJs, ...arquivosCss]) {
  for (const [url] of read(file).matchAll(/https?:\/\/[^\s"')]+/g)) {
    assert.ok(url.startsWith("http://www.w3.org/"), `${file}: recurso externo ${url}`);
  }
}

// 6) todo var(--x) usado no CSS está definido em variaveis.css
const defined = new Set(
  [...read("css/variaveis.css").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
);
for (const file of arquivosCss) {
  for (const [, name] of read(file).matchAll(/var\((--[\w-]+)/g)) {
    assert.ok(defined.has(name), `${file}: variável indefinida ${name}`);
  }
}
// 7) cores hexadecimais só existem em variaveis.css
for (const file of arquivosCss.filter((f) => !f.endsWith("variaveis.css"))) {
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(read(file)), `${file}: cor fixa fora dos tokens`);
}
// 8) cada <img> do HTML e do JS declara alt (o JS cria imagens com alt via atributos)
for (const page of pages) {
  for (const [tag] of read(page).matchAll(/<img\b[^>]*>/g))
    assert.ok(/\balt=/.test(tag), `${page}: <img> sem alt`);
}

console.log(
  `Etapa 6: auditoria estática ok (${pages.length} páginas, ${arquivosJs.length} módulos JS, ${arquivosCss.length} CSS).`,
);
