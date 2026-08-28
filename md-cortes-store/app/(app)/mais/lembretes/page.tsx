"use client";

import { useState } from "react";
import { Bell, BellOff, Clock } from "lucide-react";
import { REMINDER_INTERVALS } from "@/lib/constants";
import { nextReminderAt } from "@/lib/reminders";
import { timeOf } from "@/lib/date";
import { useStore } from "@/lib/store";
import { usePush } from "@/hooks/usePush";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";

const ROTULOS: Record<number, string> = { 60: "1 hora", 120: "2 horas", 180: "3 horas", 240: "4 horas" };

export default function LembretesPage() {
  const settings = useStore((s) => s.settings);
  const saveSettings = useStore((s) => s.saveSettings);
  const { permissao, ativar, desativar, ocupado } = usePush();
  const toast = useToast();
  const [mensagem, setMensagem] = useState(settings.reminderMessage);

  const proximo = nextReminderAt(
    {
      enabled: settings.remindersEnabled,
      intervalMinutes: settings.reminderIntervalMinutes,
      quietStart: settings.quietStart,
      quietEnd: settings.quietEnd,
    },
    settings,
  );

  return (
    <>
      <PageHeader title="Lembretes" />

      <Card className="mb-4">
        <div className="flex items-center gap-3 px-4 py-4">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
              settings.remindersEnabled ? "bg-ouro-suave text-ouro" : "bg-areia text-cinza"
            }`}
          >
            {settings.remindersEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold text-tinta">Lembrete de vendas</span>
            <span className="block text-[13px] text-cinza">
              {settings.remindersEnabled
                ? proximo
                  ? `Próximo por volta de ${timeOf(proximo.toISOString())}`
                  : "Ativado"
                : "Desativado"}
            </span>
          </span>
          <Interruptor
            ligado={settings.remindersEnabled}
            onMudar={(valor) => saveSettings({ remindersEnabled: valor })}
            rotulo="Lembrete de vendas"
          />
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Frequência" />
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {REMINDER_INTERVALS.map((intervalo) => (
            <Chip
              key={intervalo}
              active={settings.reminderIntervalMinutes === intervalo}
              onClick={() => saveSettings({ reminderIntervalMinutes: intervalo })}
            >
              A cada {ROTULOS[intervalo]}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Horário ativo" />
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          <Field label="Das">
            <Input
              type="time"
              value={settings.quietStart}
              onChange={(e) => saveSettings({ quietStart: e.target.value })}
            />
          </Field>
          <Field label="Até">
            <Input
              type="time"
              value={settings.quietEnd}
              onChange={(e) => saveSettings({ quietEnd: e.target.value })}
            />
          </Field>
        </div>
        <p className="flex items-start gap-2 px-4 pb-4 text-[13px] leading-relaxed text-cinza">
          <Clock size={15} className="mt-0.5 shrink-0" />
          Fora dessa faixa nada é enviado. E se você registrar uma venda pouco antes do horário, o aviso é adiado —
          não faz sentido perguntar se vendeu logo depois de você ter vendido.
        </p>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Texto do lembrete" />
        <div className="px-4 pb-4">
          <Textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onBlur={() => {
              const limpo = mensagem.trim();
              if (limpo && limpo !== settings.reminderMessage) {
                void saveSettings({ reminderMessage: limpo });
                toast({ tone: "sucesso", title: "Texto atualizado" });
              }
            }}
            maxLength={140}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Notificações no aparelho" />
        <div className="px-4 pb-4">
          {permissao === "granted" ? (
            <>
              <p className="mb-3 text-[14px] text-verde">Permissão concedida neste aparelho.</p>
              <Button
                variant="suave"
                size="md"
                full
                onClick={async () => {
                  await desativar();
                  toast({ tone: "sucesso", title: "Aparelho removido dos avisos" });
                }}
              >
                Parar de receber neste aparelho
              </Button>
            </>
          ) : permissao === "denied" ? (
            <p className="text-[14px] leading-relaxed text-cinza">
              As notificações estão bloqueadas nas configurações do navegador. Libere por lá para voltar a receber —
              enquanto isso, o lembrete continua aparecendo com o app aberto.
            </p>
          ) : permissao === "indisponivel" ? (
            <p className="text-[14px] text-cinza">Este navegador não envia notificações.</p>
          ) : (
            <>
              <p className="mb-3 text-[14px] leading-relaxed text-cinza">
                Receba o lembrete mesmo com o app fechado.
              </p>
              <Button
                variant="ouro"
                size="md"
                full
                loading={ocupado}
                onClick={async () => {
                  const resultado = await ativar();
                  if (resultado === "granted") toast({ tone: "sucesso", title: "Lembretes ativados" });
                }}
                className="uppercase tracking-wide"
              >
                Ativar lembretes
              </Button>
            </>
          )}
        </div>
      </Card>
    </>
  );
}

function Interruptor({
  ligado,
  onMudar,
  rotulo,
}: {
  ligado: boolean;
  onMudar: (valor: boolean) => void;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      onClick={() => onMudar(!ligado)}
      className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${ligado ? "bg-ouro" : "bg-borda-forte"}`}
    >
      <span
        className={`absolute top-1 size-5 rounded-full bg-branco shadow-card transition-all ${
          ligado ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
