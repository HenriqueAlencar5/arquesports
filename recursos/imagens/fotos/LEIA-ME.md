# Fotos dos produtos

1. Baixe uma foto por produto e salve **nesta pasta** com o nome exato da coluna "Arquivo" (`.jpg`, `.webp`, `.png` ou `.avif`).
2. Na raiz do projeto, rode `npm run fotos`.
3. Recarregue a página. Produtos sem foto continuam com o placeholder.

| Arquivo                | Produto                   | Sugestão de busca (Unsplash / Pexels)              |
| ---------------------- | ------------------------- | -------------------------------------------------- |
| `camisa-selecao`       | Camisa Seleção Brasileira | camisa de futebol amarela / yellow soccer jersey   |
| `asics-pulse-x`        | Asics Pulse X             | tênis de corrida / running shoes                   |
| `adidas-street-cap`    | Adidas Street Cap         | boné azul-marinho / navy baseball cap              |
| `volt-runner-elite`    | Volt Runner Elite         | tênis de corrida azul / blue running shoe          |
| `volt-sprint-feminino` | Volt Sprint Feminino      | tênis feminino de corrida / women running shoes    |
| `short-pace-dry`       | Short Pace Dry            | short de corrida / running shorts                  |
| `jaqueta-thermo`       | Jaqueta Cortavento Thermo | jaqueta corta-vento / sport windbreaker jacket     |
| `legging-flex-pro`     | Legging Flex Pro          | legging de academia / gym leggings                 |
| `top-core`             | Top Fitness Core          | top fitness / sports bra top                       |
| `tenis-play-kids`      | Tênis Play Fast Kids      | tênis infantil / kids sneakers                     |
| `mochila-kids`         | Mochila Kids Sport        | mochila infantil / kids backpack                   |
| `garrafa-volt`         | Garrafa Térmica Volt      | garrafa de aço inox / stainless steel water bottle |

## Dicas

- **Formato:** retrato 4:5 (por exemplo 800×1000 px). Outras proporções funcionam, mas são cortadas para caber.
- **Peso:** idealmente até ~150 KB por foto (use WebP ou JPG comprimido), para a página carregar rápido.
- **Licença:** use bancos de fotos de uso livre (Unsplash, Pexels, Pixabay) e confira a licença de cada foto. Evite fotos de produtos de marcas reais tiradas de lojas: são protegidas por direitos autorais.
- **Marcas:** se a foto mostrar o logotipo de outra marca (por exemplo Nike) num produto chamado "Asics", escolha uma foto sem logo visível ou renomeie o produto em `js/data/products.js`.
