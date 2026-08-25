# Colocar o site no ar

O que já funciona na sua máquina, o que só funciona depois de publicado e o que
depende de você preencher. Marque conforme for fazendo.

## O que já funciona sem publicar nada

Rode `npm install && npm run dev` e tudo isto responde em `localhost:3000`:

- Layout inteiro, em celular e desktop.
- Catálogo, seções, categorias por espécie e departamentos.
- Busca no catálogo.
- Carrinho: adicionar, mudar quantidade, remover, subtotal. Fica no
  `localStorage` do navegador, não precisa de servidor.
- **Fechar pedido no WhatsApp.** O link `wa.me` abre a conversa com a lista do
  pedido escrita, direto para (12) 98167-6145. Funciona de qualquer lugar,
  inclusive de `localhost` — não espera o site estar no ar.
- Carrossel, menu lateral, âncoras.

## O que só funciona depois de publicado

### 1. Entrar com Facebook — precisa de HTTPS

O Facebook exige HTTPS nas URLs de retorno do login. Em `localhost` o
comportamento é inconsistente e depende do modo do app. Na prática: o botão do
Facebook só é confiável com o site num domínio HTTPS de verdade (ou atrás de um
túnel tipo ngrok, se quiser testar antes).

Cadastre em developers.facebook.com → seu app → Login do Facebook →
"URIs de redirecionamento do OAuth válidos":

```
https://SEU-DOMINIO/api/auth/callback/facebook
```

### 2. Entrar com Google — funciona local, mas cada endereço precisa ser cadastrado

O Google aceita `http://localhost`, então dá para testar antes de publicar.
Cadastre os dois em console.cloud.google.com → Credenciais → ID do cliente
OAuth → "URIs de redirecionamento autorizados":

```
http://localhost:3000/api/auth/callback/google
https://SEU-DOMINIO/api/auth/callback/google
```

O endereço de produção precisa entrar lá **antes** de alguém tentar usar, senão
o Google recusa com `redirect_uri_mismatch`.

### 3. Aparecer no Google

`sitemap.xml`, `robots.txt`, o canonical e a ficha da loja (JSON-LD) são
gerados desde já, mas apontam para o domínio de `NEXT_PUBLIC_SITE_URL`. Sem
domínio público não há o que indexar. Depois de publicar, cadastre o site no
Google Search Console e envie o sitemap.

### 4. Prévia do link no WhatsApp e nas redes

Quando alguém colar o endereço da loja no WhatsApp ou no Facebook, aparece um
cartão com título, descrição e imagem (Open Graph). A imagem precisa de uma URL
pública absoluta — em `localhost` o cartão não monta.

### 5. Cookie de sessão

Fora de HTTPS o cookie de login não é marcado como `Secure`. Funciona para
testar, mas só é seguro de verdade com o site em HTTPS.

## O que depende de você preencher, não de publicar

Nada aqui espera o site estar no ar — é decisão da loja:

- [ ] **Preços.** Os valores em `data/products.ts` são rascunho de mercado e o
      site não os mostra. Revise com a loja e vire
      `PRECOS_CONFIRMADOS` para `true`.
- [ ] **Fotos dos produtos.** Salve em `public/produtos/` com o nome igual ao
      `id` do produto — ver `public/produtos/README.md`.
- [ ] **Endereço completo e horário de funcionamento** em `data/business.ts`.
      Estão `null` e por isso não aparecem no rodapé.
- [ ] **Fotos dos banners.** As de hoje são recortes da peça de referência, em
      baixa resolução. Troque por fotografia de campanha em `public/banners/`.

## O que ainda não existe

- **Pagamento online.** Hoje o pedido fecha pelo WhatsApp; não há checkout,
  cartão nem Pix no site.
- **Login por e-mail e senha.** Precisa de um banco para guardar a conta. O
  ponto de ligação é `lib/usuarios.ts` — o hash de senha já está pronto lá,
  falta a consulta. Enquanto isso o formulário avisa e oferece Google/Facebook.
- **Estoque de verdade.** `estoque: true/false` é manual no catálogo.

## Passo a passo para publicar (Vercel)

1. Conecte o repositório em vercel.com → New Project. Ela reconhece Next.js
   sem configuração.
2. Em Settings → Environment Variables, adicione:

   | Variável | De onde vem |
   | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | o domínio final, ex. `https://casaderacaobandeirabranca.com.br` |
   | `AUTH_SECRET` | `npx auth secret` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | console.cloud.google.com |
   | `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET` | developers.facebook.com |

   Sem as chaves de um provedor, o botão dele não aparece na tela de login —
   o site continua funcionando.
3. Aponte o domínio em Settings → Domains.
4. Volte no Google e no Facebook e cadastre as URLs de retorno com o domínio
   final.
5. Rode `npm test` contra o site publicado para conferir:

   ```bash
   BASE=https://SEU-DOMINIO npm test
   ```
