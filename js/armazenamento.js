// Leitura/escrita segura de JSON no localStorage (compartilhada por carrinho e favoritos).

/**
 * Só ler `globalThis.localStorage` já pode lançar erro (cookies bloqueados, página isolada).
 * Por isso o acesso fica dentro de try/catch: sem armazenamento, o app segue sem persistir.
 */
function armazenamentoPadrao() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function lerJson(chave, armazenamento = armazenamentoPadrao()) {
  try {
    const texto = armazenamento.getItem(chave);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null; // JSON corrompido ou armazenamento indisponível
  }
}

export function escreverJson(chave, valor, armazenamento = armazenamentoPadrao()) {
  try {
    armazenamento.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // modo privado, cota cheia ou armazenamento indisponível
  }
}
