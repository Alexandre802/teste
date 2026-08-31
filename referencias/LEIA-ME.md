# Referências

Material de apoio usado na construção do site. Não vai para o ar — nada aqui
é servido ao visitante.

```
referencias/
└── imagens/     imagens de referência (fotos, capturas, mockups)
```

As imagens que virarem conteúdo do site precisam ser processadas e movidas
para `public/`:

- foto de produto → `public/produtos/`
- marca e logotipo → `public/marca/`
- camadas do lanche do topo → `public/lanche/`

Foto de produto só entra no catálogo se for **daquele item**. Item sem foto
confirmada fica com `image: null` em `lib/catalog.ts` e cai no marcador da
marca — reaproveitar a foto de um lanche em outro é proibido pelas regras do
projeto (ver `CLAUDE.md`).
