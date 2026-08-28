"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase/client";
import { uploadPhoto } from "@/services/repository";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";

const TAMANHO_MAXIMO = 5 * 1024 * 1024;

/**
 * Foto da peça, enviada para o Storage do Supabase.
 *
 * Cada cor tem a sua própria foto: a foto de uma peça nunca é reaproveitada em
 * outra. Sem foto, o cartão cai no monograma da marca.
 */
export function SeletorFoto({
  valor,
  onChange,
  rotulo = "Foto do produto",
}: {
  valor: string | null;
  onChange: (url: string | null) => void;
  rotulo?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const userId = useStore((s) => s.userId);
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);

  async function selecionar(arquivo: File | undefined) {
    if (!arquivo) return;
    const supabase = getSupabase();
    if (!supabase || !userId) {
      toast({ tone: "erro", title: "Sem conexão com o servidor", description: "Tente enviar a foto mais tarde." });
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast({ tone: "aviso", title: "Foto muito grande", description: "Envie uma imagem de até 5 MB." });
      return;
    }
    setEnviando(true);
    try {
      onChange(await uploadPhoto(supabase, userId, arquivo));
    } catch {
      toast({ tone: "erro", title: "Não foi possível enviar a foto" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-grafite">{rotulo}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={enviando}
          className="relative flex size-[92px] shrink-0 items-center justify-center overflow-hidden rounded-suave border border-dashed border-borda-forte bg-areia text-cinza transition-colors hover:bg-[#f2f2ef]"
        >
          {enviando ? (
            <Loader2 size={22} className="animate-spin text-ouro" />
          ) : valor ? (
            <Image src={valor} alt="" fill sizes="92px" className="object-cover" />
          ) : (
            <ImagePlus size={24} className="text-ouro-claro" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-relaxed text-cinza">
            Use a foto da própria peça. Sem foto, o app mostra o símbolo da marca.
          </p>
          {valor ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-vermelho hover:underline"
            >
              <Trash2 size={14} />
              Remover foto
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(evento) => selecionar(evento.target.files?.[0])}
      />
    </div>
  );
}
