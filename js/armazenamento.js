// Leitura/escrita segura de JSON no localStorage (compartilhada por carrinho e favoritos).
export function lerJson(key, storage = globalThis.localStorage) {
  try {
    const texto = storage.getItem(key);
    return texto === null ? null : JSON.parse(texto);
  } catch {
    return null; // JSON corrompido ou storage indisponível
  }
}

export function escreverJson(key, value, storage = globalThis.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // modo privado ou cota cheia: o app segue sem persistir
  }
}
