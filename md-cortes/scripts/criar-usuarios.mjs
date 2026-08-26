#!/usr/bin/env node
/**
 * Cria os três usuários do MD_cortes no Supabase Auth.
 *
 * Roda na sua máquina, uma vez, e nada disso vai para o repositório: a chave
 * service_role e as senhas vêm de variáveis de ambiente e só existem no
 * terminal em que você rodar.
 *
 *   export SUPABASE_URL="https://xxxx.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="..."      # Project Settings → API Keys
 *   export SENHA_MAICON="..." SENHA_GABRIEL="..." SENHA_NINO="..."
 *   node scripts/criar-usuarios.mjs
 *
 * Depois rode supabase/schema.sql e supabase/seed.sql no SQL Editor.
 */

const URL_BASE = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DOMINIO = process.env.LOGIN_DOMAIN || 'mdcortes.app';

if (!URL_BASE || !CHAVE) {
  console.error('Faltou SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  process.exit(1);
}

const USUARIOS = [
  { usuario: 'maicon', name: 'Maicon', role: 'developer', job_title: 'Desenvolvedor', senha: process.env.SENHA_MAICON },
  { usuario: 'gabriel', name: 'Gabriel', role: 'employee', job_title: 'Funcionário 1', senha: process.env.SENHA_GABRIEL },
  { usuario: 'nino', name: 'Nino', role: 'employee', job_title: 'Funcionário 2', senha: process.env.SENHA_NINO },
];

const faltando = USUARIOS.filter((u) => !u.senha || u.senha.length < 8);
if (faltando.length > 0) {
  console.error(
    'Defina uma senha de 8 caracteres ou mais para: ' +
      faltando.map((u) => u.usuario.toUpperCase()).join(', '),
  );
  console.error('Ex.: export SENHA_GABRIEL="algo-forte-aqui"');
  process.exit(1);
}

let falhou = false;

for (const u of USUARIOS) {
  const email = `${u.usuario}@${DOMINIO}`;
  const resposta = await fetch(`${URL_BASE}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: CHAVE,
      Authorization: `Bearer ${CHAVE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: u.senha,
      // Sem servidor de e-mail configurado, confirmar na mão trava o login.
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role, job_title: u.job_title },
    }),
  });

  if (resposta.ok) {
    console.log(`  criado   ${email}  (${u.job_title})`);
    continue;
  }

  const erro = await resposta.text();
  if (resposta.status === 422 || /already/i.test(erro)) {
    console.log(`  já existe ${email} — senha não foi alterada`);
    continue;
  }
  console.error(`  FALHOU   ${email}: ${resposta.status} ${erro}`);
  falhou = true;
}

console.log('\nAgora rode supabase/schema.sql e supabase/seed.sql no SQL Editor do Supabase.');
process.exit(falhou ? 1 : 0);
