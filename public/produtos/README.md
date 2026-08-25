# Fotos dos produtos

Coloque aqui a foto **do próprio produto**, uma por arquivo, e aponte no
catálogo (`data/products.ts`):

```ts
imagem: '/produtos/premier-formula-caes-adultos-pequeno-frango-15kg.webp',
```

Regras que valem para todas as fotos:

- **Só a foto do próprio produto.** Nunca reaproveitar a foto de um item em
  outro, mesmo que a embalagem pareça igual.
- **Nunca alterar a embalagem de uma marca.** Nada de recolorir, recortar o
  logotipo ou gerar embalagem por IA — use o material oficial do fabricante.
- Produto sem foto confirmada fica com `imagem: null` e cai no placeholder da
  marca. Isso é melhor do que uma imagem errada.

Formato sugerido: WebP, fundo branco, 800×800, produto centralizado com
respiro nas bordas. O nome do arquivo pode ser o mesmo `id` do produto.
