"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";

import { criarClienteNavegador } from "@/lib/supabase/client";
import { formatarCentavos } from "@/lib/dinheiro";

type Aviso = { numero: number; total_cents: number };

const CHAVE_SOM = "comida-caseira:som-novo-pedido";

/**
 * Escuta pedidos novos em tempo real e atualiza o painel sem recarregar.
 *
 * Sobre o som: o navegador só deixa tocar áudio depois de alguma interação da
 * pessoa com a página. Por isso o som fica desligado até ela ligar no próprio
 * aviso — ligar sozinho daria um botão que parece funcionar e não toca.
 */
export function EscutaPedidos() {
  const router = useRouter();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  // A preferência é lida na inicialização do estado, e não dentro de um
  // efeito: assim não existe um render intermediário com o valor errado.
  const [somLigado, setSomLigado] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(CHAVE_SOM) === "1";
    } catch {
      // Navegador com armazenamento bloqueado: segue sem som.
      return false;
    }
  });
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    const supabase = criarClienteNavegador();
    if (!supabase) return;

    const canal = supabase
      .channel("comida-caseira-pedidos")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comida_caseira_orders",
        },
        (evento) => {
          const linha = evento.new as { order_number: number; total_cents: number };
          setAviso({ numero: linha.order_number, total_cents: linha.total_cents });
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [router]);

  // Um bipe curto gerado na hora: não precisa de arquivo de áudio no projeto.
  useEffect(() => {
    if (!aviso || !somLigado) return;
    try {
      audio.current ??= new AudioContext();
      const contexto = audio.current;
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();
      oscilador.frequency.value = 880;
      ganho.gain.setValueAtTime(0.0001, contexto.currentTime);
      ganho.gain.exponentialRampToValueAtTime(0.2, contexto.currentTime + 0.02);
      ganho.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.45);
      oscilador.connect(ganho).connect(contexto.destination);
      oscilador.start();
      oscilador.stop(contexto.currentTime + 0.45);
    } catch {
      // Sem permissão para tocar: o aviso visual já cumpre o papel.
    }
  }, [aviso, somLigado]);

  const alternarSom = () => {
    const novo = !somLigado;
    setSomLigado(novo);
    try {
      localStorage.setItem(CHAVE_SOM, novo ? "1" : "0");
    } catch {
      // Preferência não persistida: vale só nesta sessão.
    }
  };

  return (
    <AnimatePresence>
      {aviso && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex items-center gap-3 rounded-bloco border border-laranja/30 bg-creme px-4 py-3"
        >
          <Bell className="h-5 w-5 shrink-0 text-laranja" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-[14px] font-semibold text-laranja-queimado">
            Novo pedido #{aviso.numero} · {formatarCentavos(aviso.total_cents)}
          </p>
          <button
            type="button"
            onClick={alternarSom}
            className="shrink-0 rounded-full px-3 py-2 text-[12px] font-bold text-laranja-queimado underline underline-offset-2"
          >
            {somLigado ? "Som ligado" : "Ligar som"}
          </button>
          <button
            type="button"
            onClick={() => setAviso(null)}
            aria-label="Dispensar aviso"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-laranja-queimado hover:bg-creme-forte"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
