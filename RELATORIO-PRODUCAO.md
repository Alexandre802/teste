# Michel Food House — o que falta para operar com cliente real

Levantado direto do código. Nada aqui é estimativa: cada linha corresponde a
um arquivo do projeto ou a uma credencial que o painel espera.

---

## 1. Variáveis de ambiente

Configurar na Vercel em **Settings → Environment Variables**, no ambiente
*Production*. Nenhuma delas está definida hoje.

| Variável | Para que serve | Obrigatória | Estado |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Endereço canônico no Google, no sitemap e no compartilhamento | Não — sem ela o site usa `https://teste-steel-five-45.vercel.app` | Pendente (só ao ter domínio próprio) |
| `MP_ACCESS_TOKEN` | Cobrar por Pix e cartão pelo site | Só para pagamento online | Pendente |
| `MP_WEBHOOK_SECRET` | Conferir a assinatura do webhook do Mercado Pago | **Sim, se `MP_ACCESS_TOKEN` estiver definido** | Pendente |
| `MP_SANDBOX` | `1` usa o checkout de teste | Não | Pendente |
| `WHATSAPP_TOKEN` | Enviar o pedido para a casa automaticamente | Só para o aviso automático | Pendente |
| `WHATSAPP_PHONE_NUMBER_ID` | Número REMETENTE na Cloud API | Junto com o token | Pendente |
| `WHATSAPP_API_VERSION` | Versão da API da Meta (padrão `v21.0`) | Não | Tem padrão |
| `WHATSAPP_VERIFY_TOKEN` | Validar o webhook no painel da Meta | Só para o atendente automático | Pendente |
| `WHATSAPP_APP_SECRET` | Conferir a assinatura do webhook da Meta | **Sim, se usar o webhook** | Pendente |
| `WHATSAPP_STORE_NUMBER` | Número que RECEBE o aviso | Não — já vem `5512988447711` | Configurada no código |
| `WHATSAPP_TEMPLATE_NAME` | Template aprovado, para avisar fora da janela de 24 h | Sim, na prática | Pendente |
| `WHATSAPP_TEMPLATE_LANG` | Idioma do template (padrão `pt_BR`) | Não | Tem padrão |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Botão "Entrar com Google" | Não | Pendente — botão oculto |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | Botão "Entrar com Facebook" | Não | Pendente — botão oculto |
| `AUTH_SECRET` | Derivar o código de acesso por e-mail | **Sim, se quiser login por e-mail** | Pendente — login por e-mail desligado |
| `RESEND_API_KEY` | Enviar o código por e-mail | Junto com `AUTH_SECRET` | Pendente |
| `EMAIL_FROM` | Remetente do e-mail | Junto com `RESEND_API_KEY` | Pendente |
| `ANTHROPIC_API_KEY` | Atendente automático no WhatsApp | Não | Pendente |
| `RATE_LIMIT_SALT` | Embaralhar o identificador do limite de taxa | Recomendada | Pendente — avisa no log |

**Nunca** colocar segredo em variável com prefixo `NEXT_PUBLIC_`: esse prefixo
manda o valor para o navegador. As duas `NEXT_PUBLIC_` da tabela são
identificadores públicos de aplicativo, não segredos.

---

## 2. Integrações externas pendentes

### Mercado Pago
1. Criar a aplicação em <https://www.mercadopago.com.br/developers/panel/app>.
2. Copiar o *access token* de produção para `MP_ACCESS_TOKEN`.
3. Cadastrar o webhook apontando para
   `https://teste-steel-five-45.vercel.app/api/webhook/mercadopago`.
4. Copiar o segredo do webhook para `MP_WEBHOOK_SECRET`.

O passo 4 não é opcional. Com token e sem segredo, **o pagamento online fica
desligado de propósito** (`lib/payments.ts`): sem conferir assinatura, qualquer
pessoa que descubra a URL manda um "pagamento aprovado" forjado e a cozinha
produz de graça.

### WhatsApp Cloud API
1. **Contratar uma segunda linha telefônica.** Registrar um número na Cloud API
   tira ele do aplicativo WhatsApp Business, e o (12) 98844-7711 é o número que
   atende o cliente. Ele *recebe* o aviso; quem *envia* tem que ser outra linha.
