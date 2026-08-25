# Segurança e privacidade

O que está implementado, o que não está, e o que depende de configuração sua.

---

## Sobre "criptografia de ponta a ponta"

**Ponta a ponta não se aplica a este site, e é importante entender por quê.**

Criptografia de ponta a ponta significa que só os dois extremos da conversa
conseguem ler o conteúdo — nem o servidor no meio consegue. Funciona no
WhatsApp porque o servidor só precisa entregar o pacote, não entender.

Aqui o servidor **precisa ler** o pedido: para calcular o total, para mandar
o resumo à cozinha e para criar a cobrança no gateway. Um servidor que não
consegue ler o pedido não consegue processá-lo. Então o servidor é um extremo
legítimo, e o que protege o dado é outra coisa:

| Onde o dado está | O que protege |
|---|---|
| Navegador → servidor | TLS 1.3 (HTTPS), obrigatório via HSTS |
| No servidor | Nada é gravado: as rotas processam e descartam |
| No aparelho do cliente | Fica só ali; o cliente apaga quando quiser |
| Servidor → WhatsApp / gateway | TLS, com credencial que nunca vai ao navegador |

Quem prometer "ponta a ponta" num site de pedidos com pagamento está
descrevendo errado o que fez, ou entregando algo que não funciona.

---

## IP e identificadores: o que dá e o que não dá para bloquear

**O site não coleta IP.** Não há analytics, nenhum script de terceiro, nenhum
cookie de rastreio, nenhum pixel de Meta ou Google. Nada do que a pessoa faz
no site é enviado para fora.

**O que não é possível esconder:** o servidor que entrega a página enxerga o
IP de quem pediu — é assim que TCP/IP funciona, não é escolha de projeto.
A Vercel (ou qualquer hospedagem) vê esse endereço nos registros dela.
Prometer o contrário seria mentira. O que dá para fazer, e foi feito:

- **Nenhuma rota grava o IP.** Nem em banco, nem em log, nem em memória.
- **O limite de taxa usa um hash**, não o endereço. O identificador é
  `sha256(sal + dia + IP)` truncado: não dá para voltar ao IP a partir dele, e
  como o dia entra na conta, o valor muda a cada 24 h e não serve para seguir
  alguém ao longo do tempo. (`lib/seguranca.ts`)
- **`Referrer-Policy: no-referrer`** — ao clicar no WhatsApp ou no mapa, o
  endereço da página não vai junto.
- **`Permissions-Policy`** nega localização, câmera, microfone e sensores.
  Nem se um script tentasse, o navegador deixaria.

**Não existe "ID de usuário".** O cliente é identificado só pelo que ele
digita, e isso fica no aparelho dele.

---

## O que já protege

### Cabeçalhos (`middleware.ts`)

- **CSP com nonce por requisição.** Script inline só executa com o nonce do
  momento. Sem `unsafe-inline` — é o que impede uma injeção de HTML virar
  execução de código, a porta mais comum de roubo de dados.
- **HSTS** 2 anos, com subdomínios e `preload`.
- **`frame-ancestors 'none'` + `X-Frame-Options: DENY`** — bloqueia
  clickjacking (site embutido em iframe invisível para roubar cliques).
- **`X-Content-Type-Options: nosniff`**, `Cross-Origin-Opener-Policy`,
  `Cross-Origin-Resource-Policy`.

### Rotas

| Rota | Teto | Janela |
|---|---|---|
| `/api/pedido` | 8 | 1 min |
| `/api/checkout` | 6 | 1 min |
| `/api/auth/email` | 12 | 5 min |
| `/api/whatsapp/webhook` | 20 | 1 min |

- **Webhook do Mercado Pago**: valida `x-signature` (HMAC).
- **Webhook do WhatsApp**: valida `X-Hub-Signature-256` contra o
  `WHATSAPP_APP_SECRET`. Sem isso, quem descobrisse a URL faria o bot
  responder, gastando cota da API e crédito do modelo.
- **Total recalculado no servidor** a partir do catálogo. Preço vindo do
  navegador é ignorado; quantidade limitada a 50 por item.
- **Comparações de segredo em tempo constante** (`timingSafeEqual`), para não
  vazar o valor pelo tempo de resposta.

### Registros

Tudo que sai em log passa por redação (`lib/seguranca.ts`): e-mail, telefone,
CPF, CEP, IP, número de cartão e qualquer cadeia longa que pareça token viram
marcadores. Log de plataforma é lido por gente que não precisa ver isso, e
costuma ficar guardado por semanas.

### Segredos

Só três variáveis chegam ao navegador, e nenhuma é secreta por natureza:
`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_FACEBOOK_APP_ID` e
`NEXT_PUBLIC_SITE_URL`. Tokens de WhatsApp, Mercado Pago e Anthropic só
existem no servidor.

### Dados do cliente

Ficam apenas no `localStorage` do aparelho. Há um botão **"Apagar meus dados
deste aparelho"** na seção de contato — como não existe cópia em servidor
nosso, apagar ali apaga de verdade (LGPD art. 18, VI).

---

## O que ainda depende de você

1. **`WHATSAPP_APP_SECRET`** — sem ele o webhook do WhatsApp **recusa tudo**
   (falha fechada, de propósito). Pegue em Meta Business → Configurações do app.
2. **`RATE_LIMIT_SALT`** e **`AUTH_SECRET`** — valores longos e aleatórios.
   Sem trocar, ficam com o padrão de desenvolvimento, que é público.
3. **`MP_WEBHOOK_SECRET`** — assinatura do Mercado Pago.
4. **Limite de taxa compartilhado.** O atual vive na memória da instância. Em
   serverless cada instância tem a própria, então isso segura abuso casual,
   não ataque distribuído. Para valer, ligue Vercel KV ou Upstash Redis com a
   mesma lógica de `limitarTaxa`.
5. **Pagamento.** O site nunca vê número de cartão: quem coleta é o Mercado
   Pago, na página dele. Mantenha assim — guardar cartão exige PCI-DSS.

---

## O que este projeto não faz

Dito na lata, para ninguém contar com o que não existe:

- Não há autenticação de dois fatores.
- O bloqueio de 5 tentativas de login é **trava de interface**: vive no
  navegador e qualquer pessoa zera limpando os dados do site. Contém erro de
  digitação, não ataque. Proteção real contra força bruta é limite por IP no
  servidor de autenticação — que é o que Google e Facebook já fazem quando
  você configurar as chaves deles.
- Não há WAF nem proteção contra DDoS além do que a hospedagem oferece.
- Não há registro de auditoria de acesso.
- Não houve teste de invasão. As verificações feitas aqui foram automáticas.
