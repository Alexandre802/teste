'use client'

import { useActionState } from 'react'
import { KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/Field'
import { Alert } from '@/components/ui/Feedback'
import { loginAction, type ActionState } from '@/app/admin/actions'

export function LoginForm({ authConfigured }: { authConfigured: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {})

  return (
    <form action={action} className="grid gap-4" noValidate>
      {!authConfigured ? (
        <Alert tone="warning" title="Acesso ainda não configurado">
          Configure o Supabase Auth e cadastre o usuário do barbeiro para liberar o painel. Enquanto
          isso, o login recusa qualquer tentativa.
        </Alert>
      ) : null}

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="username"
        required
        icon={<Mail size={16} aria-hidden />}
        data-testid="admin-email"
      />

      <TextField
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        icon={<KeyRound size={16} aria-hidden />}
        data-testid="admin-senha"
      />

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Button type="submit" size="lg" loading={pending} data-testid="admin-entrar">
        Entrar no painel
      </Button>
    </form>
  )
}
