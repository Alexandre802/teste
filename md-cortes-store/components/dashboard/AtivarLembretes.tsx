"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePush } from "@/hooks/usePush";
import { useToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";

/**
 * Convite para ligar os lembretes.
 *
 * O navegador só é consultado depois do toque no botão: pedir permissão na
 * abertura do app costuma render um bloqueio permanente, e aí não há segunda
 * chance de avisar Maicon de nada.
 */
export function AtivarLembretes() {
  const { permissao, ativar, ocupado } = usePush();
  const remindersEnabled = useStore((s) => s.settings.remindersEnabled);
  const saveSettings = useStore((s) => s.saveSettings);
  const toast = useToast();
  const [escondido, setEscondido] = useState(false);

  const mostrar = permissao === "default" && remindersEnabled && !escondido;

  async function ligar() {
    const resultado = await ativar();
    if (resultado === "granted") {
      await saveSettings({ remindersEnabled: true, lastReminderAt: new Date().toISOString() });
      toast({ tone: "sucesso", title: "Lembretes ativados", description: "Você será avisado a cada 2 horas." });
    } else if (resultado === "denied") {
      toast({
        tone: "aviso",
        title: "Notificações bloqueadas",
        description: "O lembrete continua aparecendo com o app aberto.",
      });
    }
  }

  return (
    <AnimatePresence>
      {mostrar ? (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          className="relative overflow-hidden rounded-card border border-ouro-borda bg-ouro-suave p-4"
        >
          <button
            type="button"
            onClick={() => setEscondido(true)}
            aria-label="Dispensar"
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-ouro/70 hover:bg-ouro/10"
          >
            <X size={16} />
          </button>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-branco text-ouro">
              <BellRing size={20} />
            </span>
            <div className="min-w-0 flex-1 pr-6">
              <h2 className="text-[15px] font-bold text-tinta">Ativar lembretes</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-grafite">
                Receba lembretes para não esquecer de registrar suas vendas.
              </p>
              <Button variant="ouro" size="sm" className="mt-3 uppercase tracking-wide" loading={ocupado} onClick={ligar}>
                Ativar lembretes
              </Button>
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
