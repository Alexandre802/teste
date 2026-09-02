#!/usr/bin/env bash
# Aplica as migrations num Postgres local e roda os testes do fluxo financeiro.
# Nada toca o banco de produção: tudo acontece num banco descartável.
set -euo pipefail

BANCO="${BANCO_TESTE:-comida_caseira_teste}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== recriando $BANCO"
su postgres -c "dropdb --if-exists $BANCO && createdb $BANCO" >/dev/null

echo "== esquema auth e papéis que o Supabase fornece"
su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $BANCO -f $RAIZ/supabase/testes/preparar.sql"

echo "== migrations"
for arquivo in "$RAIZ"/supabase/migrations/*.sql; do
  su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $BANCO -f $arquivo" 2>&1 | grep -vi notice || true
done

echo "== fluxo financeiro"
su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $BANCO -f $RAIZ/supabase/testes/fluxo.sql" 2>&1 \
  | sed 's/^psql.*NOTICE:  //' | grep -E "OK   |FALHOU|ERROR"

echo "== RLS"
su postgres -c "psql -v ON_ERROR_STOP=1 -q -d $BANCO -f $RAIZ/supabase/testes/rls.sql" 2>&1 \
  | sed 's/^psql.*NOTICE:  //' | grep -E "OK   |FALHOU|ERROR"

echo "== tudo passou"
