"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Boxes, Shirt } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/lib/brand";
import { FORNECEDOR_DEMONSTRACAO, PRODUTOS_DEMONSTRACAO } from "@/services/demonstracao";

const PASSOS = [
  { icone: <Shirt size={19} />, titulo: "Cadastre seus produtos", texto: "Nome, cor, custo e preço de venda." },
  { icone: <Boxes size={19} />, titulo: "Informe seu estoque inicial", texto: "Quantidade de cada tamanho." },
  { icone: <Bell size={19} />, titulo: "Ative os lembretes", texto: "Para não esquecer de registrar as vendas." },
];

/** Aparece só na primeira entrada; depois a preferência fica gravada. */
export default function BemVindoPage() {
  const router = useRouter();
  const saveSettings = useStore((s) => s.saveSettings);
  const saveSupplier = useStore((s) => s.saveSupplier);
  const saveProduct = useStore((s) => s.saveProduct);
  const [enviando, setEnviando] = useState(false);

  async function comecar(comExemplos: boolean) {
    setEnviando(true);
    if (comExemplos) {
      const fornecedorId = await saveSupplier(FORNECEDOR_DEMONSTRACAO);
      for (const produto of PRODUTOS_DEMONSTRACAO) {
        await saveProduct({ ...produto, supplierId: fornecedorId });
      }
    }
    await saveSettings({ onboarded: true });
    router.replace(comExemplos ? "/estoque" : "/produto/novo");
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto w-full max-w-sm"
      >
        <div className="flex justify-center">
          <Logo size={130} priority />
        </div>

        <h1 className="mt-9 text-center text-[25px] font-bold leading-tight tracking-[-0.01em] text-tinta">
          Bem-vindo ao {BRAND.name}
        </h1>
        <p className="mt-2 text-center text-[15px] text-cinza">Três passos e a loja está no ar.</p>

        <ol className="mt-8 space-y-3">
          {PASSOS.map((passo, indice) => (
            <motion.li
              key={passo.titulo}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + indice * 0.09 }}
              className="flex items-start gap-3 rounded-card border border-borda bg-branco p-4 shadow-card"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ouro-suave text-ouro">
                {passo.icone}
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-tinta">
                  {indice + 1}. {passo.titulo}
                </span>
                <span className="block text-[13px] text-cinza">{passo.texto}</span>
              </span>
            </motion.li>
          ))}
        </ol>

        <Button
          variant="principal"
          size="lg"
          full
          className="mt-8"
          loading={enviando}
          onClick={() => comecar(false)}
        >
          {enviando ? null : <ArrowRight size={19} />}
          Começar
        </Button>

        <button
          type="button"
          onClick={() => comecar(true)}
          disabled={enviando}
          className="mt-4 block w-full text-center text-[14px] font-medium text-ouro hover:underline disabled:opacity-50"
        >
          Ver primeiro com peças de exemplo
        </button>
      </motion.div>
    </div>
  );
}
