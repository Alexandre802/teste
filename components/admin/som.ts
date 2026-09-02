/**
 * Aviso sonoro de pedido novo.
 *
 * Duas regras dos navegadores mandam aqui, e ignorar qualquer uma delas faz o
 * som simplesmente não tocar, sem erro visível:
 *
 *  1. áudio só toca depois de a pessoa ter interagido com a página. Antes
 *     disso o navegador bloqueia — por isso o módulo espera o primeiro toque
 *     antes de considerar o som liberado;
 *  2. o AudioContext nasce suspenso e precisa de `resume()`.
 *
 * O som é sintetizado, não é arquivo: duas notas curtas, sem nada para
 * baixar, sem depender de um .mp3 que pode faltar na publicação.
 */

let interagiu = false;
let contexto: AudioContext | null = null;

if (typeof window !== 'undefined') {
  const marcar = () => {
    interagiu = true;
  };
  // `once` em ambos: depois do primeiro toque não há mais o que observar
  window.addEventListener('pointerdown', marcar, { once: true });
  window.addEventListener('keydown', marcar, { once: true });
}

/** A pessoa já interagiu o bastante para o navegador deixar tocar? */
export function somLiberado(): boolean {
  return interagiu;
}

export async function tocarAvisoDePedido(): Promise<void> {
  if (typeof window === 'undefined' || !interagiu) return;

  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    contexto ??= new Ctor();
    if (contexto.state === 'suspended') await contexto.resume();

    const agora = contexto.currentTime;
    // duas notas: sobe e resolve. Curto o bastante para não atrapalhar quem
    // está no telefone com o cliente.
    for (const [atraso, frequencia] of [
      [0, 880],
      [0.16, 1174.7],
    ] as const) {
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.type = 'sine';
      oscilador.frequency.value = frequencia;

      // envelope suave: onda quadrada crua estala no alto-falante do celular
      ganho.gain.setValueAtTime(0.0001, agora + atraso);
      ganho.gain.exponentialRampToValueAtTime(0.22, agora + atraso + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, agora + atraso + 0.15);

      oscilador.connect(ganho).connect(contexto.destination);
      oscilador.start(agora + atraso);
      oscilador.stop(agora + atraso + 0.16);
    }
  } catch {
    // som é conforto, não função: falhar aqui não pode derrubar o painel
  }
}
