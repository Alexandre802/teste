# Publicar o MD Cortes Store

O que falta para o app sair do código e virar o sistema do dia a dia da loja.
Os passos 1 a 4 dependem de contas suas — só você pode criá-las.

---

## 1. Banco de dados (Supabase) — ~10 min

1. Crie um projeto em [supabase.com](https://supabase.com). Guarde a senha do
   banco; a região mais perto do Brasil é **South America (São Paulo)**.
2. No painel, abra **SQL Editor** e rode os quatro arquivos **nesta ordem**:

   | Ordem | Arquivo | O que faz |
   |---|---|---|
   | 1 | `supabase/migrations/0001_schema.sql` | tabelas, índices e o gatilho que cria o perfil |
   | 2 | `supabase/migrations/0002_policies.sql` | RLS: cada linha presa a `auth.uid()` |
   | 3 | `supabase/migrations/0003_functions.sql` | venda, cancelamento e movimentação de estoque |
   | 4 | `supabase/migrations/0004_storage_realtime.sql` | fotos e atualização em tempo real |

   Com a CLI: `supabase link` e depois `supabase db push`.

3. Confira em **Table Editor** que as 13 tabelas apareceram.

## 2. Criar o usuário do Maicon — ~2 min

**Authentication → Users → Add user**, com e-mail e senha, e marque
*Auto Confirm User*.

Não existe cadastro aberto no app: quem não está aqui não entra. O gatilho do
passo 1 cria o perfil e as preferências sozinho.

## 3. Chaves — ~3 min

Em **Project Settings → API**, copie:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (só no servidor, nunca no navegador)

Para rodar na sua máquina: `cp .env.example .env.local` e preencha.

## 4. Publicar (Vercel) — ~5 min

1. Importe o repositório na [Vercel](https://vercel.com).
2. **Root Directory: `md-cortes-store`** — este é o passo que mais gente esquece;
   sem ele o build não encontra o projeto.
3. Cole as variáveis do passo 3 em **Environment Variables**.
4. Publique. O `vercel.json` já agenda o disparo dos lembretes a cada 30 minutos.
5. Volte ao Supabase, em **Authentication → URL Configuration**, e ponha o
   endereço da Vercel em *Site URL*. É o que faz o link de "esqueci minha senha"
   voltar para o app.

## 5. Lembrete com o app fechado — opcional, ~3 min

Sem isto o lembrete já funciona com o app aberto. Para ele chegar também com o
app fechado:

```bash
npx web-push generate-vapid-keys
```

Ponha a pública em `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, a privada em
`VAPID_PRIVATE_KEY`, e um `CRON_SECRET` qualquer (uma senha longa). Republique.

## 6. Instalar no celular — ~1 min

Abra o endereço da Vercel no celular:

- **iPhone (Safari):** Compartilhar → Adicionar à Tela de Início.
- **Android (Chrome):** menu → Instalar app.

Depois disso ele abre em tela cheia, sem barra de endereço, e a sessão fica ativa.

---

## Conferir se ficou tudo certo

Percorra este caminho uma vez, na ordem:

- [ ] Entrar com o e-mail e a senha do passo 2.
- [ ] A tela de boas-vindas aparece e some depois de "Começar".
- [ ] Cadastrar um produto com foto, custo, preço e quantidade por tamanho.
- [ ] Registrar uma venda dessa peça.
- [ ] O estoque do tamanho vendido baixou em 1.
- [ ] O faturamento e o lucro do painel subiram.
- [ ] A venda está no histórico com a forma de pagamento e o horário.
- [ ] Recarregar a página: nada sumiu.
- [ ] Cancelar a venda: a peça volta ao estoque e o registro fica como cancelada.
- [ ] Lançar uma despesa e conferir que o lucro líquido caiu, e o faturamento não.
- [ ] Ativar os lembretes e aceitar a permissão do navegador.
- [ ] Em Configurações, exportar as vendas em CSV.

Se algum passo falhar, o estado da sincronização no topo da tela costuma dizer
o porquê.
