# imobiliaria-demo

Site demonstrativo de uma imobiliária de imóveis de alto padrão. Existe para
ser apresentado a possíveis clientes do ramo — **não é o site de nenhuma
imobiliária real**, e todos os dados são fictícios.

A peça central é o hero: o scroll do visitante percorre, quadro a quadro, um
vídeo de câmera entrando na casa.

```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run test:e2e # constrói antes, por pretest:e2e
```

Antes do primeiro `test:e2e`: `npx playwright install chromium`.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Remotion ·
Framer Motion · Lucide.

## O hero

O movimento não é reconstruído com CSS nem aproximado com zoom: quem produz
o movimento é o arquivo de vídeo. O Remotion entra para controlar **qual
quadro** está na tela, e o scroll decide esse quadro.

```
progresso = scrollPercorrido / (alturaDaSecao − alturaDaTela)
quadro    = round(progresso × (192 − 1))
playerRef.current.seekTo(quadro)
```

A divisão é linear de propósito. Qualquer easing aqui reordenaria os quadros
e mudaria o ritmo gravado na filmagem. O resultado: parou de rolar, a câmera
para; voltou o scroll, a câmera volta; o vídeo nunca toca sozinho.

Peças envolvidas:

| Arquivo | Papel |
|---|---|
| `remotion/RealEstateHero.tsx` | A composição. Um `<Video>` do Remotion e nada mais. |
| `remotion/constants.ts` | Medidas do arquivo (fps, quadros, dimensões) e os marcos do percurso. |
| `remotion/utils.ts` | `progressoParaQuadro`, e o easing que só a interface usa. |
| `remotion/Root.tsx` | Registro da composição para abrir no Remotion Studio. O site não passa por aqui. |
| `components/HeroScrollExperience.tsx` | A seção alta, o `sticky`, o `<Player>` e o laço de scroll. |

Detalhes que valem saber:

- **Nada de `setState` por quadro.** As opacidades do convite e do bloco final
  são escritas direto no DOM dentro de um `requestAnimationFrame`; os
  listeners são `passive`. O único estado de React que muda durante o scroll
  é o booleano que libera o clique nos botões do fim.
- **Enquadramento.** O `<Player>` do Remotion sempre encaixa a composição
  inteira no espaço disponível, o que deixaria tarja preta. A classe
  `.hero-cobertura` dimensiona a caixa em volta dele para *sempre cobrir* a
  viewport mantendo a proporção 720×1280 — mesmo efeito de um
  `object-fit: cover`, sem esticar. O corte cai igual dos dois lados, então a
  porta continua no centro tanto no celular quanto no monitor.
- **Altura do percurso.** 520vh no celular, 600vh a partir de 1024px
  (`.hero-scroll`, em `app/globals.css`). É essa altura que define o ritmo:
  quanto maior, mais devagar a câmera anda para o mesmo gesto de scroll.
- **Pré-carga.** Um elemento de vídeo solto puxa o arquivo para o cache
  enquanto o poster do primeiro quadro segura a tela. Sem preto, sem flash.
  Se o arquivo falhar, o poster fica e a página continua utilizável.
- **Codec.** O site escolhe entre MP4/H.264 e WebM/VP9 por `canPlayType`.
- **`prefers-reduced-motion`.** A seção encolhe para uma tela só por CSS —
  antes da hidratação, então não há salto de layout —, o último quadro entra
  como imagem parada, o conteúdo comercial já nasce visível e o `<Player>`
  nem chega a montar: o vídeo não é baixado.

## Seções

Na ordem: hero → `#imoveis` → `#sobre` → `#localizacao` (com `#contato`
dentro) → rodapé.

O catálogo filtra de verdade, sem back-end: categorias, busca por nome,
cidade e estado (ignorando acento), e um painel com ordenação, quartos
mínimos e teto de preço. Os dados estão em `lib/properties.ts`.

**O acervo demonstrativo só tem casas.** O filtro "Apartamentos" existe
porque o layout de referência o traz, e ele funciona — devolve zero e a tela
diz por quê, em vez de fingir um resultado. Basta acrescentar itens com
`tipo: 'apartamento'` em `lib/properties.ts` para a categoria ganhar conteúdo.

## Adaptar para outro cliente

`lib/site-config.ts` concentra nome, telefone, WhatsApp, e-mail, endereço,
horário e redes sociais. Nenhuma dessas informações aparece escrita dentro de
JSX, então trocar esse arquivo adapta o demonstrativo inteiro.

> **Antes de publicar:** os contatos em `site-config.ts` são inventados. O
> telefone e o WhatsApp fictícios podem pertencer a alguém de verdade — troque
> pelos dados do cliente antes de qualquer publicação. Enquanto isso, o rodapé
> avisa ao visitante que os dados são demonstrativos.

O acervo fica em `lib/properties.ts` e as fotografias em `public/imagens/`.
Veja `ASSET_MAP.md` para a origem de cada arquivo.

## Imagens

As fotografias dos imóveis foram recortadas das capturas de tela de
referência, que é o material que existia. Elas seguram bem no celular e
ficam macias em tela grande — a resolução das capturas é o limite. Em
produção, entram no lugar as fotos do acervo do cliente, com as mesmas
proporções.

Nenhuma captura de tela é usada como fundo de seção: títulos, cards, botões,
filtros, ícones e grid são HTML e CSS de verdade.

## Testes

`npm run test:e2e` roda a suíte nos cinco tamanhos do briefing — 390×844,
430×932, 768×1024, 1440×900 e 1920×1080 — e cobre:

- o quadro do hero acompanhando o scroll nos dois sentidos, com o vídeo
  sempre pausado;
- a câmera parando quando o scroll para;
- o conteúdo comercial ausente durante o movimento e presente no fim;
- o caminho de `prefers-reduced-motion`;
- filtros, busca, ordenação, favoritos e o estado vazio honesto;
- ausência de rolagem horizontal e de erro no console;
- os contatos vindo do `site-config`, e o `noindex`.

Em ambiente que já traz um Chromium instalado fora do diretório do Playwright,
aponte `PLAYWRIGHT_CHROMIUM_PATH` para o executável.

## Licença do Remotion

O Remotion é gratuito para uso individual e para empresas pequenas, mas exige
licença paga acima de certo porte — veja <https://remotion.dev/license>.
O `<Player>` é montado com `acknowledgeRemotionLicense`; confirme o
enquadramento do cliente antes de colocar no ar.
