#!/usr/bin/env bash
# lib-probe.sh — TSPEC §11.2's batched-driver precedent (`backup-grammar.sh`, T-18),
# generalised to ANY C1 function (`pdlc/hooks/scripts/lib/pdlc-drift.sh`, §2.2). PLAN T-39
# (TE F-03): gives C1 layers 2-5 a real, sourced-green observable before the entrypoints
# (C2/C3) land — see the PLAN's Phase 4 preamble and §3 note 1.
#
# No execute bit needed — always invoked as `bash <this path>` (never the bare path), exactly
# like `backup-grammar.sh`.
#
# stdin  : one case per line —  <fnName> TAB <arg>...
#                             |  dump    TAB <varName>
#          `<fnName>` is any C1 function (§2.2's table); `dump` reads back the current value
#          of a `PDLC_*` scalar or indexed array C1 populates as a side effect.
#
# stdout : one result per line, in input order —
#            ok  TAB <status> TAB <field>...   `fnName` (or `dump`'s target) resolved.
#                                               `<status>` is the invoked function's own exit
#                                               status (`dump` always reports 0). Each
#                                               `<field>` is one percent-encoded, tab-split
#                                               piece of the captured stdout — C1 functions
#                                               that return more than one value tab-delimit
#                                               their OWN stdout (e.g. `pdlc_backup_parse`
#                                               returns `id TAB stamp TAB nn`); this driver
#                                               only re-splits and re-escapes that, it never
#                                               invents its own multi-value convention.
#            err TAB <reason>                  `fnName` names no defined function
#                                               ("unknown-function") or a `dump` names an
#                                               unset variable ("unset-variable").
#
# Every field is percent-encoded byte-for-byte per TSPEC §4.1's rule (`%`, and every byte
# outside 0x20-0x7E, become uppercase `%XX`) so a captured value containing a tab or newline
# can never corrupt the outer TAB-delimited result grammar.
#
# NOTE (PLAN T-39, batch 4): C1 does not exist until T-31 (batch 6). Until then, `source`
# below fails (stderr suppressed, exactly like `backup-grammar.sh`) and no `pdlc_*` function is
# ever defined, so `declare -F` never resolves any requested name and every case below falls
# through to the `unknown-function` err branch — one result line per input line either way,
# satisfying the harness's line-count-equality check (TSPEC §11.2) without any special-casing
# here. The two driver-contract tests this row gates in `driftHelpers.test.js` (T-01 clause
# (d)) name only the line-count invariant and the unknown-function-name case, so both are
# green from this batch; a real function's round trip is exercised once T-31 lands C1.
#
# Two constraints (PLAN T-39): this driver calls `pdlc_fault_active` NOWHERE (so PROPERTIES
# §8.1's three-shipped-file static scan and PROP-SEAM-02's call-site closure stay untouched by
# it), and it is a test helper only — excluded from jest by the existing
# `testPathIgnorePatterns`, never shipped.

# Deliberately no `set -u`: bash 3.2 (macOS's shipped /bin/bash) raises "unbound variable"
# when expanding an EMPTY array under `set -u` (`"${args[@]}"` with zero elements) — a case
# this driver hits routinely (a zero-arg function call, a dump target with no trailing
# fields). Every variable this script reads is either always-assigned inside the same
# function or explicitly defaulted with `${var:-}` at its use site.

export LC_ALL=C
export LANG=C

