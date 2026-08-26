'use client';

import { useEffect } from 'react';
import { gravarConfigNuvem, lerConvite } from '@/lib/data';

/**
 * Aceita o convite que veio no fim do endereço.
 *
 * Quem já configurou a nuvem manda um link com a configuração embutida; ao
 * abrir, este componente guarda no aparelho, limpa o endereço e recarrega —
 * porque o módulo que escolhe nuvem ou local já rodou, e só uma recarga faz o
 * aplicativo inteiro passar a falar com o Supabase.
 */
export function ConviteDaNuvem() {
  useEffect(() => {
    const config = lerConvite(window.location.hash);
    if (!config) return;
    gravarConfigNuvem(config);
    // Tira a chave da barra de endereços antes de recarregar.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.location.reload();
  }, []);

  return null;
}