2. Criar o app no Meta Business, habilitar a Cloud API e gerar o token.
3. Criar um template na categoria **Utilidade**, com 4 variáveis nesta ordem:
   forma de pagamento e tipo · itens · total · cliente.
4. A aprovação da Meta leva de horas a dias — **começar por aqui**, é a única
   pendência cujo relógio não é seu.

Enquanto isso não existir, o pedido continua chegando: o botão abre o WhatsApp
do cliente com a mensagem montada (`wa.me`), que é o caminho garantido e não
depende de credencial nenhuma.

### Login social (Google / Facebook)
Além das credenciais, o fluxo OAuth precisa das rotas
`/api/auth/<provedor>/start` e `/callback`, **que ainda não existem**. Por isso
os dois botões estão ocultos: antes eles fingiam autenticar (`concluir({name:
'Cliente'})`) sem nenhuma verificação — login falso com cliente real.

Decidir: implementar o OAuth completo, ou seguir só com e-mail e convidado. O
convidado cobre 100% do fluxo de pedido hoje.

### Envio de e-mail (Resend)
Sem `RESEND_API_KEY` + `EMAIL_FROM`, o login por e-mail **não aparece na tela**.
Antes ele devolvia o código de 6 dígitos na própria resposta da API — o que não
é login nenhum.

---

## 3. Dados que precisam da confirmação do Michel

### Regras de entrega — `lib/entrega.ts`
Tudo está `null` de propósito. Enquanto estiver assim, o site não mostra taxa,
não mostra pedido mínimo e não promete prazo.

| O que perguntar | Campo |
|---|---|
| Existe pedido mínimo para entrega? Quanto? | `pedidoMinimo` |
| Quanto custa a entrega? | `taxa` |
| A partir de que valor a entrega é grátis? | `gratisAPartirDe` |
| Quais bairros vocês atendem? | `bairrosAtendidos` |
| Quanto tempo leva, de mínimo a máximo? | `estimativaMinutos` |

Preenchido o arquivo, a interface, a soma do carrinho e a mensagem do WhatsApp
acompanham sozinhas.

### Dados do estabelecimento — `lib/business.ts`
Vieram do perfil público no Google e do cardápio impresso. Precisam de
confirmação antes de virarem propaganda:

- Endereço: R. Fidêncio José de Souza, 100 — Bandeira Branca I — Jacareí-SP —
  CEP 12323-390
- Telefone/WhatsApp: (12) 98844-7711
- **Horário: só a abertura (19:00) está confirmada.** Falta o horário de
  fechamento e os dias da semana. Isso aparece no topo, no rodapé e nos dados
  estruturados que o Google usa para montar o cartão da lanchonete.
- Avaliação: 4,8 com 46 avaliações (do Google, muda com o tempo)
- Faixa de preço: R$ 20–40 por pessoa

### Identidade jurídica
Razão social e CNPJ não foram informados. Entram na política de privacidade,
seção "Quem trata os dados", quando existirem.

### Catálogo — `lib/catalog.ts`
Auditoria completa dos 77 produtos:

- Sem id duplicado, sem nome repetido, sem preço zerado ou negativo, sem
  categoria inválida, sem imagem quebrada.
- **43 itens sem foto** (27 tradicionais, 12 bebidas, 3 combos, 1 master).
  Renderizam o marcador da marca. É o item de maior impacto direto em venda.
- **34 fotos existentes** foram recortadas de fotografias do cardápio impresso.
  Algumas trouxeram a folha junto — no **X Egg** aparece um pedaço de telefone
  impresso no enquadramento. Vale revisar as 34.
- **31 descrições terminam em "…"**, porque o cardápio de origem vinha
  truncado. Não foram completadas por dedução. Precisa da lista real de
  ingredientes.
- **5 sucos estão marcados como indisponíveis** e o botão aparece desabilitado.
  Confirmar se é permanente ou sazonal.
- Nenhuma foto foi gerada por IA. Nenhum preço foi alterado.

