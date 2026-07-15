#!/usr/bin/env bash
# Run the backend test suite against a throwaway local Postgres database.
# Usage: PGURL=postgres://user@host:port ./run-local.sh
# (defaults to a local socket server on port 5544, user postgres)
set -euo pipefail
cd "$(dirname "$0")"

PGURL="${PGURL:-postgres://postgres@%2Ftmp:5544}"
DB="wt_test_$$"

psql "$PGURL/postgres" -qc "create database $DB"
trap 'psql "$PGURL/postgres" -qc "drop database if exists $DB with (force)"' EXIT

psql "$PGURL/$DB" -v ON_ERROR_STOP=1 -q -f 00-shim.sql
for m in ../migrations/*.sql; do
  psql "$PGURL/$DB" -v ON_ERROR_STOP=1 -q -f "$m"
done
psql "$PGURL/$DB" -v ON_ERROR_STOP=1 -f 01-tests.sql
