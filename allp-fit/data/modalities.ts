/**
 * Modalidades.
 *
 * Só entra no site o que veio das referências do cliente. O que ainda não foi
 * confirmado pela academia fica com `ativo: false` e simplesmente não aparece
 * na página — basta virar para `true` quando a casa confirmar, sem tocar em
 * nenhum componente.
 *
 * `fonte` registra de onde veio a informação, para auditoria futura.
 *
 * `foto: null` cai no marcador da marca. Nenhuma modalidade recebe a foto de
 * outro ambiente só para "ficar bonita".
 */

import { fotos, type Foto } from './gallery';

export type Modalidade = {
  id: string;
  nome: string;
  descricao: string;
  /** Ícone do lucide-react, resolvido em components/sections/Modalities.tsx */
  icone: 'dumbbell' | 'heart' | 'bike' | 'users' | 'activity' | 'stretch';
  foto: Foto | null;
  /** Campos opcionais: preencher só com informação confirmada. */
  nivel: string | null;
  duracao: string | null;
  ativo: boolean;
  fonte: string;
};

export const modalidades: Modalidade[] = [
  {
    id: 'musculacao',
    nome: 'Musculação',
    descricao: 'Máquinas de resistência e pesos livres para treinar força, com espaço para circular entre os equipamentos.',
    icone: 'dumbbell',
    foto: fotos.musculacao,
    nivel: null,
    duracao: null,
    ativo: true,
    fonte: 'Resumo das avaliações no Google + fotos da unidade',
  },
  {
    id: 'cardio',
    nome: 'Cardio',
    descricao: 'Fileira de esteiras e equipamentos de cardio com painel individual, de frente para os televisores.',
    icone: 'heart',
    foto: fotos.esteiras,
    nivel: null,
    duracao: null,
    ativo: true,
    fonte: 'Fotos da unidade + resumo das avaliações no Google',
  },
  {
    id: 'aulas-coletivas',
    nome: 'Aulas coletivas',
    descricao: 'Aulas em grupo para quem rende mais treinando junto, com o professor conduzindo a turma.',
    icone: 'users',
    foto: null,
    nivel: null,
    duracao: null,
    ativo: true,
    fonte: 'Resumo das avaliações no Google ("oferece diversas aulas em grupo")',
  },
  {
    id: 'spinning',
    nome: 'Spinning',
    descricao: 'Bike indoor em aula guiada, com o ritmo puxado pelo professor.',
    icone: 'bike',
    foto: null,
    nivel: null,
    duracao: null,
    ativo: true,
    fonte: 'Briefing do cliente (menção nas referências)',
  },
  // ── Ainda sem confirmação da academia: não aparecem no site. ──────────────
  {
    id: 'funcional',
    nome: 'Treino funcional',
    descricao: 'Circuito de movimentos do dia a dia, trabalhando o corpo inteiro.',
    icone: 'activity',
    foto: null,
    nivel: null,
    duracao: null,
    ativo: false,
    fonte: 'Sugestão do briefing — pendente de confirmação',
  },
  {
    id: 'alongamento',
    nome: 'Alongamento',
    descricao: 'Sessão de mobilidade e alongamento para fechar o treino.',
    icone: 'stretch',
    foto: null,
    nivel: null,
    duracao: null,
    ativo: false,
    fonte: 'Sugestão do briefing — pendente de confirmação',
  },
];

export const modalidadesAtivas = modalidades.filter((m) => m.ativo);