### Galeria — `lib/photos.ts`
As 5 fotos de ambiente vêm de `lh3.googleusercontent.com`, do perfil do Google
Maps. Carregam hoje, mas são links que o Google pode expirar sem aviso. Baixar
para `public/galeria/` e trocar o endereço resolve.

---

## 4. Banco de dados: o que muda com e sem

**O escopo atual não precisa de banco.** O site é cardápio + pedido pelo
WhatsApp; o histórico fica no navegador do próprio cliente (`lib/store.ts`), e o
pedido vive na conversa do WhatsApp, que a casa já usa.

Duas coisas *precisariam* de armazenamento compartilhado:

1. **Idempotência do webhook do Mercado Pago.** Hoje a proteção contra
   processar o mesmo pagamento duas vezes é uma tabela em memória
   (`app/api/webhook/mercadopago/route.ts`). Ela cobre a repetição imediata,
   que é o caso comum — o Mercado Pago reenvia quando não recebe 200 rápido.
   Mas em serverless cada instância tem a própria memória: dois eventos que
   caiam em instâncias diferentes passam os dois. Garantia de verdade exige
   Vercel KV, Upstash Redis ou banco.

2. **Limite de taxa distribuído.** Mesma limitação, mesmo remédio
   (`lib/seguranca.ts`). Hoje segura abuso casual, não ataque distribuído.

Se um dia a casa quiser **painel administrativo, status do pedido, fila da
cozinha ou relatório de vendas**, aí o banco deixa de ser opcional — nenhuma
dessas coisas existe sem persistir pedido no servidor.

---

## 5. Checklist

### ✅ Pronto e funcionando
- Fluxo completo: sacola → entrega/retirada → identificação → endereço →
  pagamento → revisão → WhatsApp → confirmação
- Endereço com campos, validação e persistência (rua, número e bairro
  obrigatórios; complemento, referência e CEP opcionais)
- Retirada não pede endereço e não manda endereço nenhum na mensagem
- Formas de pagamento: Pix, cartão e dinheiro, com pergunta de troco e cálculo
  do que o entregador leva de volta
- Mensagem do WhatsApp com itens, quantidades, observação por item, total,
  tipo, forma de pagamento exata, troco, cliente, telefone, endereço completo e
  observações gerais
- Preço sempre recalculado no servidor a partir do catálogo
- Fallback `wa.me` funcionando sem nenhuma credencial
- Cabeçalhos de segurança: CSP com nonce por requisição, HSTS,
  X-Frame-Options, Referrer-Policy, Permissions-Policy
- Limite de taxa por solicitante, sem guardar IP
- Instalável na tela inicial (Android e iPhone), com service worker que **nunca**
  guarda pedido, pagamento nem login
- Política de privacidade em `/politica-de-privacidade`, ligada no rodapé
- SEO: canônico no endereço de produção real, sitemap, robots, JSON-LD
- 178 testes automatizados passando, em celular e desktop

### ⚠️ Pendente de configuração externa
- Pagamento online por Pix e cartão — `MP_ACCESS_TOKEN` + `MP_WEBHOOK_SECRET`
- Aviso automático do pedido no WhatsApp — Cloud API + segunda linha
- Template aprovado na Meta
- Login com Google e Facebook — credenciais **e** as rotas OAuth
- Login por e-mail — `AUTH_SECRET` + `RESEND_API_KEY` + `EMAIL_FROM`
- Atendente automático — `ANTHROPIC_API_KEY`
- Segredos de produção — `AUTH_SECRET`, `RATE_LIMIT_SALT`
- Domínio próprio — `NEXT_PUBLIC_SITE_URL`

### ❓ Pendente de informação do cliente
- Taxa de entrega, pedido mínimo, entrega grátis, bairros atendidos, prazo
- Horário de fechamento e dias da semana
- Razão social e CNPJ
- Fotos dos 43 itens que faltam
- Revisão das 34 fotos recortadas do cardápio impresso
- Lista completa de ingredientes das 31 descrições truncadas
- Os 5 sucos indisponíveis: definitivo ou temporário?
