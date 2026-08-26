'use client';

import { PainelAdmin } from '@/components/paineis/PainelAdmin';
import { PainelFuncionario } from '@/components/paineis/PainelFuncionario';
import { useSessao } from '@/lib/hooks/use-sessao';

/**
 * Uma rota, dois painéis.
 *
 * Quem entrou decide o que aparece — e não um endereço diferente por cargo. Se
 * a rota do administrador fosse outra, bastaria digitá-la para ver a casca do
 * painel do Maicon; assim não existe endereço a adivinhar (e, de todo jeito, o
 * banco não devolveria os dados).
 */
export default function PaginaInicio() {
  const { perfil, ehAdmin } = useSessao();
  if (!perfil) return null;
  return ehAdmin ? <PainelAdmin perfil={perfil} /> : <PainelFuncionario perfil={perfil} />;
}
