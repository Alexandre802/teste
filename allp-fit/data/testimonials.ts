/**
 * Avaliações.
 *
 * Os depoimentos abaixo foram transcritos das avaliações públicas do perfil da
 * Allp Fit no Google que aparecem nas referências enviadas. Nada foi escrito
 * "em nome" de aluno nenhum.
 *
 * Onde a referência mostrava o texto cortado pelo próprio Google, a transcrição
 * termina em "…" e fica assim — não completamos a frase de ninguém.
 *
 * Para acrescentar novas avaliações reais, copie o bloco abaixo. Se precisar de
 * um espaço reservado durante o desenvolvimento, use `publicar: false`: o item
 * fica no arquivo mas não vai para a página.
 */

export type Avaliacao = {
  id: string;
  nome: string;
  /** Inicial usada no avatar (não temos as fotos de perfil). */
  inicial: string;
  nota: 1 | 2 | 3 | 4 | 5;
  texto: string;
  /** Como a data aparece no Google, sem converter para data absoluta. */
  quando: string;
  publicar: boolean;
};

export const avaliacoes: Avaliacao[] = [
  {
    id: 'roberta-aquino',
    nome: 'Roberta Aquino',
    inicial: 'R',
    nota: 5,
    texto:
      'A allpfit foi a academia que me fez gostar de atividades físicas, o ambiente é muito acolhedor e os instrutores são muito atenciosos, sem contar na estrutura que está sempre evoluindo',
    quando: '4 meses atrás',
    publicar: true,
  },
  {
    id: 'lucas-amaral',
    nome: 'Lucas Amaral',
    inicial: 'L',
    nota: 5,
    texto:
      'A melhor academia de Londrina. O espaço, limpeza, organização, instalações, instrutores e o gestor são muito tops! Espaço kids com monitor o tempo… Mega recomendooo!',
    quando: '4 meses atrás',
    publicar: true,
  },
  // ── Espaços reservados: preencher com avaliações reais e virar publicar. ──
  // {
  //   id: 'aluno-3',
  //   nome: 'NOME DO ALUNO',
  //   inicial: 'N',
  //   nota: 5,
  //   texto: 'TEXTO EXATO DA AVALIAÇÃO PUBLICADA NO GOOGLE',
  //   quando: 'x meses atrás',
  //   publicar: false,
  // },
];

export const avaliacoesPublicadas = avaliacoes.filter((a) => a.publicar);

/**
 * Resumo que o próprio Google exibe no perfil da academia, gerado a partir do
 * conjunto de avaliações. Vai para a página como citação atribuída.
 */
export const resumoGoogle = {
  texto:
    'As pessoas dizem que esta academia oferece uma ampla variedade de equipamentos modernos, incluindo inúmeras máquinas de cardio, pesos livres e máquinas de resistência, e oferece diversas aulas em grupo. Apreciam também o ambiente limpo, organizado e climatizado, além da equipe atenciosa e prestativa. Os visitantes mencionam o estacionamento conveniente e benefícios adicionais como cadeiras de massagem e um clube infantil.',
  atribuicao: 'Resumo das avaliações no perfil do Google',
};
