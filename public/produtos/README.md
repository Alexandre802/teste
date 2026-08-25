# Fotos dos produtos

Salve a foto aqui com o **nome igual ao `id` do produto** em `data/products.ts`
e ela aparece no card sozinha — sem editar código.

Exemplo: o produto

```ts
{ id: 'premier-formula-caes-adultos-pequeno-frango-15kg', ... }
```

pega automaticamente o arquivo

```
public/produtos/premier-formula-caes-adultos-pequeno-frango-15kg.webp
```

O mapa é gerado por `npm run fotos`, que já roda sozinho antes de
`npm run dev` e `npm run build`. Se adicionar fotos com o servidor ligado,
rode `npm run fotos` e recarregue.

Formatos aceitos, em ordem de preferência: `.avif`, `.webp`, `.png`, `.jpg`.

Para uma foto que não segue esse nome, aponte o caminho direto no catálogo:

```ts
imagem: '/produtos/qualquer-outro-nome.webp',
```

## Regras que valem para todas as fotos

- **Só a foto do próprio produto.** Nunca reaproveitar a foto de um item em
  outro, mesmo que a embalagem pareça igual.
- **Nunca alterar a embalagem de uma marca.** Nada de recolorir, recortar o
  logotipo ou gerar embalagem por IA — use o material oficial do fabricante.
- Produto sem foto confirmada fica no placeholder da marca. Isso é melhor do
  que uma imagem errada.

Formato sugerido: WebP, fundo branco, 800×800, produto centralizado com
respiro nas bordas.

## Quais produtos ainda estão sem foto

```bash
npm run fotos     # imprime quantas fotos existem na pasta
```
