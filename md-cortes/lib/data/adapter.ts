import type {
  AppNotification,
  Haircut,
  HaircutRange,
  NewHaircut,
  Profile,
  Service,
} from '@/lib/types';

/**
 * 'nuvem' é o modo de produção: Supabase Auth de verdade.
 * 'local' só existe em build de demonstração, explicitamente ligada.
 * 'nao-configurado' é quando falta a chave: o app não deixa ninguém entrar.
 */
export type Modo = 'nuvem' | 'local' | 'nao-configurado';

export interface EventoCorte {
  tipo: 'INSERT' | 'UPDATE' | 'DELETE';
  id: string;
  corte?: Haircut;
}

export interface Escutas {
  aoCorte?: (evento: EventoCorte) => void;
  aoNotificar?: (notificacao: AppNotification) => void;
}

/**
 * A única porta entre a interface e os dados.
 *
 * Existem duas implementações: `nuvem` (Supabase, com login de verdade, RLS e
 * tempo real entre aparelhos) e `local` (o próprio celular guarda tudo, sem
 * configuração nenhuma). A tela não sabe — e não precisa saber — qual das duas
 * está atendendo.
 */
export interface Adapter {
  readonly modo: Modo;

  /** `identificador` aceita usuário ("gabriel") ou e-mail completo. */
  entrar(identificador: string, senha: string): Promise<Profile>;
  sair(): Promise<void>;
  sessaoAtual(): Promise<Profile | null>;

  /** Todos os perfis que a sessão atual tem direito de ver. */
  perfis(): Promise<Profile[]>;
  servicos(): Promise<Service[]>;

  cortes(faixa: HaircutRange): Promise<Haircut[]>;
  registrarCorte(dados: NewHaircut): Promise<Haircut>;

  notificacoes(limite?: number): Promise<AppNotification[]>;
  marcarLida(id: string): Promise<void>;
  marcarTodasLidas(): Promise<void>;

  /** Devolve a função que cancela a escuta. */
  escutar(escutas: Escutas): () => void;

  /**
   * Avisa quando a autenticação muda por fora do app: token expirado, sessão
   * encerrada noutra aba, refresh recusado. Sem isso a tela continuaria
   * mostrando um painel de quem já não está mais autenticado.
   */
  aoMudarAutenticacao?(aviso: (perfil: Profile | null) => void): () => void;

  /** Só no modo local: true enquanto as senhas dos três perfis não existirem. */
  precisaConfigurar(): boolean;
  /** Só no modo local: grava o hash das senhas do primeiro acesso. */
  configurar(senhas: Record<string, string>): Promise<void>;
}

export class ErroDeLogin extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroDeLogin';
  }
}
