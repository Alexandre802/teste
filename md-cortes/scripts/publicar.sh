#!/usr/bin/env bash
#
# Publica o MD_cortes no GitHub Pages.
#
# Gera o site, joga o conteúdo de out/ no branch gh-pages e empurra. O branch
# gh-pages guarda só o site compilado — nada do código-fonte vai para lá, o que
# importa porque o repositório de origem pode ser privado e o Pages é público.
#
#   ./scripts/publicar.sh
#
# Variáveis opcionais:
#   BASE_PATH   subpasta do endereço final. Padrão: /teste
#               (https://usuario.github.io/teste/). Para servir na raiz de um
#               domínio próprio, use BASE_PATH="".
#   BRANCH      branch de publicação. Padrão: gh-pages.

set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_PATH="${BASE_PATH-/teste}"
BRANCH="${BRANCH:-gh-pages}"

cd "$AQUI"

REMOTO="$(git -C "$AQUI" remote get-url origin)"
echo "→ Gerando o site (BASE_PATH='${BASE_PATH}')"
rm -rf out .next
NEXT_PUBLIC_BASE_PATH="$BASE_PATH" npx next build >/dev/null

# O Pages roda Jekyll por padrão, e o Jekyll ignora pastas que começam com "_".
# Sem este arquivo, todo o /_next/ some e o site abre em branco.
touch out/.nojekyll

echo "→ Empurrando para ${BRANCH}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -r out/. "$TMP/"

cd "$TMP"
git init -q
git checkout -q -b "$BRANCH"
git add -A
git -c user.email="publicacao@md-cortes" -c user.name="MD_cortes" \
    commit -q -m "Publica o MD_cortes ($(date -u '+%Y-%m-%d %H:%M UTC'))"
git remote add origin "$REMOTO"
git push -q --force origin "$BRANCH"

echo "✓ Publicado. Se o Pages ainda não estiver ligado, vá em"
echo "  Settings → Pages e escolha: Deploy from a branch → ${BRANCH} → / (root)"