SCRIPT_DIR="$(cd "${BASH_SOURCE[0]%/*}" && pwd)"
C1_PATH="${SCRIPT_DIR}/../../../../hooks/scripts/lib/pdlc-drift.sh"

# shellcheck disable=SC1090
source "$C1_PATH" 2>/dev/null || true

# Percent-encodes "$1" byte-for-byte per TSPEC §4.1's rule and prints the result (no
# trailing newline). Bash-3.2-safe (macOS's shipped /bin/bash) — no namerefs, no
# associative arrays, no bashisms newer than 3.2.
percent_encode() {
  local input="$1"
  local out="" i c ord hex
  local len=${#input}
  for (( i = 0; i < len; i++ )); do
    c="${input:i:1}"
    if [[ "$c" == "%" ]]; then
      out+="%25"
      continue
    fi
    ord=$(printf '%d' "'$c")
    # bash 3.2's `printf '%d' "'<byte>"` sign-extends: any byte >= 0x80 comes back negative
    # (0xE2 -> -30), and `printf '%02X'` on that yields %FFFFFFFFFFFFFFE2. Under LC_ALL=C the
    # loop is byte-wise, so the true value is always the unsigned byte.
    if (( ord < 0 )); then ord=$(( ord + 256 )); fi
    if (( ord >= 32 && ord <= 126 )); then
      out+="$c"
    else
      hex=$(printf '%02X' "$ord")
      out+="%${hex}"
    fi
  done
  printf '%s' "$out"
}

# Splits "$1" on TAB into the global FIELDS array. Manual prefix-stripping (not
# `IFS=$'\t' read -a`) so empty fields survive — bash treats tab as an "IFS whitespace"
# character even when it is the only character in IFS, which would otherwise collapse or
# drop empty fields.
split_tab_fields() {
  FIELDS=()
  local remaining="$1"
  while [[ "$remaining" == *$'\t'* ]]; do
    FIELDS+=("${remaining%%$'\t'*}")
    remaining="${remaining#*$'\t'}"
  done
  FIELDS+=("$remaining")
}

emit_ok() {
  local status="$1"
  shift
  local line="ok"$'\t'"${status}"
  local field
  for field in "$@"; do
    line+=$'\t'"$(percent_encode "$field")"
  done
  printf '%s\n' "$line"
}

emit_err() {
  printf 'err\t%s\n' "$1"
}

dump_variable() {
  local varName="${1:-}"
  if [[ -z "$varName" ]] || ! declare -p "$varName" >/dev/null 2>&1; then
    emit_err "unset-variable"
    return
  fi
  local declLine declFlags
  declLine="$(declare -p "$varName")"
  # Test the FLAG SET, not the literal prefix `declare -a `: bash renders every attribute in
  # one flag word, so C1's `readonly -a PDLC_FAULT_TOKENS` comes back as `declare -ar NAME=…`.
  # A `"declare -a "*` prefix match misses that, silently falls through to the scalar branch,
  # and `${!varName}` on an array yields element 0 alone — a 16-member dump arriving as one
  # field (T-39's `dump PDLC_FAULT_TOKENS` case).
  declFlags="${declLine#declare -}"
  declFlags="${declFlags%% *}"
  if [[ "$declFlags" == *a* ]]; then
    local -a values=()
    eval "values=(\"\${${varName}[@]}\")"
    emit_ok 0 "${values[@]}"
  else
    emit_ok 0 "${!varName}"
  fi
}

invoke_function() {
  local fnName="$1"
  shift
  if ! declare -F "$fnName" >/dev/null 2>&1; then
    emit_err "unknown-function"
    return
  fi
  # Deliberately NOT `stdout="$("$fnName" "$@")"` — command substitution always forks a
  # subshell, and any `PDLC_*` global the function sets as its documented side effect (this
  # file's own header: "dump reads back the current value of a PDLC_* scalar or indexed array
  # C1 populates as a side effect") would be discarded the instant that subshell exits, making
  # every later `dump` case in the same batch report `unset-variable` regardless of what the
  # function actually did. A plain output redirect on a simple command does not fork, so the
  # function runs in THIS process and its globals persist for later cases; only the tiny
  # scratch file (never `cat`/`mktemp` — neither is a guaranteed PATH tool here) is read back
  # via bash's own `$(< file)` fast path.
  local tmpOut="${TMPDIR:-/tmp}/pdlc-lib-probe-out.$$.${RANDOM}"
  local stdout status
  "$fnName" "$@" >"$tmpOut" 2>/dev/null
  status=$?
  stdout="$(< "$tmpOut")"
  rm -f "$tmpOut" 2>/dev/null
  if [[ -z "$stdout" ]]; then
    emit_ok "$status"
  else
    split_tab_fields "$stdout"
    emit_ok "$status" "${FIELDS[@]}"
  fi
}

while IFS= read -r line || [[ -n "${line:-}" ]]; do
  [[ -z "${line:-}" ]] && continue
  split_tab_fields "$line"
  fnName="${FIELDS[0]}"
  args=("${FIELDS[@]:1}")
  if [[ "$fnName" == "dump" ]]; then
    dump_variable "${args[0]:-}"
  else
    invoke_function "$fnName" "${args[@]}"
  fi
done
