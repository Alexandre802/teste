# Como colocar o site no ar

O site **funciona sem nenhuma configuração**. Publique primeiro, configure
depois. Cada item da parte 2 é um ganho separado, e nenhum deles é necessário
para o cliente conseguir pedir.

---

## Parte 1 — Publicar (15 minutos, de graça)

### 1. Juntar o código na branch principal

O trabalho está em `claude/remotion-skill-setup-1rpekd`. No GitHub:

- Abra **Pull requests → New pull request**
- base: `main` · compare: `claude/remotion-skill-setup-1rpekd`
- **Create pull request** → **Merge**

Dá para pular isso e publicar direto da branch, mas juntar em `main` deixa o
caminho normal: todo push em `main` republica sozinho.

### 2. Vercel

1. <https://vercel.com> → entrar com a conta do GitHub
2. **Add New → Project** → escolher `Alexandre802/teste`
3. Não mexer em nada: a Vercel reconhece Next.js sozinha
4. **Deploy**

Em uns 2 minutos sai uma URL tipo `teste-xxx.vercel.app`. **O site já está no
ar**: cardápio, sacola, login, e o pedido fechando pelo WhatsApp.

### 3. Domínio próprio (opcional)

Registre em Registro.br (`.com.br` custa cerca de R$ 40/ano). Na Vercel:
**Settings → Domains → Add**, e siga as instruções de DNS que ela mostra.

Depois de apontar o domínio, volte em **Settings → Environment Variables** e
crie `NEXT_PUBLIC_SITE_URL` com o endereço final. É o que faz o link certo
aparecer no Google e no compartilhamento do WhatsApp.

---

## Parte 2 — Ligar os extras

Cada bloco é independente. Em **Settings → Environment Variables**, e
**Redeploy** depois de salvar.

### Segurança (faça primeiro — 2 minutos)

| Variável | Valor |
|---|---|
| `RATE_LIMIT_SALT` | texto longo e aleatório |
| `AUTH_SECRET` | texto longo e aleatório |

Sem trocar, ficam com o padrão de desenvolvimento, que está público neste
repositório. Gere assim no terminal:

```bash
openssl rand -base64 32
```

### Aviso automático de pedido no WhatsApp

**Antes de começar, entenda a restrição:** o número que *envia* pela API não
pode ser o mesmo `12 98844-7711` usado no aplicativo WhatsApp Business.
Registrar um número na Cloud API tira ele do aplicativo. Você precisa de uma
segunda linha (chip pré-pago serve) como remetente.

1. <https://business.facebook.com> → criar app do tipo **Business**
2. Adicionar o produto **WhatsApp** e registrar a segunda linha
3. Criar um template de categoria **Utilidade** com 4 variáveis, nesta ordem:
   pagamento e tipo · itens · total · cliente

| Variável | Onde achar |
|---|---|
| `WHATSAPP_TOKEN` | token permanente do app |
| `WHATSAPP_PHONE_NUMBER_ID` | painel do WhatsApp, ao lado do número |
| `WHATSAPP_APP_SECRET` | Configurações do app → Básico |
| `WHATSAPP_TEMPLATE_NAME` | nome que você deu ao template |
| `WHATSAPP_VERIFY_TOKEN` | invente uma senha e repita no passo 4 |

4. Webhook: URL `https://SEUDOMINIO/api/whatsapp/webhook`, com o mesmo
   `WHATSAPP_VERIFY_TOKEN`. Assine o campo **messages**.

`WHATSAPP_STORE_NUMBER` já vem com `5512988447711` — só mude se trocar de
número.

### Pagamento por Pix e cartão

1. <https://www.mercadopago.com.br/developers> → criar aplicação
2. Copiar as credenciais **de produção**

| Variável | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | Access Token de produção |
| `MP_WEBHOOK_SECRET` | assinatura secreta do webhook |
| `MP_SANDBOX` | `false` (ou `true` para testar sem cobrar) |

3. No painel do Mercado Pago, webhook para
   `https://SEUDOMINIO/api/webhook/mercadopago`

Enquanto isso não estiver pronto, o pagamento fica em modo demonstração e a
tela avisa o cliente. O pedido continua chegando pelo WhatsApp.

### Login com Google e Facebook

| Variável | Onde |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | console.cloud.google.com → Credenciais |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | o mesmo app do Meta Business |

Sem elas, a tela de login mostra um aviso de demonstração. E-mail e convidado
funcionam sem configurar nada.

### Código de acesso por e-mail

`RESEND_API_KEY` e `EMAIL_FROM` (<https://resend.com>, plano gratuito dá
conta). Sem eles, o código aparece na tela marcado como demonstração.

### Atendente automático no WhatsApp

`ANTHROPIC_API_KEY` (<https://console.anthropic.com>). Sem ela o bot fica
desligado e as mensagens seguem para atendimento humano.

---

## Como atualizar depois

Todo push em `main` republica sozinho. Para mexer no cardápio, edite
`lib/catalog.ts`; para telefone, endereço ou horário, `lib/business.ts`.
Nenhum produto ou dado da casa fica escrito dentro do JSX.

---

## Antes de divulgar

- [ ] Abrir no celular e fechar um pedido de ponta a ponta
- [ ] Conferir se a mensagem chega no WhatsApp certo
- [ ] `RATE_LIMIT_SALT` e `AUTH_SECRET` trocados
- [ ] `NEXT_PUBLIC_SITE_URL` com o domínio final
- [ ] Google Search Console: cadastrar o site e enviar
      `https://SEUDOMINIO/sitemap.xml`
