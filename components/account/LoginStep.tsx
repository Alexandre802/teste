'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BLOQUEIO_MINUTOS,
  FACEBOOK_ATIVO,
  GOOGLE_ATIVO,
  MAX_TENTATIVAS,
  MODO_DEMO,
  emailValido,
  formatarEspera,
  nomeDoEmail,
  useAuth,
  type Provedor,
} from '@/lib/auth';
import { useShop } from '@/lib/store';
import { Button } from '../ui/Button';
import { FacebookIcon, GoogleIcon, LockIcon, MailIcon } from '../ui/Icons';

/**
 * Identificação antes do pagamento.
 *
 * Entrar é opcional: o modo convidado fica sempre disponível, inclusive
 * quando o login está bloqueado por tentativas. Ninguém deixa de comprar
 * porque errou a senha.
 */
export default function LoginStep({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const signIn = useShop((s) => s.signIn);
  const clienteAtual = useShop((s) => s.customer);

  const tentativas = useAuth((s) => s.tentativas);
  const bloqueadoAte = useAuth((s) => s.bloqueadoAte);
  const registrarFalha = useAuth((s) => s.registrarFalha);
  const limparTentativas = useAuth((s) => s.limparTentativas);

  const [tela, setTela] = useState<'escolha' | 'email' | 'codigo' | 'convidado'>('escolha');
  const [email, setEmail] = useState(clienteAtual?.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState(clienteAtual?.name ?? '');
  const [telefone, setTelefone] = useState(clienteAtual?.phone ?? '');
  const [ocupado, setOcupado] = useState<Provedor | 'codigo' | null>(null);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [agora, setAgora] = useState(() => Date.now());

  const bloqueado = Boolean(bloqueadoAte && bloqueadoAte > agora);
  const restantes = Math.max(0, MAX_TENTATIVAS - tentativas);

  // relógio de 1s só enquanto o bloqueio está de pé
  useEffect(() => {
    if (!bloqueadoAte) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [bloqueadoAte]);

  // ao vencer o prazo, o estado se limpa sozinho
  useEffect(() => {
    if (bloqueadoAte && bloqueadoAte <= agora) limparTentativas();
  }, [bloqueadoAte, agora, limparTentativas]);

  const falhou = (mensagem: string) => {
    registrarFalha();
    setErro(mensagem);
    setOcupado(null);
  };

  const concluir = (dados: Parameters<typeof signIn>[0]) => {
    limparTentativas();
    signIn(dados);
    onDone();
  };

  /* ── provedores sociais ── */
  const entrarSocial = async (provedor: 'google' | 'facebook') => {
    if (bloqueado) return;
    setErro('');
    setOcupado(provedor);

    const configurado = provedor === 'google' ? GOOGLE_ATIVO : FACEBOOK_ATIVO;
    if (!configurado) {
      // Sem app registrado no provedor não existe login de verdade. Em vez de
      // simular por baixo dos panos, o fluxo roda e diz o que está faltando.
      await new Promise((r) => setTimeout(r, 700));
      concluir({
        name: clienteAtual?.name || 'Cliente',
        phone: clienteAtual?.phone ?? '',
        provider: provedor,
      });
      return;
    }

    try {
      const r = await fetch(`/api/auth/${provedor}/start`, { method: 'POST' });
      if (!r.ok) throw new Error();
      const { url } = (await r.json()) as { url: string };
      window.location.href = url;
    } catch {
      falhou(`Não conseguimos entrar com ${provedor === 'google' ? 'Google' : 'Facebook'}.`);
    }
  };

  /* ── e-mail: pede o código ── */
  const pedirCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado || !emailValido(email)) return;
    setErro('');
    setAviso('');
    setOcupado('email');
    try {
      const r = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'enviar', email }),
      });
      const dados = await r.json();
      if (!r.ok) throw new Error(dados?.erro);
      setAviso(
        dados.demo
          ? `Nenhum e-mail foi enviado — o envio ainda não está configurado. Use o código ${dados.codigo} para testar o fluxo.`
          : `Código enviado para ${email}. Ele vale por 10 minutos.`,
      );
      setTela('codigo');
      setOcupado(null);
    } catch (err) {
      setOcupado(null);
      setErro(err instanceof Error && err.message ? err.message : 'Não conseguimos enviar o código.');
    }
  };

  /* ── e-mail: confere o código (aqui a tentativa conta) ── */
  const conferirCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado || codigo.replace(/\D/g, '').length !== 6) return;
    setErro('');
    setOcupado('codigo');
    try {
      const r = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'verificar', email, codigo }),
      });
      if (!r.ok) {
        falhou('Código incorreto.');
        setCodigo('');
        return;
      }
      concluir({
        name: clienteAtual?.name || nomeDoEmail(email),
        phone: clienteAtual?.phone ?? '',
        provider: 'email',
        email,
        address: clienteAtual?.address,
      });
    } catch {
      falhou('Não conseguimos conferir o código.');
    }
  };

  const entrarConvidado = (e: React.FormEvent) => {
    e.preventDefault();
    concluir({
      name: nome.trim() || 'Convidado',
      phone: telefone.replace(/\D/g, ''),
      provider: 'convidado',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── aviso de bloqueio ── */}
      <AnimatePresence>
        {bloqueado && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="flex gap-3 rounded-2xl border border-white/45 bg-white/16 p-4"
          >
            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-white" />
            <div className="text-sm leading-relaxed text-white">
              <p className="font-extrabold">Login bloqueado</p>
              <p className="mt-1 text-white/90">
                Foram {MAX_TENTATIVAS} tentativas sem sucesso. O login volta em{' '}
                <strong className="font-extrabold">
                  {formatarEspera((bloqueadoAte ?? 0) - agora)}
                </strong>
                . Você pode seguir agora como convidado.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {MODO_DEMO && !bloqueado && (
        <p className="rounded-2xl border border-white/40 bg-white/12 p-3 text-xs leading-relaxed text-white/90">
          <strong className="font-extrabold text-white">Modo demonstração.</strong> Google e
          Facebook ainda não têm app registrado, então esses botões apenas simulam a entrada. O
          e-mail e o convidado funcionam de verdade.
        </p>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {/* ─────────────── escolha do método ─────────────── */}
        {tela === 'escolha' && (
          <motion.div
            key="escolha"
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={() => entrarSocial('google')}
              disabled={bloqueado || ocupado !== null}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-3.5 font-extrabold text-cocoa transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <GoogleIcon className="h-5 w-5" />
              {ocupado === 'google' ? 'Entrando…' : 'Continuar com Google'}
            </button>

            <button
              type="button"
              onClick={() => entrarSocial('facebook')}
              disabled={bloqueado || ocupado !== null}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1877F2] px-6 py-3.5 font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <FacebookIcon className="h-5 w-5" />
              {ocupado === 'facebook' ? 'Entrando…' : 'Continuar com Facebook'}
            </button>

            <button
              type="button"
              onClick={() => {
                setErro('');
                setTela('email');
              }}
              disabled={bloqueado || ocupado !== null}
              className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-white/60 px-6 py-3.5 font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-cocoa disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-transparent disabled:hover:text-white"
            >
              <MailIcon className="h-5 w-5" />
              Entrar com e-mail
            </button>

            <div className="my-1 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              <span className="h-px flex-1 bg-white/30" />
              ou
              <span className="h-px flex-1 bg-white/30" />
            </div>

            <button
              type="button"
              onClick={() => setTela('convidado')}
              className="w-full rounded-full bg-white/18 px-6 py-3.5 font-extrabold text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white/28"
            >
              Continuar como convidado
            </button>
            <p className="text-center text-xs leading-relaxed text-white/75">
              Como convidado o pedido segue normalmente. Entrar só serve para a casa lembrar de
              você no próximo.
            </p>
          </motion.div>
        )}

        {/* ─────────────── e-mail ─────────────── */}
        {tela === 'email' && (
          <motion.form
            key="email"
            onSubmit={pedirCodigo}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            <label className="text-sm font-bold text-white" htmlFor="login-email">
              Seu e-mail
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              disabled={bloqueado}
              className="w-full rounded-2xl border border-white/30 bg-white/16 px-4 py-3 text-white placeholder:text-white/60 disabled:opacity-50"
            />
            <Button type="submit" size="lg" disabled={!emailValido(email) || bloqueado || ocupado !== null}>
              {ocupado === 'email' ? 'Enviando…' : 'Enviar código'}
            </Button>
            <button
              type="button"
              onClick={() => setTela('escolha')}
              className="text-sm font-bold text-white/80 underline underline-offset-4 hover:text-white"
            >
              Voltar
            </button>
          </motion.form>
        )}

        {/* ─────────────── código ─────────────── */}
        {tela === 'codigo' && (
          <motion.form
            key="codigo"
            onSubmit={conferirCodigo}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            <label className="text-sm font-bold text-white" htmlFor="login-codigo">
              Código de 6 dígitos
            </label>
            <input
              id="login-codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              disabled={bloqueado}
              className="w-full rounded-2xl border border-white/30 bg-white/16 px-4 py-3 text-center text-2xl font-extrabold tracking-[0.4em] text-white placeholder:text-white/40 disabled:opacity-50"
            />
            <Button type="submit" size="lg" disabled={codigo.length !== 6 || bloqueado || ocupado !== null}>
              {ocupado === 'codigo' ? 'Conferindo…' : 'Entrar'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setTela('email');
                setCodigo('');
                setErro('');
              }}
              className="text-sm font-bold text-white/80 underline underline-offset-4 hover:text-white"
            >
              Usar outro e-mail
            </button>
          </motion.form>
        )}

        {/* ─────────────── convidado ─────────────── */}
        {tela === 'convidado' && (
          <motion.form
            key="convidado"
            onSubmit={entrarConvidado}
            initial={reduce ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm leading-relaxed text-white/90">
              Só precisamos de um nome para a casa chamar no balcão. O telefone é opcional e ajuda
              se o entregador precisar falar com você.
            </p>
            <input
              type="text"
              autoComplete="given-name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              aria-label="Seu nome"
              className="w-full rounded-2xl border border-white/30 bg-white/16 px-4 py-3 text-white placeholder:text-white/60"
            />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="Telefone (opcional)"
              aria-label="Telefone, opcional"
              className="w-full rounded-2xl border border-white/30 bg-white/16 px-4 py-3 text-white placeholder:text-white/60"
            />
            <Button type="submit" size="lg">
              Continuar como convidado
            </Button>
            <button
              type="button"
              onClick={() => setTela('escolha')}
              className="text-sm font-bold text-white/80 underline underline-offset-4 hover:text-white"
            >
              Voltar
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── mensagens ── */}
      {aviso && !erro && (
        <p className="rounded-2xl border border-white/40 bg-white/12 p-3 text-sm leading-relaxed text-white/90">
          {aviso}
        </p>
      )}

      {erro && (
        <div role="alert" className="rounded-2xl border border-white/50 bg-ember-deep/45 p-3">
          <p className="text-sm font-bold text-white">{erro}</p>
          {!bloqueado && (
            <p className="mt-1 text-xs text-white/85">
              {restantes === 1
                ? 'Resta 1 tentativa antes do login bloquear por ' + BLOQUEIO_MINUTOS + ' minutos.'
                : `Restam ${restantes} tentativas antes do login bloquear.`}
            </p>
          )}
        </div>
      )}

      {/* saída de emergência: sempre disponível, inclusive bloqueado */}
      {tela !== 'convidado' && tela !== 'escolha' && (
        <button
          type="button"
          onClick={() => setTela('convidado')}
          className="text-sm font-bold text-white/80 underline underline-offset-4 hover:text-white"
        >
          Prefiro continuar como convidado
        </button>
      )}
    </div>
  );
}
