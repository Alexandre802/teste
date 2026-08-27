/**
 * Onde ficam as chaves do Supabase.
 *
 * Elas podiam viver só nas variáveis de ambiente, mas aí trocar de modo exigiria
 * gerar o site de novo e publicar de novo — e quem vai usar o MD_cortes é uma
 * barbearia, não alguém com terminal aberto. Então a configuração também pode
 * entrar pelo próprio aplicativo, e fica guardada no aparelho.
 *
 * A ordem é: o que o usuário salvou no aparelho vence; se não houver nada, valem
 * as variáveis da build; se não houver nem isso, o app abre em modo local.
 *
 * A chave `anon` é pública por natureza — ela vai no JavaScript entregue a todo
 * mundo de qualquer forma. Quem protege os dados é a Row Level Security do
 * `schema.sql`, não o segredo da chave. É por isso que dá para passá-la num
 * link de convite sem abrir buraco nenhum.
 */

const CHAVE_ARMAZENAMENTO = 'md-cortes:nuvem';

export interface ConfigNuvem {
  url: string;
  chave: string;
}

function daBuild(): ConfigNuvem | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return url && chave ? { url, chave } : null;
}

function doAparelho(): ConfigNuvem | null {
  if (typeof window === 'undefined') return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    if (!bruto) return null;
    const lido = JSON.parse(bruto) as Partial<ConfigNuvem>;
    return validar(lido.url, lido.chave);
  } catch {
    return null;
  }
}

/** Aceita só o que parece mesmo um projeto Supabase, para não travar o app depois. */
export function validar(url?: string, chave?: string): ConfigNuvem | null {
  const u = (url ?? '').trim().replace(/\/+$/, '');
  const c = (chave ?? '').trim();
  if (!u || !c) return null;
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in|net)$/i.test(u)) return null;
  // As chaves do Supabase são JWT (três blocos) ou o formato novo sb_publishable_…
  if (!/^(ey[\w-]+\.[\w-]+\.[\w-]+|sb_publishable_[\w-]+)$/.test(c)) return null;
  return { url: u, chave: c };
}

/**
 * A configuração da build vence a do aparelho.
 *
 * A ordem já foi a inversa, para deixar configurar pelo celular. Numa build de
 * produção isso é um buraco: bastaria escrever no localStorage para repontar o
 * app para outro projeto Supabase — outro banco, outros usuários. Agora, quando
 * a build traz as chaves, elas mandam, e a tela de configuração só informa.
 */
export function lerConfigNuvem(): ConfigNuvem | null {
  return daBuild() ?? doAparelho();
}

/** Verdadeiro quando as chaves vieram embutidas na build. */
export function configVeioDaBuild(): boolean {
  return daBuild() !== null;
}

/** Verdadeiro quando quem mandou foi o aparelho, e não a build. */
export function configVeioDoAparelho(): boolean {
  return daBuild() === null && doAparelho() !== null;
}

export function gravarConfigNuvem(config: ConfigNuvem): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(config));
}

export function apagarConfigNuvem(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CHAVE_ARMAZENAMENTO);
}

/* ── convite ────────────────────────────────────────────────────────────── */

/**
 * Empacota a configuração no fim de um endereço, para que o segundo celular não
 * precise digitar nada: quem já configurou manda o link, o outro abre e pronto.
 */
export function montarConvite(config: ConfigNuvem, base: string): string {
  const dados = btoa(JSON.stringify(config))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${base.replace(/#.*$/, '').replace(/\/+$/, '')}/#nuvem=${dados}`;
}

export function lerConvite(hash: string): ConfigNuvem | null {
  const achado = /(?:^#|&)nuvem=([A-Za-z0-9_-]+)/.exec(hash);
  if (!achado?.[1]) return null;
  try {
    const base64 = achado[1].replace(/-/g, '+').replace(/_/g, '/');
    const lido = JSON.parse(atob(base64)) as Partial<ConfigNuvem>;
    return validar(lido.url, lido.chave);
  } catch {
    return null;
  }
}
