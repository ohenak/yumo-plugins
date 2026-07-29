#!/usr/bin/env bash
# backup-grammar.sh — TSPEC §11.2's batched driver for the backup filename grammar (T-18).
#
# Sources C1 (`pdlc/hooks/scripts/lib/pdlc-drift.sh`) for `pdlc_backup_format` /
# `pdlc_backup_parse` (TSPEC §11.1) and drives them over a batch of cases in ONE spawn — the
# property runner (`driftHarness.js`'s `runGrammar`) writes every generated case to this
# script's stdin and zips the stdout lines back, so a 500-case property costs one `spawnSync`
# rather than one per case (TSPEC §11.2).
#
# No execute bit needed — always invoked as `bash <this path>` (never the bare path).
#
# stdin  : one case per line —  format TAB id TAB stamp TAB nn
#                             |  parse  TAB name
# stdout : one result per line — ok TAB <fields…>  |  err TAB <reason>
#
# NOTE (PLAN T-18, batch 4): C1 does not exist until T-31 (batch 6). Until then, `source`
# below fails (stderr suppressed) and `pdlc_backup_format`/`pdlc_backup_parse` are undefined,
# so every case below falls through to its `err` branch (`command not found` is a non-zero
# exit like any other failure) — one `err` line per input line, satisfying the harness's
# line-count-equality check (TSPEC §11.2) without any special-casing here. This row's
# driver-contract tests in `driftHelpers.test.js` (T-01 clause (d)) go green once T-31 lands
# C1, not before — documented in the PLAN's "Phase 4" preamble.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
C1_PATH="${SCRIPT_DIR}/../../../../hooks/scripts/lib/pdlc-drift.sh"

# shellcheck disable=SC1090
source "$C1_PATH" 2>/dev/null || true

while IFS=$'\t' read -r kind a b c || [[ -n "${kind:-}" ]]; do
  case "$kind" in
    format)
      if out="$(pdlc_backup_format "$a" "$b" "$c" 2>/dev/null)"; then
        printf 'ok\t%s\n' "$out"
      else
        printf 'err\tformat-failed\n'
      fi
      ;;
    parse)
      if out="$(pdlc_backup_parse "$a" 2>/dev/null)"; then
        printf 'ok\t%s\n' "$out"
      else
        printf 'err\tparse-failed\n'
      fi
      ;;
    *)
      printf 'err\tunknown-case-kind\n'
      ;;
  esac
done
