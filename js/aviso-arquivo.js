// Script clássico (não é módulo), de propósito: é o único tipo que roda quando a página
// é aberta com duplo clique (file://), onde o navegador bloqueia os módulos do site.
if (location.protocol === "file:") {
  const caixa = document.createElement("div");
  caixa.className = "aviso-arquivo";
  caixa.setAttribute("role", "alert");
  caixa.textContent =
    'Este site precisa de um servidor local para funcionar. Abra a pasta no VS Code e use a extensão Live Server (botão direito em index.html → Open with Live Server), ou rode "python -m http.server 8000" na pasta e acesse localhost:8000 no navegador.';
  document.body.prepend(caixa);
}
