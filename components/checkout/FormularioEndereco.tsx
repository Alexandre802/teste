"use client";

import { MapPin } from "lucide-react";

import type { Address } from "@/types";
import { Campo, CampoSelecao } from "@/components/ui/Campo";
import { cidadesAtendidas } from "@/data/deliveryZones";
import { mascaraCep } from "@/lib/format";
import type { ErrosEndereco } from "@/lib/endereco";

/**
 * Endereco da entrega. Rua, numero, bairro e cidade sao obrigatorios;
 * CEP, complemento e referencia sao opcionais.
 */
export function FormularioEndereco({
  endereco,
  erros,
  aoMudar,
}: {
  endereco: Address;
  erros: ErrosEndereco;
  aoMudar: (parcial: Partial<Address>) => void;
}) {
  return (
    <fieldset>
      <legend className="fonte-titulo mb-3 flex items-center gap-2 text-[17px] font-bold text-tinta">
        <MapPin className="h-5 w-5 text-laranja" aria-hidden="true" />
        Endereço de entrega
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo
          rotulo="CEP"
          opcional
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={endereco.cep}
          erro={erros.cep}
          onChange={(evento) =>
            aoMudar({ cep: mascaraCep(evento.target.value) })
          }
        />
        <Campo
          rotulo="Rua"
          autoComplete="address-line1"
          placeholder="Nome da rua"
          value={endereco.rua}
          erro={erros.rua}
          onChange={(evento) => aoMudar({ rua: evento.target.value })}
        />
        <Campo
          rotulo="Número"
          inputMode="numeric"
          placeholder="123"
          value={endereco.numero}
          erro={erros.numero}
          onChange={(evento) => aoMudar({ numero: evento.target.value })}
        />
        <Campo
          rotulo="Bairro"
          autoComplete="address-level3"
          placeholder="Seu bairro"
          value={endereco.bairro}
          erro={erros.bairro}
          onChange={(evento) => aoMudar({ bairro: evento.target.value })}
        />
        <Campo
          rotulo="Complemento"
          opcional
          placeholder="Apartamento, bloco, casa"
          value={endereco.complemento}
          onChange={(evento) => aoMudar({ complemento: evento.target.value })}
        />
        <CampoSelecao
          rotulo="Cidade"
          value={endereco.cidade}
          erro={erros.cidade}
          onChange={(evento) => aoMudar({ cidade: evento.target.value })}
        >
          <option value="">Escolha a cidade</option>
          {cidadesAtendidas.map((cidade) => (
            <option key={cidade} value={cidade}>
              {cidade}
            </option>
          ))}
        </CampoSelecao>
        <Campo
          rotulo="Ponto de referência"
          opcional
          className="sm:col-span-2"
          placeholder="Perto de quê?"
          value={endereco.referencia}
          onChange={(evento) => aoMudar({ referencia: evento.target.value })}
        />
      </div>

    </fieldset>
  );
}
