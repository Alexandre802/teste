#!/usr/bin/env bash
#
# Publica o MD_cortes na Vercel, como projeto próprio.
#
#   ./scripts/publicar-vercel.sh
#
# O que ele faz:
#   1. gera o site na raiz do domínio (sem subpasta, ao contrário do GitHub Pages)
#   2. copia o vercel.json para dentro de out/
#   3. sobe SÓ a pasta out/, num projeto chamado md-cortes
#
# Por que sobe só out/: assim a Vercel não tem código-fonte para detectar nem
# reconstruir. O que está na pasta é exatamente o que vai ao ar.
#
# O projeto é fixado em --project md-cortes, então não há como este deploy cair
# em cima de outro projeto da conta.
#
# Variáveis opcionais:
#   PROJETO       nome do projeto na Vercel. Padrão: md-cortes.
#   VERCEL_TOKEN  token de acesso; sem ele a CLI usa o login já feito na máquina.

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJETO="${PROJETO:-md-cortes}"

cd "$AQUI"

echo "→ Gerando o site para a raiz do domínio"
rm -rf out .next
NEXT_PUBLIC_BASE_PATH= npx next build >/dev/null

cp vercel.json out/vercel.json

ARGS=(deploy --prod --yes --project "$PROJETO")
if [ -n "${VERCEL_TOKEN:-}" ]; then
  ARGS+=(--token "$VERCEL_TOKEN")
fi

echo "→ Publicando out/ no projeto '${PROJETO}'"
cd out
npx --yes vercel@latest "${ARGS[@]}"
